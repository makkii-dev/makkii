import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View,Text,TouchableOpacity, Linking, Keyboard, Dimensions, ImageBackground,BackHandler, NativeModules} from 'react-native';
import {ComponentLogo,PasswordInput, ComponentButton, alert_ok} from '../common.js';
import {hashPassword, getLatestVersion, generateUpdateMessage} from '../../utils';
import {fixedHeight, linkButtonColor, mainColor, mainBgColor} from '../style_util';
import defaultStyles from '../styles';
import {strings} from "../../locales/i18n";
import {createAction} from "../../utils/dva";

const {width,height} = Dimensions.get('window');

class Login extends Component {
	constructor(props){
		super(props);
        this.state = {
			password: '',
		}
	}
	async componentDidMount(){
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (this.props.navigation.isFocused()) {
                BackHandler.exitApp();
            }
        });
		Linking.getInitialURL().then(url => {
			console.log("linking url: " + url);
		});

		Linking.addEventListener('url', this.handleOpenURL);

        this.props.dispatch(createAction('settingsModel/checkForceVersion')());
	}

	componentWillUnmount() {
		console.log("unmount login");
        this.backHandler.remove();
		Linking.removeEventListener('url', this.handleOpenURL);
	}
	handleOpenURL = (event) => {
		console.log("linking url=" + event.url);
	};


	Login = ()=>{
	    const {password} = this.state;
	    const {hashed_password, dispatch} = this.props;
	    if(hashed_password === ''){
            alert_ok(strings('alert_title_error'), strings('unsigned_login.error_not_register'));
        }else if(hashed_password === hashPassword(password)){
            dispatch(createAction('userModel/login')());
        }else{
            alert_ok(strings('alert_title_error'), strings('unsigned_login.error_incorrect_password'));
        }

    };

	toRegister = ()=>{
        this.props.navigation.navigate('unsigned_register')
    };

	toRecovery = ()=>{
        this.props.navigation.navigate('unsigned_recovery')
    };

	render(){
		return (
                <ImageBackground
					style={{
                        flex: 1,
                        backgroundColor: mainBgColor,
                    }}
                    imageStyle={{width: width, height: fixedHeight(686)}}
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
                                disabled={this.state.password.length === 0}
                                onPress={this.Login}
                                title={strings('unsigned_login.btn_login')}
                            />
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                height: 40,
                                marginTop: 30
                            }}>
                                <TouchableOpacity onPress={this.toRegister}>
                                    <Text style={{color: linkButtonColor}}>{strings('unsigned_login.btn_register')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.toRecovery}>
                                    <Text style={{color: linkButtonColor}}>{strings('unsigned_login.btn_recovery')}</Text>
							    </TouchableOpacity>
						</View>
					</View>
					</TouchableOpacity>
                </ImageBackground>
		);
	}
}

const mapToState = ({userModel,settingsModel})=>({
    hashed_password: userModel.hashed_password,
    lang: settingsModel.lang
});

export default connect(mapToState)(Login);
