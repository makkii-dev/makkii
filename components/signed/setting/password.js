import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dimensions, View, Text, Keyboard, Alert, ScrollView, TouchableOpacity} from 'react-native';
import { PasswordInputWithTitle } from '../../common.js';
import styles from '../../styles.js';
import { validatePassword, hashPassword } from '../../../utils.js';
import { user_update_password } from '../../../actions/user.js';
import { accounts_save } from '../../../actions/accounts.js';
import Toast from 'react-native-root-toast';
import { strings } from '../../../locales/i18n';

const {width,height} = Dimensions.get('window');

class Password extends Component {
	static navigationOptions = ({ navigation }) => {
		let textColor;
		if (navigation.state.params && navigation.state.params.isEdited) {
			textColor = 'rgba(255, 255, 255, 1.0)';
		} else {
			textColor = 'rgba(255, 255, 255, 0.3)';
		}
	    return {
		    title: strings('password.title'),
			headerTitleStyle: {
				fontSize: 20,
				alignSelf: 'center',
				textAlign: 'center',
				flex: 1,
			},
			headerRight: (
				<TouchableOpacity
					onPress={() => {
                        navigation.state.params.updatePassword();
                    }}
					disabled={!navigation.state.params || !navigation.state.params.isEdited}
				>
					<View style={{marginRight: 20}}>
						<Text style={{
							color: textColor,
							fontWeight: 'bold'
						}}>{strings('save_button')}</Text>
					</View>
				</TouchableOpacity>
			)
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

	componentWillMount() {
		this.props.navigation.setParams({
			updatePassword: this.updatePassword,
			isEdited: false
		});
	}

	render(){
		return (
			<TouchableOpacity
				activeOpacity={1}
				onPress={()=>{Keyboard.dismiss()}}
				style={{
					backgroundColor: '#eeeeee',
                    flex:1,
					paddingLeft: 20,
					paddingRight: 20,
				}}
			>
                <Text style={{...styles.instruction, marginTop: 20, marginBottom: 20}}>{strings('password.password_format')}</Text>
                <View style={{
                    width: width - 40,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    elevation: 3,
                    padding: 20,
                }} >
                    <PasswordInputWithTitle
                        title={strings('password.current_password_label')}
                        placeholder={strings('password.hint_enter_current_password')}
                        value={this.state.password_current}
                        onChange={e => {
                            this.setState({
                                password_current: e
                            });
                            this.updateEditStatus(e, this.state.password_new, this.state.password_confirm);
                        }}
                    />
					<View style={{marginBottom: 20}} />
                    <PasswordInputWithTitle
                        title={strings('password.new_password_label')}
						placeholder={strings('password.hint_enter_new_password')}
                        value={this.state.password_new}
                        onChange={e => {
                            this.setState({
                                password_new: e
                            });
							this.updateEditStatus(e, this.state.password_confirm, this.state.password_current);
                        }}
                    />
					<View style={{marginBottom: 20}} />
                    <PasswordInputWithTitle
                        title={strings('password.confirm_password_label')}
						placeholder={strings('password.hint_enter_confirm_password')}
                        value={this.state.password_confirm}
                        onChange={e => {
                            this.setState({
                                password_confirm: e
                            });
							this.updateEditStatus(e, this.state.password_new, this.state.password_current);
                        }}
                    />
                </View>
			</TouchableOpacity>
		)
	}

	updateEditStatus=(currentp, newp, confirmp) => {
		let allFilled = currentp.length != 0
			&& newp.length != 0
			&& confirmp.length != 0;
		this.props.navigation.setParams({
			isEdited: allFilled
		});
	}

	updatePassword=()=> {
		// validate old password correctness
		let hashedPassword = hashPassword(this.state.password_current);
		if (hashedPassword !== this.props.user.hashed_password) {
			Alert.alert(strings('alert_title_error'), strings('invalid_old_password'));
			return;
		}

		// validate new password format
		if (!validatePassword(this.state.password_new)) {
			Alert.alert(strings('alert_title_error'), strings('invalid_new_password'));
			return;
		}

		if (hashedPassword === hashPassword(this.state.password_new)) {
			Alert.alert(strings('alert_title_error'), strings('same_old_new_passwords'));
			return;
		}

		// validate new password and confirmed password consistency
		if (this.state.password_new !== this.state.password_confirm) {
			Alert.alert(strings('alert_title_error'), strings('inconsistent_passwords'));
			return;
		}

		// update password
		const { dispatch } = this.props;
		let newHashedPassword = hashPassword(this.state.password_new);
		dispatch(user_update_password(newHashedPassword));
		dispatch(accounts_save(newHashedPassword));
        console.log("update password successfully.");
        Toast.show(strings('toast_update_success'), {
			position: Toast.positions.CENTER,
        	onHidden: () => {
				this.props.navigation.goBack();
			}
		});
	}

}

export default connect(state => { return ({ setting: state.setting, user: state.user }); })(Password);