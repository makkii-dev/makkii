import * as React from 'react';
import { View, Dimensions, FlatList, ActivityIndicator, Image, Text, TouchableOpacity, TextInput } from 'react-native';
import { connect } from 'react-redux';
import { getTokenIconUrl } from '../../../../client/api';
import { COINS } from '../../../../client/support_coin_list';
import { createAction, navigateBack } from '../../../../utils/dva';
import { strings } from '../../../../locales/i18n';

const { width } = Dimensions.get('window');

class ExchangeTokenList extends React.PureComponent {
    static navigationOptions = ({ navigation }) => {
        const keyword = navigation.getParam('keyword', '');
        const isClearable = navigation.getParam('isClearable', false);
        const search = navigation.getParam('search', () => {});
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
                        value={keyword}
                        placeholder={strings('select_coin.placeholder_search_token')}
                        onChangeText={e => {
                            navigation.setParams({
                                isClearable: e.length > 0,
                                keyword: e,
                            });
                            search(e);
                        }}
                    />
                </View>
            ),
            headerRight: isClearable ? (
                <TouchableOpacity
                    onPress={() => {
                        navigation.setParams({
                            keyword: '',
                            isClearable: false,
                        });
                        search(e);
                    }}
                >
                    <Image style={{ width: 20, height: 20, marginRight: 20, tintColor: 'white' }} resizeMode="contain" source={require('../../../../assets/icon_clear.png')} />
                </TouchableOpacity>
            ) : null,
        };
    };

    constructor(props) {
        super(props);
        this.props.navigation.setParams({
            search: this.setKeyword,
        });
    }

    state = {
        keyword: '',
    };

    setKeyword = keyword => {
        this.setState({ keyword });
    };

    renderLoading = () => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator animating color="red" size="large" />
        </View>
    );

    onSelectToken = token => {
        const { srcToken, destToken } = this.props.trade;
        const flow = this.props.navigation.getParam('flow');
        const srcQty = this.props.navigation.getParam('srcQty');
        const payload =
            flow === 'src'
                ? {
                      srcToken: token,
                      destToken: token === destToken ? srcToken : destToken,
                      srcQty,
                  }
                : {
                      srcToken: token === srcToken ? destToken : srcToken,
                      destToken: token,
                      srcQty,
                  };
        this.props.dispatch(createAction('ERC20Dex/updateTrade')(payload));
        navigateBack(this.props);
    };

    renderItem = ({ item }) => {
        const { symbol, name, icon } = item;
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#fff',
                    justifyContent: 'flex-start',
                    height: 60,
                    width: '100%',
                }}
                onPress={() => this.onSelectToken(symbol)}
            >
                <Image style={{ width: 30, height: 30 }} source={icon} resizeMode="contain" />
                <Text numberOfLines={1} style={{ paddingLeft: 10 }}>
                    {`${symbol}-${name}`}
                </Text>
            </TouchableOpacity>
        );
    };

    renderList = data => {
        const { keyword } = this.state;
        if (keyword.trim() !== '') {
            data = data.filter(el => el.symbol.toLowerCase().indexOf(keyword.trim().toLowerCase()) >= 0);
        }
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <FlatList style={{ width }} data={data} keyExtractor={(item, index) => `${index}`} renderItem={this.renderItem} />
            </View>
        );
    };

    render() {
        const { isLoading, tokenList } = this.props;
        return isLoading ? this.renderLoading() : this.renderList(tokenList);
    }
}

const mapToState = ({ ERC20Dex }) => {
    const { srcToken, destToken } = ERC20Dex.trade;
    const tokenList = Object.keys(ERC20Dex.tokenList)
        .filter(el => el !== srcToken && el !== destToken)
        .map(el => {
            if (el === 'ETH') {
                return {
                    symbol: el,
                    name: ERC20Dex.tokenList[el].name,
                    icon: COINS.ETH.icon,
                };
            }
            try {
                const fastIcon = getTokenIconUrl('ETH', el, ERC20Dex.tokenList[el].address);
                return {
                    symbol: el,
                    name: ERC20Dex.tokenList[el].name,
                    icon: { uri: fastIcon },
                };
            } catch (e) {
                return {
                    symbol: el,
                    name: ERC20Dex.tokenList[el].name,
                    icon: COINS.ETH.default_token_icon,
                };
            }
        });

    return {
        isLoading: ERC20Dex.isLoading,
        trade: ERC20Dex.trade,
        tokenList,
    };
};

export default connect(mapToState)(ExchangeTokenList);
