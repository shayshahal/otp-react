function Nav({ setAppState, appState }) {
	return (
		<nav>
			<ul>
				<li>
					<button
						onClick={() => {
							setAppState('sms');
						}}
						className={
							'navbtn ' +( appState === 'sms' ? ' active' : '')
						}
					>
						SMS
					</button>
				</li>
				<li>
					<button
						onClick={() => {
							setAppState('fingerprint');
						}}
						className={
							'navbtn ' + (appState === 'fingerprint'
								? ' active'
								: '')
						}
					>
						Fingerprint
					</button>
				</li>
			</ul>
		</nav>
	);
}

export default Nav;
