import * as React from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Platform, ScrollView, Dimensions } from 'react-native';
import { Header } from 'react-navigation';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BigNumber from 'bignumber.js';
import { strings } from '../../../../locales/i18n';
import { ComponentButton } from '../../../components/common';
import { AccountBar } from '../../../components/AccountBar';
import { createAction, navigate } from '../../../../utils/dva';
import Loading from '../../../components/Loading';
import commonStyles from '../../../styles';
import { mainBgColor } from '../../../style_util';
import { COINS } from '../../../../client/support_coin_list';
import { accountKey, getStatusBarHeight, validateAdvancedAmount } from '../../../../utils';
import { DismissKeyboardView } from '../../../components/DismissKeyboardView';
import { getTokenIconUrl } from '../../../../client/api';
import { DEX_MENU, getExchangeRulesURL } from './constants';
import { PopupMenu } from '../../../components/PopUpMenu';
import { AppToast } from '../../../components/AppToast';
import { CustomHeader } from '../../../components/CustomHeader';

const { width } = Dimensions.get('window');

const MyscrollView = Platform.OS === 'ios' ? KeyboardAwareScrollView : ScrollView;

class Home extends React.Component {
    state = {
        srcToken: this.props.trade.srcToken,
        destToken: this.props.trade.destToken,
        srcQty: 0,
        destQty: 0,
        tradeRate: this.props.trade.tradeRate,
        showMenu: false,
        isLoading: true,
        error: false,
    };

    srcQtyFocused = false;

    destQtyFocused = false;

    componentWillMount(): void {
        this.listenNavigation = this.props.navigation.addListener('willBlur', () => this.setState({ showMenu: false }));
        this.getTokenLists();
    }

    componentWillReceiveProps(nextProps) {
        const { isLoading, trade } = this.props;
        const { isLoading: nextisLoading, trade: nextTrade } = nextProps;
        const res = isLoading !== nextisLoading || trade.destToken !== nextTrade.destToken || trade.srcToken !== nextTrade.srcToken || trade.tradeRate !== nextTrade.tradeRate;
        if (res) {
            const { srcQty, destQty } = this.state;
            let newState = {
                srcToken: nextTrade.srcToken,
                destToken: nextTrade.destToken,
                tradeRate: nextTrade.tradeRate,
            };
            if (this.srcQtyFocused || !this.destQtyFocused) {
                newState = {
                    ...newState,
                    srcQty,
                    destQty: BigNumber(srcQty || 0)
                        .multipliedBy(BigNumber(nextTrade.tradeRate))
                        .toNumber(),
                };
            } else {
                newState = {
                    ...newState,
                    srcQty: BigNumber(destQty || 0)
                        .dividedBy(BigNumber(nextTrade.tradeRate))
                        .toNumber(),
                    destQty,
                };
            }
            this.setState(newState);
        }
    }

    componentWillUnmount(): void {
        this.listenNavigation.remove();
    }

    getTokenLists = () => {
        this.props.dispatch(createAction('ERC20Dex/getTokenList')()).then(res => {
            if (res) {
                this.setState({
                    isLoading: false,
                    error: false,
                });
            } else {
                this.setState({
                    isLoading: false,
                    error: true,
                });
            }
        });
    };

    onExchangeSrc2dest = () => {
        const { srcToken, destToken } = this.props.trade;
        this.props.dispatch(
            createAction('ERC20Dex/updateTrade')({
                srcToken: destToken,
                destToken: srcToken,
                srcQty: this.state.srcQty,
            }),
        );
    };

    onChangeSrcTokenValue = v => {
        const { tradeRate } = this.state;
        if (validateAdvancedAmount(v) || v === '') {
            const { srcToken, destToken } = this.props.trade;
            this.props.dispatch(
                createAction('ERC20Dex/updateTrade')({
                    srcToken,
                    destToken,
                    srcQty: v,
                    displayLoading: false,
                }),
            );
            this.setState({
                srcQty: v,
                destQty: BigNumber(v || 0)
                    .multipliedBy(BigNumber(tradeRate))
                    .toNumber(),
            });
        }
    };

    onChangeDestTokenValue = v => {
        const { tradeRate } = this.state;
        if (validateAdvancedAmount(v) || v === '') {
            this.setState({
                srcQty: BigNumber(v || 0)
                    .dividedBy(BigNumber(tradeRate))
                    .toNumber(),
                destQty: v,
            });
        }
    };

    selectAccount = () => {
        navigate('signed_Dex_account_list', { type: 'ETH', usage: 'Dex' })(this.props);
    };

