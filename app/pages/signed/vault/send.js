import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Linking, Keyboard, PixelRatio, Platform, BackHandler, Slider } from 'react-native';
import BigNumber from 'bignumber.js';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { strings } from '../../../../locales/i18n';
import { sameAddress, client } from '../../../../client/api';
import Loading from '../../../components/Loading';
import { ComponentButton, SubTextInput } from '../../../components/common';
import { linkButtonColor, mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { COINS } from '../../../../client/support_coin_list';
import { AppToast } from '../../../components/AppToast';
import { createAction, navigateBack, popCustom } from '../../../../utils/dva';

const MyscrollView = Platform.OS === 'ios' ? KeyboardAwareScrollView : ScrollView;
const { width } = Dimensions.get('window');

const updateTxObj = (txObj, nextTxObj, oldState, field) => {
    if (txObj[field] !== nextTxObj[field]) {
        return { ...oldState, [field]: nextTxObj[field] };
    }
    return oldState;
};

const SliderInput = ({ minValue, maxValue, value, onValueChange, labelText, unitText, step, advancedCalc = true, advancedLabel = true, disabled = false }) => {
    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ width: width - 60, marginVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                {advancedLabel ? (
                    <Text style={{ width: '40%', color: 'black' }}>{`${labelText}: (${minValue} - ${maxValue})`}</Text>
                ) : (
                    <Text style={{ width: '40%', color: 'black' }}>{`${labelText}:`}</Text>
                )}
                <Slider
                    style={{
                        marginHorizontal: 10,
                        width: '50%',
                        height: 20,
                    }}
                    disabled={disabled}
                    minimumValue={minValue}
                    maximumValue={maxValue}
                    minimumTrackTintColor={linkButtonColor}
                    maximumTrackTintColor="lightgray"
                    thumbTintColor={linkButtonColor}
                    step={step}
                    value={value - 0}
                    onValueChange={v => {
                        onValueChange(v);
                    }}
                />
            </View>
            {advancedCalc ? <Text style={{ marginLeft: 20 }}>{`${value} ${unitText}`}</Text> : null}
        </View>
    );
};

const AdvancedSliderEth = props => {
    const { coinSymbol, gasPrice, gasLimit, onGasPriceChange, onGasLimitChange, coinPrice, fiatCurrency } = props;
    const coinUsed = gasPrice * gasLimit * 10 ** -9 || 0;
    return (
        <View style={styles.containerView}>
            <SliderInput
                minValue={COINS[coinSymbol].minGasPrice}
                maxValue={COINS[coinSymbol].maxGasPrice}
                value={gasPrice}
                onValueChange={onGasPriceChange}
                labelText={strings('send.label_gas_price')}
                unitText={COINS[coinSymbol].gasPriceUnit}
                step={1}
            />
            <SliderInput
                minValue={COINS[coinSymbol].minGasLimit}
                maxValue={COINS[coinSymbol].maxGasLimit}
                value={gasLimit}
                onValueChange={onGasLimitChange}
                labelText={strings('send.label_gas_limit')}
                advancedLabel={gasLimit <= COINS[coinSymbol].maxGasLimit}
                disabled={gasLimit > COINS[coinSymbol].maxGasLimit}
                unitText=""
                step={100}
            />
            <Text style={{ width: '100%', color: 'black', paddingLeft: 10 }}>
                {`${strings('transaction_detail.label_fee')}: ${coinUsed.toFixed(5)} ${coinSymbol} ≈  ${(coinUsed * coinPrice).toFixed(5)} ${fiatCurrency}`}
            </Text>
        </View>
    );
};

