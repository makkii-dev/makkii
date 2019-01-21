import { createStackNavigator } from 'react-navigation';
import { StyleSheet } from 'react-native';
import Home from './home';
import Launch from './launch';

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

const navigator = createStackNavigator(
    {
        SettingHome: {screen: Home, navigationOptions: { headerStyle: styles.headerStyle }},
        SettingLaunch: {screen: Launch, navigationOptions: { headerStyle: styles.headerStyle }}
    },
    {
        initialRouteName: 'SettingHome',
    }
);

navigator.navigationOptions = ({ navigation }) => {
    let { routeName } = navigation.state.routes[navigation.state.index];
    let navigationOptions = {};
    switch(routeName) {
        case 'SettingLaunch':
            navigationOptions.tabBarVisible=false;
            break;
    }
    return navigationOptions;
};

export default navigator;