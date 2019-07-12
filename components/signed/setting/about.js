import React,{Component} from 'react';
import {connect} from 'react-redux';
import { Linking, Image, View, Text, Dimensions, TouchableOpacity, Platform, NativeModules} from 'react-native';

import AionCell from '../../cell.js';
import {strings} from '../../../locales/i18n';
import defaultStyles from '../../styles.js';
import {linkButtonColor, mainBgColor} from '../../style_util';
import {getLatestVersion, generateUpdateMessage} from '../../../utils';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import Config from 'react-native-config';
import {AppToast} from "../../../utils/AppToast";
import {popCustom} from "../../../utils/dva";

const {width,height} = Dimensions.get('window');

class About extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
			title: strings('about.title')
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	upgradeForAndroid = (version) => {
		var index = version.url.lastIndexOf('\/');
		let filename = version.url.substring(index + 1, version.url.length);

		let filePath = RNFS.CachesDirectoryPath + '/' + filename;
		console.log("download to " + filePath);
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
		    popCustom.hide();
			console.log("download result: ", result);
			if (result.statusCode === 200) {
				console.log("install apk: api level: " + DeviceInfo.getAPILevel() +
					",packageId: " + DeviceInfo.getBundleId() + ", filePath: " + filePath);
				NativeModules.InstallApk.install(DeviceInfo.getAPILevel(), DeviceInfo.getBundleId(), filePath);
			} else {
			    AppToast.show(strings('version_upgrade.toast_download_fail'));
			}
		}, error => {
		    console.log("download file error:", error);
			AppToast.show(strings('version_upgrade.toast_download_fail'));
		});

		popCustom.show(strings('version_upgrade.label_downloading'), '', [
			{
				text: strings('cancel_button'),
				onPress: ()=> {
					console.log("cancel downloading.");
					RNFS.stopDownload(download.jobId);
				}
			}
		], {
			type: 'progress',
			cancelable: false,
            canHide: true,
			callback: () => {},
			progress: 0.01,
		});
    }
    upgradeForIOS = (version) => {
		Linking.openURL("https://itunes.apple.com/us/app/makkii/id1457952857?ls=1&mt=8").catch(error => {
			console.log("open app store url failed: ", error);
			AppToast.show(strings('version_upgrade.toast_to_appstore_fail'));
		});
	}

	render(){
		return (
			<View style={{
				backgroundColor: mainBgColor,
                width: width,
				height: height,
				alignItems:'center',
				flex: 1,
			}}>
				<View style={{
					marginBottom:40,
					marginTop:40,
					justifyContent:'center',
					alignItems:'center',
				}}>
					<Image
						style={{
							width:50,
							height:50,
						}}
						resizeMode={'contain'}
						source={require('../../../assets/icon_app_logo.png')}
					/>
					<Text style={{
						marginTop: 15,
						fontSize: 22,
                        color: 'black',
					}}>{ strings('app_name') }</Text>
					<Text style={{
						marginTop: 15,
						fontSize: 14,
						color: 'black',
					}}>{strings('about.version_label')} {DeviceInfo.getVersion()}</Text>
				</View>
				<View style={{
				    ...defaultStyles.shadow,
				    marginBottom: 150,
					width: width - 40,
					borderRadius: 5,
					backgroundColor: 'white',
					paddingLeft: 10,
					paddingRight: 10,
				}} >
					<AionCell
						title={strings('about.version_update_button')}
						onClick={() => {
							let currentVersionCode = DeviceInfo.getBuildNumber();
							let lang = this.props.lang;
							if (lang === 'auto') {
								lang = DeviceInfo.getDeviceLocale().substring(0, 2);
							}
						    getLatestVersion(Platform.OS, currentVersionCode, lang).then(version=> {
						    	console.log("latest version is: ", version);
								if (version.versionCode <= currentVersionCode) {
									AppToast.show(strings('about.version_latest'));
								} else {
									let options = [
										{
											text: strings('cancel_button'), onPress: ()=> {}
										},
										{
											text: strings('alert_button_upgrade'),
											onPress: ()=> {
												if (Platform.OS === 'android') {
													setTimeout(() => this.upgradeForAndroid(version), 500);
												} else {
													this.upgradeForIOS();
												}
											}
										}
                                    ];
									if (version.mandatory) {
										options.shift();
									}
								    popCustom.show(strings('version_upgrade.alert_title_new_version'),
										generateUpdateMessage(version),
										options,
                                    {
								    	canHide: false,
										cancelable: false,
									});
								}
							}, err=> {
						        console.log("get latest version error: ", err);
								AppToast.show(strings('version_upgrade.toast_get_latest_version_fail'));
							});
						}}
					/>
				</View>
                <View style={{
                	position: 'absolute',
					bottom: 40,
					alignItems: 'center'
				}}>
					<Text style={{marginBottom: 40}}>
						Powered by Chaion
					</Text>
                    <View style={{
                    	flexDirection: 'row',
						justifyContent: 'space-between',
						marginBottom: 10,
					}}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('simple_webview', {
                                title: strings('terms_service.title'),
                                initialUrl: {uri: `${Config.app_server_static}/terms_services.html`},
                            });
                        }}>
                            <Text style={{...defaultStyles.center_text, color: linkButtonColor}}> {strings('about.terms_label')} </Text>
                        </TouchableOpacity>
                        <Text style={defaultStyles.center_text}>
                            {strings('about.label_and')}
                        </Text>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("simple_webview", {
                                title: strings('privacy_policy.title'),
                                initialUrl: {uri: `${Config.app_server_static}/privacy_policy.html`},
                            });
                        }}>
                            <Text style={{...defaultStyles.center_text, color: linkButtonColor}}> {strings('about.policy_label')} </Text>
                        </TouchableOpacity>
                    </View>
					<Text style={defaultStyles.center_text}>
						{strings('about.copyright_label')}
					</Text>
				</View>
			</View>
		);
	}
}
const mapToState = ({settingsModal})=>({
	lang: settingsModal.lang
});
export default connect(mapToState)(About);
