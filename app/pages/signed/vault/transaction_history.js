import React from 'react';
import { View, FlatList, Image, Text, ActivityIndicator, Dimensions, NativeModules } from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import { sameAddress } from '../../../../client/api';
import { ImportListFooter, TransactionItem } from '../../../components/common';
import { mainBgColor } from '../../../style_util';
import { createAction, navigate } from '../../../../utils/dva';

const BaiduMobStat = NativeModules.BaiduMobStat;
const { width } = Dimensions.get('window');

class TransactionHistory extends React.Component {
    static navigationOptions = () => {
        return {
            title: strings('account_view.transaction_history_label'),
        };
    };

    state = {
        currentPage: 0,
        footerState: 0,
        isLoading: true,
    };

    componentWillMount() {
        setTimeout(() => {
            this.fetchAccountTransactions(this.state.currentPage);
        }, 500);
        this.isMount = true;
        BaiduMobStat.onPageStart('Transaction History');
    }

    componentWillUnmount(): void {
        this.isMount = false;
        BaiduMobStat.onPageEnd('Transaction History');
    }

    fetchAccountTransactions = (page = 0, size = 10) => {
        const { currentPage } = this.state;
        const { currentAccount, dispatch, transactions } = this.props;

        // size = currentAccount.symbol.match(/^BTC$|^LTC$/) ? 10: size;

        console.log(`get transactions page: ${page} size: ${size}`);
        console.log('---------------------------------------------');
        console.log('transaction length: ', transactions.length);
        console.log('now: ', Date.now());
        console.log('---------------------------------------------');
        let lastTimestamp;
        if (page === 0 || transactions.length <= 0) {
            lastTimestamp = Date.now();
        } else if (transactions.length > 0) {
            lastTimestamp = transactions[transactions.length - 1].timestamp;
        } else {
            lastTimestamp = Date.now();
        }

        dispatch(
            createAction('accountsModel/getTransactionHistory')({
                user_address: currentAccount.address,
                symbol: currentAccount.symbol,
                tokenSymbol: currentAccount.coinSymbol === currentAccount.symbol ? '' : currentAccount.coinSymbol,
                page,
                size,
                needSave: false,
                timestamp: lastTimestamp,
            }),
        ).then(r => {
            if (r === 0) {
                this.isMount &&
                    this.setState({
                        currentPage,
                        isLoading: false,
                        footerState: 1,
                    });
            } else {
                this.isMount &&
                    this.setState({
                        currentPage: page,
                        isLoading: false,
                        footerState: r === size ? 0 : 1,
                    });
            }
        });
    };

    toTxDetail = item => {
        const { currentAccount } = this.props;
        navigate('signed_vault_transaction', {
            account: currentAccount,
            transaction: item,
        })(this.props);
    };

    _onEndReached() {
        // if not in fetching account
        if (this.state.footerState !== 0) {
            return;
        }
        // set footer state
        this.setState(
            {
                footerState: 2,
            },
            () => {
                setTimeout(() => this.fetchAccountTransactions(this.state.currentPage + 1), 500);
            },
        );
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

    renderTransaction = ({ item }) => {
        const { currentAccount } = this.props;
        return (
            <TransactionItem
                isSender={sameAddress(currentAccount.symbol, currentAccount.address, item.from)}
                symbol={currentAccount.coinSymbol}
                transaction={item}
                onPress={() => this.toTxDetail(item)}
            />
        );
    };

    render() {
        if (this.state.isLoading) {
            return this.renderLoadingView();
        }
        const { transactions } = this.props;
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: mainBgColor,
                }}
            >
                {transactions.length ? (
                    <FlatList
                        data={transactions}
                        style={{ backgroundColor: '#fff' }}
                        keyExtractor={(item, index) => `${index}`}
                        renderItem={this.renderTransaction}
                        onEndReached={() => {
                            this._onEndReached();
                        }}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={() => <ImportListFooter hasSeparator={false} footerState={this.state.footerState} />}
                    />
                ) : (
                    <View
                        style={{
                            width,
                            height: 180,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Image source={require('../../../../assets/empty_transactions.png')} style={{ width: 80, height: 80, tintColor: 'gray', marginBottom: 20 }} resizeMode="contain" />
                        <Text style={{ color: 'gray' }}>{strings('account_view.empty_label')}</Text>
                    </View>
                )}
            </View>
        );
    }
}

const mapToState = ({ accountsModel }) => {
    const { currentAccount: key, currentToken, transactionsMap, accountsMap } = accountsModel;
    const currentAccount = {
        ...accountsMap[key],
        coinSymbol: currentToken === '' ? accountsMap[key].symbol : currentToken,
        balance: currentToken === '' ? accountsMap[key].balance : accountsMap[key].tokens[currentToken],
    };
    const txKey = currentToken === '' ? key : `${key}+${currentToken}`;
    const compareFn = (a, b) => {
        if (b.timestamp === undefined && a.timestamp !== undefined) return 1;
        if (b.timestamp === undefined && a.timestamp === undefined) return 0;
        if (b.timestamp !== undefined && a.timestamp === undefined) return -1;
        return b.timestamp - a.timestamp;
    };
    const transactions = Object.values(transactionsMap[txKey]).sort(compareFn);

    return {
        currentAccount,
        transactions,
    };
};

export default connect(mapToState)(TransactionHistory);
