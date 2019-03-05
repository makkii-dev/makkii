import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, Alert, TouchableOpacity, Keyboard} from 'react-native';
import {ComponentButton,ComponentPassword} from '../common.js';
import {validatePassword, hashPassword, dbGet} from '../../utils.js';
import {user} from '../../actions/user.js';
import {delete_accounts} from "../../actions/accounts";
import {generateMnemonic} from '../../libs/aion-hd-wallet/index.js';
import styles from '../styles.js';
import {strings} from "../../locales/i18n";


class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
			title: strings('register.title'),
	    };   
    };
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
			<TouchableOpacity activeOpacity={1} onPress={() => {Keyboard.dismiss()}}>
			<View style={styles.container}>
				<View>
					<Text>{strings("register.label_password")}</Text>
				</View>
				<View style={styles.marginBottom10}>
					<ComponentPassword 
						value={this.state.password}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
				</View>
				<View>
					<Text>{strings("register.label_confirm_password")}</Text>
				</View>
				<View style={styles.marginBottom20}>
					<ComponentPassword
						value={this.state.password_confirm} 
						onChange={e=>{
							this.setState({
								password_confirm: e
							});
						}}
					/>
				</View>
				<View>  
					<ComponentButton
						title={strings("register.button_register")}
						onPress={e=>{
							if (!validatePassword(this.state.password))
								Alert.alert(strings('alert_title_error'),strings("register.error_password"));
							else if (this.state.password !== this.state.password_confirm)
								Alert.alert(strings('alert_title_error'),strings("register.error_dont_match"));
							else {
								const hashed_password = hashPassword(this.state.password);
								const mnemonic = generateMnemonic();
								dbGet('user').then(userJson=>{
									Alert.alert( 
										strings('alert_title_warning'),
										strings("register.warning_register_again"),
										[
											{text: strings('cancel_button'),onPress:()=>{}},
											{text: strings('alert_ok_button'),onPress:()=>{
												console.log('mnemonic ', mnemonic);
												dispatch(user(hashed_password, mnemonic));
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