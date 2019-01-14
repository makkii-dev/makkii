import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class New extends Component {
	render(){
		console.log('[route] ' + this.props.navigation.state.key);
		return (
				<Text>New Account </Text>
		
		);
	}
}