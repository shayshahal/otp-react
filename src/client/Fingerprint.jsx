import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState } from 'react';
import LoginForm from './LoginForm';
import LogoutForm from './LogoutForm';
import RegisterForm from './RegisterForm';

function Fingerprint() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isRegistered, setIsRegistered] = useState(true);
	const [username, setUsername] = useState('');
	return (
			<div>
				{browserSupportsWebAuthn() ? (
					isRegistered ? (
						isLoggedIn ? (
							<LogoutForm
								onLogout={() => setIsLoggedIn(false)}
								username={username}
							/>
						) : (
							<LoginForm onLogin={() => setIsLoggedIn(true)} />
						)
					) : (
						<RegisterForm
							onRegister={(username) => {
								setIsRegistered(true);
								setIsLoggedIn(true);
								setUsername(username);
							}}
						/>
					)
				) : (
					<div>Browser does not support Web Authentication!</div>
				)}
			</div>
	);
}
export default Fingerprint;
