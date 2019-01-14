import { createBottomTabNavigator } from 'react-navigation';
import { connect } from 'react-redux';
import New      from './new.js';
import Password from './password.js';
import Recovery from './recovery.js';

const Unidentified = createBottomTabNavigator({
  	PASSWORD: {screen: Password}, 
  	RECOVERY: {screen: Recovery},
  	NEW: {screen: New}
}, {
	initialRouteName: 'PASSWORD',
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