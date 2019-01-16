import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View,Text} from 'react-native';
import {Password,Button} from '../common.js';
import langs from '../langs.js';
import style from '../style.js';

class Register extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       title: navigation.getParam('otherParam', 'Register'),
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	render(){
		return (
			<View style={style.container}>
				<Text style={style.label}>Enter password</Text>
				<Password />
				<Text style={style.label}>Confirm password</Text>
				<Password />
				<Button 
					text="Register"  
					onPress={()=>{
						this.props.navigation.navigate('RegisterMnemonic');
					}}
				/>
			</View>
		);
	}
}

export default connect(state => {
	return {user: state.user};
})(Register);