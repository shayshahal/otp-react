import { useEffect, useRef, useState } from 'react';

function CodeForm({ onVerify, phoneNumber }) {
	const [otp, setOtp] = useState('');
	const [errMsg, setErrMsg] = useState('');
	const formRef = useRef(null);
	useEffect(() => {
		let form, handler;
		if ('OTPCredential' in window) {
			form = formRef.current;
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
			form?.removeEventListener('submit', handler);
		};
	}, []);
	async function handleSubmit(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const payload = Object.fromEntries(form);

		try {
			const response = await fetch(
				window.location.origin + '/verify-code',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				}
			);
			if (response.status !== 200) throw new Error('Wrong input');
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
			className='form'
		>
			<label
				htmlFor='one-time-code'
				className='inputLabel'
			>
				<input
					type='text'
					name='verificationCode'
					inputMode='numeric'
					required
					autoComplete='one-time-code'
					id='one-time-code'
					value={otp}
					onChange={(e) => setOtp(e.target.value)}
					className='input'
				/>
			</label>
			<span>{errMsg}</span>
			<input
				type='hidden'
				name='phoneNumber'
				value={phoneNumber}
			/>
			<button className='btn'>Verify</button>
		</form>
	);
}
export default CodeForm;
