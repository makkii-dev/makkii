import { createBottomTabNavigator } from 'react-navigation';
import Vault    from './vault.js';
import Dapps    from './dapps.js';
import Odex     from './odex.js';
import Setting  from './setting.js';

const Identified = createBottomTabNavigator({
	VAULT: {screen: Vault},
	DAPPS: {screen: Dapps}, 
	ODEX: {screen: Odex},
	SETTING: {screen: Setting}
}, {
	initialRouteName: 'VAULT',
	tabBarOptions: {
		activeTintColor: '#333333',
		inactiveTintColor: '#adb0b5',
		borderTopColor: '#adb0b5',
	  	labelStyle: {
	    	fontSize: 12
	  	},
	  	tabStyle: {
	  		paddingBottom: 14,
	    	backgroundColor: '#ffffff',
	  	},
	}
});

export default Identified;