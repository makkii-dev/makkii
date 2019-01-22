import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button, } from 'react-native';
import { Password } from '../../common.js';
import styles from '../../styles.js';

class UpdatePassword extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : '',
        }
    }
	constructor(props){
		super(props);
		this.state = {
			password_current: '',
			password_new: '',
			password_confirm: '',
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
		this.props.navigation.setParams({
			title: 'Update Password',
		});
	}
	render(){
		return (
			<View style={styles.container}>	
				<View style={styles.marginBottom10}>
					<Text style={styles.label}>Current Password</Text>
				</View>
				<View style={styles.marginBottom10}>
					<Password 
						value={this.state.password_current} 
						onChange={e => {
							this.setState({
								password_current: e
							})
						}}
					/>
				</View>
				<View style={styles.marginBottom10}>
					<Text style={styles.label}>New Password</Text>
				</View>
				<View style={styles.marginBottom10}>
					<Password
						value={this.state.password_new} 
						onChange={e => {
							this.setState({
								password_new: e
							});
						}} 
					/>
				</View>
				<View style={styles.marginBottom10}>
					<Text style={styles.label}>Confirm Password</Text>
				</View>
				<View style={styles.marginBottom20}>
					<Password 
						value={this.state.password_confirm} 
						onChange={e => {
							this.setState({
								password_confirm: e
							});
						}} 
					/>
				</View>
				<View>
					<Button 
						title="update"
						onPress={e => {
							console.log(this.state);
						}}
					/>
				</View>
			</View>
		)
	}
}

export default connect(state => { return ({ setting: state.setting }); })(UpdatePassword);