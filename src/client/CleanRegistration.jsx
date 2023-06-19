function CleanRegistration({ onClean }) {
	async function handleClick() {
		try {
			await fetch('/clear-registration', { method: 'POST' });
			onClean();
		} catch (err) {
			console.error(err);
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
