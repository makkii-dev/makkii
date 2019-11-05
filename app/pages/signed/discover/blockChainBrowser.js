import React from 'react';
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import { mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { BROWSERS } from './constants';

const { width } = Dimensions.get('window');

const BlockChainBrowser = props => {
    const { navigation, browsers } = props;
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
                data={browsers}
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

const mapToState = ({ discoverModel }) => {
    const { enabledApps } = discoverModel;
    const { BlockchainExplorer } = enabledApps;
    return {
        browsers: BROWSERS.map(i => ({ ...i, uri: BlockchainExplorer[i.id] })),
    };
};

export default connect(mapToState)(BlockChainBrowser);
