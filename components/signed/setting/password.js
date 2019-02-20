import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Button, Alert} from 'react-native';
import { ComponentPassword } from '../../common.js';
import styles from '../../styles.js';
import { validatePassword, hashPassword } from '../../../utils.js';
import { user_update_password } from '../../../actions/user.js';
import Toast from 'react-native-root-toast';
import { strings } from '../../../locales/i18n';

class Password extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
		    title: strings('password.title')
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
					<Text style={styles.instruction}>{strings('password.password_format')}</Text>
				</View>
				<View>
					<Text>{strings('password.current_password_label')}</Text>
				</View>
				<View style={styles.marginBottom10}>
					<ComponentPassword 
						value={this.state.password_current} 
						supportVisibility={false}
						onChange={e => {
							this.setState({
								password_current: e
							}) 
						}} 
					/>
				</View>
				<View>
					<Text>{strings('password.new_password_label')}</Text>
				</View>
				<View style={styles.marginBottom10}>
					<ComponentPassword
						value={this.state.password_new} 
						supportVisibility={false}
						onChange={e => {
							this.setState({
								password_new: e
							});
						}} 
					/>
				</View>
				<View>
					<Text>{strings('password.confirm_password_label')}</Text>
				</View>
				<View style={styles.marginBottom40}>
					<ComponentPassword 
						value={this.state.password_confirm}
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
						title={strings('update_button')}
						onPress={() => this.updatePassword()}
					/>
				</View>
			</View>
		)
	}

	updatePassword=()=> {
		// validate old password correctness
		let hashedPassword = hashPassword(this.state.password_current);
		if (hashedPassword != this.props.user.hashed_password) {
			Alert.alert(strings('alert_title_error'), strings('invalid_old_password'));
			return;
		}

		// validate new password format
		if (!validatePassword(this.state.password_new)) {
			Alert.alert(strings('alert_title_error'), strings('invalid_new_password'));
			return;
		}

		// validate new password and confirmed password consistency
		if (this.state.password_new != this.state.password_confirm) {
			Alert.alert(strings('alert_title_error'), strings('inconsistent_passwords'));
			return;
		}

		// update password
		const { dispatch } = this.props;
		let newHashedPassword = hashPassword(this.state.password_new);
		dispatch(user_update_password(newHashedPassword));

        console.log("update password successfully.");
        Toast.show(strings('toast_update_success'), {
        	onHidden: () => {
				this.props.navigation.goBack();
			}
		});
	}

}

export default connect(state => { return ({ setting: state.setting, user: state.user }); })(Password);