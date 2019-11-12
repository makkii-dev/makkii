import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Image, Clipboard, TouchableOpacity, ScrollView, Dimensions, PixelRatio, TextInput, ActivityIndicator } from 'react-native';
import BigNumber from 'bignumber.js';
import { TransactionItemCell, PendingComponent } from '../../../components/common';
import { strings } from '../../../../locales/i18n';
import { sameAddress, getTransactionExplorerUrl } from '../../../../client/api';
import { fixedWidthFont, linkButtonColor, mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { AppToast } from '../../../components/AppToast';
import { createAction } from '../../../../utils/dva';
import { accountKey } from '../../../../utils';
import { getTransactionNote, setTransactionNote } from '../../../../services/accounts.service';
import Loading from '../../../components/Loading';

const { width, height } = Dimensions.get('window');

class Transaction extends Component {
    static navigationOptions = () => {
        return {
            title: strings('transaction_detail.title'),
        };
    };

    state = {
        editRemarks: false,
        remarksValue: '',
        isLoading: true,
    };

    constructor(props) {
        super(props);
        this.account = this.props.navigation.state.params.account;
        this.additional_data = this.props.navigation.state.params.additional_data;
        this.transaction = this.props.navigation.state.params.transaction;
    }

    componentDidMount(): void {
        const txHash = this.transaction.hash;
        const chain = this.account.symbol;
        const address = this.account.address;
        getTransactionNote(chain, txHash, address).then(note => {
            this.setState({
                isLoading: false,
                remarksValue: note,
            });
        });
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
                    title={strings('transaction_detail.label_amount')}
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
                <TransactionItemCell title={strings('transaction_detail.label_sender')}>{fromView}</TransactionItemCell>
                <TransactionItemCell title={strings('transaction_detail.label_receiver')}>{toView}</TransactionItemCell>
            </View>
        );
    };

    renderNormal = () => {
        const { transaction } = this;
        const ifSender = sameAddress(this.account.symbol, this.account.address, transaction.from);
        const title1 = ifSender ? strings('transaction_detail.label_receiver') : strings('transaction_detail.label_sender');
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

    handle_Remarks = v => {
        this.setState(
            {
                editRemarks: v,
            },
            () => {
                if (!v) {
                    const txHash = this.transaction.hash;
                    const chain = this.account.symbol;
                    const address = this.account.address;
                    this.refs.refLoading.show();
                    setTransactionNote(chain, txHash, address, this.state.remarksValue).then(r => {
                        this.refs.refLoading.hide();
                        if (r) {
                            AppToast.show(strings('transaction_detail.toast_update_success'));
                        } else {
                            AppToast.show(strings('transaction_detail.toast_update_fail'));
                        }
                    });
                } else {
                    this.refs.refTextInput.focus();
                }
            },
        );
    };

    renderLoading() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    }

    render() {
        const { transaction, account } = this;
        const timestamp = transaction.timestamp === undefined ? '' : new Date(transaction.timestamp).Format('yyyy/MM/dd hh:mm');
        if (this.state.isLoading) {
            return this.renderLoading();
        }

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
                        <TransactionItemCell title={strings('transaction_detail.label_timestamp')} value={timestamp} valueTextAlign="left" />
                        <TransactionItemCell
                            title={strings('transaction_detail.label_transactionHash')}
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
                        {transaction.blockNumber && <TransactionItemCell title={strings('transaction_detail.label_blockNumber')} value={transaction.blockNumber} valueTextAlign="left" />}

                        {account.symbol !== 'BTC' && account.symbol !== 'LTC' ? this.renderAdditionData() : null}
                        {transaction.fee ? <TransactionItemCell title={strings('transaction_detail.label_fee')} value={`${transaction.fee} ${this.account.coinSymbol}`} valueTextAlign="left" /> : null}
                        <TransactionItemCell title={strings('transaction_detail.label_status')} value={<PendingComponent status={transaction.status} />} valueTextAlign="left" />
                        <TransactionItemCell
                            title={strings('transaction_detail.label_remarks')}
                            rightView={() => {
                                return (
                                    <TouchableOpacity onPress={() => this.handle_Remarks(!this.state.editRemarks)}>
                                        {this.state.editRemarks ? (
                                            <Text style={{ color: linkButtonColor }}>{strings('transaction_detail.button_save')}</Text>
                                        ) : (
                                            <Text style={{ color: linkButtonColor }}>{strings('transaction_detail.button_edit')}</Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        >
                            <TextInput
                                ref="refTextInput"
                                style={{
                                    width: '100%',
                                    borderBottomColor: '#000',
                                    borderBottomWidth: 1 / PixelRatio.get(),
                                    paddingBottom: 5,
                                    color: '#000',
                                    height: 70,
                                }}
                                placeholder={strings('transaction_detail.placeholder_remarks')}
                                placeholderTextColor="#ddd"
                                editable={this.state.editRemarks}
                                value={this.state.remarksValue}
                                multiline
                                onChangeText={t => {
                                    this.setState({
                                        remarksValue: t,
                                    });
                                }}
                            />
                        </TransactionItemCell>
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
                            <Text style={{ color: linkButtonColor }}>{strings('transaction_detail.button_viewInExplorer')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Loading ref="refLoading" />
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
