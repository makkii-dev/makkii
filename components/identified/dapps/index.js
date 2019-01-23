import { createStackNavigator } from 'react-navigation';
import Home from './home';
import Launch from './launch';
import Dapp from './dapp';
const navigator = createStackNavigator(
    {
        DappsHome: {screen: Home},
        DappsLaunch: {screen: Launch},
        DappsSingle: {screen: Dapp},
    },
    {
        initialRouteName: 'DappsHome',
    }
);

navigator.navigationOptions = ({ navigation }) => {
    let { routeName } = navigation.state.routes[navigation.state.index];
    let navigationOptions = {};
    switch(routeName) {
        case 'DappsLaunch':
        case 'DappsSingle':
            navigationOptions.tabBarVisible=false;
            break;
    }
    return navigationOptions;
};

export default navigator;