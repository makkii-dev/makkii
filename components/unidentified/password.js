import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput, Button } from 'react-native';
import langs from '../langs.js';
import style from '../style.js';

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
			<View style={style.container}>
				<View style={style.form}>
					<Text style={style.form_header}>{langs.view_enter_password.en}</Text>
					<TextInput
						style={style.form_input}
				        onChangeText={(password) => this.setState({
				        	password
				        })}
				        secureTextEntry={true}
				        value={this.state.password}
				    />
				    <View style={style.form_label}>
						<Button
						  	onPress={(e)=>{
						  	}}
						  	title="Login"
						/>
					</View>
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