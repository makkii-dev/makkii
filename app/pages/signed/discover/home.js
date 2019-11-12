import React from 'react';
import { View, FlatList, PixelRatio, Dimensions, Image, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import { CustomHeader } from '../../../components/CustomHeader';
import { strings } from '../../../../locales/i18n';
import { APPS } from './constants';
import defaultStyles from '../../../styles';
import { mainBgColor, mainColor } from '../../../style_util';
import { createAction } from '../../../../utils/dva';
import { renderNoNetWork } from '../../../components/common';

const { width } = Dimensions.get('window');

const mapToState = ({ discoverModel, settingsModel }) => {
    const { lang } = settingsModel;
    return {
        apps: discoverModel.enabledApps,
        lang: lang === 'auto' ? DeviceInfo.getDeviceLocale() : lang,
    };
};

const process_data = (data, apps, lang) => {
    const apps_ = Object.keys(apps).reduce((maps, k) => {
        if (k === 'News') {
            const news = lang.indexOf('en') >= 0 ? apps[k].en : apps[k].zh;
            if (news.filter(i => i.enabled).length > 0) {
                maps[k] = apps[k];
            }
        } else {
            maps[k] = apps[k];
        }
        if (k === 'AionStaking') {
            data[0].entry.uri = apps[k].url; // update Aion Staking's url
        }
        return maps;
    }, {});
    return data.filter(i => Object.keys(apps_).indexOf(i.id) >= 0);
};

const DiscoverHome = props => {
    const { apps, lang, navigation, dispatch } = props;
    const [isLoading, setIsLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const handle_entry = entry => {
        if (entry.type === 'dapp') {
            navigation.navigate('signed_dapp_launcher', { uri: entry.uri, dappName: entry.dappName });
        } else if (entry.type === 'route') {
            navigation.navigate(entry.uri);
        }
    };
    const onRefresh = () => {
        setRefreshing(true);
        dispatch(createAction('discoverModel/getApps')()).then(() => {
            setRefreshing(false);
        });
    };

    React.useEffect(() => {
        dispatch(createAction('discoverModel/getApps')()).then(() => {
            setIsLoading(false);
        });
    }, []);
    const data = process_data(APPS, apps, lang);
    return (
        <View style={{ flex: 1, backgroundColor: mainBgColor }}>
            <CustomHeader title={strings('menuRef.title_discover')} />
            {isLoading ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: mainBgColor,
                    }}
                >
                    <ActivityIndicator animating color="red" size="large" />
                </View>
            ) : data.length === 0 ? (
                renderNoNetWork(() => {
                    setIsLoading(true);

                    dispatch(createAction('discoverModel/getApps')()).then(() => {
                        setIsLoading(false);
                    });
                })
            ) : (
                <ScrollView style={{ width }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
                            data={data}
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
                </ScrollView>
            )}
        </View>
    );
};

export default connect(mapToState)(DiscoverHome);
