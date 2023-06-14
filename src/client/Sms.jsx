import { useState } from 'react';
import CodeForm from './CodeForm';
import PhoneForm from './PhoneForm';
import Verified from './Verified';

function Sms() {
	const [isCodeSent, setIsCodeSent] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState('');
	function handleSend(phoneNumber) {
		setIsCodeSent(true);
		setPhoneNumber(phoneNumber);
	}

	return (
		<div>
			{isVerified ? (
				<Verified />
			) : isCodeSent ? (
				<CodeForm
					onVerify={setIsVerified}
					phoneNumber={phoneNumber}
				/>
			) : (
				<PhoneForm onSend={handleSend} />
			)}
		</div>
	);
}

export default Sms;
