import { createStackNavigator } from 'react-navigation';
import Home from './home.js';
import Sell from './sell.js';
import Buy from './buy.js';

const navigator = createStackNavigator({
	  OdexHome: { screen: Home  },
    OdexSell: { screen: Sell },
	  OdexBuy: { screen: Buy  },
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