import { StyleSheet } from 'react-native';
import { createStackNavigator, AppBar } from 'react-navigation';
import Home from './home.js';
import Mnemonic from './mnemonic.js';
import styles from '../../styles';

const navigator = createStackNavigator({
    RegisterHome: { screen: Home, navigationOptions: { headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle } },
    RegisterMnemonic: { screen: Mnemonic, navigationOptions: { headerStyle:styles.headerStyle, headerTitleStyle:styles.headerTitleStyle } },
}, {
    initialRouteName: "RegisterHome",
    //initialRouteName: "RegisterMnemonic",
  	navigationOptions: ({ navigation }) => ({
        header: <AppBar title={ navigation.getParam('appBar', {title: ''}).title } />,
    })
});

navigator.navigationOptions = ({ navigation }) => {
  	let { routeName } = navigation.state.routes[navigation.state.index];
  	switch(routeName) {
        case 'RegisterHome':
		    case 'RegisterMnemonic':
            return {
                tabBarVisible: false
            };
  	}
};

export default navigator;