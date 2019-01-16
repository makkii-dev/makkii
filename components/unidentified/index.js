import { createStackNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import Register from './register.js';
import RegisterMnemonic from './register_mnemonic.js';
import Login from './login.js';
import Recovery from './recovery.js';
import RecoveryScan from './recovery_scan.js';
import RecoveryPassword from './recovery_password.js';

const Unidentified = createStackNavigator({
  	Login: {screen: Login}, 
  	Recovery: {screen: Recovery},
  	RecoveryScan: {screen: RecoveryScan},
  	RecoveryPassword: {screen: RecoveryPassword},
  	Register: {screen: Register},
  	RegisterMnemonic: {screen: RegisterMnemonic}
}, {
	lazy: true,
	initialRouteName: 'Login',
	tabBarOptions: {
		activeTintColor: '#333333',
		inactiveTintColor: '#adb0b5',
		borderTopColor: '#adb0b5',
	  	labelStyle: {
	    	fontSize: 12
	  	},
	  	tabStyle: {
	  		textAlign: 'center',
	  		paddingBottom: 14,
	    	backgroundColor: '#ffffff',
	  	},
	},
});

export default connect(state => {
	return state;
})(Unidentified);