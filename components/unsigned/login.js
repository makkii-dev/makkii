import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Button,TouchableOpacity} from 'react-native';
import {ComponentLogo,ComponentPassword} from '../common.js';
import {hashPassword} from '../../utils.js';
import {user_signin} from '../../actions/user.js';
import {dbGet} from '../../utils.js';
import styles from '../styles.js';

class Login extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	headerStyle: {
	       		visibility:'none'
	       	}
	    };
    };
	constructor(props){
		super(props);
		this.state = {
			password: '',
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.user);
	}
	render(){
		const {dispatch} = this.props;
		return (
			<View style={styles.container}>
				<View style={{
					padding: 40,
					justifyContent: 'center',
    				alignItems: 'center',
				}}>
					<ComponentLogo />
				</View>
				<View style={styles.marginBottom10}>
					<ComponentPassword
						value={this.state.value_password}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
				</View>
				<View style={styles.marginBottom20}>
				    <Button
						title="Login"
						onPress={e=>{
							dbGet('user')
							.then(user=>{
								if(user.hashed_password === hashPassword(this.state.password)){
									dispatch(user_signin(user.hashed_password, user.mnemonic));

									// load db accounts
									dbGet('accounts')
									.then(accounts=>{
										dispatch(add_accounts(accounts));
									},err=>{
										console.log(err);
									});
									setTimeout(()=>{
										this.props.navigation.navigate('signed_vault');
									}, 200);
								} else {
									alert('Invalid password');
								}
							},err=>{
								alert(err);
							});
						}}
					/>
				</View>
				<View style={{
					flex: 1,
					flexDirection: 'row',
        			justifyContent: 'space-between',
					height: 40,
				}}>
					<TouchableOpacity
						onPress={e=>{ 
							this.props.navigation.navigate('unsigned_register')
						}}
					>
						<Text>Register</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={e=>{
							this.props.navigation.navigate('unsigned_recovery')
						}}
					>
						<Text>Recovery</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

export default connect(state => { 
	return { 
		user: state.user 
	}; 
})(Login);