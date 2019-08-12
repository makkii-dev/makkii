import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Text, Platform, View, TouchableOpacity, StyleSheet, Keyboard, Image, PixelRatio, Dimensions, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { strings } from '../../../../locales/i18n';
import { mainBgColor, linkButtonColor } from '../../../style_util';
import { RightActionButton, SubTextInput } from '../../../components/common';
import defaultStyles from '../../../styles';
import { COINS } from '../../../../client/support_coin_list';
import { createAction } from '../../../../utils/dva';

const MyscrollView = Platform.OS === 'ios' ? KeyboardAwareScrollView : ScrollView;
const { width } = Dimensions.get('window');

const updateContactObj = (contactObj, nextContactObj, oldState, field) => {
    if (contactObj[field] !== nextContactObj[field]) {
        return { ...oldState, [field]: nextContactObj[field] };
    }
    return oldState;
};

class AddAddress extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('add_address.title'),
            headerRight: (
                <RightActionButton
                    btnTitle={strings('add_address.btn_save')}
                    onPress={() => {
                        const { addContact } = navigation.state.params;
                        addContact();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        const { contactObj } = this.props;
        console.log('contactObj=>', contactObj);
        this.state = {
            ...contactObj,
        };
    }

    componentWillMount() {
        this.props.navigation.setParams({
            isAdd: this.name === undefined,
            addContact: this.addContact,
            isEdited: false,
        });
    }

    componentWillReceiveProps(props) {
        const { contactObj: nextContactObj } = props;
        const { contactObj } = this.props;
        let newState = {};
        ['symbol', 'name', 'address'].forEach(f => {
            newState = updateContactObj(contactObj, nextContactObj, newState, f);
        });
        if (JSON.stringify(newState) !== '{}') {
            this.setState(newState);
        }
    }

    addContact = () => {
        const { name, address, symbol } = this.state;
        const { dispatch, navigation } = this.props;
        dispatch(createAction('contactAddModel/addContact')({ name, address, symbol })).then(r => {
            if (r) {
                navigation.goBack();
            }
        });
    };

    scan = () => {
        const { dispatch, navigation } = this.props;
        navigation.navigate('scan', {
            success: 'signed_setting_add_address',
            validate: (data, callback) => {
                console.log('validating code.....');
                dispatch(createAction('contactAddModel/parseScannedData')({ data: data.data })).then(res => {
                    res ? callback(true) : callback(false, strings('error_invalid_qrcode'));
                });
            },
        });
    };

    updateEditStatus = (name, address) => {
        const { symbol } = this.state;
        const { name: _name, address: _address } = this.props.contactObj;
        const allValid = symbol !== undefined && name.length !== 0 && address.length !== 0 && (name !== _name || address !== _address);
        if (allValid !== this.props.navigation.getParam('isEdited')) {
            this.props.navigation.setParams({
                isEdited: allValid,
            });
        }
    };

    selectCoin = () => {
        this.props.navigation.navigate('signed_vault_select_coin', { usage: 'address_book' });
    };

    render() {
        const { editable } = this.props;
        const { name, symbol, address } = this.state;
        const coinName = `${COINS[symbol].name}/${symbol}`;
        return (
            <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                <MyscrollView contentContainerStyle={{ justifyContent: 'center' }} keyboardShouldPersistTaps="always">
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => Keyboard.dismiss()}>
                        <View style={{ ...styles.containerView, marginVertical: 30 }}>
                            <SubTextInput
                                title={strings('add_address.label_coin_type')}
                                style={styles.text_input}
                                value={coinName}
                                multiline={false}
                                editable={false}
                                rightView={() =>
                                    editable ? (
                                        <TouchableOpacity onPress={this.selectCoin}>
                                            <Text style={{ color: linkButtonColor }}>{strings('add_address.btn_select_coin')}</Text>
                                        </TouchableOpacity>
                                    ) : null
                                }
                            />
                            <SubTextInput
                                title={strings('add_address.label_name')}
                                style={styles.text_input}
                                value={name}
                                multiline={false}
                                onChangeText={v => {
                                    this.setState({ name: v });
                                    this.updateEditStatus(v, address);
                                }}
                                placeholder={strings('add_address.hint_name')}
                            />
                            <SubTextInput
                                title={strings('add_address.label_address')}
                                style={styles.text_input}
                                value={address}
                                multiline
                                editable={editable}
                                onChangeText={v => {
                                    this.setState({ address: v });
                                    this.updateEditStatus(name, v);
                                }}
                                placeholder={strings('add_address.hint_address')}
                                rightView={() =>
                                    editable ? (
                                        <TouchableOpacity onPress={() => this.scan()}>
                                            <Image source={require('../../../../assets/icon_scan.png')} style={{ width: 20, height: 20, tintColor: '#000' }} resizeMode="contain" />
                                        </TouchableOpacity>
                                    ) : null
                                }
                            />
                        </View>
                    </TouchableOpacity>
                </MyscrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    text_input: {
        flex: 1,
        fontSize: 16,
        color: '#777676',
        fontWeight: 'normal',
        borderColor: '#8c8a8a',
        textAlignVertical: 'bottom',
        borderBottomWidth: 1 / PixelRatio.get(),
        // paddingVertical: 10,
    },
    containerView: {
        ...defaultStyles.shadow,
        width: width - 40,
        marginHorizontal: 20,
        marginVertical: 10,
        paddingHorizontal: 30,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1 / PixelRatio.get(),
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderRadius: 10,
        // flex: 1,
    },
});

const mapToState = ({ contactAddModel }) => ({
    contactObj: {
        symbol: contactAddModel.symbol,
        address: contactAddModel.address,
        name: contactAddModel.name,
    },
    editable: contactAddModel.editable,
});

export default connect(mapToState)(AddAddress);
