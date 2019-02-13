import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View} from 'react-native';
import {createStackNavigator} from 'react-navigation';
import Vault                 from './vault/home.js';
import VaultAccount          from './vault/account.js';
import VaultImportHdWallet   from './vault/import_hd_wallet';
import VaultImportLedger     from './vault/import_ledger.js';
import VaultImportPrivateKey from './vault/import_private_key.js';
import VaultReceive          from './vault/receive.js';
import VaultSend             from './vault/send.js';
import VaultTransaction      from './vault/transaction.js';
import Dapps                 from './dapps/home.js';
import DappsDapp             from './dapps/dapp.js';
import DappsLaunch           from './dapps/launch.js';
import Setting               from './setting/home.js';
import SettingAbout          from './setting/about.js';
import SettingPassword       from './setting/password.js';
import SettingRecovery       from './setting/recovery.js';
import SettingServices       from './setting/services.js'; 
import styles from '../styles.js';  

const signed = createStackNavigator({
	'signed_vault': { 
		screen: Vault,
		navigationOptions: {
            header: null
        }  
	}, 
	'signed_vault_account': { 
		screen: VaultAccount,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }  
	}, 
	'signed_vault_import_hdwallet': { 
		screen: VaultImportHdWallet,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }  
	}, 
	'signed_vault_import_ledger': { 
		screen: VaultImportLedger,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }  
	}, 
	'signed_vault_import_private_key': { 
		screen: VaultImportPrivateKey,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }  
	}, 
	'signed_vault_receive': { 
		screen: VaultReceive,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }  
	}, 
	'signed_vault_send': { 
		screen: VaultSend,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }  
	}, 
	'signed_vault_transaction': { 
		screen: VaultTransaction,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }  
	}, 
	'signed_dapps': { 
		screen: Dapps,
		navigationOptions: {
            headerLeft: null,
            headerRight: null,
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        } 
	}, 
	'signed_dapps_dapp': { 
		screen: DappsDapp,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        } 
	}, 
	'signed_dapps_launch': { 
		screen: DappsLaunch,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        } 
	}, 
	'signed_setting': {  
		screen: Setting,
		navigationOptions: {
			headerLeft: null,
            headerRight: null,
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }
	},  
	'signed_setting_about': {  
		screen: SettingAbout,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }
	},  
	'signed_setting_password': {  
		screen: SettingPassword,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }
	},  
	'signed_setting_recovery': {  
		screen: SettingRecovery,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        } 
	},  
	'signed_setting_services': {  
		screen: SettingServices,
		navigationOptions: {
            headerRight: (<View></View>),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        } 
	},  
}, {    
	//initialRouteName: 'signed_vault', 
	//initialRouteName: 'signed_dapps',
	//initialRouteName: 'signed_odex',  
	//initialRouteName: 'signed_setting', 
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
})(signed);