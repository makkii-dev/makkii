import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { Camera, Permissions } from 'expo';
import langs from '../langs.js';
import style from '../style.js';

class Mnemonic extends Component {
	constructor(props){
		super(props);
		this.state = {
			camera_on: false,
			mnemonic: '',
		}
	}
	render(){
		console.log('[route] ' + this.props.navigation.state.key);
		const { dispatch } = this.props;
		return (
			<View style={style.container}>
				<Text style={style.form_header}>Account Recovery</Text>
				
				{
					this.state.camera_on ? 
					(
						<View style={style.form_label} style={{wdith:'100%',height: 300}}>
							<Camera type={Camera.Constants.Type.back}
				        	    style={{
				        	    	flex: 1,
								    justifyContent: 'flex-end',
								    alignItems: 'center',
								    height: 300,
				        	    }}
				        		onBarCodeScanned={(e)=>{
				        			// { data: "http://en.m.wikipedia.org",target:15,type:256 }
				        			console.log('[onBarCodeScanned] ' + JSON.stringify(e));
				        			this.setState({
				        				camera_on: false,
				        				mnemonic: e.data,
				        			})
				        		}}
				        		onPress={(e)=>{
				        			console.log('wocao');
				        		}}
				        	>
				        	</Camera>	
			        	</View>
					)
					: 
					(
						<View style={style.form_label}>
							<Button
							  	onPress={(e)=>{
							  		this.setState({
							  			camera_on: true
							  		})
							  	}}
							  	title="Scan"
							  	accessibilityLabel="Learn more about this purple button"
							/>
						</View>
					)
				}
				
				<Text style={style.form_label}>Enter 24 characters mnemonic</Text>
				<TextInput
					style={style.form_input}
					value={this.state.mnemonic}
			    	multiline = {true}   
			    	editable = {true} 
			        numberOfLines = {4}
		        />		        
			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(Mnemonic);