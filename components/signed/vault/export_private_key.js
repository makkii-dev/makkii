import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    NativeModules,
    NativeEventEmitter,
    TouchableOpacity,
    Clipboard,
    Platform,
    PermissionsAndroid, ScrollView
} from 'react-native';

import Toast from 'react-native-root-toast';
import defaultStyles from '../../styles.js';
import {mainBgColor, linkButtonColor, fontColor} from "../../style_util";
import {strings} from "../../../locales/i18n";
import QRCode from "react-native-qrcode-svg";
import {alert_ok, ComponentButton, InputMultiLines} from "../../common";
import {saveImage} from "../../../utils";
import screenshotHelper from 'react-native-screenshot-helper';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const MyscrollView = Platform.OS === 'ios'? KeyboardAwareScrollView:ScrollView;

const nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);
const {width} = Dimensions.get('window');

class ExportPrivateKey extends React.Component{

    static navigationOptions=({navigation})=>{

        return ({
            title: strings('export_private_key.title'),
        })
    };
    constructor(props){
        super(props);
        const {navigation} = this.props;
        this.privateKey = navigation.getParam('privateKey','');
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            screenshotHelper.disableTakeScreenshot();
        } else {
            this.subscription = NativeModule.addListener('screenshot_taken', () => {
                AppToast.show(strings('toast_private_key_warning'), {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER,
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
                saveImage(base64, 'private_key_qrcode_' + Date.now() + ".png").then(imagePath => {
                    console.log("image path:" + imagePath);
                    if (Platform.OS === 'android') {
                        AppToast.show(strings('toast_save_image_success', {path: imagePath}));
                    } else {
                        AppToast.show(strings('toast_save_image_to_album'));
                    }
                }, error => {
                    console.log(error);
                    alert_ok(strings('alert_title_error'), strings('error_save_qrcode_image'));
                });
            });
        }
    }
    render(){
        return(
            <MyscrollView style={styles.container}>
                <Text style={styles.warningLabel}>{strings('export_private_key.warning')}</Text>
                <View style={styles.qrCodeView}>
                    <QRCode
                        size={200}
                        value={this.privateKey}
                        getRef={ref => {
                            this.qrcodeRef = ref;
                        }}
                    />
                    <TouchableOpacity
                        onPress={()=>{
                            this.saveQRCode();
                        }}
                    >
                        <Text style={styles.saveButton}>{strings('export_private_key.button_save_image')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.privateKeyView}>
                    <InputMultiLines
                        style={styles.privateKeyText}
                        editable={false}
                        value={this.privateKey}
                    />
                </View>
                <ComponentButton
                    title={strings('copy_button')}
                    onPress={e => {
                        Clipboard.setString(this.privateKey);
                        AppToast.show(strings('toast_copy_success'));
                    }}
                />
            </MyscrollView>
        )
    }
}

export default ExportPrivateKey;

const styles= StyleSheet.create({
    container:{
        ...defaultStyles.container, backgroundColor: mainBgColor
    },
    warningLabel:{
        color: fontColor,
        fontSize: 12,
        marginBottom: 10,
        textAlign: 'center',
    },
    qrCodeView:{
        ...defaultStyles.shadow,
        width: width - 40,
        borderRadius: 5,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical:20,
    },
    saveButton:{
        color:linkButtonColor,
        marginTop:20,
    },
    privateKeyView:{
        ...defaultStyles.shadow,
        padding: 10,
        borderTopLeftRadius:5,
        borderTopRightRadius:5,
        backgroundColor: 'white',
        width: width - 40,
        marginTop: 20,
        marginBottom: -5,
    },
    privateKeyText:{
        borderWidth: 0,
        flex:1,
        fontSize: 16,
        fontWeight: 'normal',
        textAlignVertical: 'top'
    }

});
