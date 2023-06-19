import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState } from 'react';
import CleanRegistration from './CleanRegistration';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';

function Fingerprint() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isRegistered, setIsRegistered] = useState(false);
	const [msg, setMsg] = useState('');
	return browserSupportsWebAuthn() ? (
		<form
			className='form'
			onSubmit={(e) => {
				e.preventDefault();
			}}
		>
			<span className='status'>
				{'status: '}
				{isRegistered ? 'Registered' : 'Not registered'}
			</span>
			<p>{msg}</p>
			<Register
				onRegister={() => {
					setIsRegistered(true);
					setIsLoggedIn(false);
					setMsg('Registration succeeded!');
				}}
				setMsg={setMsg}
			/>
			{isLoggedIn ? (
				<Logout
					onLogout={() => {
						setIsLoggedIn(false);
						setMsg('Logout succeeded!');
					}}
				/>
			) : (
				<Login
					onLogin={() => {
						setIsLoggedIn(true);
						setMsg('Login succeeded!');
					}}
				/>
			)}
			<CleanRegistration
				onClean={() => {
					setIsRegistered(false);
					setIsLoggedIn(false);
					setMsg('Registration cleaned up successfully!');
				}}
				setMsg={setMsg}
			/>
		</form>
	) : (
		<div>Browser does not support Web Authentication!</div>
	);
}
export default Fingerprint;
