import { createBottomTabNavigator, BottomTabBar } from 'react-navigation';
import Vault    from './vault.js';
import Dapps    from './dapps.js';
import Odex     from './odex.js';
import Setting  from './setting/index.js';

const Identified = createBottomTabNavigator({
	Vault: {screen: Vault, navigationOptions:{ tabBarVisible: false }},
	Dapps: {screen: Dapps, navigationOptions:{ tabBarVisible: false }}, 
	Odex: {screen: Odex, navigationOptions:{ tabBarVisible: false }},
	Setting: {screen: Setting, navigationOptions:{ tabBarVisible: false } }
}, {
	lazy: true,
	initialRouteName: 'Setting',
	tabBarOptions: {
		activeTintColor: '#333333',
		inactiveTintColor: '#adb0b5',
		borderTopColor: '#adb0b5',
	  	labelStyle: {
	    	fontSize: 14
	  	},
	  	tabStyle: {
	  		paddingBottom: 14,
	    	backgroundColor: '#ffffff',
	  	},
	}
});

export default Identified;