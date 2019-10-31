import * as React from 'react';
import { View, FlatList, Image, Text, Button, Dimensions, TouchableOpacity, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import { mainBgColor } from '../../../style_util';
import { COINS } from '../../../../client/support_coin_list';
import { renderAddress } from '../../../components/AccountBar';
import commonStyles from '../../../styles';
import { strings } from '../../../../locales/i18n';
import { createAction, navigate, navigateBack } from '../../../../utils/dva';
import { accountKey } from '../../../../utils';

const { width } = Dimensions.get('window');
class AccountList extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('token_exchange.label_select_account'),
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
        this.accountType = this.props.navigation.getParam('type', 'ETH');
        this.usage = this.props.navigation.getParam('usage', 'Dex');
        this.callback = this.props.navigation.getParam('callback', (error, res) => {
            console.log(error, res);
        });
        this.props.navigation.setParams({ onGoBack: this.onGoBack });
    }

    componentDidMount(): void {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.onGoBack(); // works best when the goBack is async
            return true;
        });
    }

    componentWillUnmount(): void {
        this.backHandler.remove();
    }

    onGoBack = () => {
        this.callback('give up switch');
        navigateBack(this.props);
    };

    addAccount = () => {
        const { dispatch } = this.props;
        dispatch(createAction('accountImportModel/updateState')({ symbol: this.accountType }));
        navigate('signed_vault_import_from')(this.props);
    };

    selectAccount = ({ symbol, address }) => {
        const { dispatch } = this.props;
        if (typeof this.usage === 'function') {
            this.usage({ symbol, address });
        } else if (this.usage === 'Dex') {
            dispatch(
                createAction('ERC20Dex/ERC20DexUpdateState')({
                    currentAccount: accountKey(symbol, address),
                }),
            );
        } else if (this.usage === 'pokket') {
            dispatch(
                createAction('pokketModel/updateState')({
                    currentAccount: accountKey(symbol, address),
                }),
            );
        } else if (this.usage === 'dapp') {
            dispatch(
                createAction('accountsModel/updateState')({
                    currentAccount: accountKey(symbol, address),
                }),
            );
            this.callback(null, address);
        }
        navigateBack(this.props);
    };

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this.selectAccount(item)}>
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
                            {renderAddress(item.address, item.symbol)}
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
                    <Text style={{ color: 'gray', marginBottom: 20 }}>{strings(`token_exchange.label_${this.accountType}_account_not_found`)}</Text>
                    <Button title={strings(`token_exchange.button_add_${this.accountType}_account`)} onPress={this.addAccount} />
                </View>
            </View>
        );
    };

    render() {
        const { accounts: accounts_ } = this.props;
        const accounts = Object.values(
            Object.keys(accounts_)
                .filter(k => k.startsWith(this.accountType))
                .reduce((map, el) => {
                    map[el] = accounts_[el];
                    return map;
                }, {}),
        );
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
        accounts: accountsMap,
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
