import {strings} from '../../../locales/i18n';
import {connect} from 'react-redux';
import React, {Component} from 'react';
import {validateAddress} from "../../../coins/api";
import {mainBgColor, linkButtonColor} from '../../style_util';
import {Text, Platform, View, TouchableOpacity, StyleSheet, Keyboard, Image, PixelRatio, Dimensions, ScrollView} from 'react-native';
import {RightActionButton,SubTextInput} from '../../common';
import defaultStyles from '../../styles';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Toast from 'react-native-root-toast';
import {add_address, update_address} from '../../../actions/user';
import {accountKey} from '../../../utils/index';
import {COINS} from '../../../coins/support_coin_list';

const MyscrollView = Platform.OS === 'ios'? KeyboardAwareScrollView:ScrollView;
const {width} = Dimensions.get('window');

class AddAddress extends Component {
    static navigationOptions = ({navigation}) => {
        return ({
            title: strings('add_address.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <RightActionButton
                    btnTitle={strings('add_address.btn_save')}
                    onPress={() => {
                        const addAddress = navigation.state.params.addAddress;
                        addAddress();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                />
            )
        })
    };

    constructor(props) {
        super(props);
        this.address = props.navigation.getParam('address');
        if (this.address !== undefined) {
            this.name = props.navigation.getParam('name');
            this.symbol = props.navigation.getParam('symbol');
            this.oldAddressKey = accountKey(this.symbol, this.address);
            this.newSymbol = this.symbol;
        } else {
            this.newSymbol = 'AION';
        }
        this.state = {
            name: this.name === undefined? '': this.name,
            address: this.address === undefined? '': this.address,
            coinName: this.symbol === undefined? COINS[this.newSymbol].name + "/" + this.newSymbol: COINS[this.symbol].name + "/" + this.symbol,
        };
    }

    componentWillMount() {
        this.props.navigation.setParams({
            isAdd: this.name === undefined,
            addAddress: this.addAddress,
            isEdited: false,
        });
    }

    async componentWillReceiveProps(props) {
        let scannedData = props.navigation.getParam('scanned', '');
        if (scannedData !== '' && this.oldScannedData !== scannedData) {
            this.oldScannedData = scannedData;
            validateAddress(scannedData, this.newSymbol).then(isValidAddress => {
                let address = scannedData;
                if (!isValidAddress) {
                    try {
                        let json = JSON.parse(scannedData);
                        address = json.receiver;
                    } catch (error) {
                        console.log("parse qrcode failed: ", error);
                        // did nothing.
                        return;
                    }
                }
                this.setState({
                    address: address,
                });
                this.updateEditStatus(this.state.name, address);
            });
        }
    }

    addAddress=() => {
        const {name, address} = this.state;

        validateAddress(address, this.newSymbol).then(isValid => {
            if (!isValid) {
                AppToast.show(strings('add_address.error_address_format', { coin: this.newSymbol }), {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER
                });
                return;
            }

            let address_book = this.props.user.address_book;
            let newKey = accountKey(this.newSymbol, address);
            if (Object.keys(address_book).indexOf(newKey) >= 0)  {
                if (this.address === undefined || (this.address !== undefined && address !== this.address)) {
                    AppToast.show(strings('add_address.error_address_exists'), {
                        duration: Toast.durations.LONG,
                        position: Toast.positions.CENTER,
                    });
                    return;
                }
            }

            const {dispatch} = this.props;
            if (this.address === undefined) {
                dispatch(add_address({key: newKey, name: name, address: address, symbol: this.newSymbol}));
            } else {
                dispatch(update_address({oldKey: this.oldAddressKey, key: newKey, name: name, address: address, symbol: this.newSymbol}));
            }
            AppToast.show(strings('add_address.toast_address_saved'), {
                duration: Toast.durations.LONG,
                position: Toast.positions.CENTER
            });

            const {addressAdded} = this.props.navigation.state.params;
            if (addressAdded !== undefined) {
                addressAdded({
                    name: name,
                    address: address,
                    symbol: this.newSymbol,
                    oldKey: this.oldAddressKey,
                    newKey: newKey,
                });
            }
            this.props.navigation.goBack();
        }).catch( err=> {
            AppToast.show(strings(''), {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER
                });
        });
    }
    validateQrcode=(code, symbol)=> {
        return new Promise((resolve, reject) => {
            validateAddress(code, symbol).then(isValidAddress => {
                if (isValidAddress) {
                    resolve(true);
                } else {
                    try {
                        let json = JSON.parse(code);
                        if (!json.receiver) {
                            resolve(false);
                        } else {
                            if (json.coin !== undefined && json.coin !== symbol) {
                                resolve(false);
                                return;
                            }
                            validateAddress(json.receiver, symbol).then(isValidAddress => {
                                resolve(isValidAddress);
                            });
                        }
                    } catch (error) {
                        resolve(false);
                    }
                }
            });
        });
    }

    scan=() => {
        let thus = this;
        this.props.navigation.navigate('scan', {
            success: 'signed_setting_add_address',
            validate: function(data, callback) {
                thus.validateQrcode(data.data, thus.newSymbol).then(result => {
                    if (result) {
                        callback(true);
                    } else {
                        callback(false, strings('error_invalid_qrcode'));
                    }
                });
            }
        });
    }

    updateEditStatus=(name, address)=> {
        let allValid = this.newSymbol !== undefined && name.length !== 0 && address.length !== 0
            && (name !== this.name || address !== this.address || this.newSymbol !== this.symbol);
        if (allValid !== this.props.navigation.getParam('isEdited')) {
            this.props.navigation.setParams({
                isEdited: allValid,
            });
        }
    }

    selectCoin=()=> {
        this.props.navigation.navigate('signed_vault_import_coin', {
            coinSelected: (symbol) => {
                this.newSymbol = symbol;
                this.setState({
                    coinName: COINS[symbol].name + '/' + symbol
                });
                this.updateEditStatus(this.state.name, this.state.address);
            }
        });
    }

    render() {
        let addressEditable = !(this.name === undefined && this.address !== undefined);
        return (
            <View style={{flex: 1, backgroundColor: mainBgColor}}>
                <MyscrollView
                    contentContainerStyle={{justifyContent: 'center'}}
                    keyboardShouldPersistTaps='always'
                >
                    <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={() => Keyboard.dismiss()}>
                        <View style={{...styles.containerView, marginVertical: 30}}>
                            <SubTextInput
                                title={strings('add_address.label_coin_type')}
                                style={styles.text_input}
                                value={this.state.coinName}
                                multiline={false}
                                editable={false}
                                rightView={() =>
                                    <TouchableOpacity onPress={this.selectCoin}>
                                        <Text style={{color: linkButtonColor}}>{strings('add_address.btn_select_coin')}</Text>
                                    </TouchableOpacity>
                                }
                            />
                            <SubTextInput
                                title={strings('add_address.label_name')}
                                style={styles.text_input}
                                value={this.state.name}
                                multiline={false}
                                onChangeText={v=>{
                                    this.setState({name: v});
                                    this.updateEditStatus(v, this.state.address);
                                }}
                                placeholder={strings('add_address.hint_name')}
                            />
                            <SubTextInput
                                title={strings('add_address.label_address')}
                                style={styles.text_input}
                                value={this.state.address}
                                multiline={true}
                                editable={addressEditable}
                                onChangeText={v=>{
                                    this.setState({address: v});
                                    this.updateEditStatus(this.state.name, v);
                                }}
                                placeholder={strings('add_address.hint_address')}
                                rightView={() =>
                                    addressEditable?
                                    <TouchableOpacity onPress={() => this.scan()}>
                                        <Image source={require('../../../assets/icon_scan.png')}
                                               style={{width: 20, height: 20, tintColor: '#000'}}
                                               resizeMode={'contain'}/>
                                    </TouchableOpacity>:null
                                }
                            />
                        </View>
                    </TouchableOpacity>
                </MyscrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    text_input: {
        flex: 1,
        fontSize: 16,
        color: '#777676',
        fontWeight: 'normal',
        borderColor: '#8c8a8a',
        textAlignVertical:'bottom',
        borderBottomWidth: 1/ PixelRatio.get(),
        // paddingVertical: 10,
    },
    containerView: {
        ...defaultStyles.shadow,
        width:width-40,
        marginHorizontal:20,
        marginVertical: 10,
        paddingHorizontal:30,
        paddingVertical:10,
        justifyContent:'center',
        alignItems:'center',
        borderWidth:1/ PixelRatio.get(),
        backgroundColor:'#fff',
        borderColor:'#eee',
        borderRadius:10,
        // flex: 1,
    }
});

export default connect(state => {
    return {
        setting: state.setting,
        user: state.user,
    };
})(AddAddress);