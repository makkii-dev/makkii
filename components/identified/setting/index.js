import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation';
import Home from './home.js';
import About from './about.js';
import Password from './password.js';
import Config from './config.js';
import Recovery from './recovery.js';

const navigator = createStackNavigator({
	SettingHome: { screen: Home  },
	SettingPassword: { screen: Password },
	SettingAbout: { screen: About  },
	SettingConfig: { screen: Config },
	SettingRecovery: { screen: Recovery },
}, {
	initialRouteName: "SettingPassword",
	resetOnBlur: true,
	backBehavior: 'none',
});

navigator.navigationOptions = ({ navigation }) => {
  	let { routeName } = navigation.state.routes[navigation.state.index];
  	let navigationOptions = {};
  	console.log('routeName !!! ' + routeName);
  	switch(routeName) {
  		case 'SettingPassword':
  		case 'SettingAbout':
  		case 'SettingConfig':
  		case 'SettingRecovery':
  			navigationOptions.tabBarVisible = false;
  		break;
  	}
  	return navigationOptions;
};

export default navigator;