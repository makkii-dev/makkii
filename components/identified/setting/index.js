import { createStackNavigator } from 'react-navigation';
import { StyleSheet } from 'react-native';
import * as React from 'react';
import Home from './home.js';
import About from './about.js';
import UpdatePassword from './update_password.js';
import Services from './services.js';
import Recovery from './recovery.js';

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
        backgroundColor: '#eeeeee'
    },
    headerTitleStyle: {
        alignSelf: 'center',
        textAlign: 'center',
        flex: 1
    }
});

const navigator = createStackNavigator({
	  SettingHome: { screen: Home, navigationOptions: { headerStyle: styles.headerStyle } },
      SettingUpdatePassword: { screen: UpdatePassword },
	  SettingAbout: { screen: About, navigationOptions: { headerStyle: styles.headerStyle } },
	  SettingServices: { screen: Services, navigationOptions: { headerStyle: styles.headerStyle } },
	  SettingRecovery: { screen: Recovery, navigationOptions: { headerStyle: styles.headerStyle } },
}, {
	  // initialRouteName: "SettingRecovery",
    initialRouteName: "SettingHome",
	  resetOnBlur: true,
	  backBehavior: 'none',
});

navigator.navigationOptions = ({ navigation }) => {
  	let { routeName } = navigation.state.routes[navigation.state.index];
    let navigationOptions = {}; 
    // navigationOptions.headerStyle = styles.headerStyle;
  	switch(routeName) {
  		  case 'SettingUpdatePassword':
  		  case 'SettingAbout':
  		  case 'SettingServices':
  		  case 'SettingRecovery':
            navigationOptions.tabBarVisible = false;
            break;
  	}
    return navigationOptions;
};

export default navigator;