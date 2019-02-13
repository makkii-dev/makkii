import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Image,AsyncStorage} from 'react-native';
import {user_signin} from '../actions/user.js';
import {add_accounts} from '../actions/accounts.js';

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
		const {navigate} = this.props.navigation;
		const {dispatch} = this.props;
		
		// load db user
		AsyncStorage
			.getItem('user') 
			.then(json_user=>{
				if(json_user){ 
					try{
						let user = JSON.parse(json_user);		 			
						// TODO: move max_keep_signed to setting;
						let max_keep_signed = 60000 * 30;  
						let time_diff = Date.now() - user.timestamp; 
						if(time_diff < max_keep_signed) {  

							// load db accounts
							AsyncStorage
								.getItem('accounts') 
								.then(json_accounts=>{
									if(json_accounts){
										try{
											let accounts = JSON.parse(json_accounts);
											dispatch(add_accounts(accounts));
										}catch(e){
											alert(e);
										} 
									}
								}); 

							dispatch(user_signin(user.hashed_password, user.mnemonic));
							setTimeout(()=>{   
								navigate('signed');
							}, 1000);      
						} else {
							setTimeout(()=>{
								navigate('unsigned_login'); 
							}, 500);
						}
					} catch(e){
						setTimeout(()=>{
							navigate('unsigned_register');  
						}, 500);
					}
				} else {
					setTimeout(()=>{
						navigate('unsigned_register');  
					}, 500);    
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
		user: state.user,
	};
})(Splash);