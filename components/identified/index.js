import { createBottomTabNavigator, BottomTabBar } from 'react-navigation';
import Vault    from './vault/index.js';
import Dapps    from './dapps/index.js';
import Odex     from './odex/index.js';
import Setting  from './setting/index.js';

const Identified = createBottomTabNavigator({
	Vault: { screen: Vault },
	Dapps: { screen: Dapps }, 
	Odex: { screen: Odex },
	Setting: { screen: Setting }
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
	},
	
});

export default Identified;