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
    SettingAcount: { screen: Account  },
    SettingHome: { screen: Home  },
    SettingImportLedger: { screen: ImportLedger },
    SettingImportPrivateKey: { screen: ImportPrivateKey  },
    SettingReceive: { screen: Receive },
    SettingSend: { screen: Send },
    SettingTransaction: { screen: Transaction },
}, {
  	initialRouteName: "SettingHome",
  	resetOnBlur: true,
    navigationOptions: ({ navigation }) => ({
          header: <AppBar title={navigation.getParam('appBar', {title: ''}).title} />
    }),
    cardStyle: {
        backgroundColor: '#EFF4F8'
    }
});

navigator.navigationOptions = ({ navigation }) => {
  	let { routeName } = navigation.state.routes[navigation.state.index];
  	let navigationOptions = {};
  	console.log('routeName !!! ' + routeName);
  	switch(routeName) {
        case 'SettingAcount':
    		case 'SettingImportLedger':
    		case 'SettingImportPrivateKey':
    		case 'SettingReceive':
        case 'SettingSend':
        case 'SettingTransaction':
            navigationOptions.tabBarVisible = false;
  		  break;
  	}
  	return navigationOptions;
};

export default navigator;