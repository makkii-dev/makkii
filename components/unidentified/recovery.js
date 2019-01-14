import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class Recovery extends Component {
	render(){
		console.log('[route] ' + this.props.navigation.state.key);
		return (
			<View>
				<Text>Passphase Recovery</Text>
			</View>
		);
	}
}