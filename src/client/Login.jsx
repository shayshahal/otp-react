import { startAuthentication } from '@simplewebauthn/browser';

function Login({ onLogin, setErr }) {
	async function auth() {
		let asseResp;
		try {
			const resp = await fetch('/generate-authentication-options');
			const opts = await resp.json();
			asseResp = await startAuthentication(opts);
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
	async function handleClick() {
		await auth();
	}

	return (
		<button
			className='btn'
			onClick={handleClick}
		>
			Login
		</button>
	);
}
export default Login;
