import {strings} from '../../../locales/i18n';
import {connect} from 'react-redux';
import React, {Component} from 'react';
import {validateAddress} from "../../../coins/api";
import {mainBgColor} from '../../style_util';
import {Platform, View, TouchableOpacity, Iamge, StyleSheet, Keyboard, Image, PixelRatio, Dimensions, ScrollView} from 'react-native';
import {RightActionButton,SubTextInput} from '../../common';
import defaultStyles from '../../styles';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Toast from 'react-native-root-toast';
import {add_address, update_address} from '../../../actions/user';

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
        this.name = props.navigation.getParam('name');
        this.address = props.navigation.getParam('address');
        this.state = {
            name: this.name === undefined? '': this.name,
            address: this.address === undefined? '': this.address,
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
        let oldData = this.props.navigation.getParam('scanned');
        let scannedData = props.navigation.getParam('scanned', '');
        if (scannedData !== '' && oldData !== scannedData) {
            this.setState({
                address: scannedData,
            });
            this.updateEditStatus(this.state.name, scannedData);
        }
    }

    addAddress=() => {
        const {name, address} = this.state;
        let address_book = this.props.user.address_book;
        if ((this.address === undefined && Object.keys(address_book).indexOf(address) >= 0) ||
            (this.address != undefined && address !== this.address && Object.keys(address_book).indexOf(address) >= 0)) {
            AppToast.show(strings('add_address.error_address_exists'), {
                duration: Toast.durations.LONG,
                position: Toast.positions.CENTER,
            });
            return;
        }

        const {dispatch} = this.props;
        if (this.address === undefined) {
            dispatch(add_address({name: name, address: address}));
        } else {
            dispatch(update_address({oldAddress: this.address, name: name, address: address}));
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
                oldAddress: this.address,
            });
        }
        this.props.navigation.goBack();
    }

    scan=() => {
        this.props.navigation.navigate('scan', {
            success: 'signed_setting_add_address',
            validate: function(data) {
                validateAddress(data.data).then(result => {
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
        validateAddress(address).then(isValidAddress => {
            let allValid = isValidAddress && name.length !== 0 && (name !== this.name || address !== this.address);
            if (allValid !== this.props.navigation.getParam('isEdited')) {
                this.props.navigation.setParams({
                    isEdited: allValid,
                });
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