import { startRegistration } from '@simplewebauthn/browser';

function RegisterForm({ onRegister, setErr }) {
	async function handleClick() {
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
			} else {
				setErr(error.message);
			}
			console.error(error);
		}
	}

	return (
		<button
			className='btn'
			onClick={handleClick}
			
		>
			Register
		</button>
	);
}
export default RegisterForm;
