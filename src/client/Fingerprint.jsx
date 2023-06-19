import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState } from 'react';
import CleanRegistration from './CleanRegistration';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';

function Fingerprint() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isRegistered, setIsRegistered] = useState(false);

	return browserSupportsWebAuthn() ? (
		<form className='form'>
			<p className='status'>
				{isRegistered ? 'Already registered' : 'Not registered'}
				<br />
				If you are registered, you can only un register or login. <br />
				If you are un registered, you can only register
			</p>
			<Register
				onRegister={() => {
					setIsRegistered(true);
					setIsLoggedIn(false);
				}}
			/>
			{isLoggedIn ? (
				<Logout onLogout={() => setIsLoggedIn(false)} />
			) : (
				<Login onLogin={() => setIsLoggedIn(true)} />
			)}
			<CleanRegistration onClean={() => setIsRegistered(false)} />
		</form>
	) : (
		<div>Browser does not support Web Authentication!</div>
	);
}
export default Fingerprint;
