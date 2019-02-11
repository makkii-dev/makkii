import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Image,AsyncStorage} from 'react-native';

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
				if(json_user){ 
					let user = JSON.parse(json_user);		 			
					// TODO: move max_keep_signed to setting;
					let max_keep_signed = 60000 * 30;  
					let time_diff = Date.now() - user.timestamp; 
					console.log('user.timestamp ' + user.timestamp);
					console.log('Date.now()     ' + Date.now());
					console.log('time diff      ' + time_diff);
					if(time_diff < max_keep_signed) {  
						setTimeout(()=>{navigate('Vault');}, 1000); 
						console.log('[db-user] keep alive');    
					} else {
						setTimeout(()=>{navigate('unsigned_login');}, 1000);
						console.log('[db-user] timeout');	
					}
				} else {
					setTimeout(()=>{navigate('unsigned_register');}, 1000); 
					console.log('[db-user] new user');
				} 
			}, err=>{  
				alert(err);  
			}); 
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