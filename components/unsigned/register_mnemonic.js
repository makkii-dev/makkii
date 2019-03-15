import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Clipboard, Dimensions, NativeModules, Platform, NativeEventEmitter } from 'react-native';
import { ActionButton, InputMultiLines } from '../common.js';
import Toast from 'react-native-root-toast';
import {strings} from "../../locales/i18n";
import styles from '../styles.js';
import screenshotHelper from 'react-native-screenshot-helper';

const {width,height} = Dimensions.get('window');

var nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);

class Mnemonic extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       title: strings('unsigned_register_mnemonic.title')
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.user);
		if(this.props.user.mnemonic !== ''){

		}

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
			<View style={{
					flex: 1,
					padding: 40,
				}}
			>
                <Text style={{
                	fontSize: 16,
					marginBottom: 20
				}}>{strings('unsigned_register_mnemonic.hint')}</Text>
                <View style={{
                	elevation: 3,
					padding: 10,
                    borderRadius: 5,
					height: 130,
					backgroundColor: 'white',
					width: width - 80,
                    marginBottom: 100,
				}}>
                    <InputMultiLines
                        editable={false}
                        value={this.props.user.mnemonic}
                        style={{
                            borderWidth: 0,
                            fontSize: 18,
                            fontWeight: 'normal',
                            textAlignVertical: 'top'
                        }}
                    />
				</View>
                <ActionButton
                    title={strings('unsigned_register_mnemonic.btn_copy')}
                    onPress={e=>{
                        Clipboard.setString(this.props.user.mnemonic);
                        Toast.show(strings('unsigned_register_mnemonic.toast_copy_mnemonic'));
                    }}
                />
				<View style={{marginBottom: 20}} />
                <ActionButton
                    title={strings('unsigned_register_mnemonic.btn_done')}
                    onPress={e=>{
                        this.props.navigation.navigate('signed_vault');
                    }}
                />
			</View>
		);
	}
}

export default connect(state=>{return {user: state.user};})(Mnemonic);