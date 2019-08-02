import React from 'react';
import { View, Text, StyleSheet, Dimensions, NativeModules, NativeEventEmitter, TouchableOpacity, Clipboard, Platform, PermissionsAndroid, ScrollView, ActivityIndicator } from 'react-native';

import QRCode from 'react-native-qrcode-svg';
import screenshotHelper from 'react-native-screenshot-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import defaultStyles from '../../../styles';
import { mainBgColor, linkButtonColor, fontColor } from '../../../style_util';
import { strings } from '../../../../locales/i18n';
import { alertOk, ComponentButton, InputMultiLines } from '../../../components/common';
import { saveImage } from '../../../../utils';
import { AppToast } from '../../../components/AppToast';
import { createAction } from '../../../../utils/dva';

const MyscrollView = Platform.OS === 'ios' ? KeyboardAwareScrollView : ScrollView;

const nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);
const { width } = Dimensions.get('window');

class ExportPrivateKey extends React.Component {
    static navigationOptions = () => {
        return {
            title: strings('export_private_key.title'),
        };
    };

    state = {
        isLoading: true,
    };

    constructor(props) {
        super(props);
        const { navigation, dispatch } = this.props;
        const accKey = navigation.getParam('currentAccount', '');
        console.log('acckey=>', accKey);
        dispatch(createAction('accountsModel/getPrivateKey')({ key: accKey })).then(pk => {
            console.log('pk=>', pk);
            this.privateKey = pk;
            this.setState({
                isLoading: false,
            });
        });
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            screenshotHelper.disableTakeScreenshot();
        } else {
            this.subscription = NativeModule.addListener('screenshot_taken', () => {
                AppToast.show(strings('toast_private_key_warning'), {
                    duration: AppToast.durations.LONG,
                    position: AppToast.positions.CENTER,
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
                console.log(`storagePermission: ${storagePermission}`);
                if (!storagePermission) {
                    alertOk(strings('alert_title_error'), strings('receive.no_permission_save_file'));
                    return;
                }
            }

            // save image
            this.qrcodeRef.toDataURL(base64 => {
                saveImage(base64, `private_key_qrcode_${Date.now()}.png`).then(
                    imagePath => {
                        console.log(`image path:${imagePath}`);
                        if (Platform.OS === 'android') {
                            AppToast.show(strings('toast_save_image_success', { path: imagePath }));
                        } else {
                            AppToast.show(strings('toast_save_image_to_album'));
                        }
                    },
                    error => {
                        console.log(error);
                        alertOk(strings('alert_title_error'), strings('error_save_qrcode_image'));
                    },
                );
            });
        }
    }

    // loading page
    renderLoadingView() {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: mainBgColor,
                }}
            >
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    }

    render() {
        if (this.state.isLoading) {
            return this.renderLoadingView();
        }
        return (
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
                        onPress={() => {
                            this.saveQRCode();
                        }}
                    >
                        <Text style={styles.saveButton}>{strings('export_private_key.button_save_image')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.privateKeyView}>
                    <InputMultiLines style={styles.privateKeyText} editable={false} value={this.privateKey} />
                </View>
                <ComponentButton
                    title={strings('copy_button')}
                    onPress={() => {
                        Clipboard.setString(this.privateKey);
                        AppToast.show(strings('toast_copy_success'));
                    }}
                />
            </MyscrollView>
        );
    }
}

export default connect()(ExportPrivateKey);

const styles = StyleSheet.create({
    container: {
        ...defaultStyles.container,
        backgroundColor: mainBgColor,
    },
    warningLabel: {
        color: fontColor,
        fontSize: 12,
        marginBottom: 10,
        textAlign: 'center',
    },
    qrCodeView: {
        ...defaultStyles.shadow,
        width: width - 40,
        borderRadius: 5,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    saveButton: {
        color: linkButtonColor,
        marginTop: 20,
    },
    privateKeyView: {
        ...defaultStyles.shadow,
        padding: 10,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        backgroundColor: 'white',
        width: width - 40,
        marginTop: 20,
        marginBottom: -5,
    },
    privateKeyText: {
        borderWidth: 0,
        flex: 1,
        fontSize: 16,
        fontWeight: 'normal',
        textAlignVertical: 'top',
    },
});
