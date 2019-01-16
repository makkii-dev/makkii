import React,{Component} from 'react';
import {View,TextInput,Text,TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

class Button extends Component{
	render(){
		return (
			<TouchableOpacity onPress={this.props.onPress}>
	          	<Text style={this.props.style}>{this.props.text}</Text>
	        </TouchableOpacity>
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
			<View style={{
				flex: 1,
				justifyContent:'center',
				alignItems: 'center',
			}}>
				<TextInput
					style={style.input}
			        onChangeText={(password) => this.setState({
			        	password
			        })}
			        ref={x => this.input = x}
			        secureTextEntry={this.state.secure}
			        value={this.state.password}
			    />
			    <Icon  
			    	type={this.state.secure ? 'eye': 'eye-invisible'} 
			    	size={30}
			    	style={{
			    		position: 'absolute',
					    top: -20,
					    right: 0,
			    	}} 
			    	onPress={()=>{
			    		this.setState({
			    			secure: !this.state.secure
			    		})
			    	}}
			    	/>
		    </View>
		);
	}
}

module.exports = {
	Button,
	Password
}