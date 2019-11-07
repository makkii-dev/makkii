import React from 'react';
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { strings } from '../../../../locales/i18n';

const { width } = Dimensions.get('window');

const constants = {
    ChainNews: {
        id: 'ChainNews',
        title: 'news.origin_chainnews',
        image: { uri: 'https://res-2.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_120,w_120,f_auto,b_white,q_auto:eco/fyn6kwkfi2lsvf3l8a6f' },
        route: 'signed_news_chainnews',
    },
    CoinVoice: {
        id: 'CoinVoice',
        title: 'news.origin_CoinVoice',
        image: { uri: 'https://media.licdn.com/dms/image/C510BAQGcM2tkqAy-Og/company-logo_200_200/0?e=2159024400&v=beta&t=3gJKfy1nby32z76rzBAoLmv_ZiF5sJFm5IGVa7aY6-w' },
        route: 'signed_news_common_channel',
        routeParams: {
            title: 'news.origin_CoinVoice',
            origin: 'CoinVoice',
        },
    },
    UTB: {
        id: 'UTB',
        title: 'news.origin_UTB',
        image: { uri: 'https://www.xinfin.org/assets/images/Resources/Use-the-bitcoin.jpg' },
        route: 'signed_news_common_channel',
        routeParams: {
            title: 'news.origin_UTB',
            origin: 'UTB',
        },
    },
    Cointelegraph: {
        id: 'Cointelegraph',
        title: 'news.origin_Cointelegraph',
        image: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRphrtBWv41__swduXUgcHQ3DUCx7txgZBpIg0xtZ5Yd8eWwhpE&s' },
        route: 'signed_news_common_channel',
        routeParams: {
            title: 'news.origin_Cointelegraph',
            origin: 'Cointelegraph',
        },
    },
    'Bitcoin.com': {
        id: 'Bitcoin.com',
        title: 'news.origin_Bitcoin_com',
        image: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDCXg5cdByvEVO0ZjSn75y5_LDuLdZIhC2WXWmQptfxwgdp54I&s' },
        route: 'signed_news_common_channel',
        routeParams: {
            title: 'news.origin_Bitcoin_com',
            origin: 'Bitcoin.com',
        },
    },
};

const home = props => {
    const { navigation, News } = props;
    const handle_uri = (uri, params = {}) => {
        navigation.navigate(uri, { ...params });
    };
    const constants_ = News.reduce((arr, el) => {
        if (el.enabled) {
            arr.push(constants[el.name]);
        }
        return arr;
    }, []);
    return (
        <View style={{ flex: 1, backgroundColor: mainBgColor }}>
            <FlatList
                style={{
                    marginTop: 20,
                    width,
                }}
                data={constants_}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handle_uri(item.route, item.routeParams)}
                        style={{
                            ...defaultStyles.shadow,
                            borderRadius: 5,
                            backgroundColor: 'white',
                            flexDirection: 'row',
                            marginHorizontal: 20,
                            marginVertical: 10,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: 20,
                        }}
                    >
                        <Image
                            source={item.image}
                            style={{
                                width: 30,
                                height: 30,
                                position: 'absolute',
                                left: 20,
                            }}
                            resizeMode="contain"
                        />
                        <Text style={{ fontSize: 15, color: 'black', fontWeight: 'normal', paddingLeft: 60 }}>{strings(item.title)}</Text>
                        <Image style={{ position: 'absolute', right: 10, width: 24, height: 24 }} source={require('../../../../assets/arrow_right.png')} />
                    </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    );
};

home.navigationOptions = () => {
    return {
        title: strings('news.title'),
    };
};
const mapToState = ({ discoverModel, settingsModel }) => {
    const { lang } = settingsModel;
    const lang_ = lang === 'auto' ? DeviceInfo.getDeviceLocale() : lang;

    return {
        News: lang_.indexOf('en') >= 0 ? discoverModel.enabledApps.News.en : discoverModel.enabledApps.News.zh,
    };
};

export default connect(mapToState)(home);
