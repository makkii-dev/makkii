// btc ltc only
import React from 'react';
import { NativeModules, Image, Keyboard, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { mainBgColor } from '../../../style_util';
import { strings } from '../../../../locales/i18n';
import defaultStyles from '../../../styles';
import { alertOk, InputMultiLines, RightActionButton } from '../../../components/common';
import { createAction, navigate } from '../../../../utils/dva';
import { AppToast } from '../../../components/AppToast';
import { validateAddress } from '../../../../client/keystore';

const BaiduMobStat = NativeModules.BaiduMobStat;
const { width, height } = Dimensions.get('window');

const viewOnlyAddressImport = props => {
    const { navigation } = props;
    const [address, setAddress] = React.useState('');
    const symbol = useSelector(({ accountImportModel }) => accountImportModel.symbol);
    const dispatch = useDispatch();

    const scan = () => {
        navigation.navigate('scan', {
            validate: (data, callback) => {
                const res = validateAddress(symbol, data.data);
                if (res) {
                    setAddress(data.data);
                    navigation.setParams({
                        isEdited: true,
                        address: data.data,
                    });
                }
                callback(res ? data.data : null, res ? '' : strings('import_view_only_address.error_invalid_address'));
            },
        });
    };

    const ImportAccount = value => {
        dispatch(createAction('accountImportModel/fromViewOnlyAddress')({ address: value })).then(r => {
            if (r === 2) {
                // already imported
                AppToast.show(strings('import_private_key.already_existed'), { position: 0 });
            } else if (r === 3) {
                // invalid  private key
                alertOk(strings('alert_title_error'), strings('import_view_only_address.error_invalid_address'));
            } else {
                BaiduMobStat.onEventWithAttributes('import_view_only_address', '导入只读地址', { coin: symbol });
                navigate('signed_vault_set_account_name')({ dispatch });
            }
        });
    };

    React.useEffect(() => {
        if (navigation.getParam('ImportAccount') === undefined) {
            navigation.setParams({
                ImportAccount,
                isEdited: false,
            });
        }
    }, [navigation]);

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
                Keyboard.dismiss();
            }}
            style={{
                flex: 1,
                width,
                height,
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    flex: 1,
                    padding: 40,
                    backgroundColor: mainBgColor,
                }}
            >
                <View
                    style={{
                        height: 20,
                        width: width - 80,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                        }}
                    >
                        {strings('import_view_only_address.lable_input')}
                    </Text>
                    <TouchableOpacity onPress={scan}>
                        <Image
                            source={require('../../../../assets/icon_scan.png')}
                            style={{
                                tintColor: 'black',
                                width: 20,
                                height: 20,
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        ...defaultStyles.shadow,
                        padding: 10,
                        borderRadius: 5,
                        backgroundColor: 'white',
                        width: width - 80,
                        marginBottom: 40,
                    }}
                >
                    <InputMultiLines
                        editable
                        numberOfLines={10}
                        style={{
                            borderWidth: 0,
                            fontSize: 18,
                            fontWeight: 'normal',
                            height: 250,
                            textAlignVertical: 'top',
                        }}
                        value={address}
                        onChangeText={val => {
                            setAddress(val);
                            navigation.setParams({
                                isEdited: val.length !== 0,
                                address: val,
                            });
                        }}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

viewOnlyAddressImport.navigationOptions = ({ navigation }) => {
    return {
        title: strings('import_view_only_address.title'),
        headerRight: (
            <RightActionButton
                onPress={() => {
                    navigation.state.params.ImportAccount(navigation.state.params.address);
                }}
                disabled={!navigation.state.params || !navigation.state.params.isEdited}
                btnTitle={strings('import_button')}
            />
        ),
    };
};

export default viewOnlyAddressImport;
