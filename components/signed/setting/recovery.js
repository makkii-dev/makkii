import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View,Keyboard,Clipboard, TouchableOpacity, Platform} from 'react-native';
import {InputMultiLines, ComponentButton} from '../../common.js';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-root-toast';
import styles from '../../styles.js';
import { strings } from '../../../locales/i18n';
import screenshotHelper from 'react-native-screenshot-helper';

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
		}
	}

	componentWillUnmount() {
		if (Platform.OS === 'android') {
			screenshotHelper.enableTakeScreenshot();
		}
	}

	render(){
		return (
			<TouchableOpacity activeOpacity={1} onPress={() => {Keyboard.dismiss()}}>
			<View style={styles.container}>
				<View style={styles.marginBottom40}>
                    <InputMultiLines
						style={{
							borderColor: 'grey',
							borderRadius: 5,
							borderWidth: 1,
							padding: 10,
							backgroundColor: '#E9F8FF',
							fontSize: 18
						}}
						editable={false}
						borderRadius={5}
						numberOfLines={3}
						value={this.props.user.mnemonic}
					/>
				</View>
				<View style={styles.marginBottom80}>
					<ComponentButton
						title={strings('copy_button')}
						onPress={e => {
							Clipboard.setString(this.props.user.mnemonic);
							Toast.show(strings('toast_copy_success'));
						}}
					/>
				</View>
                <View style={{
                	justifyContent: 'center',
					alignItems: 'center',
				}}>
                	<QRCode
                		size={200}
				      	value={this.props.user.mnemonic}
				    />	   
				</View>
			</View>
			</TouchableOpacity>
		)
	}
}

export default connect(state => { 
	return ({ 
		user: state.user 
	}); 
})(Recovery);