import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,TouchableOpacity, Linking, Keyboard, Dimensions, ImageBackground,BackHandler} from 'react-native';

import {ComponentLogo,PasswordInput, ComponentButton, alert_ok} from '../common.js';
import {hashPassword} from '../../utils.js';
import {user} from '../../actions/user.js';
import {accounts as accounts_action} from '../../actions/accounts';
import {dbGet,decrypt} from '../../utils.js';
import {linkButtonColor, mainColor, mainBgColor} from '../style_util';
import defaultStyles from '../styles';
import {strings} from "../../locales/i18n";
import GeneralStatusBar from '../GeneralStatusBar';

const {width,height} = Dimensions.get('window');

class Login extends Component {
	constructor(props){
		super(props);
		this.state = {
			password: '',
		}
	}
	async componentDidMount(){
		console.log("mount login");
		console.log('[route] ' + this.props.navigation.state.routeName);
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            BackHandler.exitApp();
        });
		Linking.getInitialURL().then(url => {
			console.log("linking url: " + url);
		});

		Linking.addEventListener('url', this.handleOpenURL);
	}
	componentWillUnmount() {
		console.log("unmount login");
        this.backHandler.remove();
		Linking.removeEventListener('url', this.handleOpenURL);
	}
	handleOpenURL = (event) => {
		console.log("linking url=" + event.url);
	};
	render(){
		const {dispatch} = this.props;
		return (
                <ImageBackground
					style={{
                        height: height,
                        width: width,
                        flex: 1,
                        backgroundColor: mainBgColor,
                    }}
                    source={require('../../assets/login_header_bg.png')}
				>
					<TouchableOpacity
						style={{
							flex: 1,
							alignItems: 'center',
						}}
						activeOpacity={1}
						onPress={() => {Keyboard.dismiss()}}
                    >
                        <GeneralStatusBar backgroundColor={mainColor}/>
                        <View style={{
                            ...defaultStyles.shadow,
                            marginTop: 160,
                            width: width - 80,
                            borderRadius: 10,
                            backgroundColor: 'white',
                            paddingHorizontal: 20,
                        }} >
                            <View style={{alignItems: 'center', marginBottom: 60}}>
                                <ComponentLogo style={{
                                    marginTop: -25,
                                }}/>
                            </View>
                            <PasswordInput
                                value={this.state.password}
                                placeholder={strings('unsigned_login.hint_enter_password')}
                                onChange={e=>{
                                    this.setState({
                                        password: e
                                    });
                                }}
                            />
                            <ComponentButton
                                style={{marginTop: 30}}
                                onPress={e => {
                                    dbGet('user')
                                        .then(json=>{
                                            let db_user = JSON.parse(json);
                                            if(db_user.hashed_password === hashPassword(this.state.password)){
                                                dispatch(user(db_user.hashed_password, db_user.mnemonic));
                                                dbGet('accounts').then(json=>{
                                                    let accounts = JSON.parse(decrypt(json, db_user.hashed_password))
                                                    this.props.dispatch(accounts_action(accounts));
                                                },err=>{});
                                                this.props.navigation.navigate('signed_vault');
                                            } else {
                                                alert_ok(strings('alert_title_error'), strings('unsigned_login.error_incorrect_password'));
                                            }
                                        },err=>{
                                            alert_ok(strings('alert_title_error'), strings('unsigned_login.error_login'));
                                        })
                                }}
                                title={strings('unsigned_login.btn_login')}
                            />
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                height: 40,
                                marginTop: 30
                            }}>
                                <TouchableOpacity
                                    onPress={e=>{
                                        this.props.navigation.navigate('unsigned_register')
                                    }}
                                >
                                    <Text style={{
                                        color: linkButtonColor
                                    }}>{strings('unsigned_login.btn_register')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={e=>{
                                        this.props.navigation.navigate('unsigned_recovery')
                                    }}
                                >
                                    <Text style={{
                                        color: linkButtonColor
                                    }}>{strings('unsigned_login.btn_recovery')}</Text>
							</TouchableOpacity>
						</View>
					</View>
					</TouchableOpacity>
                </ImageBackground>
		);
	}
}

export default connect(state => {
	return {
		user: state.user,
	};
})(Login);
