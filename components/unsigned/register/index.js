import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,Button,AsyncStorage} from 'react-native';
import {ComponentPassword} from '../../common.js';
import {validatePassword, hashPassword} from '../../../utils.js';
import {user_register} from '../../../actions/user.js';
import {generateMnemonic,validateMnemonic,AionAccount} from '../../../libs/aion-hd-wallet/index.js';
import styles from '../../styles.js';

class Index extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: navigation.getParam('title', 'Register'), 
	    };  
    };
	constructor(props){ 
		super(props); 
		this.state = { 
			password: '',            
			password_confirm: '',
		}; 
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.user);
		this.props.navigation.setParams({
			title: 'Register',
		});
	}
	render(){
		const { dispatch } = this.props;
		return (
			<View style={styles.container}>
				<View>
					<Text>Enter password</Text>
				</View>
				<View style={styles.marginBottom10}>
					<ComponentPassword 
						value={this.state.password}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
				</View>
				<View>
					<Text>Confirm password</Text>
				</View>
				<View style={styles.marginBottom20}>
					<ComponentPassword
						value={this.state.password_confirm} 
						onChange={e=>{
							this.setState({
								password_confirm: e
							});
						}}
					/>
				</View>
				<View> 
					<Button
						title="Register"
						onPress={e=>{
							if (!validatePassword(this.state.password))
								alert("Invalid password!");
							else if (!validatePassword(this.state.password_confirm))
								alert('Invalid confirm password!');
							else if (this.state.password !== this.state.password_confirm)
								alert('Confirm password does not match password!') 
							else {
								let hashed_password = hashPassword(this.state.password);
								let mnemonic = generateMnemonic();
								dispatch(user_register(hashed_password, mnemonic));
								this.setState({
									password: '',
									password_confirm: '',
								});
								AsyncStorage.setItem(
									'user',
									JSON.stringify({
										timestamp: Date.now(),
										hashed_password,
										mnemonic,
									})
								)
								this.props.navigation.navigate('unsigned_register_mnemonic'); 
							}
						}}
					/>
				</View>
			</View>
		);
	}
}

export default connect(state=>{
	return {
		user: state.user
	};
})(Index);