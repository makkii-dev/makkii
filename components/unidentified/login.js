import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button, TextInput, TouchableOpacity, Image, KeyboardAvoidingView } from 'react-native';
import { Logo, ComponentPassword } from '../common.js';
import langs from '../langs.js';
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
			secure: true,
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.user);
		//this.input.focus();
	}
	render(){
		return (
			<KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={200}>
				<View style={{
					flex:1,
					justifyContent:'center',
					alignItems: 'center',
					marginTop: 180,
					marginBottom: 100,
				}}>
					<Logo />
				</View>
				<View style={{padding:5}}>
					<ComponentPassword
						value={ this.state.value_password }
						onChange={ val =>{
							this.setState({
								value_password: val
							});
						}}
					/>
				</View>
				<View style={{padding:5}}>
				    <Button
						title="Login"
						onPress={(e)=>{
							this.props.navigation.navigate('Vault');
						}}
					/>
				</View>
				<View style={{
					flex: 1,
					flexDirection: 'row',
        			justifyContent: 'space-between',
					height: 50,
					padding: 10
				}}>
					<TouchableOpacity
						onPress={()=>{
							this.props.navigation.navigate('Register')
						}}
					>
						<Text>Register</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={()=>{
							this.props.navigation.navigate('Recovery')
						}}
					>
						<Text>Recovery</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		);
	}
}

export default connect(state => { return { user: state.user }; })(Login);