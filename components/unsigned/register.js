import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, Button, Alert} from 'react-native';
import {ComponentPassword} from '../common.js';
import {validatePassword, hashPassword} from '../../utils.js';
import {user} from '../../actions/user.js';
import {generateMnemonic,AionAccount} from '../../libs/aion-hd-wallet/index.js';
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
					<Button
						title={strings("register.button_register")}
						onPress={e=>{
							if (!validatePassword(this.state.password))
								Alert.alert(strings('alert_title_error'),strings("register.error_password"));
							else if (this.state.password !== this.state.password_confirm)
								Alert.alert(strings('alert_title_error'),strings("register.error_dont_match"))
							else {
								const hashed_password = hashPassword(this.state.password);
								const mnemonic = generateMnemonic();
								dispatch(user(hashed_password, mnemonic));
								this.setState({
									password: '',
									password_confirm: '',
								});
								this.props.navigation.navigate('unsigned_register_mnemonic');
							}   
						}}
					/>
				</View>
			</View>
		);
	}
}

export default connect(state=>{
	return {
		user: state.user
	};
})(Home);