import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	View,
	Text,
	TouchableWithoutFeedback,
	PermissionsAndroid,
    Platform,
	TouchableOpacity,
	Keyboard,
    Image,
	Dimensions,
	ScrollView,
} from 'react-native';
import Toast from 'react-native-root-toast';
import QRCode from 'react-native-qrcode-svg';
import { SubTextInput, alert_ok } from '../../common.js';
import {linkButtonColor} from '../../style_util';
import {mainColor} from '../../style_util';
import {strings} from "../../../locales/i18n";
import { generateQRCode, validateAmount, saveImage } from '../../../utils.js';
import ContextMenu from '../../contextMenu';
import {fixedHeight,fixedWidth} from '../../style_util';

const CIRCLE_SIZE = 20;
const SMALL_CIRCLE_SIZE = 8;
const SMALL_CIRCLE_COLOR = '#dfdfdf';
const {width,height} = Dimensions.get('window');
const draw_circle=()=>{
	const max = (width-60-CIRCLE_SIZE*2)/(SMALL_CIRCLE_SIZE+16);
	let ret=[];
	for(let i=0;i<max;i++){
		ret.push(
			<View key={i+''} style={{width:SMALL_CIRCLE_SIZE,height:SMALL_CIRCLE_SIZE, borderRadius: SMALL_CIRCLE_SIZE/2 , backgroundColor: SMALL_CIRCLE_COLOR, marginHorizontal:8}}/>
		)
	}
	return ret;
};
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
			alert_ok(strings('alert_title_error'), strings('invalid_amount'));
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
					alert_ok(strings('alert_title_error'), strings('receive.no_permission_save_file'));
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
                    alert_ok(strings('alert_title_error'), strings('error_save_qrcode_image'));
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
				<ScrollView style={{width, height, backgroundColor:mainColor, paddingHorizontal:30, paddingTop: 20,paddingBottom:20}}
							contentContainerStyle={{alignItems:'center'}}>
					<View style={{backgroundColor:'#fff', alignItems:'center',width:width-60, borderRadius:10}}>
						<View style={{height:60, width:width-60,alignItems:'center', justifyContent:'center', backgroundColor:'#dfdfdf',
									borderTopEndRadius: 10, borderTopStartRadius:10,
						}}>
							<Text style={{color:'black',fontSize:20, fontWeight: 'bold'}}>{strings('receive.instruction')}</Text>
						</View>
						<TouchableWithoutFeedback onLongPress={() => this.longPressCode()}>
							<View style={{alignItems: 'center', margin: 10, marginTop:20}} >
								<QRCode
									value={this.state.qrCodeValue}
									size={200}
									getRef={ref => {
										this.qrcodeRef = ref;
									}}
								/>
							</View>
						</TouchableWithoutFeedback>
						<TouchableOpacity style={{alignItems: 'center', margin: 10, marginBottom: 20}}>
							<Text style={{ color: linkButtonColor, }} onPress={() => this.saveQRCode()}>
								{strings('receive.button_save_receive_code')}
							</Text>
						</TouchableOpacity>
						<View style={{height:CIRCLE_SIZE, flexDirection:'row',justifyContent:'center', alignItems:'center'}}>
							<View style={{height:CIRCLE_SIZE,width:CIRCLE_SIZE/2,borderTopRightRadius:CIRCLE_SIZE/2,borderBottomRightRadius:CIRCLE_SIZE/2, backgroundColor:mainColor}}/>
							<View style={{flex:1,height:CIRCLE_SIZE, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
								{draw_circle()}
							</View>
							<View style={{height:CIRCLE_SIZE,width:CIRCLE_SIZE/2,borderTopLeftRadius:CIRCLE_SIZE/2,borderBottomLeftRadius:CIRCLE_SIZE/2, backgroundColor:mainColor}}/>
						</View>
						<View style={{paddingHorizontal:20, marginVertical: 20, height:100,width:'100%', justifyContent:'flex-start'}}>
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
										<Image source={require('../../../assets/refresh.png')} style={{width:20,height:20,tintColor:linkButtonColor}} resizeMode={'contain'}/>
									</TouchableOpacity>
								}
								unit={'AION'}
							/>
						</View>
					</View>

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
				</ScrollView>
			</TouchableOpacity>
		)
	}
}

export default connect(state => { return ({ accounts: state.accounts }); })(Receive);
