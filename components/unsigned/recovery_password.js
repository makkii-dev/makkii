import React, {Component} from 'react';
import {Button,View,Text} from 'react-native';
import {ComponentPassword} from '../common.js';
import {connect} from 'react-redux'; 
import {hashPassword,validatePassword} from '../../utils.js';
import {user_update_password} from '../../actions/user.js';
import styles from '../styles.js'; 

class Password extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: navigation.getParam('title', 'Recovery/Password'),
	    };
    };
	constructor(props){
		super(props);
		this.state = {
			password: '',            
			password_confirm: '',
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log('[store.user] ' + this.props.user);
		this.props.navigation.setParams({
			title: 'Recovery/Password',
		});
	}
	render(){
		const {dispatch} = this.props; 
		return (
			<View style={ styles.container }>
				<Text>Enter password</Text>
				<View style={styles.marginBottom20}>
					<ComponentPassword  
						value={this.state.password}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
				</View>
				<Text>Confirm your password</Text>
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
				<Button 
					title="Reset" 
					onPress={e=>{
						if (!validatePassword(this.state.password))
							alert("Invalid password!");
						else if (!validatePassword(this.state.password_confirm))
							alert('Invalid confirm password!');
						else if (this.state.password !== this.state.password_confirm)
							alert('Confirm password does not match password!') 
						else {
							let hashed_password = hashPassword(this.state.password);
							dispatch(user_update_password(hashed_password));
							this.setState({
								password: '',
								password_confirm: '',
							});
							this.props.navigation.navigate('signed');
						}   
					}}
				/>
			</View>
		);
	}
}

export default connect(state => { return { user: state.user };})(Password);