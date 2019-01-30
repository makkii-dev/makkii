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
	static defaultProps = {
		supportVisibility: true
	};
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
				{this.props.supportVisibility &&
				<Text
					style={styles.input.text}
					onPress={e => {
						this.props.onClear(e);
					}}
				>CLR</Text>
				}
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
			<TextInput
				style={this.props.style || {}}
                editable={typeof(this.props.editable) !== 'undefined' ? this.props.editable : true}
				numberOfLines={this.props.numberOfLines || 4}
				multiline={true}
				value={this.props.value}
		        onChangeText={e=>{
		        	if (this.props.onChangeText)
		        		this.props.onChangeText(val);
		        }}
		    />
		);
	}
}

class ComponentPassword extends Component {
	static defaultProps = {
		supportVisibility: true
	};

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
					placeholder={this.props.placeholder}
			        onChangeText={ val => { 
			        	this.props.onChange(val); 
			        }}
			        secureTextEntry={ this.state.secure }
			        value={ this.props.value }
			    />
			    {this.props.supportVisibility &&
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
				}
		    </View>
		);
	}
}

module.exports = {
	Logo,
	Input,
	InputMultiLines,
	ComponentPassword
}