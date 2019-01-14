import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import langs from '../langs.js';
import style from '../style.js';

export default class New extends Component {
	render(){
		console.log('[route] ' + this.props.navigation.state.key);
		return (
			<View style={style.container}>
				<Text style={style.form_header}>Create New Vault</Text>
				<View style={style.form_label}>
					<Button
					  	onPress={(e)=>{
					  	}}
					  	title="New"
					/>
				</View>
			</View>
		);
	}
}