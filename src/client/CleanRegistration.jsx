import { useEffect } from 'react';

function CleanRegistration({ onClean, setMsg }) {
	useEffect(() => {
		handleClick();
	}, []);
	async function handleClick() {
		try {
			await fetch('/clear-registration', { method: 'POST' });
			onClean();
		} catch (error) {
			console.error(error);
			setMsg(error.message);
		}
	}
	return (
		<button
			className='btn'
			onClick={handleClick}
		>
			Clear Registration
		</button>
	);
}
export default CleanRegistration;
