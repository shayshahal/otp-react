import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState } from 'react';
import CleanRegistration from './CleanRegistration';
import Login from './Login';
import Logout from './Logout';
import Register from './Register';

function Fingerprint() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isRegistered, setIsRegistered] = useState(false);
	const [err, setErr] = useState('');
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
				setErr={setErr}
			/>
			{isLoggedIn ? (
				<Logout onLogout={() => setIsLoggedIn(false)} />
			) : (
				<Login
					onLogin={() => setIsLoggedIn(true)}
					setErr={setErr}
				/>
			)}
			<CleanRegistration
				onClean={() => setIsRegistered(false)}
				setErr={setErr}
			/>
			<p>{err}</p>
		</form>
	) : (
		<div>Browser does not support Web Authentication!</div>
	);
}
export default Fingerprint;
