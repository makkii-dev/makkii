import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Button,TouchableOpacity} from 'react-native';
import {ComponentLogo,ComponentPassword} from '../common.js';
import {hashPassword} from '../../utils.js';
import {user} from '../../actions/user.js';
import {add_accounts} from '../../actions/accounts';
import {dbGet} from '../../utils.js';
import styles from '../styles.js';

class Login extends Component {
	constructor(props){
		super(props);
		this.state = { 
			password: '',
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName); 
		console.log('[store.user] ' + JSON.stringify(this.props.user));
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
							.then(db_user=>{
								if(db_user.hashed_password === hashPassword(this.state.password)){
									dispatch(user(db_user.hashed_password, db_user.mnemonic));

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
								console.log(err);
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