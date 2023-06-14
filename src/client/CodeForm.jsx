import { useEffect, useRef, useState } from 'react';

function CodeForm({ onVerify, phoneNumber }) {
	const [otp, setOtp] = useState('');
	const [errMsg, setErrMsg] = useState('');
	const formRef = useRef(null);
	useEffect(() => {
		if ('OTPCredential' in window) {
			const form = formRef.current;
			const ac = new AbortController();
			const handler = () => {
				ac.abort();
			};
			form.addEventListener('submit', handler);
			navigator.credentials
				.get({
					otp: { transport: ['sms'] },
					signal: ac.signal,
				})
				.then((otp) => {
					setOtp(otp.code);
					form.submit();
				})
				.catch((err) => {
					console.log(err);
				});
		}
		return () => {
			form.removeEventListener('submit', handler);
		};
	}, []);
	async function handleSubmit(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const payload = Object.fromEntries(form);

		try {
			const response = await fetch(window.location.origin + '/verify-code', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});
			if (response.status !== 200) throw new Error('Error');
			onVerify(true);
		} catch (error) {
			if (error instanceof Error) setErrMsg(error.message);
			else setErrMsg(String(error));
			console.error(error);
		}
	}
	return (
		<form
			onSubmit={handleSubmit}
			ref={formRef}
		>
			<label htmlFor='one-time-code'>
				<input
					type='text'
					name='verificationCode'
					inputMode='numeric'
					required
					autoComplete='one-time-code'
					id='one-time-code'
					value={otp}
					onChange={(e) => setOtp(e.target.value)}
				/>
				<span>{errMsg}</span>
			</label>
			<input
				type='hidden'
				name='phoneNumber'
				value={phoneNumber}
			/>
			<span>{otp}</span>
			<button>Verify</button>
		</form>
	);
}
export default CodeForm;
