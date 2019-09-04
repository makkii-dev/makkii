import * as React from 'react';
import { PixelRatio, Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import commonStyles from '../styles';
import { strings } from '../../locales/i18n';
import { COINS } from '../../client/support_coin_list';

const { width } = Dimensions.get('window');

export const renderAddress = (address, symbol) => {
    if (symbol === 'ETH') {
        return (
            <View>
                <Text style={{ ...commonStyles.addressFontStyle, color: '#000' }}>
                    {`${address.substring(0, 4)} ${address.substring(4, 8)} ${address.substring(8, 12)} ${address.substring(12, 16)} ${address.substring(16, 21)}`}
                </Text>
                <Text style={{ ...commonStyles.addressFontStyle, color: '#000' }}>
                    {`${address.substring(21, 25)} ${address.substring(25, 29)} ${address.substring(29, 33)} ${address.substring(33, 37)} ${address.substring(37, 42)}`}
                </Text>
            </View>
        );
    }
    if (symbol === 'BTC') {
        return (
            <View>
                <Text style={{ ...commonStyles.addressFontStyle, color: '#000', fontSize: 10 }}>{address}</Text>
            </View>
        );
    }
};

export class AccountBar extends React.Component {
    static propTypes = {
        currentAccount: PropTypes.object,
        currentToken: PropTypes.string.isRequired,
        selectAccount: PropTypes.func.isRequired,
        toAccountDetail: PropTypes.func.isRequired,
    };

    // shouldComponentUpdate({ currentAccount, currentToken }): boolean {
    //     const { currentAccount: currentAccount_, currentToken: currentToken_ } = this.props;
    //     console.log('[AccountBar] currentAccount_=>', currentAccount_);
    //     console.log('[AccountBar] currentToken_=>', currentToken_);
    //     console.log('[AccountBar] currentAccount=>', currentAccount);
    //     console.log('[AccountBar] currentToken=>', currentToken);
    //     console.log('[AccountBar] shouldComponentUpdate=>', JSON.stringify(currentAccount_) !== JSON.stringify(currentAccount) || currentToken !== currentToken_);
    //     return JSON.stringify(currentAccount_) !== JSON.stringify(currentAccount) || currentToken !== currentToken_;
    // }

    render() {
        const { currentAccount, currentToken, selectAccount, toAccountDetail } = this.props;
        if (currentAccount) {
            const balance = currentToken !== 'ETH' && currentAccount.tokens[currentToken] ? currentAccount.tokens[currentToken] : currentAccount.balance;
            const symbol = currentToken !== 'ETH' && currentAccount.tokens[currentToken] ? currentToken : 'ETH';

            return (
                <View
                    style={{
                        ...commonStyles.shadow,
                        borderRadius: 10,
                        marginTop: 20,
                        marginHorizontal: 20,
                        paddingHorizontal: 10,
                        alignItems: 'flex-start',
                        backgroundColor: '#fff',
                        width: width - 40,
                    }}
                >
                    <TouchableOpacity onPress={selectAccount}>
                        <View
                            style={{
                                width: width - 40 - 20,
                                paddingVertical: 10,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                borderBottomWidth: 1 / PixelRatio.get(),
                                borderBottomColor: 'lightgray',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                }}
                            >
                                {strings('token_exchange.label_current_account')}
                            </Text>
                            <Image source={require('../../assets/arrow_right.png')} style={{ width: 24, height: 24 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toAccountDetail(currentAccount)}>
                        <View style={styles.accountContainerWithShadow}>
                            <Image source={COINS[currentAccount.symbol].icon} style={{ marginRight: 10, width: 24, height: 24 }} />
                            <View style={{ flex: 1, paddingVertical: 10 }}>
                                <View
                                    style={{
                                        ...styles.accountSubContainer,
                                        width: '100%',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ ...styles.accountSubTextFontStyle1, width: '70%' }} numberOfLines={1}>
                                        {currentAccount.name}
                                    </Text>
                                    <Text
                                        style={{
                                            ...styles.accountSubTextFontStyle1,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {BigNumber(balance).toFixed(4)}
                                    </Text>
                                </View>
                                <View style={{ ...styles.accountSubContainer, alignItems: 'center' }}>
                                    {renderAddress(currentAccount.address, currentAccount.symbol)}
                                    <Text style={styles.accountSubTextFontStyle2}>{symbol}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View
                style={{
                    ...commonStyles.shadow,
                    borderRadius: 10,
                    marginVertical: 10,
                    marginHorizontal: 20,
                    paddingHorizontal: 10,
                    alignItems: 'flex-start',
                    backgroundColor: '#fff',
                    width: width - 40,
                }}
            >
                <TouchableOpacity onPress={selectAccount}>
                    <View
                        style={{
                            width: '100%',
                            paddingVertical: 10,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}
                        >
                            {strings('token_exchange.label_select_account')}
                        </Text>
                        <Image source={require('../../assets/arrow_right.png')} style={{ width: 24, height: 24 }} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = {
    accountContainerWithShadow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 15,
        width: width - 40 - 20,
    },
    accountSubContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    accountSubTextFontStyle1: {
        fontSize: 14,
        color: '#000',
    },
    accountSubTextFontStyle2: {
        fontSize: 12,
        color: 'gray',
    },
    divider: {
        height: 0.5,
        backgroundColor: '#dfdfdf',
    },
};
