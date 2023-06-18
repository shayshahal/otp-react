import { startRegistration } from '@simplewebauthn/browser';
import { useState } from 'react';

function RegisterForm({ onRegister }) {
	const [err, setErr] = useState('');
	const [showButtons, setShowButtons] = useState(false);
	async function handleSubmit(e) {
		e.preventDefault();
		let attResp;
		try {
			const resp = await fetch('/generate-registration-options');
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
				setShowButtons(true);
			} else {
				setErr(error.message);
			}

			console.error(error);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='form'
		>
			<button className='btn'>Register</button>
			<br />
			<span>{err}</span>
			{showButtons && (
				<div>
					<button
						className='btn'
						onClick={onRegister}
					>
						Go To Login
					</button>
					<button
						className='btn'
						onClick={async () => {
							try {
								await fetch('/clear-registration');
							} catch (err) {
								console.error(err);
							}
						}}
					>
						Clear Registration
					</button>
				</div>
			)}
		</form>
	);
}
export default RegisterForm;
