import React from 'react'; 
import { createStackNavigator, AppBar } from 'react-navigation';
import Home from './home.js';
import Password from './password.js';
import Scan from './scan.js';
import styles from '../../styles.js';

//TODO: figure out why general style setting not working on createStackNavigator
const navigator = createStackNavigator({
    RecoveryHome: {screen: Home, navigationOptions: {headerStyle: styles.headerStyle, headerTitleStyle: styles.headerTitleStyle}},
    RecoveryPassword: {screen: Password, navigationOptions: {headerStyle: styles.headerStyle, headerTitleStyle: styles.headerTitleStyle}},
    RecoveryScan: {screen: Scan, navigationOptions: {headerStyle: styles.headerStyle, headerTitleStyle: styles.headerTitleStyle}},
}, {
    initialRouteName: "RecoveryHome",
    //initialRouteName: "RecoveryPassword",
    //initialRouteName: "RecoveryScan"
});

export default navigator;