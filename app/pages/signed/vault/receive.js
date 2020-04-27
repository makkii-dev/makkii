import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NativeModules, View, Text, TouchableWithoutFeedback, PermissionsAndroid, Platform, TouchableOpacity, Keyboard, Image, Dimensions, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { validator } from 'lib-common-util-js';
import { SubTextInput, alertOk } from '../../../components/common';
import { linkButtonColor, mainColor } from '../../../style_util';

import { strings } from '../../../../locales/i18n';
import { generateQRCode, saveImage } from '../../../../utils';
import ContextMenu from '../../../components/ContextMenu';
import { AppToast } from '../../../components/AppToast';

const BaiduMobStat = NativeModules.BaiduMobStat;
const MyScrollView = Platform.OS === 'ios' ? KeyboardAwareScrollView : ScrollView;
const CIRCLE_SIZE = 20;
const SMALL_CIRCLE_SIZE = 8;
const SMALL_CIRCLE_COLOR = '#dfdfdf';
const { width } = Dimensions.get('window');
const drawCircle = () => {
    const max = (width - 60 - CIRCLE_SIZE * 2) / (SMALL_CIRCLE_SIZE + 16);
    const ret = [];
    for (let i = 0; i < max; i++) {
        ret.push(
            <View
                key={`${i}`}
                style={{
                    width: SMALL_CIRCLE_SIZE,
                    height: SMALL_CIRCLE_SIZE,
                    borderRadius: SMALL_CIRCLE_SIZE / 2,
                    backgroundColor: SMALL_CIRCLE_COLOR,
                    marginHorizontal: 8,
                }}
            />,
        );
    }
    return ret;
};
class Receive extends Component {
    static navigationOptions = () => {
        return {
            title: strings('receive.title'),
            headerRight: <View />,
        };
    };

    constructor(props) {
        super(props);
        this.qrcodeRef = null;
        const { currentAccount, currentToken } = this.props;
        this.state = {
            amount: '0',
            qrCodeValue: generateQRCode('0', currentAccount.address, currentAccount.symbol, currentToken.contractAddr, currentToken.tokenDecimal),
        };
    }

    componentDidMount() {
        BaiduMobStat.onPageStart('Receive');
    }

    componentWillUnmount() {
        BaiduMobStat.onPageEnd('Receive');
    }

    onRefresh() {
        // validate
        if (!validator.validateAmount(this.state.amount)) {
            alertOk(strings('alert_title_error'), strings('invalid_amount'));
            return;
        }
        const { currentAccount, currentToken } = this.props;
        // refresh
        this.setState({
            qrCodeValue: generateQRCode(this.state.amount, currentAccount.address, currentAccount.symbol, currentToken.contractAddr, currentToken.tokenDecimal),
        });
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
                console.log(`storagePermission: ${storagePermission}`);
                if (!storagePermission) {
                    alertOk(strings('alert_title_error'), strings('receive.no_permission_save_file'));
                    return;
                }
            }

            // save image
            this.qrcodeRef.toDataURL(base64 => {
                saveImage(base64, `receive_qrcode_${Date.now()}.png`).then(
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

    render() {
        return (
            <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={1}
                onPress={() => {
                    Keyboard.dismiss();
                }}
            >
                <MyScrollView style={{ backgroundColor: mainColor }} keyboardShouldPersistTaps="always">
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: mainColor,
                            paddingHorizontal: 30,
                            paddingTop: 20,
                            paddingBottom: 20,
                            alignItems: 'center',
                        }}
                    >
                        <View style={{ backgroundColor: '#fff', width: width - 60, borderRadius: 10 }} contentContainerStyle={{ alignItems: 'center' }}>
                            <View
                                style={{
                                    height: 60,
                                    width: width - 60,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#dfdfdf',
                                    borderTopEndRadius: 10,
                                    borderTopStartRadius: 10,
                                }}
                            >
                                <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold' }}>{strings('receive.instruction')}</Text>
                            </View>
                            <TouchableWithoutFeedback onLongPress={() => this.longPressCode()} onPress={() => Keyboard.dismiss()}>
                                <View style={{ alignItems: 'center', margin: 10, marginTop: 20 }}>
                                    <QRCode
                                        value={this.state.qrCodeValue}
                                        size={200}
                                        getRef={ref => {
                                            this.qrcodeRef = ref;
                                        }}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableOpacity style={{ alignItems: 'center', margin: 10, marginBottom: 20 }}>
                                <Text style={{ color: linkButtonColor }} onPress={() => this.saveQRCode()}>
                                    {strings('receive.button_save_receive_code')}
                                </Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    height: CIRCLE_SIZE,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View
                                    style={{
                                        height: CIRCLE_SIZE,
                                        width: CIRCLE_SIZE / 2,
                                        borderTopRightRadius: CIRCLE_SIZE / 2,
                                        borderBottomRightRadius: CIRCLE_SIZE / 2,
                                        backgroundColor: mainColor,
                                    }}
                                />
                                <View
                                    style={{
                                        flex: 1,
                                        height: CIRCLE_SIZE,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    {drawCircle()}
                                </View>
                                <View
                                    style={{
                                        height: CIRCLE_SIZE,
                                        width: CIRCLE_SIZE / 2,
                                        borderTopLeftRadius: CIRCLE_SIZE / 2,
                                        borderBottomLeftRadius: CIRCLE_SIZE / 2,
                                        backgroundColor: mainColor,
                                    }}
                                />
                            </View>
                            <View
                                style={{
                                    paddingHorizontal: 20,
                                    marginVertical: 20,
                                    height: 100,
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <SubTextInput
                                    title={strings('receive.label_modify_amount')}
                                    style={{
                                        flex: 1,
                                        fontSize: 12,
                                        color: '#777676',
                                        borderColor: '#8c8a8a',
                                        borderBottomWidth: 1,
                                        paddingBottom: 5,
                                    }}
                                    value={this.state.amount}
                                    placeholder={strings('receive.amount_placeholder')}
                                    keyboardType="decimal-pad"
                                    onChangeText={e => {
                                        this.setState({
                                            amount: e,
                                        });
                                    }}
                                    rightView={() => (
                                        <TouchableOpacity onPress={() => this.onRefresh()}>
                                            <Image
                                                source={require('../../../../assets/icon_refresh.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    tintColor: linkButtonColor,
                                                }}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    )}
                                    unit={this.unit}
                                />
                            </View>
                        </View>

                        <ContextMenu
                            message={strings('save_file_button')}
                            onClick={() => {
                                this.contextMenu.hide();
                                this.saveQRCode();
                            }}
                            ref={element => {
                                this.contextMenu = element;
                            }}
                        />
                    </View>
                </MyScrollView>
            </TouchableOpacity>
        );
    }
}

const mapToState = ({ accountsModel }) => {
    const { currentAccount: key, currentToken: tokenKey, accountsMap, tokenLists } = accountsModel;
    const currentAccount = {
        ...accountsMap[key],
        coinSymbol: tokenKey === '' ? accountsMap[key].symbol : tokenKey,
    };
    const tokens = tokenLists[currentAccount.symbol] || {};
    return {
        currentAccount,
        currentToken: tokens[tokenKey] || {},
    };
};

export default connect(mapToState)(Receive);