    selectToken = flow => {
        navigate('signed_Dex_exchange_token_list', { flow, srcQty: this.state.srcQty })(this.props);
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

    onTrade = () => {
        const { srcToken, destToken, srcQty, destQty } = this.state;
        const { dispatch, currentAccount } = this.props;
        dispatch(
            createAction('ERC20Dex/trade')({
                srcToken,
                destToken,
                srcQty,
                destQty,
                account: currentAccount,
                dispatch,
            }),
        );
    };

    openMenu = () => {
        this.setState({
            showMenu: true,
        });
    };

    onCloseMenu = select => {
        this.setState(
            {
                showMenu: false,
            },
            () => {
                switch (select) {
                    case DEX_MENU[0].title:
                        if (this.props.currentAccount) {
                            navigate('signed_Dex_exchange_history')(this.props);
                        } else {
                            AppToast.show(strings('token_exchange.toast_no_selected_eth_account'), {
                                position: AppToast.positions.CENTER,
                            });
                        }
                        break;
                    case DEX_MENU[1].title:
                        navigate('simple_webview', {
                            title: strings('token_exchange.title_exchange_rules'),
                            initialUrl: getExchangeRulesURL(this.props.lang),
                        })(this.props);
                        break;
                    default:
                }
            },
        );
    };

    renderLoading = () => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator animating color="red" size="large" />
        </View>
    );

    getTokenIcon = tokenSymbol => {
        const { tokenList } = this.props;
        if (tokenSymbol === 'ETH') {
            const Icon = COINS.ETH.icon;
            return <Image style={{ width: 24, height: 24 }} source={Icon} resizeMode="contain" />;
        }
        try {
            const fastIcon = getTokenIconUrl('ETH', tokenSymbol, tokenList[tokenSymbol].address);
            return <Image style={{ width: 24, height: 24 }} source={{ uri: fastIcon }} resizeMode="contain" />;
        } catch (e) {
            const Icon = COINS.ETH.default_token_icon;
            return <Image style={{ width: 24, height: 24 }} source={Icon} resizeMode="contain" />;
        }
    };

