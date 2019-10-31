import React from 'react';
import { View, FlatList, PixelRatio, Dimensions, Image, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { CustomHeader } from '../../../components/CustomHeader';
import { strings } from '../../../../locales/i18n';
import { APPS } from './constants';
import defaultStyles from '../../../styles';
import { mainBgColor, mainColor } from '../../../style_util';

const { width } = Dimensions.get('window');

const mapToState = ({ discoverModel }) => {
    return {
        apps: discoverModel.enabledApps,
    };
};

const DiscoverHome = props => {
    const { apps, navigation } = props;
    const handle_entry = entry => {
        if (entry.type === 'dapp') {
            navigation.navigate('signed_dapp_launcher', { uri: entry.uri, dappName: entry.dappName });
        } else if (entry.type === 'route') {
            navigation.navigate(entry.uri);
        }
    };
    return (
        <View style={{ flex: 1, backgroundColor: mainBgColor }}>
            <CustomHeader title={strings('menuRef.title_discover')} />
            <View style={{ margin: 20, marginBottom: 10, flexDirection: 'row' }}>
                <Image source={require('../../../../assets/separate.png')} style={{ height: 25, width: 3, tintColor: mainColor, marginRight: 10 }} />
                <Text style={{ fontSize: 18 }}>{strings('discoverApp.label_popular')}</Text>
            </View>
            <View
                style={{
                    ...defaultStyles.shadow,
                    marginHorizontal: 20,
                    width: width - 40,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    paddingLeft: 10,
                    paddingRight: 10,
                }}
            >
                <FlatList
                    data={APPS.filter(i => apps.includes(i.id))}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handle_entry(item.entry)}>
                            <View style={{ backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
                                <Image
                                    source={item.image}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        position: 'absolute',
                                        left: 5,
                                    }}
                                    resizeMode="contain"
                                />
                                <Text style={{ fontSize: 15, color: 'black', fontWeight: 'normal', paddingLeft: 50 }}>{strings(item.title)}</Text>
                                <Image style={{ position: 'absolute', right: 0, width: 24, height: 24 }} source={require('../../../../assets/arrow_right.png')} />
                            </View>
                        </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => (
                        <View
                            style={{
                                height: 1 / PixelRatio.get(),
                                backgroundColor: 'lightgray',
                            }}
                        />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </View>
    );
};

export default connect(mapToState)(DiscoverHome);
