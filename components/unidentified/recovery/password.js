import React, { Component } from 'react';
import { Button, View, Text } from 'react-native';
import { ComponentPassword } from '../../common.js';
import { connect } from 'react-redux';
import { user } from '../../../actions/user.js';
import styles from '../../styles.js';

class Password extends Component {
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
		console.log(this.props.user);
		this.props.navigation.setParams({
			title: 'Recovery/Password',
		});
	}
	render(){
		return (
			<View style={ styles.container }>
				<View style={ styles.form }>
					<Text style={ styles.label }>Enter password</Text>
				</View>
				<View style={ styles.form }>
					<ComponentPassword onChange={e=>{
						console.log();
					}} />
				</View>
				<View style={ styles.form }>
					<Text style={ styles.label }>Confirm your password</Text>
				</View>
				<View style={ styles.form }>
					<ComponentPassword onChange={e=>{
						console.log();
					}} />
				</View>
				<View style={styles.form}>
					<Button title="Reset" onPress={(e)=>{
						this.props.navigation.navigate('Vault');
					}} />
				</View>
			</View>
		);
	}
}

export default connect(state => { return { user: state.user };})(Password);