import { startRegistration } from '@simplewebauthn/browser';
import { useState } from 'react';

function RegisterForm({ onRegister, goToLogin }) {
	const [err, setErr] = useState('');
	async function handleSubmit(e) {
		e.preventDefault();
		let attResp;
		try {
			const resp = await fetch('/generate-registration-options');
			// Pass the options to the authenticator and wait for a response
			attResp = await startRegistration(await resp.json());
			const verificationResp = await fetch('/verify-registration', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(attResp),
			});
			const verificationJSON = await verificationResp.json();
			if (verificationJSON && verificationJSON.verified) {
				onRegister();
				goToLogin();
			} else {
				setErr(
					`Oh no, something went wrong! Response: ${JSON.stringify(
						verificationJSON
					)}`
				);
			}
		} catch (error) {
			// Some basic error handling
			if (error.name === 'InvalidStateError') {
				setErr(
					'Error: Authenticator was probably already registered by user'
				);
				goToLogin();
			} else {
				setErr(error.message);
			}

			console.error(error);
		}
	}
	return (
		<form onSubmit={handleSubmit}>
			<button
				type='button'
				onClick={goToLogin}
			>
				Go to login
			</button>
			<button>Register</button>
			<br />
			<span>{err}</span>
		</form>
	);
}
export default RegisterForm;
