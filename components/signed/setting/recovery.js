import React,{Component} from 'react';
import {connect} from 'react-redux';
import {
	Dimensions,
	View,
	Clipboard,
	Platform,
	NativeModules,
	NativeEventEmitter} from 'react-native';
import screenshotHelper from 'react-native-screenshot-helper';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-root-toast';

import {InputMultiLines, ComponentButton} from '../../common.js';
import defaultStyles from '../../styles.js';
import {mainBgColor} from '../../style_util';
import { strings } from '../../../locales/i18n';

var nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);
const {width} = Dimensions.get('window');

class Recovery extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
			title: strings('recovery_phrase.title'),
	    };
    };
	constructor(props){
		super(props);
		console.log('[route] ' + this.props.navigation.state.routeName);
	}


	componentDidMount() {
		if (Platform.OS === 'android') {
			screenshotHelper.disableTakeScreenshot();
		} else {
			this.subscription = NativeModule.addListener('screenshot_taken',() => {
				Toast.show(strings('toast_mnemonic_share_warning'), {
					duration: Toast.durations.LONG,
					position: Toast.positions.CENTER
				});
			});
		}
	}

	componentWillUnmount() {
		if (Platform.OS === 'android') {
			screenshotHelper.enableTakeScreenshot();
		} else {
			this.subscription.remove();
		}
	}

	render(){
		return (
			<View style={{...defaultStyles.container, backgroundColor: mainBgColor}}>
				<View style={{
				    ...defaultStyles.shadow,
					width: width - 40,
                    height: width - 40,
					borderRadius: 5,
					backgroundColor: 'white',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
					<QRCode
						size={200}
						value={this.props.user.mnemonic}
					/>
				</View>
				<View style={{
				    ...defaultStyles.shadow,
					padding: 10,
					height: 120,
					borderTopLeftRadius:5,
					borderTopRightRadius:5,
					backgroundColor: 'white',
					width: width - 40,
					marginTop: 20,
					marginBottom: -5,
				}}>
                    <InputMultiLines
						style={{
							borderWidth: 0,
							fontSize: 16,
							fontWeight: 'normal',
							textAlignVertical: 'top'
						}}
						editable={false}
						value={this.props.user.mnemonic}
					/>
				</View>
                <ComponentButton
                    title={strings('copy_button')}
                    onPress={e => {
                        Clipboard.setString(this.props.user.mnemonic);
                        Toast.show(strings('toast_copy_success'));
                    }}
                />
			</View>
		)
	}
}

export default connect(state => {
	return ({
		user: state.user
	});
})(Recovery);
