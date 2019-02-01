import { createStackNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import Login            from './login.js';
import Register         from './register/index.js';
import RegisterMnemonic from './register/mnemonic.js';
import Recovery         from './recovery/index.js';
import RecoveryPassword from './recovery/password.js';
import RecoveryScan     from './recovery/scan.js';
import styles from '../styles.js';

const Unidentified = createStackNavigator({
  	Login: {screen: Login, navigationOptions: {header: null}}, 
  	Register: {screen: Register, navigationOptions: {headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle}},
  	RegisterMnemonic: {screen: RegisterMnemonic, navigationOptions: {headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle}}, 
  	Recovery: {screen: Recovery, navigationOptions: {headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle}},
  	RecoveryPassword: {screen: RecoveryPassword, navigationOptions: {headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle}},
  	RecoveryScan: {screen: RecoveryScan, navigationOptions: {header: null}},
}, {
    	initialRouteName: 'Login',  
	    //initialRouteName: 'Register',
	    //initialRouteName: 'RegisterMnemonic', 
	    //initialRouteName: 'Recovery',
	    //initialRouteName: 'RecoveryPassword',
	    //initialRouteName: 'RecoveryScan',
	    swipeEnabled: false,
    	animationEnabled: false,
    	lazy: true,
    	transitionConfig: () => ({
			transitionSpec: {
				duration: 0,
			},
    	}),
});

export default connect(state => { return state; })(Unidentified);