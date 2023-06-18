function LogoutForm({ onLogout }) {
	function handleSubmit(e) {
		e.preventDefault();
		onLogout();
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='form'
		>
			<h1>Hi!</h1>
			<button className='btn'>Logout</button>
		</form>
	);
}
export default LogoutForm;
