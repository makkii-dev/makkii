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
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.key);
	}
	render(){
		console.log('[route] ' + this.props.navigation.state.key);
		const { dispatch } = this.props;
		return (
			<View style={style.container}>
				<Text style={style.header}>Account Recovery</Text>
				{
					this.state.camera_on ? 
					(
						<View style={style.label} style={{wdith:'100%',height: 300}}>
							<TouchableOpacity 
								style={{wdith:'100%',height: 300}}
								onPress={(e)=>{
							  		this.setState({
							  			camera_on: false
							  		})
							  	}}
						  	>
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
				        	</TouchableOpacity>	
			        	</View>
					)
					: 
					(
						<View style={style.label}>
							<TouchableOpacity 
								onPress={(e)=>{
							  		this.setState({
							  			camera_on: true
							  		})
							  	}}
						  	>
					          	<Text style={style.button}>Scan</Text>
					        </TouchableOpacity>
						</View>
					)
				}
				
				<Text style={style.label}>Enter 24 characters mnemonic</Text>
				<TextInput
					style={style.input}
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