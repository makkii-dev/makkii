import { createStackNavigator } from 'react-navigation';
import Home from './home.js';
import About from './about.js';
import UpdatePassword from './update_password.js';
import Services from './services.js';
import Recovery from './recovery.js';
import styles from '../../styles.js';

const navigator = createStackNavigator({
	  'signed_setting': {screen:Home, navigationOptions:{headerStyle:styles.headerStyle,headerTitleStyle:styles.headerTitleStyle}},
    'signed_setting_password': {screen:UpdatePassword, navigationOptions:{headerStyle:styles.headerStyle,headerTitleStyle:styles.headerTitleStyle}},
	  'signed_setting_about': {screen:About, navigationOptions:{headerStyle:styles.headerStyle,headerTitleStyle:styles.headerTitleStyle}},
	  'signed_setting_services': {screen:Services, navigationOptions:{headerStyle:styles.headerStyle,headerTitleStyle:styles.headerTitleStyle}},
	  'signed_setting_recovery': {screen:Recovery, navigationOptions:{headerStyle:styles.headerStyle,headerTitleStyle:styles.headerTitleStyle}},
}, {
    //initialRouteName: "signed_setting",
    //initialRouteName: "signed_setting_password",
    initialRouteName: "signed_setting_about",
    //initialRouteName: "signed_setting_services",
    //initialRouteName: "signed_setting_recovery",
    swipeEnabled: false,
    animationEnabled: false,
    lazy: true, 
    transitionConfig: () => ({
        transitionSpec: {
            duration: 0,
        }, 
    }),
});

navigator.navigationOptions = ({ navigation }) => {
  	let { routeName } = navigation.state.routes[navigation.state.index];
    let navigationOptions = {}; 
  	switch(routeName) {
  		  case 'signed_setting_password':
  		  case 'signed_setting_about':
  		  case 'signed_setting_services':
  		  case 'signed_setting_recovery':
            navigationOptions.tabBarVisible = false;
            break;
  	}
    return navigationOptions;
};

export default navigator;