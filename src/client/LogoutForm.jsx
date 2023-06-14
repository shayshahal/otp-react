function LogoutForm({ onLogout, username }) {
	function handleSubmit(e) {
		e.preventDefault();
		onLogout();
	}

	return (
		<form onSubmit={handleSubmit}>
			<h1>Hi, {username}</h1>
			<button>Logout</button>
		</form>
	);
}
export default LogoutForm;
