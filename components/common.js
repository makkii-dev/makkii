import React,{ Component } from 'react';
import { View, TextInput, Text, Image, StyleSheet } from 'react-native';
import styles from './styles.js'

class Logo extends Component{
	render(){
		return(
			<Image
				style={{
					width:120,
					height:120
				}}
				source={require('../assets/wallet.png')} 
			/>
		);
	}
}

class Button extends Component{
	render(){
		return (
			<View style={ styles._button._view }>
	          	<Text 
	          		style={ styles._button._text }
	          		onPress={ this.props.onPress }
	      		>
	          		{ this.props.text }
	      		</Text>
      		</View>
		);
	}
}

class Input extends Component{
	constructor(props){
		super(props);
	}
	render(){
		return (
			<View style={ styles._input._view }>
				<TextInput
					style={ styles._input._text_input }
			        onChangeText={ val => { 
			        	this.props.onChange(val); 
			        }}
			        value={ this.props.value }
			    />
			    <Text
			    	style={ styles._input._text }
			    	onPress={ e => { 
			    		this.props.onClear(e); 
			    	}}
			    >CLR</Text>
		    </View>
		);
	}
}

class InputMultiLines extends Component{
	constructor(props){
		super(props);
	}
	render(){
		return (
			<View style={ styles._input._view }>
				<TextInput
					style={ styles._input._text_input }
			        onChangeText={ val => { 
			        	this.props.onChange(val); 
			        }}
			        value={ this.props.value }
			    />
		    </View>
		);
	}
}

class Password extends Component {
	constructor(props){
		super(props);
		this.state = {
			secure: true
		};
	}
	render(){
		return (
			<View style={ styles.password.view }>
				<TextInput
					style={ styles.password.text_input }
			        onChangeText={ val => { 
			        	this.props.onChange(val); 
			        }}
			        secureTextEntry={ this.state.secure }
			        value={ this.props.value }
			    />
			    <Text
			    	style={ styles.password.text }
			    	onPress={ e =>{
			    		this.setState({
			    			secure: !this.state.secure
			    		});
			    	}}
			    >
			    	{
			    		this.state.secure ? 
			    		'SHOW' : 'HIDE'
			    	}
			    </Text>
		    </View>
		);
	}
}

module.exports = {
	Logo,
	Button,
	Input,
	InputMultiLines,
	Password
}