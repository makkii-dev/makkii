import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View, Alert, TouchableOpacity, Keyboard, Dimensions} from 'react-native';
import {ComponentButton,PasswordInput, alert_ok} from '../common.js';
import {validatePassword, hashPassword, dbGet} from '../../utils';
import {user} from '../../actions/user.js';
import {delete_accounts} from "../../actions/accounts";
import {generateMnemonic} from '../../libs/aion-hd-wallet/index.js';
import {strings} from "../../locales/i18n";
import {mainColor, mainBgColor} from '../style_util';
import defaultStyles from '../styles';
import {setting_update_pincode_enabled} from "../../actions/setting";

const {width,height} = Dimensions.get('window');

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			title: strings("register.title"),
		};
	}
	constructor(props){
		super(props);
		this.state = {
			password: '',
			password_confirm: '',
			// alert once if there is data loaded from db when user wanna register new account
			// user will lose data if register new one
			alerted: false,
		};
	}
	async componentDidMount(){
	}
	render(){
		const { dispatch } = this.props;
		return (
			<TouchableOpacity activeOpacity={1} onPress={() => {Keyboard.dismiss()}} style={{
				flex: 1,
                width:width,
				height:height,
				alignItems:'center',
				backgroundColor: mainBgColor,
			}}>
                <View style={{
                	position: 'absolute',
					top: 0,
                	width: width,
                	height: 200,
					backgroundColor: mainColor,
				}}>
				</View>
				<View style={{
				    ...defaultStyles.shadow,
					marginTop: 60,
					width: width - 80,
					height: 300,
					borderRadius: 10,
					backgroundColor: 'white',
					paddingLeft: 20,
					paddingRight: 20,
					paddingTop: 40,
				}} >
					<PasswordInput
						value={this.state.password}
						placeholder={strings('register.hint_enter_password')}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
                    <View style={{marginTop: 30}}/>
					<PasswordInput
						value={this.state.password_confirm}
						placeholder={strings('register.hint_enter_confirm_password')}
						onChange={e=>{
							this.setState({
								password_confirm: e
							});
						}}
					/>
					<View style={{marginTop: 40}}/>
					<ComponentButton
						title={strings("register.button_register")}
						onPress={e=>{
							if (!validatePassword(this.state.password))
								alert_ok(strings('alert_title_error'),strings("register.error_password"));
							else if (this.state.password !== this.state.password_confirm)
								alert_ok(strings('alert_title_error'),strings("register.error_dont_match"));
							else {
								const hashed_password = hashPassword(this.state.password);
								const mnemonic = generateMnemonic();
								dbGet('user').then(userJson=>{
									popCustom.show(
										strings('alert_title_warning'),
										strings("register.warning_register_again"),
										[
											{text: strings('cancel_button'),onPress:()=>{}},
											{text: strings('alert_ok_button'),onPress:()=>{
													console.log('mnemonic ', mnemonic);
													dispatch(user(hashed_password, mnemonic));
													dispatch(setting_update_pincode_enabled(false,false));
													dispatch(delete_accounts(hashed_password));
													this.props.navigation.navigate('unsigned_register_mnemonic')

												}},
										]
									)
								},err=>{
									dispatch(user(hashed_password, mnemonic));
									this.props.navigation.navigate('unsigned_register_mnemonic')
								})
							}
						}}
					/>
				</View>
			</TouchableOpacity>
		);
	}
}

export default connect(state=>{
	return {
		user: state.user
	};
})(Home);
