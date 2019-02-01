import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { createStackNavigator, AppBar } from 'react-navigation';
import Account from './account.js';
import Home from './home.js';
import ImportLedger from './import_ledger.js';
import ImportPrivateKey from './import_private_key.js';
import ImportHdWallet from './import_hd_wallet';
import Receive from './receive.js';
import Send from './send.js';
import Transaction from './transaction.js';

const styles = StyleSheet.create({
    headerStyle: {
        shadowOpacity: 0,
        shadowOffset: { 
            height: 0, 
            width:0, 
        }, 
        shadowRadius: 0, 
        borderBottomWidth:0,
        elevation: 1,
    }
});

const navigator = createStackNavigator({
    VaultAccount: { screen: Account },
    VaultHome: { screen: Home, navigationOptions: { headerStyle: styles.headerStyle }  },
    VaultImportLedger: { screen: ImportLedger, navigationOptions: { headerStyle: styles.headerStyle } },
    VaultImportPrivateKey: { screen: ImportPrivateKey, navigationOptions: { headerStyle: styles.headerStyle }  },
    VaultImportHdWallet:{screen: ImportHdWallet},
    VaultReceive: { screen: Receive },
    VaultSend: { screen: Send },
    VaultTransaction: { screen: Transaction, navigationOptions: { headerStyle: styles.headerStyle } },

}, {
    //initialRouteName: "VaultImportLedger",
    initialRouteName: "VaultHome",
  	resetOnBlur: true,

    cardStyle: {
        backgroundColor: '#EFF4F8'
    }
});

navigator.navigationOptions = ({ navigation }) => {
  	let { routeName } = navigation.state.routes[navigation.state.index];
  	switch(routeName) {
        case 'VaultAccount':
		case 'VaultImportLedger':
		case 'VaultImportPrivateKey':
		case 'VaultReceive':
        case 'VaultSend':
        case 'VaultTransaction':
        case 'VaultImportHdWallet':
            return {
                tabBarVisible: false
            };
  	}
};

export default navigator;