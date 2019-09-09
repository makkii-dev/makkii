import * as React from 'react';
import { Dimensions, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BigNumber from 'bignumber.js';
import { validator } from 'lib-common-util-js';
import { connect, createAction, navigate } from '../../../../utils/dva';
import { accountKey, formatMoney } from '../../../../utils';
import { AccountBar } from '../../../components/AccountBar';
import { mainBgColor } from '../../../style_util';
import { DismissKeyboardView } from '../../../components/DismissKeyboardView';
import commonStyles from '../../../styles';
import { Cell2, CellInput } from '../../../components/Cell';
import { strings } from '../../../../locales/i18n';
import { ComponentButton } from '../../../components/common';
import Loading from '../../../components/Loading';
import { validateAddress } from '../../../../services/contact_add.service';
import { AppToast } from '../../../components/AppToast';

const MyscrollView = Platform.OS === 'ios' ? KeyboardAwareScrollView : ScrollView;

const { width } = Dimensions.get('window');

class Product extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('title', ''),
        };
    };

    state = {
        amount: '',
        RetAddress: '',
    };

    componentWillMount(): void {
        this.isMount = true;
    }

    componentWillUnmount(): void {
        this.isMount = false;
    }

    selectAccount = () => {
        const { currentProduct } = this.props;
        navigate('signed_Dex_account_list', {
            type: currentProduct.token === 'BTC' ? 'BTC' : 'ETH',
            usage: 'pokket',
        })(this.props);
    };

    selectIncomeAddress = () => {
        const { currentProduct } = this.props;
        navigate('signed_Dex_account_list', {
            type: currentProduct.token === 'BTC' ? 'BTC' : 'ETH',
            usage: ({ address }) => {
                this.setState({
                    RetAddress: address,
                });
            },
        })(this.props);
    };

    toAccountDetail = item => {
        const { dispatch } = this.props;
        dispatch(
            createAction('accountsModel/updateState')({
                currentAccount: accountKey(item.symbol, item.address),
                currentToken: '',
            }),
        );
        navigate('signed_vault_account_tokens')(this.props);
    };

    scan = () => {
        const { dispatch, navigation } = this.props;
        navigation.navigate('scan', {
            validate: (data, callback) => {
                console.log('validating code.....');
                dispatch(createAction('pokketModel/parseScannedData')({ data: data.data })).then(res => {
                    const { result, data } = res;
                    if (result) {
                        this.setState({
                            RetAddress: data.address,
                        });
                    }
                    result ? callback(true) : callback(false, strings('error_invalid_qrcode'));
                });
            },
        });
    };

    onBuy = async () => {
        const { dispatch } = this.props;
        const { amount, RetAddress } = this.state;
        const { token, tokenFullName, weeklyInterestRate, yearlyInterestRate, token2Collateral, productId } = this.props.currentProduct;
        const { address } = this.props.currentAccount;
        const condition1 = validator.validateAmount(amount);
        const condition2 = RetAddress ? await validateAddress(RetAddress, 'ETH') : true;
        if (!condition1) {
            AppToast.show(strings('pokket.toast_invalid_amount'));
            return;
        }
        if (!condition2) {
            AppToast.show(strings('pokket.toast_invalid_address'));
            return;
        }
        this.refs.refLoading.show();
        let payload = {
            amount,
            autoRoll: false,
            investorAddress: address.toLowerCase(),
            token,
            token2Collateral,
            tokenFullName,
            weeklyInterestRate,
            yearlyInterestRate,
            productId,
        };
        if (RetAddress) {
            payload = { ...payload, collateralAddress: RetAddress };
        }
        dispatch(createAction('pokketModel/createOrder')(payload)).then(() => {
            this.isMount && this.refs.refLoading.hide();
        });
    };

    render() {
        const { currentAccount, currentProduct } = this.props;
        const { token, weeklyInterestRate, yearlyInterestRate, remainingQuota, token2Collateral, minInvestAmount } = currentProduct;
        const { amount, RetAddress } = this.state;
        const expiryDate = new Date(Date.now() + 24 * 7 * 3600 * 1000).Format('dd/MM/yyyy');
        let buttonEnabled = false;
        let hasToken = false;
        let errorMsg = '';
        if (!currentProduct) {
            return <View />;
        }
        if (currentAccount) {
            const notBlank = amount.length > 0 && (token !== 'BTC' || RetAddress.length > 0);
            const { balance, tokens = {} } = currentAccount;
            hasToken = token === 'ETH' || token === 'BTC' ? true : !!tokens[token];
            const nativeCost = token === 'BTC' ? parseFloat(amount) + 0.00015 : token === 'ETH' ? +parseFloat(amount) + 0.0009 : 0.00021;
            const tokenCost = token === 'ETH' || token === 'BTC' ? 0 : +amount;
            const tokenBalance = tokens[token] || 0;
            buttonEnabled = notBlank && BigNumber(balance).toNumber() >= nativeCost && BigNumber(tokenBalance).toNumber() >= tokenCost && amount >= minInvestAmount;
            if (!buttonEnabled) {
                if (!notBlank) {
                    errorMsg = strings('pokket.label_fill_required');
                } else if (!hasToken) {
                    errorMsg = strings('token_exchange.button_exchange_no_token', {
                        token,
                    });
                } else if (amount < minInvestAmount) {
                    errorMsg = strings('pokket.label_less_then_min');
                } else if (amount > 0) {
                    errorMsg = strings('token_exchange.button_exchange_disable');
                } else {
                    errorMsg = strings('token_exchange.button_exchange_invalid_number');
                }
            }
        } else {
            errorMsg = token === 'BTC' ? strings('token_exchange.button_exchange_no_BTC_account') : strings('token_exchange.button_exchange_no_ETH_account');
        }
        return (
            <DismissKeyboardView>
                <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                    <MyscrollView contentContainerStyle={{ justifyContent: 'center' }} keyboardShouldPersistTaps="always">
                        <AccountBar currentAccount={currentAccount} currentToken={token} selectAccount={this.selectAccount} toAccountDetail={this.toAccountDetail} />
                        <View style={styles.body}>
                            <Cell2 title={strings('pokket.label_weekly_rate')} value={`${BigNumber(weeklyInterestRate).toNumber()} %`} />
                            <Cell2 title={strings('pokket.label_yearly_rate')} value={`${BigNumber(yearlyInterestRate).toNumber()} %`} />
                            <Cell2 title={strings('pokket.label_remaining_quote')} value={`${formatMoney(remainingQuota)}`} />
                            <Cell2 title={strings('pokket.label_min_amount')} value={`${formatMoney(minInvestAmount)}`} />
                            <Cell2 title={strings('pokket.label_end_date')} value={`${expiryDate}`} />
                            <CellInput
                                title={strings('pokket.label_investment_amount')}
                                value={`${amount}`}
                                style={{ paddingTop: 10 }}
                                isRequired
                                rightView={() => {}}
                                onChangeText={v => this.setState({ amount: v })}
                                keyboardType="decimal-pad"
                                placeholder={strings('pokket.placeholder_investment_amount')}
                                underlineColorAndroid="transparent"
                                unit={token}
                            />
                            <CellInput
                                title={strings('pokket.label_income_address')}
                                value={`${RetAddress}`}
                                style={{ paddingTop: 10 }}
                                multiline
                                isRequired={token === 'BTC'}
                                onChangeText={v => this.setState({ RetAddress: v })}
                                placeholder={strings('pokket.placeholder_income_address')}
                                rightView={() => (
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
                                        <TouchableOpacity onPress={this.selectIncomeAddress}>
                                            <Image
                                                source={require('../../../../assets/icon_list.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    tintColor: '#000',
                                                }}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                underlineColorAndroid="transparent"
                            />
                            <View style={{ width: '100%', alignItems: 'flex-end', marginTop: 5 }}>
                                <Text style={{}}>
                                    {`${strings('pokket.label_expected_profits')} ${((amount || 0) * (1 + weeklyInterestRate / 100)).toFixed(2)}${token} ${strings('label_or')} ${(
                                        (amount || 0) *
                                        (1.1 + weeklyInterestRate / 100) *
                                        token2Collateral
                                    ).toFixed(2)}TUSD`}
                                </Text>
                            </View>
                        </View>
                        <Text style={{ marginHorizontal: 20, marginBottom: 10 }}>{strings('pokket.label_glossary')}</Text>
                        {(currentAccount !== undefined && buttonEnabled) || (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    marginHorizontal: 20,
                                    marginBottom: 10,
                                }}
                            >
                                <Image
                                    source={require('../../../../assets/icon_warning.png')}
                                    resizeMode="contain"
                                    style={{
                                        width: 20,
                                        height: 20,
                                        tintColor: 'red',
                                        marginRight: 5,
                                    }}
                                />
                                <Text style={{ color: 'gray' }}>{errorMsg}</Text>
                            </View>
                        )}
                        <ComponentButton
                            title={strings('pokket.button_buy')}
                            disabled={!buttonEnabled}
                            style={{
                                width: width - 40,
                                marginHorizontal: 20,
                                marginBottom: 20,
                            }}
                            onPress={this.onBuy}
                        />
                    </MyscrollView>
                    <Loading ref="refLoading" />
                </View>
            </DismissKeyboardView>
        );
    }
}
const mapToState = ({ pokketModel, accountsModel }) => {
    const { products, currentProduct } = pokketModel;
    const currentAccount = accountsModel.accountsMap[pokketModel.currentAccount];
    return {
        currentAccount,
        currentProduct: products[currentProduct],
    };
};

export default connect(mapToState)(Product);

const styles = {
    body: {
        ...commonStyles.shadow,
        borderRadius: 10,
        backgroundColor: 'white',
        width: width - 40,
        alignItems: 'center',
        padding: 10,
        marginVertical: 20,
        marginHorizontal: 20,
    },
};
