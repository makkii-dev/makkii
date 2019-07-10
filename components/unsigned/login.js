import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Platform, View,Text,TouchableOpacity, Linking, Keyboard, Dimensions, ImageBackground,BackHandler, NativeModules} from 'react-native';

import {ComponentLogo,PasswordInput, ComponentButton, alert_ok} from '../common.js';
import {user} from '../../actions/user.js';
import {dbGet,hashPassword, getLatestVersion, generateUpdateMessage} from '../../utils';
import {fixedHeight, linkButtonColor, mainColor, mainBgColor} from '../style_util';
import defaultStyles from '../styles';
import {strings} from "../../locales/i18n";
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import {AppToast} from "../../utils/AppToast";
import {popCustom} from "../../utils/dva";
import {sendLoginEventLog} from "../../services/eventLogService";

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
            if (this.props.navigation.isFocused()) {
                BackHandler.exitApp();
            }
        });
		Linking.getInitialURL().then(url => {
			console.log("linking url: " + url);
		});

		Linking.addEventListener('url', this.handleOpenURL);

		let versionCode = DeviceInfo.getBuildNumber();
		console.log("current version code: " + versionCode);
		let lang = this.props.setting.lang;
		if (lang === 'auto') {
            lang = DeviceInfo.getDeviceLocale().substring(0, 2);
        }
		getLatestVersion(Platform.OS, versionCode, lang).then(version=> {
		    console.log("latest version: ", version);
            if (versionCode != version.versionCode && version.mandatory) {
                this.popupUpdateDialog(version);
            }
        }, err=>{
		    // ignore error condition just like there is no mandatory version.
		    console.log("get latest version error:", err);
        });
	}
	popupUpdateDialog=(version) => {
        popCustom.show(strings('version_upgrade.alert_title_new_version'),
           generateUpdateMessage(version), [
            {
                text: strings('alert_button_upgrade'),
                onPress: () => {
                    if (Platform.OS === 'android') {
                        setTimeout(() => this.upgradeForAndroid(version), 500);
                    } else {
                        this.upgradeForiOS();
                    }
                }
            }
        ], {
            forceExist: Platform.OS === 'ios',
            canHide: false,
            cancelable: false,
        });
    }
	componentWillUnmount() {
		console.log("unmount login");
        this.backHandler.remove();
		Linking.removeEventListener('url', this.handleOpenURL);
	}
	tryDownload=(version, filePath) => {
        popCustom.show(strings('version_upgrade.label_downloading'), '', [], {
            type: 'progress',
            cancelable: false,
            canHide: false,
            callback: () => {
            },
            progress: 0.01,
        });
        let download = RNFS.downloadFile({
            fromUrl: version.url,
            toFile: filePath,
            progress: res => {
                let progress = res.bytesWritten / res.contentLength;
                console.log("progress: " + progress);
                popCustom.setProgress(progress);
            },
            progressDivider: 1
        });
        download.promise.then(result => {
            this.popupUpdateDialog(version);
            console.log("download result: ", result);
            if (result.statusCode == 200) {
                console.log("install apk: " + DeviceInfo.getAPILevel() + " " + DeviceInfo.getBundleId());
                NativeModules.InstallApk.install(DeviceInfo.getAPILevel(), DeviceInfo.getBundleId(), filePath);
            } else {
                AppToast.show(strings('version_upgrade.toast_download_fail'));
            }
        }, error => {
            console.log("download error: ", error);
            AppToast.show(strings('version_upgrade.toast_download_fail'));
            this.popupUpdateDialog(version);
        });
    }
	upgradeForAndroid = (version) => {
        var index = version.url.lastIndexOf('\/');
        let filename = version.url.substring(index + 1, version.url.length);

        let filePath = RNFS.CachesDirectoryPath + '/' + filename;
        console.log("download to " + filePath);

        this.tryDownload(version, filePath);
    }
    upgradeForiOS = () => {
	    Linking.openURL("https://itunes.apple.com/us/app/makkii/id1457952857?ls=1&mt=8").catch(error => {
            console.log("open app store url failed: ", error);
            AppToast.show(strings('version_upgrade.toast_to_appstore_fail'));
        });
    }
	handleOpenURL = (event) => {
		console.log("linking url=" + event.url);
	};
	render(){
		const {dispatch,setting} = this.props;
		const {navigate} = this.props.navigation;
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
                                onPress={e => {
                                    dbGet('user')
                                        .then(json=>{
                                            let db_user = JSON.parse(json);
                                            console.log('setting', setting);
                                            if(db_user.hashed_password === hashPassword(this.state.password)){
                                                listenApp.handleTimeOut = ()=>{navigate('unsigned_login');listenApp.stop()};
                                                listenApp.handleActive = setting.pinCodeEnabled?()=>navigate('unlock',{cancel:false}):()=>{};
                                                listenApp.timeOut = setting.login_session_timeout;
                                                listenApp.start();

                                                sendLoginEventLog();

                                                navigate('signed_home');
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
        setting: state.setting,
	};
})(Login);
