import { useState } from 'react';
import './App.css';
import Nav from './Nav';
import Fingerprint from './Fingerprint';
import Sms from './Sms';
function App() {
	const [appState, setAppState] = useState('fingerprint');
	return (
		<>
			<Nav setAppState={setAppState} appState={appState}/>
			{appState === 'sms' ? <Sms /> : <Fingerprint />}
		</>
	);
}

export default App;
