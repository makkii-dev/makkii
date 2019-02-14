import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	View,
	Text,
	Button,
	Alert,
	TouchableWithoutFeedback,
	TouchableOpacity,
	PermissionsAndroid
} from 'react-native';
import { Input } from '../../common.js';
import styles from '../../styles.js';
import QRCode from 'react-native-qrcode-svg';
import Toast from '../../toast.js';
import {strings} from "../../../locales/i18n";
import { generateQRCode, validateAmount, saveImage } from '../../../utils.js';
import ContextMenu from '../../contextMenu';


class Receive extends Component {

	static navigationOptions=({navigation})=>{
		return {
			title: strings('receive.title'),
			headerTitleStyle: {
				alignItems: 'center',
				textAlign: 'center',
				flex:1,
			},
			headerRight: <View></View>
		};
	};

	constructor(props){
		super(props);
		this.qrcodeRef = null;
		this.addr=this.props.navigation.state.params.address;
		this.state={
			amount: '0',
			qrCodeValue: generateQRCode('0', this.addr),
		}

	}

	onRefresh(){
	    // validate
		if (!validateAmount(this.state.amount)) {
			Alert.alert(strings('alert_title_error'), strings('invalid_amount'));
			return;
		}

		// refresh
		this.setState({
			qrCodeValue: generateQRCode(this.state.amount, this.addr),
		})
	}
	longPressCode() {
		if (this.contextMenu) {
			this.contextMenu.show();
		}
	}

	async saveQRCode() {
		if (this.qrcodeRef) {
		    // check storage permission first.
			const storagePermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
			console.log("storagePermission: " + storagePermission);
			if (!storagePermission) {
				Alert.alert(strings('alert_title_error'), strings('receive.no_permission_save_file'));
				return;
			}

			// save image
			this.qrcodeRef.toDataURL(base64 => {
                saveImage(base64, 'receive_qrcode_' + Date.now() + ".png").then(imagePath => {
                    console.log("image path:" + imagePath);
                    this.refs.toast.show(strings('toast_save_image_success', { path: imagePath}));
                }, error => {
                    console.log(error);
                    Alert.alert(strings('alert_title_error'), strings('error_save_qrcode_image'));
                });
			});
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		return (
			<View style={styles.container}>
				<View style={{marginTop: 40}}>
					<Text>{strings('receive.label_modify_amount')}</Text>
				</View>
				<View>
					<Input
						value={ this.state.amount}
						supportVisibility={false}
						onClear={e => {

						}}
						onChange={e => {
							this.setState({
								amount: e,
							})
						}}
					/>
				</View>
				<View style={styles.marginTop20}>
					<Button
						title={strings('refresh_button')}
						onPress={ () => this.onRefresh() }
					/>
				</View>
                <View style={{alignItems: 'center', marginTop: 80, marginBottom: 20}}>
                    <Text style={styles.instruction}>{strings('receive.instruction')}</Text>
                </View>
				<TouchableWithoutFeedback onLongPress={() => this.longPressCode()}>
                    <View style={{alignItems: 'center', margin: 10}} >
                        <QRCode
                            value={this.state.qrCodeValue}
                            size={200}
                            getRef={ref => {
                            	this.qrcodeRef = ref;
                            }}
                        />
                    </View>
                </TouchableWithoutFeedback>
				<View style={{alignItems: 'center', margin: 10}}>
					<Text style={{ color: 'blue', }} onPress={() => this.saveQRCode()}>
						{strings('receive.button_save_receive_code')}
					</Text>
				</View>
                <Toast
                    ref={"toast"}
                    duration={Toast.Duration.short}
                    onDismiss={() => {}}
                />
				<ContextMenu
					message={strings('save_file_button')}
					onClick={() => {
						this.contextMenu.hide();
						this.saveQRCode();
					}}
                    ref={(element) => {
                        this.contextMenu = element;
					}}
				/>
			</View>
		)
	}
}

export default connect(state => { return ({ accounts: state.accounts }); })(Receive);