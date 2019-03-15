import React,{Component} from 'react';
import {connect} from 'react-redux';
import {
	Dimensions,
	View,
	Keyboard,
	Clipboard,
	TouchableOpacity,
	Platform,
	NativeModules,
	NativeEventEmitter} from 'react-native';
import {InputMultiLines, UnsignedActionButton} from '../../common.js';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-root-toast';
import styles from '../../styles.js';
import { strings } from '../../../locales/i18n';
import screenshotHelper from 'react-native-screenshot-helper';

var nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);
const {width,height} = Dimensions.get('window');

class Recovery extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
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
			<View style={{...styles.container, backgroundColor: '#eeeeee'}}>
				<View style={{
					width: width - 40,
                    height: width - 40,
					borderRadius: 5,
					backgroundColor: 'white',
					elevation: 3,
					justifyContent: 'center',
					alignItems: 'center',
				}}>
					<QRCode
						size={200}
						value={this.props.user.mnemonic}
					/>
				</View>
				<View style={{
					elevation: 3,
					padding: 10,
					borderRadius: 5,
					height: 100,
					backgroundColor: 'white',
					width: width - 40,
					marginTop: 20,
				}}>
                    <InputMultiLines
						style={{
							borderWidth: 0,
							fontSize: 18,
							fontWeight: 'normal',
							textAlignVertical: 'top'
						}}
						editable={false}
						borderRadius={5}
						numberOfLines={3}
						value={this.props.user.mnemonic}
					/>
				</View>
                <UnsignedActionButton
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