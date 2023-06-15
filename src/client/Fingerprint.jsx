import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { useState } from 'react';
import LoginForm from './LoginForm';
import LogoutForm from './LogoutForm';
import RegisterForm from './RegisterForm';

function Fingerprint() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isRegistered, setIsRegistered] = useState(false);

	return (
		<div>
			{browserSupportsWebAuthn() ? (
				isRegistered ? (
					isLoggedIn ? (
						<LogoutForm onLogout={() => setIsLoggedIn(false)} />
					) : (
						<LoginForm onLogin={() => setIsLoggedIn(true)} />
					)
				) : (
					<RegisterForm
						onRegister={() => {
							setIsRegistered(true);
							setIsLoggedIn(false);
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
