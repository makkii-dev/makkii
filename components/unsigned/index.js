import { createStackNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import Login            from './login.js';
import Register         from './register/index.js';
import RegisterMnemonic from './register/mnemonic.js';
import Recovery         from './recovery/index.js';
import RecoveryPassword from './recovery/password.js';
import RecoveryScan     from './recovery/scan.js';
import styles from '../styles.js';

const unsigned = createStackNavigator({ 
  	"unsigned_login": {screen: Login, navigationOptions: {header: null}}, 
  	"unsigned_register": {screen: Register, navigationOptions: {headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle}},
  	"unsigned_register_mnemonic": {screen: RegisterMnemonic, navigationOptions: {headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle}}, 
  	"unsigned_recovery": {screen: Recovery, navigationOptions: {headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle}},
  	"unsigned_recovery_password": {screen: RecoveryPassword, navigationOptions: {headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle}},
  	"unsigned_recovery_scan": {screen: RecoveryScan, navigationOptions: {header: null}},
}, {
      	initialRouteName: 'unsigned_login',    
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
    } 
);

export default connect(state => { return state; })(unsigned);