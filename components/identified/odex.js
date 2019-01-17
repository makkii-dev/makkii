import React, { Component } from 'react';
import { ScrollView, Text, View } from 'react-native';
import styles from '../styles.js';

export default class Odex extends Component {
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.odex);
	}
	render(){
		return (
			<ScrollView style={styles.container}>
				<View style={styles.form}>
					<Text style={styles.label}>Odex</Text>
				</View>
			</ScrollView>
		);
	}
}