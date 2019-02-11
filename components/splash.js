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
		console.log(this.props.user);
		AsyncStorage
			.getItem('user')
			.then(json_user=>{ 
				if(json_user){
					let user = JSON.parse(json_user);					
					// TODO: move 60000 to setting; 
					if((Date.now() - user.timestamp) < 60000) {
						setTimeout(()=>{navigate('Vault');}, 1000); 
						console.log('[db-user] '); 
					} else {
						setTimeout(()=>{navigate('unsigned_login');}, 1000);
						console.log('[db-user] timeout');	
					}
				} else {
					setTimeout(()=>{navigate('unsigned_login');}, 1000); 
					console.log('[db-user] new user');
				} 
			}, err=>{  
				alert(err);  
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