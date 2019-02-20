// libs
import React, {Component} from 'react';
import {View} from 'react-native';
import {createSwitchNavigator, createStackNavigator, createAppContainer} from 'react-navigation';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';

// actions
import {accounts}          from './actions/accounts.js';
import {accounts_ledger}   from './actions/accounts_ledger.js';
import {dapps}             from './actions/dapps.js';
import {setting}           from './actions/setting.js';
import {user,user_signout} from './actions/user.js';  
     
// reducers    
import reducer_account         from './reducers/account.js';
import reducer_accounts        from './reducers/accounts.js';
import reducer_accounts_ledger from './reducers/accounts_ledger.js';
import reducer_dapps           from './reducers/dapps.js';
import reducer_setting         from './reducers/setting.js'; 
import reducer_user            from './reducers/user.js'; 

// store 
const store = createStore(combineReducers({
	account:         reducer_account,
	accounts:        reducer_accounts,
	accounts_ledger: reducer_accounts_ledger,
	dapps:           reducer_dapps,
	setting:         reducer_setting,
	user:            reducer_user,
}));  

// ui 
import Scan                  from './components/scan.js';
import Splash                from './components/splash.js';
import Login                 from './components/unsigned/login.js';
import Register              from './components/unsigned/register.js';
import RegisterMnemonic     from './components/unsigned/register_mnemonic.js'; 
import Recovery              from './components/unsigned/recovery.js';
import RecoveryPassword     from './components/unsigned/recovery_password.js';
import Vault                 from './components/signed/vault/home.js'; 
import VaultAccount          from './components/signed/vault/account.js';
import VaultImportHdWallet   from './components/signed/vault/import_list';
import VaultImportPrivateKey from './components/signed/vault/import_private_key.js';
import VaultReceive          from './components/signed/vault/receive.js';
import VaultSend             from './components/signed/vault/send.js';
import VaultSendScan         from './components/signed/vault/send_scan.js';
import VaultTransaction      from './components/signed/vault/transaction.js';
import Dapps                 from './components/signed/dapps/home.js';
import DappsDapp             from './components/signed/dapps/dapp.js';
import DappsLaunch           from './components/signed/dapps/launch.js';
import Setting               from './components/signed/setting/home.js';
import SettingAbout          from './components/signed/setting/about.js';
import SettingPassword       from './components/signed/setting/password.js';
import SettingRecovery       from './components/signed/setting/recovery.js';
import SettingServices       from './components/signed/setting/services.js';
import SettingLanguage       from './components/signed/setting/language.js';
import SettingAdvanced       from './components/signed/setting/advanced.js';
import SettingCurrency       from './components/signed/setting/currency.js';

const Routes = createAppContainer(createStackNavigator({
	'splash':   {
		screen:Splash,
		navigationOptions: {
            header: null 
        }
	},  
	'scan': {
        screen: Scan, 
        navigationOptions: {
            header: null
        } 
    },
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
	'signed_vault_import_list': {
		screen: VaultImportHdWallet,
		navigationOptions: {
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }
	},
	'signed_vault_import_private_key': { 
		screen: VaultImportPrivateKey,
		navigationOptions: {
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
    'signed_vault_send_scan': {
		screen: VaultSendScan,
		navigationOptions: {
		    header: null,
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
	'signed_setting_currency': {
		screen: SettingCurrency,
		navigationOptions: {
			headerStyle: styles.headerStyle,
			headerTitleStyle: styles.headerTitleStyle,
		}
	},
	'signed_setting_language': {
		screen: SettingLanguage,
		navigationOptions: {
			headerStyle: styles.headerStyle,
			headerTitleStyle: styles.headerTitleStyle,
		}
	},
	'signed_setting_advanced': {
		screen: SettingAdvanced,
		navigationOptions: {
			headerRight: (<View></View>),
			headerStyle: styles.headerStyle,
			headerTitleStyle: styles.headerTitleStyle,
		}
	},
}, {
	initialRouteName: 'splash', 
	swipeEnabled: false, 
  	animationEnabled: false,
  	lazy: true,
  	transitionConfig: () => ({
		transitionSpec: {
			duration: 0,
		},
  	}),
}));

const defaultGetStateForAction = Routes.router.getStateForAction;
Routes.router.getStateForAction = (action, state) => { 
    if (action.type === "Navigation/BACK" && state) {
        const newRoutes = state.routes.filter(r => r.routeName !== 'scan' && r.routeName !== 'splash');
        const newIndex = newRoutes.length - 1;
        return defaultGetStateForAction(action, {index:newIndex,routes:newRoutes});
    }
    return defaultGetStateForAction(action, state);
}; 

// dummy
import data from './data.js'; 
store.dispatch(dapps(data.dapps));

import {listenTransaction} from './utils';
global.listenTx = new listenTransaction(store);

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Routes />
			</Provider>
		);
	}
}