import { createStackNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import Register from './register.js';
import RegisterMnemonic from './register_mnemonic.js';
import Login from './login.js';
import Recovery from './recovery.js';
import RecoveryScan from './recovery_scan.js';
import RecoveryPassword from './recovery_password.js';

import styles from '../styles.js';

const Unidentified = createStackNavigator({
  	Login: {screen: Login}, 
  	Recovery: {screen: Recovery},
  	RecoveryScan: {screen: RecoveryScan},
  	RecoveryPassword: {screen: RecoveryPassword},
  	Register: {screen: Register},
  	RegisterMnemonic: {screen: RegisterMnemonic},
}, {
	initialRouteName: 'RegisterMnemonic',
	header: {
		style: {
			shadowOpacity: 0,
			shadowOffset: {
				height: 0,
			},
			shadowRadius: 0,
			elevation: 0,
        }
	},
	headerMode: {}
});

export default connect(state => { return state; })(Unidentified);