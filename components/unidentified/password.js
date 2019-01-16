import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View,Text,TextInput,Button,TouchableOpacity } from 'react-native';
import langs from '../langs.js';
import style from '../style.js';

class Password extends Component {
	constructor(props){
		super(props);
		this.state = {
			password: '' 
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.key);
		console.log(this.props.user);
	}
	render(){ 
		return (
			<View style={style.container}>
				<Text style={style.header}>{langs.view_enter_password.en}</Text>
				<TextInput
					style={style.input}
			        onChangeText={(password) => this.setState({
			        	password
			        })}
			        secureTextEntry={true}
			        value={this.state.password}
			    />
			    <View style={style.label}>
					<TouchableOpacity 
						onPress={(e)=>{
					  		this.setState({
					  			camera_on: true
					  		})
					  	}}
				  	>
			          	<Text style={style.button}>Signin</Text>
			        </TouchableOpacity>
				</View>
			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(Password);