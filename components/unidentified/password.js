import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput } from 'react-native';
import langs from '../../langs.js';

class Password extends Component {
	constructor(props){
		super(props);
		this.state = {
			password: ''
		}
	}
	componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.key);
		console.log(this.props.user);
	}
	render(){
		return (
			<View style={{
		        flex: 1,
        		flexDirection: 'column',
        		justifyContent: 'center',
        		alignItems: 'center',
			}}>
				<Text>{langs.enter_password.cn}</Text>
				<TextInput
			        style={{
			        	width: 240,
			        	height: 40,
			        	borderBottomWidth: 1, 
			        	borderColor: '#adb0b5',
			        	alignSelf: 'center',
			        }}
			        onChangeText={(password) => this.setState({
			        	password
			        })}
			        secureTextEntry={true}
			        value={this.state.password}
			    />
			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(Password);