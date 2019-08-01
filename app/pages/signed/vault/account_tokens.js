import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RefreshControl, Platform, PixelRatio, StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';
import BigNumber from 'bignumber.js';
import { Header } from 'react-navigation';
import { strings } from '../../../../locales/i18n';
import { getStatusBarHeight, accountKey } from '../../../../utils';
import { mainBgColor, fixedHeight, mainColor } from '../../../style_util';
import { COINS } from '../../../../client/support_coin_list';
import SwipeCell from '../../../components/SwipeCell';
import { getTokenIconUrl } from '../../../../client/api';
import { PopWindow } from './home_popwindow';
import { ACCOUNT_MENU, getAccountConstants } from './constants';
import { AddressComponent } from '../../../components/common';
import defaultStyles from '../../../styles';
import { createAction, navigate, popCustom } from '../../../../utils/dva';

import { AppToast } from '../../../components/AppToast';

const { width } = Dimensions.get('window');

class AccountTokens extends Component {
    static navigationOptions = ({ navigation }) => {
        const title = navigation.getParam('title');
        const showMenu = navigation.getParam('showMenu', () => {});
        return {
            headerTitle: (
                <Text
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        color: 'white',
                        fontSize: 16,
                        fontWeight: 'bold',
                    }}
                >
                    {title}
                </Text>
            ),
            headerRight: (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity
                        style={{
                            width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => {
                            navigation.state.params.selectTokens();
                        }}
                    >
                        <Image style={{ width: 25, height: 25, tintColor: 'white' }} resizeMode="contain" source={require('../../../../assets/icon_add.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={showMenu}
                    >
                        <Image source={require('../../../../assets/icon_account_menu.png')} style={{ width: 25, height: 25, tintColor: '#fff' }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            ),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            openRowKey: null,
            showMenu: false,
            refreshing: false,
        };
        this.props.navigation.setParams({
            title: this.props.currentAccount.name,
            selectTokens: this.selectTokens,
            showMenu: this.openMenu,
        });
    }

    componentWillMount() {
        this.isMount = true;
        this.listenNavigation = this.props.navigation.addListener('willBlur', () => this.setState({ showMenu: false }));
    }

    componentWillReceiveProps(nextProps): void {
        if (nextProps.currentAccount.name !== this.props.currentAccount.name) {
            this.props.navigation.setParams({
                title: nextProps.currentAccount.name,
            });
        }
    }

    componentWillUnmount() {
        this.isMount = false;
        this.listenNavigation.remove();
    }

    onDeleteToken(key) {
        console.log(`delete key: ${key}`);
        const { dispatch, currentAccount } = this.props;
        popCustom.show(
            strings('alert_title_warning'),
            strings('select_coin.warning_delete_token'),
            [
                {
                    text: strings('cancel_button'),
                    onPress: () => this.setState({ openRowKey: null }),
                },
                {
                    text: strings('delete_button'),
                    onPress: () => {
                        this.setState(
                            {
                                openRowKey: null,
                            },
                            () =>
                                setTimeout(() => {
                                    dispatch(
                                        createAction('accountsModel/deleteToken')({
                                            ...currentAccount,
                                            tokenSymbol: key,
                                        }),
                                    );
                                }, 500),
                        );
                    },
                },
            ],
            { cancelable: false },
        );
    }

    onSwipeOpen(Key: any) {
        this.setState({
            openRowKey: Key,
        });
    }

    onSwipeClose() {
        this.setState({
            openRowKey: null,
        });
    }

    openMenu = () => {
        this.setState({
            showMenu: true,
        });
    };

    onCloseMenu = select => {
        const { dispatch, currentAccount } = this.props;
        const { navigationSafely } = this.props.screenProps;
        this.setState(
            {
                showMenu: false,
            },
            () => {
                switch (select) {
                    case ACCOUNT_MENU[0].title:
                        navigate('signed_vault_set_account_name')({ dispatch });
                        break;
                    case ACCOUNT_MENU[1].title:
                        navigationSafely({
                            routeName: 'signed_vault_export_private_key',
                            params: {
                                currentAccount: accountKey(currentAccount.symbol, currentAccount.address),
                            },
                        })({ dispatch });
                        break;
                    case ACCOUNT_MENU[2].title:
                        dispatch(
                            createAction('ERC20Dex/ERC20DexUpdateState')({
                                currentAccount: accountKey(currentAccount.symbol, currentAccount.address),
                            }),
                        );
                        navigate('signed_dex')({ dispatch });
                        break;
                    default:
                }
            },
        );
    };

    loadBalances = () => {
        const { dispatch, currentAccount } = this.props;
        this.setState(
            {
                refreshing: true,
            },
            () => {
                dispatch(
                    createAction('accountsModel/loadBalances')({
                        keys: [accountKey(currentAccount.symbol, currentAccount.address)],
                    }),
                ).then(r => {
                    if (r) {
                        this.isMount &&
                            this.setState({
                                refreshing: false,
                            });
                    } else {
                        AppToast.show(strings('wallet.toast_has_pending_transactions'), {
                            position: AppToast.positions.CENTER,
                        });
                    }
                });
            },
        );
    };

    selectTokens = () => {
        this.props.navigation.navigate('signed_select_token');
    };

    toAccounts = tokenSymbol => {
        const { dispatch, currentAccount } = this.props;
        console.log('tokenSymbol=>', tokenSymbol);
        console.log('currentAccount.symbol=>', currentAccount.symbol);
        dispatch(
            createAction('accountsModel/updateState')({
                currentToken: tokenSymbol !== currentAccount.symbol ? tokenSymbol : '',
            }),
        );
        navigate('signed_vault_account')({ dispatch });
    };

    renderItem = ({ item, index }) => {
        const { name, symbol, balance, imageIcon, fastImageUrl } = item;
        const cellHeight = 60;
        return (
            <SwipeCell
                maxSwipeDistance={fixedHeight(186)}
                swipeEnabled={this.state.openRowKey === null && index !== 0}
                preventSwipeRight
                shouldBounceOnMount
                onOpen={() => this.onSwipeOpen(symbol)}
                onClose={() => this.onSwipeClose(symbol)}
                isOpen={symbol === this.state.openRowKey}
                slideoutView={
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                            backgroundColor: 'transparent',
                            height: cellHeight,
                            justifyContent: 'flex-end',
                            borderRadius: 5,
                            marginVertical: 10,
                            marginHorizontal: 20,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                this.onDeleteToken(symbol);
                            }}
                        >
                            <View
                                style={{
                                    width: fixedHeight(186),
                                    justifyContent: 'center',
                                    height: cellHeight,
                                    alignItems: 'center',
                                    backgroundColor: '#fe0000',
                                    borderRadius: 5,
                                }}
                            >
                                <Text style={{ fontSize: 14, color: '#fff' }}>{strings('delete_button')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                }
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        ...defaultStyles.shadow,
                        flexDirection: 'row',
                        borderRadius: 5,
                        alignItems: 'center',
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        backgroundColor: '#fff',
                        justifyContent: 'space-between',
                        marginVertical: 10,
                        marginHorizontal: 20,
                        height: cellHeight,
                    }}
                    onPress={() => {
                        if (this.state.openRowKey) {
                            this.setState({ openRowKey: null });
                        } else {
                            this.toAccounts(symbol);
                        }
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {imageIcon !== undefined ? (
                            <Image style={{ width: 30, height: 30 }} source={imageIcon} resizeMode="contain" />
                        ) : fastImageUrl !== undefined ? (
                            <FastImage style={{ width: 30, height: 30 }} source={{ uri: fastImageUrl }} resizeMode={FastImage.resizeMode.contain} />
                        ) : null}
                        <Text numberOfLines={1} style={{ paddingLeft: 10 }}>
                            {name}
                        </Text>
                    </View>
                    <Text numberOfLines={1}>{`${new BigNumber(balance).toFixed(4)} ${symbol}`}</Text>
                </TouchableOpacity>
            </SwipeCell>
        );
    };

    render() {
        const { currentAccount, tokenList } = this.props;

        const popWindowTop = Platform.OS === 'ios' ? getStatusBarHeight(true) + Header.HEIGHT : Header.HEIGHT;
        const menuArray = [ACCOUNT_MENU[0]];
        if (currentAccount.type !== '[ledger]') {
            menuArray.push(ACCOUNT_MENU[1]);
        }
        if (COINS[currentAccount.symbol].tokenExchangeSupport) {
            menuArray.push(ACCOUNT_MENU[2]);
        }

        const titleFontSize = 32;

        const { typeIcon, typeText } = getAccountConstants(currentAccount.type);
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                }}
                onPress={() => {
                    this.state.openRowKey && this.setState({ openRowKey: null });
                }}
            >
                <View
                    style={{
                        backgroundColor: mainColor,
                        width: '100%',
                        paddingVertical: 20,
                        paddingHorizontal: 20,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 10,
                        }}
                    >
                        <Image style={{ width: 20, height: 20, marginRight: 10 }} resizeMode="contain" source={COINS[currentAccount.symbol].icon} />
                        <Text style={{ color: '#fff', marginRight: 20 }}>{COINS[currentAccount.symbol].name}</Text>
                        <Image style={{ width: 20, height: 20, marginRight: 10, tintColor: '#fff' }} resizeMode="contain" source={typeIcon} />
                        <Text style={{ color: '#fff' }}>{typeText}</Text>
                    </View>
                    <AddressComponent address={currentAccount.address} symbol={currentAccount.symbol} />
                </View>
                <FlatList
                    style={{ flex: 1, width }}
                    data={tokenList}
                    renderItem={this.renderItem}
                    keyExtractor={item => item.symbol}
                    onScroll={() => {
                        this.setState({
                            openRowKey: null,
                        });
                    }}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.loadBalances} title="ContextMenu" />}
                />
                {/* Menu Pop window */}
                {this.state.showMenu ? (
                    <PopWindow
                        backgroundColor="rgba(52,52,52,0.54)"
                        onClose={select => this.onCloseMenu(select)}
                        data={menuArray}
                        containerPosition={{ position: 'absolute', top: popWindowTop, right: 5 }}
                        imageStyle={{ width: titleFontSize, height: 20, marginRight: 10 }}
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
                ) : null}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    divider: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#dfdfdf',
    },
});

const mapToState = ({ accountsModel }) => {
    const { currentAccount: key, accountsMap, tokenLists } = accountsModel;
    const currentAccount = { ...accountsMap[key] };
    const { symbol } = currentAccount;
    const tokens = Object.keys(currentAccount.tokens).reduce(
        (arr, el) => {
            const token = tokenLists[symbol][el];
            const item = {
                symbol: token.symbol,
                name: token.name,
                balance: currentAccount.tokens[el],
            };
            try {
                const fastImageUrl = getTokenIconUrl(symbol, token.symbol, token.contractAddr);
                arr.push({ ...item, fastImageUrl });
            } catch (e) {
                arr.push({ ...item, imageIcon: COINS[symbol].default_token_icon });
            }
            return arr;
        },
        [
            {
                symbol,
                name: COINS[symbol].name,
                balance: currentAccount.balance,
                imageIcon: COINS[symbol].icon,
            },
        ],
    );
    return {
        currentAccount,
        tokenList: tokens,
    };
};
export default connect(mapToState)(AccountTokens);
