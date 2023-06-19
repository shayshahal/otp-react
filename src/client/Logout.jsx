function Logout({ onLogout }) {
	function handleClick() {
		onLogout();
	}

	return (
		<button
			className='btn'
			onClick={handleClick}
		>
			Logout
		</button>
	);
}
export default Logout;
