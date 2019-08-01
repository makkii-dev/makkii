import * as React from 'react';
import { View, FlatList, Image, Text, Button, Dimensions, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import { mainBgColor } from '../../../style_util';
import { COINS } from '../../../../client/support_coin_list';
import { renderAddress } from './home';
import commonStyles from '../../../styles';
import { strings } from '../../../../locales/i18n';
import { createAction, navigate, navigateBack } from '../../../../utils/dva';
import { accountKey } from '../../../../utils';

const { width } = Dimensions.get('window');
class AccountList extends React.Component {
    static navigationOptions = () => {
        return {
            title: strings('token_exchange.label_select_account'),
        };
    };

    addAccount = () => {
        const { dispatch } = this.props;
        dispatch(createAction('accountImportModel/updateState')({ symbol: 'ETH' }));
        navigate('signed_vault_import_from')(this.props);
    };

    selectAccount = address => {
        const { dispatch } = this.props;
        dispatch(
            createAction('ERC20Dex/ERC20DexUpdateState')({
                currentAccount: accountKey('ETH', address),
            }),
        );
        navigateBack(this.props);
    };

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.selectAccount(item.address)}>
                <View style={styles.accountContainerWithShadow}>
                    <Image source={COINS[item.symbol].icon} style={{ marginRight: 10, width: 24, height: 24 }} />
                    <View style={{ flex: 1, paddingVertical: 10 }}>
                        <View
                            style={{
                                ...styles.accountSubContainer,
                                width: '100%',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ ...styles.accountSubTextFontStyle1, width: '70%' }} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text
                                style={{
                                    ...styles.accountSubTextFontStyle1,
                                    fontWeight: 'bold',
                                }}
                            >
                                {new BigNumber(item.balance).toFixed(4)}
                            </Text>
                        </View>
                        <View style={{ ...styles.accountSubContainer, alignItems: 'center' }}>
                            {renderAddress(item.address)}
                            <Text style={styles.accountSubTextFontStyle2}>{item.symbol}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    renderEmpty = () => {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: mainBgColor,
                }}
            >
                <View style={{ width, height: 180, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../../../../assets/empty_account.png')} style={{ width: 80, height: 80, tintColor: 'gray', marginBottom: 20 }} resizeMode="contain" />
                    <Text style={{ color: 'gray', marginBottom: 20 }}>{strings('token_exchange.label_account_not_found')}</Text>
                    <Button title={strings('token_exchange.button_add_eth_account')} onPress={this.addAccount} />
                </View>
            </View>
        );
    };

    render() {
        const { accounts } = this.props;
        if (accounts.length === 0) {
            return this.renderEmpty();
        }
        return (
            <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                <FlatList data={accounts} renderItem={this.renderItem} keyExtractor={(item, index) => `${index}`} />
            </View>
        );
    }
}

const mapToState = ({ accountsModel }) => {
    const { accountsMap } = accountsModel;
    return {
        accounts: Object.values(
            Object.keys(accountsMap)
                .filter(k => k.toLowerCase().startsWith('eth'))
                .reduce((map, el) => {
                    map[el] = accountsMap[el];
                    return map;
                }, {}),
        ),
    };
};

export default connect(mapToState)(AccountList);

const styles = {
    accountContainerWithShadow: {
        ...commonStyles.shadow,
        borderRadius: 10,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginHorizontal: 20,
        marginVertical: 10,
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
};
