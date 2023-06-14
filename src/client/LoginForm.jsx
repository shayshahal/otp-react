import { startAuthentication } from '@simplewebauthn/browser';
import { useEffect, useState } from 'react';

function LoginForm({ onLogin }) {
	const [err, setErr] = useState('');
	async function auth() {
		let asseResp;
		try {
			const resp = await fetch('/generate-authentication-options');

			asseResp = await startAuthentication(await resp.json(), true);
			// POST the response to the endpoint that calls
			const verificationResp = await fetch('/verify-authentication', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(asseResp),
			});

			// Wait for the results of verification
			const verificationJSON = await verificationResp.json();

			// Show UI appropriate for the `verified` status
			if (verificationJSON && verificationJSON.verified) {
				onLogin();
			} else {
				setErr(
					`Oh no, something went wrong! Response: ${JSON.stringify(
						verificationJSON
					)}`
				);
			}
		} catch (error) {
			setErr(error.message);
			console.error(error);
		}
	}
	async function handleSubmit(e) {
		e.preventDefault();
		await auth();
	}

	useEffect(() => {
		const callAuth = async () => await auth();
		callAuth();
	}, []);

	return (
		<form onSubmit={handleSubmit}>
			<label for='username'>Username</label>
			<input
				type='text'
				name='username'
				autocomplete='webauthn'
				autofocus
			/>
			<br />
			<label for='password'>Password</label>
			<input
				type='password'
				name='password'
				autocomplete='webauthn'
			/>
			<br />
			<span>{err}</span>
			<button>Login</button>
		</form>
	);
}
export default LoginForm;
