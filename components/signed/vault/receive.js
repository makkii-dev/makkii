import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	View,
	Text,
	Alert,
	TouchableWithoutFeedback,
	PermissionsAndroid,
    Platform,
	TouchableOpacity,
	Keyboard,
    Image,
	ImageBackground,
	Dimensions,
} from 'react-native';
import Toast from 'react-native-root-toast';
import QRCode from 'react-native-qrcode-svg';
import {  SubTextInput } from '../../common.js';
import {mainColor} from '../../style_util';
import {strings} from "../../../locales/i18n";
import { generateQRCode, validateAmount, saveImage } from '../../../utils.js';
import ContextMenu from '../../contextMenu';

const {width,height} = Dimensions.get('window');
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
			if (Platform.OS === 'android') {
				// check storage permission first.
				const storagePermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
				console.log("storagePermission: " + storagePermission);
				if (!storagePermission) {
					Alert.alert(strings('alert_title_error'), strings('receive.no_permission_save_file'));
					return;
				}
			}

            // save image
            this.qrcodeRef.toDataURL(base64 => {
                saveImage(base64, 'receive_qrcode_' + Date.now() + ".png").then(imagePath => {
                    console.log("image path:" + imagePath);
                    if (Platform.OS === 'android') {
						Toast.show(strings('toast_save_image_success', {path: imagePath}));
					} else {
                        Toast.show(strings('toast_save_image_to_album'));
					}
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
			<TouchableOpacity style={{flex:1}} activeOpacity={1} onPress={() => {Keyboard.dismiss()}}>
				<View style={{flex:1, backgroundColor:mainColor, paddingHorizontal:20, paddingTop:40,paddingBottom:80}}>
			<ImageBackground source={require('../../../assets/receive_bg.png')} style={{flex:1, backgroundColor:mainColor, alignItems:'center'}}
							 imageStyle={{justifyContent:'flex-start',alignItems:'center'}}
							 resizeMode={'stretch'}
			>
				<Text style={{marginTop:15,fontSize:20, fontWeight: 'bold'}}>{strings('receive.instruction')}</Text>
				<TouchableWithoutFeedback onLongPress={() => this.longPressCode()}>
					<View style={{alignItems: 'center', margin: 10, marginTop:30}} >
						<QRCode
							value={this.state.qrCodeValue}
							size={200}
							getRef={ref => {
								this.qrcodeRef = ref;
							}}
						/>
					</View>
				</TouchableWithoutFeedback>
				<TouchableOpacity style={{alignItems: 'center', margin: 10}}>
					<Text style={{ color: 'blue', }} onPress={() => this.saveQRCode()}>
						{strings('receive.button_save_receive_code')}
					</Text>
				</TouchableOpacity>
				<View style={{marginTop:20, paddingHorizontal:20,height:100,width:'100%'}}>
				<SubTextInput
					title={strings('receive.label_modify_amount')}
					style={{
						flex:1,
						fontSize: 12,
						color: '#777676',
						borderColor: '#8c8a8a',
						borderBottomWidth: 1,
					}}
					value={ this.state.amount}
					keyboardType={'decimal-pad'}
					onChangeText={e => {
						this.setState({
							amount: e,
						})
					}}
					rightView={()=>
						<TouchableOpacity onPress={()=>this.onRefresh()}>
							<Image source={require('../../../assets/refresh.png')} style={{width:20,height:20,tintColor:'blue'}} resizeMode={'contain'}/>
						</TouchableOpacity>
					}
					unit={'AION'}
				/>
				</View>

			</ImageBackground>
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
			</TouchableOpacity>
		)
	}
}

export default connect(state => { return ({ accounts: state.accounts }); })(Receive);