const AdvancedSliderBtc = props => {
    const { coinSymbol, byteFee, onByteFeeChange, coinPrice, fiatCurrency, coinUsed } = props;
    const coinUsed_ = coinUsed.times(byteFee).toNumber() || 0;
    return (
        <View style={styles.containerView}>
            <SliderInput
                minValue={COINS[coinSymbol].minByteFee}
                maxValue={COINS[coinSymbol].maxByteFee}
                value={byteFee}
                onValueChange={onByteFeeChange}
                labelText={strings('send.label_gas_price')}
                unitText={COINS[coinSymbol].gasPriceUnit}
                step={0.5}
                advancedCalc={false}
                advancedLabel={false}
            />
            <Text style={{ width: '100%', color: 'black', paddingLeft: 20 }}>
                {`${strings('transaction_detail.label_fee')}: ${coinUsed_.toFixed(5)} ${coinSymbol} ≈  ${(coinUsed_ * coinPrice).toFixed(5)} ${fiatCurrency}`}
            </Text>
        </View>
    );
};

const getBTCGasUsed = async (symbol, address) => {
    const btcClient = client.getCoin(symbol);
    const balance = await btcClient.getBalance(address);
    const sendAll_ = await btcClient.sendAll(address, 1);
    return balance.minus(sendAll_);
};

