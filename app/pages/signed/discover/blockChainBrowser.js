import React from 'react';
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { strings } from '../../../../locales/i18n';
import { mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { BROWSERS } from './constants';
import { COINS } from '../../../../client/support_coin_list';

const { width } = Dimensions.get('window');

const BlockChainBrowser = props => {
    const { navigation } = props;
    const handle_uri = (uri, title) => {
        navigation.navigate('simple_webview', {
            initialUrl: { uri },
            title: strings(title),
        });
    };
    return (
        <View style={{ flex: 1, backgroundColor: mainBgColor }}>
            <FlatList
                style={{
                    marginTop: 20,
                    width,
                }}
                data={BROWSERS.filter(i => Object.keys(COINS).includes(i.id))}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handle_uri(item.uri, item.title)}
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

BlockChainBrowser.navigationOptions = () => ({
    title: strings('discoverApp.blockChain_browser'),
});

export default BlockChainBrowser;
