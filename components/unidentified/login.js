import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Logo, Password, Button } from '../common.js';
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
			<View style={styles.container}>		
				<View style={{
					flex:1,
					justifyContent:'center',
					alignItems: 'center',
					marginTop: 180,
					marginBottom: 100,
				}}>
					<Logo />
				</View>
				<View style={styles.form}>
					<Password 
						value={ this.state.value_password }
						onChange={ val =>{
							this.setState({
								value_password: val
							});
						}}
					/>
				</View>
				<View style={styles.form}>
				    <Button
						text="Login"  
						onPress={(e)=>{
							this.props.navigation.navigate('Vault');
						}}
					/>
				</View>
				<View style={{
					flex: 1,
					flexDirection: 'row',
        			justifyContent: 'space-between',
				}}>
					<Text 
						style={{width:70,height:20}}
						onPress={(e)=>{
							this.props.navigation.navigate('Register');
						}}
					>Register</Text>
					<Text 
						style={{width:50,height:20}}
						onPress={(e)=>{
							this.props.navigation.navigate('Recovery');
						}}
					>Recover</Text>
				</View>
				
			</View>
		);
	}
}

export default connect(state => { return { user: state.user }; })(Login);