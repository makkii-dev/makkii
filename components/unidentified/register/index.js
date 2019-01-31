import React from 'react'; 
import { createStackNavigator, AppBar } from 'react-navigation';
import Home from './home.js';
import Mnemonic from './mnemonic.js'; 
import styles from '../../styles.js';

const navigator = createStackNavigator({
    RegisterHome: { screen: Home, navigationOptions: { headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle } },
    RegisterMnemonic: { screen: Mnemonic, navigationOptions: { headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle } },
}, {
    initialRouteName: "RegisterHome",
    //initialRouteName: "RegisterMnemonic",
});

export default navigator;