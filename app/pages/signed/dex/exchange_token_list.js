import * as React from 'react';
import { View, Dimensions, FlatList, ActivityIndicator, Image, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import FastImage from 'react-native-fast-image';
import { getTokenIconUrl } from '../../../../client/api';
import { COINS } from '../../../../client/support_coin_list';
import { createAction, navigateBack } from '../../../../utils/dva';

const { width } = Dimensions.get('window');

class ExchangeTokenList extends React.PureComponent {
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
        const { symbol, name, fastIcon, icon } = item;
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
                {fastIcon !== undefined ? (
                    <FastImage style={{ width: 30, height: 30 }} source={{ uri: fastIcon }} resizeMode={FastImage.resizeMode.contain} />
                ) : icon !== undefined ? (
                    <Image style={{ width: 30, height: 30 }} source={icon} resizeMode="contain" />
                ) : null}
                <Text numberOfLines={1} style={{ paddingLeft: 10 }}>
                    {`${symbol}-${name}`}
                </Text>
            </TouchableOpacity>
        );
    };

    renderList = data => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <FlatList style={{ width }} data={data} keyExtractor={(item, index) => `${index}`} renderItem={this.renderItem} />
        </View>
    );

    render() {
        const { isLoading, tokenList } = this.props;
        return isLoading ? this.renderLoading() : this.renderList(tokenList);
    }
}

const mapToState = ({ ERC20Dex }) => {
    const tokenList = Object.keys(ERC20Dex.tokenList).map(el => {
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
                fastIcon,
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
