import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,TouchableOpacity, Alert, Linking, Keyboard, Dimensions, ImageBackground} from 'react-native';

import {ComponentLogo,PasswordInput, UnsignedActionButton} from '../common.js';
import {hashPassword} from '../../utils.js';
import {user} from '../../actions/user.js';
import {accounts as accounts_action} from '../../actions/accounts';
import {dbGet,decrypt} from '../../utils.js';
import {linkButtonColor, mainColor} from '../style_util';
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
		console.log('[store.user] ' + JSON.stringify(this.props.user));

		Linking.getInitialURL().then(url => {
			console.log("linking url: " + url);
		});

		Linking.addEventListener('url', this.handleOpenURL);
	}
	componentWillUnmount() {
		console.log("unmount login");
		Linking.removeEventListener('url', this.handleOpenURL);
	}
	handleOpenURL = (event) => {
		console.log("linking url=" + event.url);
	}
	render(){
		const {dispatch} = this.props;
		return (
                <ImageBackground
					style={{
                        height: height,
                        width: width,
                        flex: 1,
                    }}
                    source={require('../../assets/login_header_bg.png')}
				>
					<TouchableOpacity
						style={{
							flex: 1,
							alignItems: 'center'
						}}
						activeOpacity={1}
						onPress={() => {Keyboard.dismiss()}}
                    >
                        <GeneralStatusBar backgroundColor={mainColor}/>
                        <View style={{marginTop: 60}} />
                        <ComponentLogo />
                        <View style={{
                            marginTop: 60,
                            width: width - 80,
                            height: 250,
                            borderRadius: 10,
                            backgroundColor: 'white',
                            elevation: 3,
                            paddingLeft: 20,
                            paddingRight: 20,
                            paddingTop: 40,
                        }} >
                            <PasswordInput
                                value={this.state.password}
                                placeholder={strings('unsigned_login.hint_enter_password')}
                                onChange={e=>{
                                    this.setState({
                                        password: e
                                    });
                                }}
                            />
                            <View style={{marginTop: 40}}/>
                            <UnsignedActionButton
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
                                                Alert.alert(strings('alert_title_error'), strings('unsigned_login.error_incorrect_password'));
                                            }
                                        },err=>{
                                            Alert.alert(strings('alert_title_error'), strings('unsigned_login.error_login'));
                                        })
                                }}
                                title={strings('unsigned_login.btn_login')}
                            />
                            <View style={{
                                flex: 1,
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
