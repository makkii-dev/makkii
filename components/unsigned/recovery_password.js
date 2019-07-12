import React, {Component} from 'react';
import {Dimensions, Keyboard,TouchableOpacity,View, Alert} from 'react-native';
import {PasswordInputWithTitle, ComponentButton, alert_ok } from '../common.js';
import {connect} from 'react-redux';
import {strings} from "../../locales/i18n";
import defaultStyles from '../styles';
import {mainBgColor} from '../style_util';
import {createAction, popCustom} from "../../utils/dva";
import {sendRecoveryEventLog} from "../../services/eventLogService";

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

	recovery = ()=>{
		const {dispatch, navigation } = this.props;
		const {password, password_confirm} = this.state;
		dispatch(createAction('userModel/register')({password_confirm,password, mnemonic: this.mnemonic}))
			.then(r=>{
				if(r){
					sendRecoveryEventLog();
					navigation.navigate('unsigned_register_mnemonic')
				}else{
					alert_ok(strings('alert_title_error'),r.error);
				}
			});
	};

	beforeRecovery = ()=>{
		const {dispatch, hashed_password} = this.props;
		if(hashed_password!==''){
			popCustom.show(
				strings('alert_title_warning'),
				strings('recovery.warning_mnemonic'),
				[
					{text: strings('cancel_button'),onPress:()=>{}},
					{text: strings('alert_ok_button'),onPress:()=>{
							Promise.all([
								dispatch(createAction('userModel/reset')()),
								dispatch(createAction('accountsModel/reset')()),
								dispatch(createAction('settingsModel/reset')),
								dispatch(createAction('ERC20Dex/reset')()),
								dispatch(createAction('txSenderModel/reset')()),
							]).then(this.recovery)
						}},
				]
			)
		}else{
			this.recovery()
		}
	};


	render(){
		const { password, password_confirm } = this.state;

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
						value={password}
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
						value={password_confirm}
						onChange={e=>{
							this.setState({
								password_confirm: e
							});
						}}
                    />
				</View>
				<ComponentButton
					disabled={password_confirm.length === 0 ||password.length === 0}
					title={strings('recovery_password.button_reset')}
					onPress={this.beforeRecovery}
				/>
			</TouchableOpacity>
		);
	}
}


const mapToState = ({userModel})=>({
	hashed_password: userModel.hashed_password
});
export default connect(mapToState)(Password);
