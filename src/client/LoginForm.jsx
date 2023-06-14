import { startAuthentication } from '@simplewebauthn/browser';
import { useState } from 'react';

function LoginForm({ onLogin }) {
	const [err, setErr] = useState('');
	async function handleSubmit(e) {
		e.preventDefault();
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
	return (
		<form onSubmit={handleSubmit}>
			<span>{err}</span>
			<button>Login</button>
		</form>
	);
}
export default LoginForm;
