import { createStackNavigator } from 'react-navigation';
import Home from './home';
import Launch from './launch';
const navigator = createStackNavigator(
    {
        SettingHome: {screen: Home},
        SettingLaunch: {screen: Launch}
    },
    {
        initialRouteName: 'SettingHome',
    }
);

navigator.navigationOptions = ({ navigation }) => {
    let { routeName } = navigation.state.routes[navigation.state.index];
    let navigationOptions = {};
    console.log('routeName !!!' + routeName);
    switch(routeName) {
        case 'SettingLaunch':
            navigationOptions.tabBarVisible=false;
            break;
    }
    return navigationOptions;
};

export default navigator;