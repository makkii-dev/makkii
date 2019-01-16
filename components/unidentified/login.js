import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import langs from '../langs.js';
import style from '../style.js';
import Icon from 'react-native-vector-icons/AntDesign';

class Login extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	headerStyle: {
	       		display:'none'
	       	}
	    };
    };
	constructor(props){
		super(props);
		this.state = {
			password: '',
			secure: true, 
		}
	}
	async componentDidMount(){
		console.log(this.props.navigation.state);
		console.log(this.props.user);
		//this.input.focus();
	}
	render(){ 
		return (
			<View style={style.container}>
				<View style={{
					flex:1,
					justifyContent:'center',
					alignItems: 'center',
					marginTop:90,
					marginBottom: 120,
				}}>
					<Image
						style={{
							width:120,
							height:120
						}}
						source={require('../../assets/wallet.png')} />
				</View>
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
			    <View style={{marginTop:40}}>
					<TouchableOpacity 
						onPress={(e)=>{
					  
					  	}}
				  	>
			          	<Text style={style.button}>Login</Text>
			        </TouchableOpacity>
				</View>
				<View style={{
					flex: 1,
					marginTop:30,
					flexDirection: 'row',
        			justifyContent: 'space-between',
				}}>
					<Text 
						style={{width:70,height:20}}
						onPress={(e)=>{
							this.props.navigation.navigate('Register');
						}}
					>Register</Text>
					<Text 
						style={{width:50,height:20}}
						onPress={(e)=>{
							this.props.navigation.navigate('Recovery');
						}}
					>Recover</Text>
				</View>
			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(Login);