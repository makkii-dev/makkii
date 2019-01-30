import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Button, Input, ComponentPassword } from './common.js';
import styles from './styles.js';

class Test extends Component {
	constructor(props){
		super(props);
		this.state = {
			value_input: 'input',
			value_password: 'password',
		}
	}
	render(){ 
		return (
			<View style={{}}>
				<Text>button</Text>
				<Button
					text="button"  
				
					onPress={(e)=>{
						console.log('pressed');
					}}
				/>
				<Text>input</Text>
				<Input 
					
					value={ this.state.value_input }
					onClear={ e =>{
						this.setState({
							value_input: ''
						});
					}}
					onChange={ val =>{
						this.setState({
							value_input: val
						});
					}}
				/>
				<Text>password</Text>
				<ComponentPassword 	
					value={ this.state.value_password }
					onChange={ val =>{
						this.setState({
							value_password: val
						});
					}}
				/>
			</View>
		);
	}
}

export default Test;