function LogoutForm({ onLogout }) {
	function handleSubmit(e) {
		e.preventDefault();
		onLogout();
	}

	return (
		<form onSubmit={handleSubmit}>
			<h1>Hi!</h1>
			<button>Logout</button>
		</form>
	);
}
export default LogoutForm;
