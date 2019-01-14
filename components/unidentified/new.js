import React, { Component } from 'react';
import { View,Text,Button,TouchableOpacity } from 'react-native';
import langs from '../langs.js';
import style from '../style.js';

export default class New extends Component {
	render(){
		console.log('[route] ' + this.props.navigation.state.key);
		return (
			<View style={style.container}>
				<Text style={style.header}>Create New Vault</Text>
				<View style={style.label}>
					<TouchableOpacity 
						onPress={(e)=>{
					  		this.setState({
					  			camera_on: true
					  		})
					  	}}
				  	>
			          	<Text style={style.button}>New</Text>
			        </TouchableOpacity>
				</View>
			</View>
		);
	}
}