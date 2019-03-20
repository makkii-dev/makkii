import React, {Component} from 'react';
import {Dimensions, Keyboard,TouchableOpacity,View, Alert} from 'react-native';
import {PasswordInputWithTitle, ComponentButton, alert_ok } from '../common.js';
import {connect} from 'react-redux';
import {hashPassword,validatePassword} from '../../utils.js';
import {user} from '../../actions/user.js';
import {delete_accounts} from '../../actions/accounts';
import {strings} from "../../locales/i18n";
import defaultStyles from '../styles';
import {mainBgColor} from '../style_util';

const {width} = Dimensions.get('window');

class Password extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: strings('recovery_password.title'),
	    };
    };
	constructor(props){
		super(props);
		this.mnemonic = this.props.navigation.getParam('mnemonic', '');
		this.state = {
			password: '',
			password_confirm: '',
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}

	render(){
		const {dispatch} = this.props;
		return (
			<TouchableOpacity
				activeOpacity={1}
				onPress={() => {Keyboard.dismiss()}}
				style={{
					flex: 1,
					padding: 40,
					backgroundColor: mainBgColor,
				}}
			>
				<View style={{
				    ...defaultStyles.shadow,
					marginBottom: 40,
					width: width - 80,
					height: 220,
					borderRadius: 10,
					backgroundColor: 'white',
					padding: 20,
				}}>
					<PasswordInputWithTitle
						title={strings('recovery_password.label_password')}
                        placeholder={strings('recovery_password.hint_enter_password')}
						value={this.state.password}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
					<View style={{marginBottom: 20}} />
					<PasswordInputWithTitle
                        title={strings('recovery_password.label_confirm_password')}
						placeholder={strings('recovery_password.hint_enter_confirm_password')}
						value={this.state.password_confirm}
						onChange={e=>{
							this.setState({
								password_confirm: e
							});
						}}
                    />
				</View>
				<ComponentButton
					title={strings('recovery_password.button_reset')}
					onPress={e=>{
						if (!validatePassword(this.state.password)) {
						    alert_ok(strings('alert_title_error'), strings('recovery_password.error_password'));
						} else if (this.state.password !== this.state.password_confirm) {
							alert_ok(strings('alert_title_error'), strings('recovery_password.error_dont_match'));
						} else {
							Alert.alert(
								strings('alert_title_warning'),
								strings('recovery.warning_mnemonic'),
								[
									{
										text: strings('cancel_button'), onPress: () => {}
									},
									{
										text: strings('alert_ok_button'), onPress: () => {
											let hashed_password = hashPassword(this.state.password);

											this.props.dispatch(delete_accounts(hashed_password))

											dispatch(user(hashed_password, this.mnemonic));
											this.setState({
												password: '',
												password_confirm: '',
											});
											this.props.navigation.navigate('signed_vault');
										}
									},
								]
							)

						}
					}}
				/>
			</TouchableOpacity>
		);
	}
}

export default connect()(Password);
