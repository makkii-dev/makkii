import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Button, Password } from '../common.js';
import { connect } from 'react-redux';
import { user } from '../../actions/user.js';
import langs from '../langs.js';
import styles from '../styles.js';

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
			<View style={ styles.container }>
				<View style={ styles.form }>
					<Text style={ styles.label }>Enter password</Text>
				</View>
				<View style={ styles.form }>
					<Password />
				</View>
				<View style={ styles.form }>
					<Text style={ styles.label }>Confirm your password</Text>
				</View>
				<View style={ styles.form }>
					<Password />
				</View>
				<View style={styles.form}>
					<Button text="Reset" style={styles.button} onPress={(e)=>{
						this.props.navigation.navigate('Vault');
					}} />
				</View>
			</View>
		);
	}
}

export default connect(state => { return { user: state.user };})(RecoveryPassword);