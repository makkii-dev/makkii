import React, { Component } from 'react';
import { createStackNavigator, AppBar } from 'react-navigation';
import Account from './account.js';
import Home from './home.js';
import ImportLedger from './import_ledger.js';
import ImportPrivateKey from './import_private_key.js';
import Receive from './receive.js';
import Send from './send.js';
import Transaction from './transaction.js';

const navigator = createStackNavigator({
    VaultAccount: { screen: Account  },
    VaultHome: { screen: Home  },
    VaultImportLedger: { screen: ImportLedger },
    VaultImportPrivateKey: { screen: ImportPrivateKey  },
    VaultReceive: { screen: Receive },
    VaultSend: { screen: Send },
    VaultTransaction: { screen: Transaction },
}, {
  	initialRouteName: "VaultHome",
  	resetOnBlur: true,
    navigationOptions: ({ navigation }) => ({
        header: <AppBar title={ navigation.getParam('appBar', {title: ''}).title } />,
    }),
    cardStyle: {
        backgroundColor: '#EFF4F8'
    }
});

navigator.navigationOptions = ({ navigation }) => {
  	let { routeName } = navigation.state.routes[navigation.state.index];
  	let navigationOptions = {};
  	switch(routeName) {
        case 'VaultAccount':
    		case 'VaultImportLedger':
    		case 'VaultImportPrivateKey':
    		case 'VaultReceive':
        case 'VaultSend':
        case 'VaultTransaction':
            navigationOptions.tabBarVisible = false;
  		  break;
  	}
  	return navigationOptions;
};

export default navigator;