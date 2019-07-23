import React,{Component} from 'react';
import {connect} from 'react-redux';
import {
	Dimensions,
	View,
	Clipboard,
	Platform,
	NativeModules,
	NativeEventEmitter, ScrollView
} from 'react-native';
import screenshotHelper from 'react-native-screenshot-helper';
import QRCode from 'react-native-qrcode-svg';
import {InputMultiLines, ComponentButton} from '../../common.js';
import defaultStyles from '../../styles.js';
import {mainBgColor} from '../../style_util';
import { strings } from '../../../locales/i18n';
import {AppToast} from "../../../utils/AppToast";
import {MnemonicView} from "../../common";

const nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);
const {width} = Dimensions.get('window');

class Recovery extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			title: strings('recovery_phrase.title'),
		};
	};

	componentWillMount() {
		if (Platform.OS === 'android') {
			screenshotHelper.disableTakeScreenshot();
		} else {
			this.subscription = NativeModule.addListener('screenshot_taken',() => {
				AppToast.show(strings('toast_mnemonic_share_warning'), {
					duration: AppToast.durations.LONG,
					position: AppToast.positions.CENTER
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

	renderMnemonic = ()=>{
		const mnemonic = this.props.navigation.getParam('mnemonic','');
		return mnemonic.split(' ').map(str=>{
			return(
				<MnemonicView
					key={str}
					canDelete={false}
					disabled={true}
					onSelected={()=>{}}
					text={str}
				/>
			)
		})
	};

	render(){
		const mnemonic = this.props.navigation.getParam('mnemonic','');
		return (
			<ScrollView>
				<View style={{...defaultStyles.container, backgroundColor: mainBgColor}}>
					<View style={{
						...defaultStyles.shadow,
						width: width - 40,
						height: width - 70,
						borderRadius: 5,
						backgroundColor: 'white',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<QRCode
							size={180}
							value={mnemonic}
						/>
					</View>
					<View style={{
						...defaultStyles.shadow,
						padding: 10,
						borderTopLeftRadius:5,
						borderTopRightRadius:5,
						backgroundColor: 'white',
						width: width - 40,
						marginTop: 20,
						marginBottom: -5,
						flexDirection: 'row', flexWrap: 'wrap'
					}}>
						{this.renderMnemonic()}
					</View>
					<ComponentButton
						title={strings('copy_button')}
						onPress={e => {
							Clipboard.setString(mnemonic);
							AppToast.show(strings('toast_copy_success'));
						}}
					/>
				</View>
			</ScrollView>
		)
	}
}


export default connect()(Recovery);
