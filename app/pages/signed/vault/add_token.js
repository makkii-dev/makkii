import {
    Dimensions,
    View,
    TouchableOpacity,
    Keyboard,
    PixelRatio,
    StyleSheet,
    Image,
    ScrollView,
    Platform,
} from 'react-native';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { strings } from '../../../../locales/i18n';
import { RightActionButton, SubTextInput } from '../../../components/common';
import { mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { validateAddress } from '../../../../coins/api';
import Loading from '../../../components/Loading';
import { AppToast } from '../../../components/AppToast';
import { createAction } from '../../../../utils/dva';

const MyscrollView = Platform.OS === 'ios' ? KeyboardAwareScrollView : ScrollView;
const { width } = Dimensions.get('window');

class AddToken extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('add_token.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <RightActionButton
                    btnTitle={strings('add_token.btn_add_token')}
                    onPress={() => {
                        const { addToken } = navigation.state.params;
                        addToken();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            contractAddr: '',
        };
    }

    componentWillMount() {
        this.props.navigation.setParams({
            addToken: this.addToken,
            isEdited: false,
        });
    }

    async componentWillReceiveProps(props) {
        const oldData = this.props.navigation.getParam('scanned');
        const scannedData = props.navigation.getParam('scanned', '');
        if (scannedData !== '' && oldData !== scannedData) {
            this.setState({
                contractAddr: scannedData,
            });
            this.fetchTokenDetail(scannedData);
        }
    }

    addToken = () => {
        const { symbol, name, tokenDecimal } = this.props;
        const { contractAddr } = this.state;
        const token = {
            symbol,
            contractAddr,
            name,
            tokenDecimal,
        };
        const { dispatch, navigation } = this.props;
        dispatch(createAction('accountsModel/addTokenToCurrentAccount')({ token })).then(r => {
            if (r) {
                navigation.navigate('signed_vault_account_tokens');
            }
        });
    };

    scan = () => {
        this.props.navigation.navigate('scan', {
            success: 'signed_add_token',
            validate: (data, callback) => {
                validateAddress(data.data, this.props.currentAccount.symbol).then(result => {
                    if (result) {
                        callback(true);
                    } else {
                        callback(false, strings('error_invalid_qrcode'));
                    }
                });
            },
        });
    };

    fetchTokenDetail = address => {
        this.refs.refLoading.show();
        const { dispatch, navigation } = this.props;
        dispatch(createAction('tokenImportModel/fetchTokenDetail')({ address })).then(r => {
            if (!r) {
                navigation.setParams({ isEdited: false });
                AppToast.show(strings('add_token.toast_fetch_token_detail_fail'));
            } else {
                navigation.setParams({ isEdited: true });
            }
            this.refs.refLoading.hide();
        });
    };

    render() {
        const { symbol, name, tokenDecimal } = this.props;
        const { contractAddr } = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                <MyscrollView
                    contentContainerStyle={{ justifyContent: 'center' }}
                    keyboardShouldPersistTaps="always"
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                    >
                        <View style={{ ...styles.containerView, marginVertical: 30 }}>
                            <SubTextInput
                                title={strings('add_token.label_contract_address')}
                                style={styles.text_input}
                                value={contractAddr}
                                multiline
                                onChangeText={v => {
                                    this.setState({ contractAddr: v }, () => {
                                        validateAddress(v, this.props.currentAccount.symbol).then(
                                            result => {
                                                if (result) {
                                                    this.fetchTokenDetail(v);
                                                } else {
                                                    this.props.navigation.setParams({
                                                        isEdited: false,
                                                    });
                                                }
                                            },
                                        );
                                    });
                                }}
                                placeholder={strings('add_token.hint_contract_address')}
                                rightView={() => (
                                    <TouchableOpacity onPress={() => this.scan()}>
                                        <Image
                                            source={require('../../../../assets/icon_scan.png')}
                                            style={{ width: 20, height: 20, tintColor: '#000' }}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                )}
                            />
                            <SubTextInput
                                title={strings('add_token.label_token_name')}
                                style={styles.text_input}
                                value={`${name}`}
                                multiline={false}
                                editable={false}
                            />
                            <SubTextInput
                                title={strings('add_token.label_symbol')}
                                style={styles.text_input}
                                value={`${symbol}`}
                                multiline={false}
                                editable={false}
                            />
                            <SubTextInput
                                title={strings('add_token.label_decimals')}
                                style={styles.text_input}
                                value={`${tokenDecimal}`}
                                multiline={false}
                                editable={false}
                            />
                        </View>
                    </TouchableOpacity>
                </MyscrollView>
                <Loading ref="refLoading" />
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
const mapToState = ({ tokenImportModel, accountsModel }) => {
    const { currentAccount: key, accountsMap } = accountsModel;
    const { tokenToBeImported } = tokenImportModel;
    return {
        ...tokenToBeImported,
        currentAccount: accountsMap[key],
    };
};

export default connect(mapToState)(AddToken);
