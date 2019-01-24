import { createBottomTabNavigator, BottomTabBar } from 'react-navigation';
import * as React from 'react';
import {Image} from 'react-native';
import Vault    from './vault/index.js';
import Dapps    from './dapps/index.js';
import Odex     from './odex/index.js';
import Setting  from './setting/index.js';

const Identified = createBottomTabNavigator({
	Vault: { 
		screen: Vault,
		navigationOptions:({navigation}) => ({
			tabBarIcon: ({tintColor})=>(<Image source={require('../../assets/tab_wallet.png')} style={{width: 24, height: 24, tintColor:tintColor, marginTop:10}}/>)
		})
	},
	DApps: { 
		screen: Dapps,
		navigationOptions:({navigation}) => ({
			tabBarIcon: ({tintColor})=>(<Image source={require('../../assets/tab_app.png')} style={{width: 24, height: 24, tintColor:tintColor, marginTop:10}}/>)
		})
	}, 
	Odex: { screen: Odex },
	Settings: { 
		screen: Setting,
		navigationOptions:({navigation}) => ({
			tabBarIcon: ({tintColor})=>(<Image source={require('../../assets/tab_settings.png')} style={{width: 24, height: 24, tintColor:tintColor, marginTop:10}}/>)
		})
	}
}, {
	lazy: true,
	initialRouteName: 'Settings',
	tabBarOptions: {
		activeTintColor: '#3366ff',
		inactiveTintColor: '#adb0b5',
		borderTopColor: '#adb0b5',
	  	labelStyle: {
	    	fontSize: 14,
	    	marginBottom: 5,
	  	},
	  	style: {
	  		height: 60
	  	}
	},
	
});

export default Identified;