    renderContent = () => {
        const { srcToken, destToken, srcQty, destQty, tradeRate } = this.state;
        const { currentAccount } = this.props;
        let buttonEnabled = false;
        let hasToken = false;
        let errorMsg = '';
        if (currentAccount) {
            const { balance, tokens } = currentAccount;
            hasToken = srcToken === 'ETH' ? true : !!tokens[srcToken];
            const ethCost = srcToken === 'ETH' ? +srcQty + 0.0043 : 0.0014;
            const tokenCost = srcToken === 'ETH' ? 0 : +srcQty;
            const tokenBalance = tokens[srcToken] || 0;
            buttonEnabled = BigNumber(balance).toNumber() >= ethCost && BigNumber(tokenBalance).toNumber() >= tokenCost && srcQty > 0;
            if (!buttonEnabled) {
                if (!hasToken) {
                    errorMsg = strings('token_exchange.button_exchange_no_token', {
                        token: srcToken,
                    });
                } else if (srcQty > 0) {
                    errorMsg = strings('token_exchange.label_exchange_insufficient_balance');
                } else {
                    errorMsg = strings('token_exchange.button_exchange_invalid_number');
                }
            }
        } else {
            errorMsg = strings('token_exchange.button_exchange_no_ETH_account');
        }

        return (
            <DismissKeyboardView>
                <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                    <MyscrollView style={{ width }} keyboardShouldPersistTaps="always">
                        <AccountBar currentAccount={currentAccount} selectAccount={this.selectAccount} toAccountDetail={this.toAccountDetail} currentToken={srcToken} />
                        <View style={styles.container1}>
                            <View style={{ width: '100%', alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                                    {`${strings('token_exchange.label_current_rate')} ≈ `}
                                    <Text style={{ fontSize: 14 }}>{tradeRate}</Text>
                                </Text>
                            </View>
                            <View style={styles.tokenView}>
                                <View style={styles.tokenNumberLabel}>
                                    <Text style={{ fontSize: 16 }}>{strings('token_exchange.label_sell')}</Text>
                                    <TextInput
                                        style={styles.textInputStyle}
                                        value={`${srcQty}`}
                                        onChangeText={this.onChangeSrcTokenValue}
                                        onFocus={() => (this.srcQtyFocused = true)}
                                        onBlur={() => (this.srcQtyFocused = false)}
                                        keyboardType="numeric"
                                        multiline={false}
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                                <TouchableOpacity onPress={() => this.selectToken('src')}>
                                    <View style={styles.tokenLabel}>
                                        {this.getTokenIcon(srcToken)}
                                        <Text style={{ fontSize: 16 }}>{srcToken}</Text>
                                        <Image source={require('../../../../assets/arrow_right.png')} style={{ width: 24, height: 24 }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <TouchableWithoutFeedback onPress={this.onExchangeSrc2dest}>
                                <Image source={require('../../../../assets/icon_exchange.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                            </TouchableWithoutFeedback>
                            <View style={styles.tokenView}>
                                <View style={styles.tokenNumberLabel}>
                                    <Text style={{ fontSize: 16 }}>{strings('token_exchange.label_buy')}</Text>
                                    <TextInput
                                        style={styles.textInputStyle}
                                        value={`${destQty}`}
                                        onChangeText={this.onChangeDestTokenValue}
                                        onFocus={() => (this.destQtyFocused = true)}
                                        onBlur={() => (this.destQtyFocused = false)}
                                        keyboardType="numeric"
                                        multiline={false}
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                                <TouchableOpacity onPress={() => this.selectToken('dest')}>
                                    <View style={styles.tokenLabel}>
                                        {this.getTokenIcon(destToken)}
                                        <Text style={{ fontSize: 16 }}>{`${destToken}`}</Text>
                                        <Image source={require('../../../../assets/arrow_right.png')} style={{ width: 24, height: 24 }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row-reverse', width: '100%' }}>
                                <Text style={{ fontSize: 10 }}>Kyber.Network</Text>
                                <Text style={{ fontStyle: 'italic', fontSize: 10 }}> Powered by </Text>
                            </View>
                        </View>
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
                            title={strings('token_exchange.button_exchange_enable')}
                            disabled={!buttonEnabled}
                            style={{
                                width: width - 40,
                                marginHorizontal: 20,
                            }}
                            onPress={this.onTrade}
                        />
                    </MyscrollView>
                    <Loading isShow={this.props.isWaiting} />
                </View>
            </DismissKeyboardView>
        );
    };

    renderNoNetWork() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                    style={{
                        ...commonStyles.shadow,
                        borderRadius: 10,
                        backgroundColor: 'white',
                        flex: 1,
                        width: width - 20,
                        marginVertical: 20,
                        marginHorizontal: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => {
                        this.setState(
                            {
                                isLoading: true,
                            },
                            () => this.getTokenLists(),
                        );
                    }}
                >
                    <Image source={require('../../../../assets/empty_transactions.png')} style={{ width: 80, height: 80, tintColor: 'gray' }} resizeMode="contain" />
                    <Text style={{ color: 'gray', textAlign: 'center', marginTop: 20 }}>{strings('token_exchange.label_no_token_lists')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        const { isLoading, error, showMenu } = this.state;
        const popWindowTop = getStatusBarHeight(true) + Header.HEIGHT;
        return (
            <View style={{ flex: 1 }}>
                <CustomHeader
                    title={strings('token_exchange.title')}
                    headerRight={
                        <TouchableOpacity
                            style={{
                                width: 48,
                                height: 48,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={this.openMenu}
                        >
                            <Image source={require('../../../../assets/icon_account_menu.png')} style={{ width: 25, height: 25, tintColor: '#fff' }} resizeMode="contain" />
                        </TouchableOpacity>
                    }
                />
                {isLoading ? this.renderLoading() : error ? this.renderNoNetWork() : this.renderContent()}
                {/* Menu Pop window */}
                <PopupMenu
                    backgroundColor="rgba(52,52,52,0.54)"
                    onClose={select => this.onCloseMenu(select)}
                    visible={showMenu}
                    data={DEX_MENU}
                    containerPosition={{
                        position: 'absolute',
                        top: popWindowTop,
                        right: 5,
                    }}
                    imageStyle={{ width: 20, height: 20, marginRight: 10 }}
                    fontStyle={{ fontSize: 12, color: '#000' }}
                    itemStyle={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        marginVertical: 10,
                    }}
                    containerBackgroundColor="#fff"
                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                />
            </View>
        );
    }
}

const mapToState = ({ accountsModel, settingsModel, ERC20Dex }) => {
    const currentAccount = accountsModel.accountsMap[ERC20Dex.currentAccount];

    // extract balance as a prop, since currentAccount->token->balance change won't trigger render.
    let balance;
    if (currentAccount) {
        const currentToken = ERC20Dex.trade.srcToken;
        balance = currentAccount.balance;
        if (currentToken !== 'ETH' && currentAccount.tokens[currentToken]) {
            balance = currentAccount.tokens[currentToken];
        }
    }

    return {
        trade: ERC20Dex.trade,
        isWaiting: ERC20Dex.isWaiting,
        currentAccount,
        balance,
        tokenList: ERC20Dex.tokenList,
        lang: settingsModel.lang,
    };
};

export default connect(mapToState)(Home);

const styles = {
    container1: {
        ...commonStyles.shadow,
        borderRadius: 10,
        backgroundColor: 'white',
        width: width - 40,
        alignItems: 'center',
        padding: 10,
        marginVertical: 20,
        marginHorizontal: 20,
    },
    tokenView: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.2,
        borderBottomColor: 'lightgray',
        marginVertical: 10,
        height: 50,
    },
    tokenLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: 100,
        padding: 5,
    },
    textInputStyle: {
        padding: 0,
        width: width - 200,
        marginLeft: 10,
    },
    tokenNumberLabel: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 0.5,
        backgroundColor: '#dfdfdf',
    },
};
