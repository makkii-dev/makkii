import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Image, AsyncStorage} from 'react-native';

class Splash extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	headerStyle: {
	       		visibility: 'none'
	       	}
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		const { navigate } = this.props.navigation;
		AsyncStorage
			.getItem('user')
			.then(json_user=>{
				let user = JSON.parse(json_user);   
				// TODO: move 60000 to setting;
				console.log('hashed_password ' + user.hashed_password);
				console.log('user.timestamp ' + user.timestamp);
				console.log('now            ' + Date.now());
				console.log('time diff      ' + (Date.now() - user.timestamp));
				let keep_signed = user.hashed_password !== '' && (Date.now() - user.timestamp) < 60000; 
				console.log('[keep_signed] ' + keep_signed);
				if(keep_signed) {
					setTimeout(()=>{
						navigate('Vault');	 
					}, 1000);   
				} else {
					setTimeout(()=>{
						navigate('unsigned_login');	
					}, 1000);
				} 
		}, err=>{  
			console.log('[db-err] ' + err);  
		});   
		 
		// // dummy
		// import data from './data.js'; 
		// store.dispatch(dapps(data.dapps));
	}
	render(){
		return (
			<View style={{
				flex: 1,
				justifyContent: 'center',
    			alignItems: 'center',
    			backgroundColor: 'white',
			}}>
				<Image
					style={{
						width: 120,
						height: 120,
					}}
					source={require('../assets/loading.gif')}
				/>
			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(Splash);