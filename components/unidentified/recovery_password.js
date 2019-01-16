import React, {Component} from 'react';
import {View,Text} from 'react-native';
import {Button} from '../common.js';
import {connect} from 'react-redux';

import {user} from '../../actions/user.js';

class RecoveryPassword extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: 'Reset Password'
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
			<View>
				<View style={{
					flex: 1,
					marginTop:30,
					flexDirection: 'row',
        			justifyContent: 'space-between',
				}}>
					<Text>Enter password</Text>
					<Text 
						style={{width:50,height:20}}
						onPress={(e)=>{
							this.props.navigation.navigate('Recovery');
						}}
					>Recover</Text>
				</View>
				<View style={{
					flex: 1,
					marginTop:30,
					flexDirection: 'row',
        			justifyContent: 'space-between',
				}}>
					<Text>Confirm your password</Text>
					<Text 
						style={{width:50,height:20}}
						onPress={(e)=>{
							this.props.navigation.navigate('Recovery');
						}}
					>Recover</Text>
				</View>
				<View>
					<Button text="Reset" style={style.button} onPress={()=>{
						this.props.navigation.navigate('VAULT');
					}} />
				</View>
			</View>
		);
	}
}

export default connect(state => {
	return {
		user: state.user
	};
})(RecoveryPassword);