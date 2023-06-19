function CleanRegistration({ onClean, setErr }) {
	async function handleClick() {
		try {
			await fetch('/clear-registration', { method: 'POST' });
			onClean();
		} catch (error) {
			console.error(error);
            setErr(error.message)
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
