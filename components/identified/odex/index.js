import { createStackNavigator } from 'react-navigation';
import { StyleSheet } from 'react-native';
import Home from './home.js';
import Sell from './sell.js';
import Buy from './buy.js';

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
	  OdexHome: { screen: Home, navigationOptions: { headerStyle: styles.headerStyle }  },
    OdexSell: { screen: Sell, navigationOptions: { headerStyle: styles.headerStyle } },
	  OdexBuy: { screen: Buy, navigationOptions: { headerStyle: styles.headerStyle }  },
}, {
	  initialRouteName: "OdexHome",
	  resetOnBlur: true,
	  backBehavior: 'none',
});

navigator.navigationOptions = ({ navigation }) => {
  	let { routeName } = navigation.state.routes[navigation.state.index];
  	switch(routeName) {
  		  case 'OdexSell':
  		  case 'OdexBuy':
            return {
                tabBarVisible: false,  
            };
  	}
};

export default navigator;