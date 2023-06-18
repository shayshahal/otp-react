const ViteExpress = require('vite-express');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const asyncHandler = require('express-async-handler');
const Twilio = require('twilio');
const base64url = require('base64url');
const SimpleWebAuthnServer = require('@simplewebauthn/server');
const session = require('express-session');
const memoryStore = require('memorystore');

const {
	//Registration
	generateRegistrationOptions,
	verifyRegistrationResponse,
	// Authentication
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} = SimpleWebAuthnServer;

dotenv.config();
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID, RP_ID } =
	process.env;

const app = express();
const MemoryStore = memoryStore(session);

const port = process.env.PORT || 5000;

const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const expectedOrigin = `https://${RP_ID}`;
const user = {
	id: 'internalUserId',
	username: `user@${RP_ID}`,
	devices: [],
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(
	session({
		secret: 'secret123',
		saveUninitialized: true,
		resave: false,
		cookie: {
			maxAge: 86400000,
			httpOnly: true, // Ensure to not expose session cookies to clientside scripts
		},
		store: new MemoryStore({
			checkPeriod: 86_400_000, // prune expired entries every 24h
		}),
		unset: 'destroy',
	})
);

/**
 * Make sure two Uint8Arrays are deeply equivalent
 */
function areEqual(array1, array2) {
	if (array1.length != array2.length) {
		return false;
	}

	return array1.every((val, i) => val === array2[i]);
}

app.use((req, res, next) => {
	req.body.phoneNumber = '+972' + req.body.phoneNumber;
	next();
});

app.post(
	'/send-verification-code',
	asyncHandler(async (req, res) => {
		const phoneNumber = req.body.phoneNumber;
		await client.verify.v2
			.services(TWILIO_SERVICE_SID)
			.verifications.create({ to: phoneNumber, channel: 'sms' });
		console.log('Success!');
		res.status(200).send('success');
	})
);

app.post(
	'/verify-code',
	asyncHandler(async (req, res) => {
		const { phoneNumber, verificationCode } = req.body;

		const verificationCheck = await client.verify.v2
			.services(TWILIO_SERVICE_SID)
			.verificationChecks.create({
				to: phoneNumber,
				code: verificationCode,
			});

		if (verificationCheck.status === 'approved') {
			res.sendStatus(200);
			console.log('Success!');
		}
	})
);

app.get('/generate-registration-options', (req, res) => {
	const opts = {
		rpName: 'otp-react',
		RP_ID,
		userID: user.id,
		userName: user.username,
		timeout: 60000,
		attestationType: 'none',
		/**
		 * Passing in a user's list of already-registered authenticator IDs here prevents users from
		 * registering the same device multiple times. The authenticator will simply throw an error in
		 * the browser if it's asked to perform registration when one of these ID's already resides
		 * on it.
		 */
		excludeCredentials: user.devices.map((dev) => ({
			id: dev.credentialID,
			type: 'public-key',
			transports: dev.transports,
		})),
		authenticatorSelection: {
			residentKey: 'discouraged',
		},
		/**
		 * Support the two most common algorithms: ES256, and RS256
		 */
		supportedAlgorithmIDs: [-7, -257],
	};

	const options = generateRegistrationOptions(opts);

	req.session.currentChallenge = options.challenge;

	res.send(options);
});

app.post('/verify-registration', async (req, res) => {
	const body = req.body;

	let verification;
	try {
		const opts = {
			response: body,
			expectedChallenge: `${req.session.currentChallenge}`,
			expectedOrigin,
			expectedRPID: RP_ID,
			requireUserVerification: true,
		};
		verification = await verifyRegistrationResponse(opts);
	} catch (error) {
		const _error = error;
		console.error(_error);
		return res.status(400).send({ error: _error.message });
	}

	const { verified, registrationInfo } = verification;

	if (verified && registrationInfo) {
		const { credentialPublicKey, credentialID, counter } = registrationInfo;

		const existingDevice = user.devices.find((device) =>
			areEqual(device.credentialID, credentialID)
		);

		if (!existingDevice) {
			/**
			 * Add the returned device to the user's list of devices
			 */
			const newDevice = {
				credentialPublicKey,
				credentialID,
				counter,
				transports: body.response.transports,
			};
			user.devices.push(newDevice);
		}
	}

	req.session.currentChallenge = undefined;

	res.send({ verified });
});

/**
 * Login (a.k.a. "Authentication")
 */
app.get('/generate-authentication-options', (req, res) => {
	const opts = {
		timeout: 60000,
		allowCredentials: user.devices.map((dev) => ({
			id: dev.credentialID,
			type: 'public-key',
			transports: dev.transports,
		})),
		userVerification: 'required',
		RP_ID,
	};

	const options = generateAuthenticationOptions(opts);

	/**
	 * The server needs to temporarily remember this value for verification, so don't lose it until
	 * after you verify an authenticator response.
	 */
	req.session.currentChallenge = options.challenge;

	res.send(options);
});

app.post('/verify-authentication', async (req, res) => {
	const body = req.body;

	let dbAuthenticator;
	const bodyCredIDBuffer = base64url.toBuffer(body.rawId);
	// "Query the DB" here for an authenticator matching `credentialID`

	for (const dev of user.devices) {
		if (areEqual(dev.credentialID, bodyCredIDBuffer)) {
			dbAuthenticator = dev;
			break;
		}
	}

	if (!dbAuthenticator) {
		return res
			.status(400)
			.send({ error: 'Authenticator is not registered with this site' });
	}

	let verification;
	try {
		const opts = {
			response: body,
			expectedChallenge: `${req.session.currentChallenge}`,
			expectedOrigin,
			expectedRPID: RP_ID,
			authenticator: dbAuthenticator,
			requireUserVerification: true,
		};
		verification = await verifyAuthenticationResponse(opts);
	} catch (error) {
		const _error = error;
		console.error(_error);
		return res.status(400).send({ error: _error.message });
	}

	const { verified, authenticationInfo } = verification;

	if (verified) {
		// Update the authenticator's counter in the DB to the newest count in the authentication
		dbAuthenticator.counter = authenticationInfo.newCounter;
	}

	req.session.currentChallenge = undefined;

	res.send({ verified });
});

app.get('/clear-registration', (req, res) => {
	delete req.session;
	user.devices = [];

	res.sendStatus(200);
});

ViteExpress.listen(app, port, () =>
	console.log(`Server is listening on port ${port}...`)
);
