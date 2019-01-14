import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput } from 'react-native';
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
			<View style={{
		        flex: 1,
        		flexDirection: 'column',
        		justifyContent: 'center',
        		alignItems: 'center',
			}}>
				<View style={style.form}>
					<Text style={style.form.label}>{langs.view_enter_password.cn}</Text>
					<TextInput
						style={style.form.input}
				        onChangeText={(password) => this.setState({
				        	password
				        })}
				        secureTextEntry={true}
				        value={this.state.password}
				    />
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