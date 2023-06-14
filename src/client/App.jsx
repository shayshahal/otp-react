import { useState } from 'react';
import './App.css';
import Nav from './Nav';
import FingerprintForm from './RegisterForm';
import Sms from './Sms';
function App() {
	const [appState, setAppState] = useState('fingerprint');
	return (
		<>
			<Nav setAppState={setAppState} />
			{appState === 'sms' ? <Sms /> : <FingerprintForm />}
		</>
	);
}

export default App;
