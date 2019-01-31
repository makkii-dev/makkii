import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { ComponentLogo, ComponentPassword } from '../common.js';
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
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.user);
	}
	render(){
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
						value={ this.state.value_password }
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
						onPress={(e)=>{
							this.props.navigation.navigate('Vault');
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
			</View>
		);
	}
}

export default connect(state => { return { user: state.user }; })(Login);