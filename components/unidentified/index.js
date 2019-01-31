import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import Register from './register/index.js';
import Recovery from './recovery/index.js';
import Login from './login.js';
import styles from '../styles.js';

const Unidentified = createStackNavigator({
  	Login: {screen: Login, navigationOptions: {header: null}}, 
  	Register: {screen: Register, navigationOptions: {header: null}}, 
  	Recovery: {screen: Recovery, navigationOptions: {header: null}}
}, {
	  //initialRouteName: 'Login', 
	  initialRouteName: 'Register', 
	  //initialRouteName: 'Recovery',
});

export default connect(state => { return state; })(Unidentified);