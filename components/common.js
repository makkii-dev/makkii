import React,{ Component } from 'react';
import { View, TextInput, Text, Image, StyleSheet } from 'react-native';
import styles from './styles.js'

class Logo extends Component{
	render(){
		return(
			<Image
				style={{
					width:120,
					height:120,
				}}
				source={require('../assets/wallet.png')} 
			/>
		);
	}
}

class Input extends Component{
	constructor(props){
		super(props);
	}
	render(){
		return (
			<View>
				<TextInput
					style={ styles.input.text_input }
			        onChangeText={ val => { 
			        	this.props.onChange(val); 
			        }}
			        value={ this.props.value }
			    />
			    <Text
			    	style={ styles.input.text }
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
			<View style={ styles.input.view }>
				<TextInput
					style={{
						borderWidth: 1,



					}}
					numberOfLines={4}
					multiline={true}
			        onChangeText={ val => { 
			        	this.props.onChangeText(val);
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
	Input,
	InputMultiLines,
	Password
}