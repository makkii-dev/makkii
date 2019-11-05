import React from 'react';
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { strings } from '../../../../locales/i18n';

const { width } = Dimensions.get('window');

const constants = [
    {
        id: 'ChainNews',
        title: 'news.origin_chainnews',
        image: { uri: 'https://res-2.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_120,w_120,f_auto,b_white,q_auto:eco/fyn6kwkfi2lsvf3l8a6f' },
        route: 'signed_news_chainnews',
    },
    {
        id: 'CoinVoice',
        title: 'news.origin_coinvoice',
        image: { uri: 'https://media.licdn.com/dms/image/C510BAQGcM2tkqAy-Og/company-logo_200_200/0?e=2159024400&v=beta&t=3gJKfy1nby32z76rzBAoLmv_ZiF5sJFm5IGVa7aY6-w' },
        route: 'signed_news_coinvoice',
    },
];

const home = props => {
    const { navigation, News } = props;
    const handle_uri = uri => {
        navigation.navigate(uri);
    };
    return (
        <View style={{ flex: 1, backgroundColor: mainBgColor }}>
            <FlatList
                style={{
                    marginTop: 20,
                    width,
                }}
                data={constants.filter(i => News.includes(i.id))}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handle_uri(item.route)}
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
