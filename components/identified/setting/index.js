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