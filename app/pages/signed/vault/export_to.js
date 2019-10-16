import React from 'react';
import { FlatList, View, Dimensions, TouchableOpacity, Image, Text, StyleSheet, PixelRatio } from 'react-native';
import { connect, useDispatch } from 'react-redux';
import { mainBgColor } from '../../../style_util';
import Loading from '../../../components/Loading';
import { strings } from '../../../../locales/i18n';
import { EXPORT_WAY } from './constants';
import { createAction } from '../../../../utils/dva';
import { accountKey } from '../../../../utils';
import { getAccountFromPrivateKey } from '../../../../services/account_import.service';

const { width } = Dimensions.get('window');

const ExportTo = props => {
    const { currentAccount, navigation } = props;
    const dispatch = useDispatch();
    const accKey = accountKey(currentAccount.symbol, currentAccount.address);
    const refLoading = React.useRef();
    const exportToPrivateKey = () => {
        refLoading.current.show();
        dispatch(createAction('accountsModel/getPrivateKey')({ key: accKey })).then(pk => {
            refLoading.current.hide();
            navigation.navigate('signed_vault_export_private_key', { qrWord: pk });
        });
    };
    const exportToWIF = () => {
        refLoading.current.show();
        dispatch(createAction('accountsModel/getPrivateKey')({ key: accKey })).then(pk => {
            getAccountFromPrivateKey(currentAccount.symbol, pk, { compressed: currentAccount.compressed }).then(keyPair => {
                refLoading.current.hide();
                const wif = keyPair.toWIF();
                navigation.navigate('signed_vault_export_private_key', { qrWord: wif });
            });
        });
    };
    const exportToBIP38 = () => {
        navigation.navigate('signed_vault_bip38_export');
    };

    const data = [...EXPORT_WAY];
    data[0].callback = exportToPrivateKey;
    data[1].callback = exportToBIP38;
    data[2].callback = exportToWIF;

    return (
        <View
            style={{
                backgroundColor: mainBgColor,
                alignItems: 'center',
                flex: 1,
                paddingTop: 20,
            }}
        >
            <FlatList
                style={{ width }}
                data={data}
                renderItem={({ item }) => {
                    const cellHeight = 60;
                    return (
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                backgroundColor: '#fff',
                                justifyContent: 'space-between',
                                height: cellHeight,
                            }}
                            onPress={() => {
                                item.callback();
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    source={item.icon}
                                    style={{
                                        width: 30,
                                        height: 30,
                                    }}
                                    resizeMode="contain"
                                />
                                <Text numberOfLines={1} style={{ paddingLeft: 10 }}>
                                    {strings(item.title)}
                                </Text>
                            </View>
                            <Image style={{ width: 24, height: 24 }} source={require('../../../../assets/arrow_right.png')} resizeMode="contain" />
                        </TouchableOpacity>
                    );
                }}
                ItemSeparatorComponent={() => <View style={styles.divider} />}
                keyExtractor={item => item.title}
            />
            <Loading ref={refLoading} />
        </View>
    );
};
ExportTo.navigationOptions = () => {
    return {
        title: strings('vault_export_way.title'),
    };
};
const styles = StyleSheet.create({
    divider: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#dfdfdf',
    },
});

const mapToState = ({ accountsModel }) => {
    const { currentAccount: key, currentToken, accountsMap } = accountsModel;
    const currentAccount = {
        ...accountsMap[key],
        coinSymbol: currentToken === '' ? accountsMap[key].symbol : currentToken,
    };
    return {
        currentAccount,
    };
};

export default connect(mapToState)(ExportTo);
