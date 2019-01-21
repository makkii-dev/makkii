import { createStackNavigator } from 'react-navigation';
import { StyleSheet } from 'react-native';
import Home from './home.js';
import About from './about.js';
import Password from './password.js';
import Config from './config.js';
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
    }
});

const navigator = createStackNavigator({
	  SettingHome: { screen: Home, navigationOptions: { headerStyle: styles.headerStyle } },
    SettingPassword: { screen: Password, navigationOptions: { headerStyle: styles.headerStyle } },
	  SettingAbout: { screen: About, navigationOptions: { headerStyle: styles.headerStyle }  },
	  SettingConfig: { screen: Config, navigationOptions: { headerStyle: styles.headerStyle } },
	  SettingRecovery: { screen: Recovery, navigationOptions: { headerStyle: styles.headerStyle } },
}, {
	  initialRouteName: "SettingHome",
	  resetOnBlur: true,
	  backBehavior: 'none',
});

navigator.navigationOptions = ({ navigation }) => {
  	let { routeName } = navigation.state.routes[navigation.state.index];
  	switch(routeName) {
  		  case 'SettingPassword':
  		  case 'SettingAbout':
  		  case 'SettingConfig':
  		  case 'SettingRecovery':
            return {
                tabBarVisible: false,  
            };
  	}
};

export default navigator;