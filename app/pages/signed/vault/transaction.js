import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Image, Clipboard, TouchableOpacity, ScrollView, Dimensions, PixelRatio } from 'react-native';
import { TransactionItemCell, PendingComponent } from '../../../components/common';
import { strings } from '../../../../locales/i18n';
import { sameAddress, getTransactionExplorerUrl } from '../../../../client/api';
import { fixedWidthFont, linkButtonColor, mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { AppToast } from '../../../components/AppToast';
import { createAction } from '../../../../utils/dva';
import { accountKey } from '../../../../utils';

const { width, height } = Dimensions.get('window');

class Transaction extends Component {
    static navigationOptions = () => {
        return {
            title: strings('transaction_detail.title'),
        };
    };

    constructor(props) {
        super(props);
        this.account = this.props.navigation.state.params.account;
        this.additional_data = this.props.navigation.state.params.additional_data;
        this.transaction = this.props.navigation.state.params.transaction;
    }

    onViewInExplorer = () => {
        const url = getTransactionExplorerUrl(this.account.symbol, this.transaction.hash);
        this.props.navigation.navigate('simple_webview', { initialUrl: { uri: url } });
    };

    // eslint-disable-next-line consistent-return
    renderAdditionData = () => {
        if (this.additional_data) {
            const { type, data } = this.additional_data;
            if (type === 'exchange') {
                const { srcToken, srcQty, destToken, destQty } = data;
                const content = [];
                content.push(<TransactionItemCell key="payment" style={{ height: 80 }} title={strings('transaction_detail.label_sell')} value={`${srcQty} ${srcToken}`} valueTextAlign="left" />);
                content.push(<TransactionItemCell key="exchanged" style={{ height: 80 }} title={strings('transaction_detail.label_buy')} value={`${destQty} ${destToken}`} valueTextAlign="left" />);
                return content;
            }
        } else {
            const { coinSymbol } = this.account;
            return (
                <TransactionItemCell
                    style={{ height: 80 }}
                    title={strings('transaction_detail.amount_label')}
                    value={`${new BigNumber(this.transaction.value).toNotExString()} ${coinSymbol}`}
                    valueTextAlign="left"
                />
            );
        }
    };

    addToAddressBook = (address, symbol) => {
        const { dispatch, navigation } = this.props;
        dispatch(
            createAction('contactAddModel/updateState')({
                symbol,
                name: '',
                address,
                editable: false,
            }),
        );
        navigation.navigate('signed_setting_add_address');
    };

    renderBTCAddresses = (arr, label, symbol) => {
        const views = arr.reduce((views, el, index) => {
            let inAddressBook;
            let addressName;
            const accKey = accountKey(symbol, el.addr);
            if (
                Object.keys(this.props.address_book)
                    .map(e => e.toLowerCase())
                    .indexOf(accKey.toLowerCase()) >= 0
            ) {
                inAddressBook = true;
                addressName = this.props.address_book[accKey].name;
            } else {
                inAddressBook = false;
            }
            views.push(
                <TransactionItemCell
                    key={`${index}`}
                    title={`${strings(`transaction_detail.${label}`)} ${index + 1}`}
                    rightView={() => (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    Clipboard.setString(el.addr);
                                    AppToast.show(strings('toast_copy_success'));
                                }}
                            >
                                <Image source={require('../../../../assets/icon_copy.png')} style={{ width: 20, height: 20, tintColor: '#000' }} resizeMode="contain" />
                            </TouchableOpacity>
                            {inAddressBook ? null : (
                                <TouchableOpacity onPress={() => this.addToAddressBook(el.addr, this.account.symbol)} style={{ marginLeft: 10 }}>
                                    <Image source={require('../../../../assets/icon_add_address.png')} style={{ width: 20, height: 20, tintColor: '#000' }} resizeMode="contain" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                >
                    <View style={{ width: '100%', borderBottomColor: '#000', borderBottomWidth: 1 / PixelRatio.get() }}>
                        <Text style={{ fontSize: 12, fontFamily: fixedWidthFont }}>{inAddressBook ? `${addressName}:(${el.addr})` : el.addr}</Text>
                        <Text style={{ width: '100%', textAlign: 'right' }}>{`${el.value} ${symbol}`}</Text>
                    </View>
                </TransactionItemCell>,
            );
            return views;
        }, []);
        return <View style={{ width: '100%' }}>{views}</View>;
    };

    renderBTC = () => {
        const { from, to } = this.transaction;
        const { symbol } = this.account;
        const fromView = this.renderBTCAddresses(from, 'label_input', symbol);
        const toView = this.renderBTCAddresses(to, 'label_output', symbol);
        return (
            <View style={styles.BTCTxBody}>
                <TransactionItemCell title={strings('transaction_detail.sender_label')}>{fromView}</TransactionItemCell>
                <TransactionItemCell title={strings('transaction_detail.receiver_label')}>{toView}</TransactionItemCell>
            </View>
        );
    };

    renderNormal = () => {
        const { transaction } = this;
        const ifSender = sameAddress(this.account.symbol, this.account.address, transaction.from);
        const title1 = ifSender ? strings('transaction_detail.receiver_label') : strings('transaction_detail.sender_label');
        const value1 = ifSender ? transaction.to : transaction.from;
        const accKey = accountKey(this.account.symbol, value1);
        let inAddressBook;
        let addressName;
        if (Object.keys(this.props.address_book).indexOf(accKey) >= 0) {
            inAddressBook = true;
            addressName = this.props.address_book[accKey].name;
        } else {
            inAddressBook = false;
        }

        return (
            <TransactionItemCell
                style={{ height: 100 }}
                title={title1}
                value={inAddressBook ? `${addressName}:(${value1})` : value1}
                valueTextAlign="left"
                rightView={() => (
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => {
                                Clipboard.setString(value1);
                                AppToast.show(strings('toast_copy_success'));
                            }}
                        >
                            <Image source={require('../../../../assets/icon_copy.png')} style={{ width: 20, height: 20, tintColor: '#000' }} resizeMode="contain" />
                        </TouchableOpacity>
                        {inAddressBook ? null : (
                            <TouchableOpacity onPress={() => this.addToAddressBook(value1, this.account.symbol)} style={{ marginLeft: 10 }}>
                                <Image source={require('../../../../assets/icon_add_address.png')} style={{ width: 20, height: 20, tintColor: '#000' }} resizeMode="contain" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        );
    };

    render() {
        const { transaction, account } = this;
        const timestamp = transaction.timestamp === undefined ? '' : new Date(transaction.timestamp).Format('yyyy/MM/dd hh:mm');
        return (
            <ScrollView style={{ backgroundColor: mainBgColor, height, width }}>
                <View style={{ flex: 1, width, paddingHorizontal: 20 }}>
                    <View
                        style={{
                            ...defaultStyles.shadow,
                            flex: 1,
                            marginVertical: 20,
                            paddingVertical: 10,
                            paddingHorizontal: 10,
                            borderRadius: 10,
                            backgroundColor: 'white',
                        }}
                    >
                        {account.symbol !== 'BTC' && account.symbol !== 'LTC' ? this.renderNormal() : this.renderBTC()}
                        <TransactionItemCell title={strings('transaction_detail.timestamp_label')} value={timestamp} valueTextAlign="left" />
                        <TransactionItemCell
                            title={strings('transaction_detail.transactionHash_label')}
                            value={transaction.hash}
                            valueTextAlign="left"
                            rightView={() => (
                                <TouchableOpacity
                                    onPress={() => {
                                        Clipboard.setString(transaction.hash);
                                        AppToast.show(strings('toast_copy_success'));
                                    }}
                                >
                                    <Image source={require('../../../../assets/icon_copy.png')} style={{ width: 20, height: 20, tintColor: '#000' }} resizeMode="contain" />
                                </TouchableOpacity>
                            )}
                        />
                        <TransactionItemCell title={strings('transaction_detail.blockNumber_label')} value={transaction.blockNumber} valueTextAlign="left" />

                        {account.symbol !== 'BTC' && account.symbol !== 'LTC' ? this.renderAdditionData() : null}
                        {transaction.fee ? <TransactionItemCell title={strings('transaction_detail.label_fee')} value={`${transaction.fee} ${this.account.coinSymbol}`} valueTextAlign="left" /> : null}
                        <TransactionItemCell title={strings('transaction_detail.status_label')} value={<PendingComponent status={transaction.status} />} valueTextAlign="left" />
                    </View>
                    <View
                        style={{
                            marginTop: 10,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            width: '100%',
                            padding: 10,
                        }}
                    >
                        <TouchableOpacity onPress={this.onViewInExplorer}>
                            <Text style={{ color: linkButtonColor }}>{strings('transaction_detail.viewInExplorer_button')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }
}

const mapToState = ({ userModel }) => ({
    address_book: userModel.address_book,
});
export default connect(mapToState)(Transaction);

const styles = {
    BTCTxBody: {
        alignItems: 'center',
    },
    BTCTxSubLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    BTCTxSubItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
};
