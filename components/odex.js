import React, { Component } from 'react';
import { ScrollView, Text } from 'react-native';

export default class Odex extends Component {
	render(){
		return (
			<ScrollView style={{
				width: '100%',
				height: '100%',
				padding: 10
			}}>
				<Text>Odex</Text>
			</ScrollView>
		);
	}
}