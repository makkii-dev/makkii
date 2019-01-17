import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation';
import Home from './home.js';
import About from './about.js';
import Password from './password.js';
import Config from './config.js';
import Recovery from './recovery.js';

export default createStackNavigator({
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