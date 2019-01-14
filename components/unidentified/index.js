import { createBottomTabNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import New      from './new.js';
import Password from './password.js';
import Mnemonic from './mnemonic.js';

const Unidentified = createBottomTabNavigator({
  	PASSWORD: {screen: Password}, 
  	MNEMONIC: {screen: Mnemonic},
  	NEW: {screen: New}
}, {
	lazy: true,
	initialRouteName: 'MNEMONIC',
	tabBarOptions: {
		activeTintColor: '#333333',
		inactiveTintColor: '#adb0b5',
		borderTopColor: '#adb0b5',
	  	labelStyle: {
	    	fontSize: 12
	  	},
	  	tabStyle: {
	  		textAlign: 'center',
	  		paddingBottom: 14,
	    	backgroundColor: '#ffffff',
	  	},
	},
});

export default connect(state => {
	return state;
})(Unidentified);