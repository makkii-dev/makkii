import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button, Alert, AsyncStorage } from 'react-native';
import { ComponentPassword } from '../../common.js';
import styles from '../../styles.js';
import { validatePassword, hashPassword } from '../../../utils.js';
import { user } from '../../../actions/user.js';
import Toast from '../../toast.js';

class UpdatePassword extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
		    headerStyle: {
		        backgroundColor: '#eeeeee'
		    },
		    headerTitleStyle: {
		        alignSelf: 'center',
		        textAlign: 'center',
		        flex: 1
		    },
		    headerRight: (<View></View>),
		    title: 'Password'
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
	}

	render(){
		return (
			<View style={styles.container}>	
				<View style={styles.marginBottom40}>
					<Text style={styles.instruction}>Password must be 8-16 characters and contains both numbers and letters/special characters.</Text>
				</View>
				<View>
					<Text style={styles.title_label}>Current Password</Text>
				</View>
				<View style={styles.marginBottom10}>
					<ComponentPassword 
						value={this.state.password_current} 
						placeholder='Enter old password'
						supportVisibility={false}
						onChange={e => {
							this.setState({
								password_current: e
							})
						}}
					/>
				</View>
				<View>
					<Text style={styles.title_label}>New Password</Text>
				</View>
				<View style={styles.marginBottom10}>
					<ComponentPassword
						value={this.state.password_new} 
						placeholder='Enter new password'
						supportVisibility={false}
						onChange={e => {
							this.setState({
								password_new: e
							});
						}} 
					/>
				</View>
				<View>
					<Text style={styles.title_label}>Confirm Password</Text>
				</View>
				<View style={styles.marginBottom40}>
					<ComponentPassword 
						value={this.state.password_confirm}
						placeholder='Enter new password again'
						supportVisibility={false}
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
						onPress={() => this.updatePassword()}
					/>
				</View>
				<Toast
					ref={"toast"}
					duration={Toast.Duration.short}
					onDismiss={() => this.props.navigation.goBack()}
				/>

			</View>
		)
	}

	updatePassword=()=> {
		// validate old password correctness
		let hashedPassword = hashPassword(this.state.password_current);
		if (hashedPassword != this.props.user.hashed_password) {
			Alert.alert('Error', 'Old password is incorrect');
			return;
		}

		// validate new password format
		if (!validatePassword(this.state.password_new)) {
			Alert.alert('Error', 'New password is invalid.');
			return;
		}

		// validate new password and confirmed password consistency
		if (this.state.password_new != this.state.password_confirm) {
			Alert.alert('Error', 'Confirmed password and new password are different.');
			return;
		}

		// update password
		const { dispatch } = this.props;
		let updateUser = this.props.user;
		let newHashedPassword = hashPassword(this.state.password_new);
		updateUser.hashed_password = newHashedPassword;
		dispatch(user(updateUser));

        console.log("update password successfully.");
        this.refs.toast.show('Update password successfully');
	}

}

export default connect(state => { return ({ setting: state.setting, user: state.user }); })(UpdatePassword);