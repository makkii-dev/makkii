import { connect } from 'react-redux';
import React, { Component } from 'react';
import { ActivityIndicator, Button, Dimensions, FlatList, Image, Keyboard, PixelRatio, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { strings } from '../../../../locales/i18n';
import Loading from '../../../components/Loading';
import { mainBgColor } from '../../../style_util';
import { COINS } from '../../../../client/support_coin_list';
import { getTokenIconUrl } from '../../../../client/api';
import { createAction } from '../../../../utils/dva';

const { width } = Dimensions.get('window');

class SelectToken extends Component {
    static navigationOptions = ({ navigation }) => {
        const searchstring = navigation.getParam('searchstring', '');
        return {
            headerTitle: (
                <View
                    style={{
                        flexDirection: 'row',
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <TextInput
                        style={{
                            fontSize: 16,
                            color: 'white',
                            width: '100%',
                            paddingLeft: 5,
                            paddingRight: 5,
                        }}
                        value={searchstring}
                        placeholder={strings('select_coin.placeholder_search_token')}
                        onChangeText={e => {
                            navigation.setParams({
                                isClearable: e.length > 0,
                                searchstring: e,
                            });

                            navigation.state.params.searchToken(e);
                        }}
                    />
                </View>
            ),
            headerRight:
                navigation.state.params && navigation.state.params.isClearable ? (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.setParams({
                                searchstring: '',
                                isClearable: false,
                            });
                            navigation.state.params.searchToken('');
                        }}
                    >
                        <Image style={{ width: 20, height: 20, marginRight: 20, tintColor: 'white' }} resizeMode="contain" source={require('../../../../assets/icon_clear.png')} />
                    </TouchableOpacity>
                ) : null,
        };
    };

    constructor(props) {
        super(props);
        this.isMount = false;
        this.state = {
            isLoading: true,
        };
        this.props.navigation.setParams({
            searchToken: this.searchToken,
            searchstring: '',
        });
    }

    async componentWillMount() {
        this.isMount = true;
        const { dispatch } = this.props;
        dispatch(createAction('tokenImportModel/getTopTokens')()).then(() => {
            this.isMount &&
                this.setState({
                    isLoading: false,
                });
        });
    }

    componentWillUnmount(): void {
        this.isMount = false;
    }

    addCustomToken = () => {
        this.props.navigation.navigate('signed_add_token');
    };

    addToken = item => {
        const token = {
            symbol: item.symbol,
            contractAddr: item.contractAddr,
            name: item.name,
            tokenDecimal: item.tokenDecimal,
        };
        const { dispatch, navigation } = this.props;
        dispatch(createAction('accountsModel/addTokenToCurrentAccount')({ token })).then(r => {
            if (r) {
                navigation.goBack();
            }
        });
    };

    searchToken = keyword => {
        this.refs.refLoading.show(null, { position: 'top' });
        const { dispatch } = this.props;
        const action = keyword.length ? createAction('tokenImportModel/searchTokens')({ keyword }) : createAction('tokenImportModel/getTopTokens')();
        dispatch(action).then(len => {
            if (this.isMount) {
                this.refs.refLoading.hide();
                if (len === 0) {
                    Keyboard.dismiss();
                }
            }
        });
    };

    renderItem = ({ item }) => {
        const cellHeight = 60;
        const { symbol, name, fastIcon, icon, isAdded } = item;
        return (
            <TouchableOpacity
                activeOpacity={1}
                disabled={isAdded}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#fff',
                    justifyContent: 'space-between',
                    height: cellHeight,
                }}
                onPress={() => this.addToken(item)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {fastIcon !== undefined ? (
                        <FastImage style={{ width: 30, height: 30 }} source={{ uri: fastIcon }} resizeMode={FastImage.resizeMode.contain} />
                    ) : icon !== undefined ? (
                        <Image style={{ width: 30, height: 30 }} source={icon} resizeMode="contain" />
                    ) : null}
                    <Text numberOfLines={1} style={{ paddingLeft: 10 }}>
                        {`${symbol}-${name}`}
                    </Text>
                </View>
                {isAdded ? <Text numberOfLines={1}>{strings('select_coin.label_is_added')}</Text> : null}
            </TouchableOpacity>
        );
    };

    // loading page
    renderLoadingView() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    }

    renderData() {
        return (
            <View
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    flex: 1,
                }}
            >
                <FlatList
                    style={{ width }}
                    data={this.props.token_lists}
                    renderItem={this.renderItem}
                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                    keyExtractor={item => item.contractAddr}
                />
            </View>
        );
    }

    renderEmptyView() {
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
                    <Text style={{ color: 'gray', marginBottom: 20 }}>{strings('select_coin.no_token_found')}</Text>
                    <Button title={strings('select_coin.btn_custom_token')} onPress={this.addCustomToken} />
                </View>
            </View>
        );
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.isLoading ? this.renderLoadingView() : this.props.token_lists.length !== 0 ? this.renderData() : this.renderEmptyView()}
                <Loading ref="refLoading" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    divider: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#dfdfdf',
    },
});

const mapToState = ({ tokenImportModel, accountsModel }) => {
    const { currentAccount: key, accountsMap } = accountsModel;
    const { tokens, symbol } = accountsMap[key];
    const { token_lists: tokenLists } = tokenImportModel;
    const newTokenLists = [...tokenLists];
    newTokenLists.forEach(token => {
        const { contractAddr, symbol: tokenSymbol } = token;
        try {
            token.fastIcon = getTokenIconUrl(symbol, tokenSymbol, contractAddr);
        } catch (e) {
            token.icon = COINS.ETH.default_token_icon;
        }
        token.isAdded = typeof tokens[tokenSymbol] !== 'undefined';
    });

    return {
        token_lists: newTokenLists,
    };
};

export default connect(mapToState)(SelectToken);
