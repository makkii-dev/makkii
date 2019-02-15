import React from 'react';
import {connect} from 'react-redux';
import {View} from 'react-native';  
import {createStackNavigator} from 'react-navigation';
import Login            from './login.js';
import Register         from './register/home.js';
import RegisterMnemonic from './register/mnemonic.js'; 
import Recovery         from './recovery/home.js';
import RecoveryPassword from './recovery/password.js';
import styles from '../styles.js'; 

const unsigned = createStackNavigator({  
  	'unsigned_login': {
        screen: Login, 
        navigationOptions: {
            header: null
        }
    }, 
  	'unsigned_register': { 
        screen: Register, 
        navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle
        }
    },
  	'unsigned_register_mnemonic': {
        screen: RegisterMnemonic, 
        navigationOptions: { 
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle
        }
    }, 
  	'unsigned_recovery': {
        screen: Recovery, 
        navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle
        }
    },
  	'unsigned_recovery_password': {
        screen: RecoveryPassword, 
        navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle
        }
    },
}, {
    swipeEnabled: false,
  	animationEnabled: false,
  	lazy: true,
  	transitionConfig: () => ({
  			transitionSpec: {
  				  duration: 0,
  			},
  	}),
});

export default connect(state => { 
    return state; 
})(unsigned);