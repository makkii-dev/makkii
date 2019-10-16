import React from 'react';
import { Keyboard, TouchableOpacity, View, Dimensions, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { alertOk, ComponentButton, PasswordInputWithTitle, TextInputWithTitle } from '../../../components/common';
import { strings } from '../../../../locales/i18n';
import { mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { createAction, navigate } from '../../../../utils/dva';
import { AppToast } from '../../../components/AppToast';
import Loading from '../../../components/Loading';

const { width } = Dimensions.get('window');
const bip38Import = props => {
    const [state, setState] = React.useState({ password: '', bip38: '' });
    const dispatch = useDispatch();
    const { navigation } = props;
    let refLoading = React.useRef();
    const nextStep = () => {
        refLoading.current.show();
        dispatch(createAction('accountImportModel/fromBip38')(state)).then(r => {
            refLoading.current.hide();
            if (r === 2) {
                // already imported
                AppToast.show(strings('import_private_key.already_existed'), { position: 0 });
            } else if (r === 3) {
                // invalid  private key
                alertOk(strings('alert_title_error'), strings('vault_bip38.error_invalid'));
            } else {
                navigate('signed_vault_set_account_name')({ dispatch });
            }
        });
        console.log('unstuck');
    };
    const scan = () => {
        navigation.navigate('scan', {
            validate: (data, callback) => {
                const res = /[A-Za-z0-9]{58}/.test(data.data);
                if (res) {
                    setState({
                        ...state,
                        bip38: data.data,
                    });
                }
                callback(res ? data.data : null, res ? '' : strings('import_private_key.error_invalid_private_key'));
            },
        });
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
                Keyboard.dismiss();
            }}
            style={{
                backgroundColor: mainBgColor,
                flex: 1,
                paddingHorizontal: 20,
                paddingTop: 40,
            }}
        >
            <View
                style={{
                    ...defaultStyles.shadow,
                    width: width - 40,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    padding: 20,
                    marginBottom: 20,
                }}
            >
                <TextInputWithTitle
                    height={100}
                    title={strings('vault_bip38.label_bip38')}
                    value={state.bip38}
                    placeholder={strings('vault_bip38.hint_enter_bip38')}
                    onChange={e => {
                        setState({ ...state, bip38: e });
                    }}
                    rightView={() => (
                        <TouchableOpacity onPress={() => scan()}>
                            <Image source={require('../../../../assets/icon_scan.png')} style={{ width: 20, height: 20, tintColor: '#000' }} resizeMode="contain" />
                        </TouchableOpacity>
                    )}
                />
                <View style={{ marginBottom: 20 }} />
                <PasswordInputWithTitle
                    title={strings('vault_bip38.label_password')}
                    placeholder={strings('vault_bip38.hint_enter_password')}
                    value={state.password}
                    onChange={e => {
                        setState({ ...state, password: e });
                    }}
                />
            </View>
            <ComponentButton style={{ width: width - 40 }} disabled={state.password === '' || state.bip38 === ''} onPress={() => nextStep()} title={strings('vault_bip38.button_next')} />
            <Loading ref={refLoading} />
        </TouchableOpacity>
    );
};
bip38Import.navigationOptions = () => {
    return {
        title: strings('vault_import_source.from_bip38'),
    };
};
export default bip38Import;
