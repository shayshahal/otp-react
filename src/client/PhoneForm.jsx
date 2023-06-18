import { useState } from 'react';

function PhoneForm({ onSend }) {
	const [errMsg, setErrMsg] = useState('');
	async function handleSubmit(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const payload = Object.fromEntries(form);
		try {
			const response = await fetch(
				window.location.origin + '/send-verification-code',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				}
			);
			if (response.status !== 200) throw new Error('Error');
			onSend(payload.phoneNumber);
		} catch (error) {
			if (error instanceof Error) setErrMsg(error.message);
			else setErrMsg(String(error));
			console.error(error);
		}
	}
	return (
		<form
			onSubmit={handleSubmit}
			className='form'
		>
			<label
				htmlFor='phoneNumber'
				className='inputLabel'
			>
				<input
					type='tel'
					name='phoneNumber'
					required
					id='phoneNumber'
					placeholder='enter a phone number...'
					className='input'
				/>
			</label>
			<span>{errMsg}</span>
			<button className='btn'>Send Code To Phone</button>
		</form>
	);
}
export default PhoneForm;