class Send extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('title', strings('send.title')),
            headerLeft: (
                <TouchableOpacity
                    onPress={() => navigation.state.params.onGoBack()}
                    style={{
                        width: 48,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Image
                        source={require('../../../../assets/arrow_back.png')}
                        style={{
                            tintColor: 'white',
                            width: 20,
                            height: 20,
                        }}
                    />
                </TouchableOpacity>
            ),
            headerRight: <View />,
        };
    };

    constructor(props) {
        super(props);
        const { currentAccount, txObj } = this.props;
        const gasPrice = txObj.gasPrice || COINS[currentAccount.symbol].defaultGasPrice;
        let gasLimit;
        if (currentAccount.coinSymbol !== currentAccount.symbol) {
            gasLimit = txObj.gasLimit || COINS[currentAccount.symbol].defaultGasLimitForContract;
        } else {
            gasLimit = txObj.gasLimit || COINS[currentAccount.symbol].defaultGasLimit;
        }
        this.callback = this.props.navigation.getParam('callback', (error, res) => {
            console.log(error, res);
        });
        this.props.navigation.setParams({
            onGoBack: this.onGoBack,
        });
        this.state = {
            showAdvanced: false,
            ...txObj,
            gasPrice,
            gasLimit,
            byteFee: 10,
            btcCoinUsed: currentAccount.symbol === 'BTC' ? new BigNumber(500).shiftedBy(-8) : new BigNumber(2000).shiftedBy(-8),
        };
        if (currentAccount.symbol === 'BTC' || currentAccount.symbol === 'LTC') {
            getBTCGasUsed(currentAccount.symbol, currentAccount.address).then(r => {
                this.setState({
                    btcCoinUsed: r,
                });
            });
        }
    }

    async componentDidMount() {
        Linking.addEventListener('url', this._handleOpenURL);
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.onGoBack(); // works best when the goBack is async
            return true;
        });
    }

    componentWillReceiveProps(props) {
        const { txObj: nextTxObj } = props;
        const { txObj } = this.props;
        let newState = {};
        ['to', 'amount', 'data', 'gasLimit', 'gasPrice', 'byteFee'].forEach(f => {
            newState = updateTxObj(txObj, nextTxObj, newState, f);
        });
        if (JSON.stringify(newState) !== '{}') {
            this.setState(newState);
        }
    }

    componentWillUnmount() {
        Linking.removeEventListener('', this._handleOpenURL);
        this.backHandler.remove();
    }

    onGoBack = () => {
        this.callback('give up send');
        navigateBack(this.props);
    };

    _handleOpenURL(event) {
        console.log(event.url);
    }

    // eslint-disable-next-line react/sort-comp
    scan = () => {
        const { dispatch, navigation } = this.props;
        navigation.navigate('scan', {
            validate: (data, callback) => {
                dispatch(createAction('txSenderModel/parseScannedData')({ data: data.data })).then(res => {
                    if (res.result) {
                        this.setState({
                            ...res.data,
                        });
                    }
                    callback(res.result, res.result ? '' : res.error || strings('error_invalid_qrcode'));
                });
            },
        });
    };

    selectFromAddressBook = () => {
        this.props.navigation.navigate('signed_setting_address_book', {
            type: 'select',
            filterSymbol: this.props.currentAccount.symbol,
        });
    };

    render() {
        const { currentAccount, editable, coinPrice, fiat_currency: fiatCurrency } = this.props;
        const { to, amount, data, gasPrice, gasLimit, showAdvanced, byteFee } = this.state;
        const showAdvancedOption = COINS[currentAccount.symbol].txFeeSupport;
        return (
            <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                <MyscrollView contentContainerStyle={{ justifyContent: 'center' }} keyboardShouldPersistTaps="always">
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                    >
                        <View style={{ ...styles.containerView, marginTop: 30 }}>
                            <SubTextInput
                                title={strings('send.label_receiver')}
                                style={styles.text_input}
                                value={to}
                                multiline
                                editable={editable}
                                onChangeText={v => this.setState({ to: v })}
                                placeholder={strings('send.hint_recipient')}
                                rightView={() =>
                                    editable ? (
                                        <View style={{ flexDirection: 'row' }}>
                                            <TouchableOpacity onPress={() => this.scan()} style={{ marginRight: 10 }}>
                                                <Image
                                                    source={require('../../../../assets/icon_scan.png')}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        tintColor: '#000',
                                                    }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => this.selectFromAddressBook()}>
                                                <Image
                                                    source={require('../../../../assets/icon_address_book.png')}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        tintColor: '#000',
                                                    }}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null
                                }
                            />
                            <SubTextInput
                                title={strings('send.label_amount')}
                                style={styles.text_input}
                                value={`${amount}`}
                                editable={editable}
                                onChangeText={v => this.setState({ amount: v })}
                                keyboardType="decimal-pad"
                                rightView={() =>
                                    editable ? (
                                        <TouchableOpacity onPress={this.sendAll}>
                                            <Text style={{ color: linkButtonColor }}>{strings('send.button_send_all')}</Text>
                                        </TouchableOpacity>
                                    ) : null
                                }
                                unit={currentAccount.coinSymbol}
                            />
                            {data ? <SubTextInput title={strings('send.label_data')} style={styles.text_input} value={data} multiline editable={false} numberOfLines={10} /> : null}
                        </View>

                        {/* advanced button */}
                        {showAdvancedOption ? (
                            <View>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={() => {
                                        this.setState({
                                            showAdvanced: !showAdvanced,
                                        });
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: linkButtonColor,
                                            marginTop: 20,
                                            marginHorizontal: 20,
                                        }}
                                    >
                                        {strings(showAdvanced ? 'send.hide_advanced' : 'send.show_advanced')}
                                    </Text>
                                </TouchableOpacity>

                                {showAdvanced ? (
                                    currentAccount.symbol.match(/ETH|AION/) ? (
                                        <AdvancedSliderEth
                                            gasLimit={gasLimit}
                                            gasPrice={gasPrice}
                                            onGasLimitChange={v => this.setState({ gasLimit: v })}
                                            onGasPriceChange={v => this.setState({ gasPrice: v })}
                                            coinSymbol={currentAccount.symbol}
                                            coinPrice={coinPrice}
                                            fiatCurrency={fiatCurrency}
                                        />
                                    ) : (
                                        <AdvancedSliderBtc
                                            byteFee={byteFee}
                                            onByteFeeChange={v => this.setState({ byteFee: v })}
                                            coinSymbol={currentAccount.symbol}
                                            coinPrice={coinPrice}
                                            fiatCurrency={fiatCurrency}
                                            coinUsed={this.state.btcCoinUsed}
                                        />
                                    )
                                ) : null}
                            </View>
                        ) : null}

                        {/* send button */}
                        <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 40 }}>
                            <ComponentButton disabled={`${amount}`.length <= 0 || !to} title={strings('send_button')} onPress={this.onTransfer} />
                        </View>
                    </TouchableOpacity>
                </MyscrollView>

                <Loading ref="refLoading" />
            </View>
        );
    }

    onTransfer = () => {
        Keyboard.dismiss();
        const { dispatch } = this.props;
        const txObj = {
            to: this.state.to,
            amount: this.state.amount,
            data: this.state.data,
            gasPrice: this.state.gasPrice,
            gasLimit: this.state.gasLimit,
            byteFee: this.state.byteFee,
        };
        dispatch(createAction('txSenderModel/validateTxObj')({ txObj })).then(result => {
            if (result) {
                this.checkSameAddress();
            }
        });
    };

    checkSameAddress = () => {
        const { editable } = this.props;
        const { address, symbol } = this.props.currentAccount;
        const { to } = this.state;
        if (editable && sameAddress(symbol, address, to)) {
            popCustom.show(
                strings('alert_title_warning'),
                strings('send.warning_send_to_itself'),
                [
                    { text: strings('cancel_button'), onPress: () => {} },
                    {
                        text: strings('alert_ok_button'),
                        onPress: () => {
                            setTimeout(this.checkZeroAmount, 200);
                        },
                    },
                ],
                { cancelable: false },
            );
        } else {
            this.checkZeroAmount();
        }
    };

    checkZeroAmount = () => {
        const { editable } = this.props;
        const amount = new BigNumber(this.state.amount);
        if (editable && amount.isZero() && this.state.data.length === 0) {
            popCustom.show(
                strings('alert_title_warning'),
                strings('send.warning_send_zero'),
                [
                    { text: strings('cancel_button'), onPress: () => {} },
                    {
                        text: strings('alert_ok_button'),
                        onPress: () => {
                            setTimeout(this.beforeTransfer, 200);
                        },
                    },
                ],
                { cancelable: false },
            );
        } else {
            this.beforeTransfer();
        }
    };

    beforeTransfer = () => {
        const { navigationSafely } = this.props.screenProps;
        navigationSafely({ onVerifySuccess: this.dispatchTxObj })(this.props);
    };

    dispatchTxObj = () => {
        this.refs.refLoading.show();
        const { dispatch, navigation, targetRoute } = this.props;
        const txObj = {
            to: this.state.to,
            amount: this.state.amount,
            data: this.state.data,
            gasPrice: this.state.gasPrice,
            gasLimit: this.state.gasLimit,
        };
        dispatch(createAction('txSenderModel/sendTx')({ txObj, dispatch })).then(pendingTx => {
            this.refs.refLoading.hide();
            if (pendingTx) {
                dispatch(createAction('txSenderModel/reset')());
                this.callback(undefined, pendingTx.hash);
                typeof targetRoute !== 'string' ? navigation.goBack() : navigation.navigate(targetRoute);
                AppToast.show(strings('send.toast_tx_sent'));
            }
        });
    };

    sendAll = () => {
        this.refs.refLoading.show();
        const { dispatch } = this.props;
        const { gasLimit, gasPrice, byteFee } = this.state;
        dispatch(
            createAction('txSenderModel/sendAll')({
                currentGasPrice: gasPrice,
                currentGasLimit: gasLimit,
                currentByteFee: byteFee,
            }),
        ).then(amount => {
            this.setState({ amount });
            this.refs.refLoading.hide();
        });
    };
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
        paddingVertical: 10,
    },
    containerView: {
        ...defaultStyles.shadow,
        width: width - 40,
        marginHorizontal: 20,
        marginVertical: 10,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1 / PixelRatio.get(),
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderRadius: 10,
    },
});

const mapToState = ({ accountsModel, txSenderModel, settingsModel }) => {
    const { to, amount, data, gasLimit, gasPrice, editable } = txSenderModel;
    const { currentAccount: key, currentToken, accountsMap } = accountsModel;
    const currentAccount = {
        ...accountsMap[key],
        coinSymbol: currentToken === '' ? accountsMap[key].symbol : currentToken,
    };
    return {
        currentAccount,
        txObj: { to, amount, data, gasLimit, gasPrice },
        editable,
        coinPrice: settingsModel.coinPrices[currentAccount.symbol],
        fiat_currency: settingsModel.fiat_currency,
        targetRoute: txSenderModel.targetRoute,
    };
};

export default connect(mapToState)(Send);
