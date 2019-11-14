import React from 'react';
import { Keyboard, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { connect, useDispatch } from 'react-redux';
import { mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { strings } from '../../../../locales/i18n';
import { ComponentButton, PasswordInputWithTitle } from '../../../components/common';
import Loading from '../../../components/Loading';
import { createAction } from '../../../../utils/dva';
import { accountKey } from '../../../../utils';
import BIP38 from '../../../../utils/bip38';
import { AppToast } from '../../../components/AppToast';

const { width } = Dimensions.get('window');

const bip38Export = props => {
    const { currentAccount, navigation } = props;
    const dispatch = useDispatch();
    const refLoading = React.useRef();
    const [state, setState] = React.useState({ password: '', password_confirm: '' });
    const accKey = accountKey(currentAccount.symbol, currentAccount.address);
    const nextStep = () => {
        if (state.password !== state.password_confirm) {
            AppToast.show(strings('register.error_dont_match'));
            return;
        }
        refLoading.current.show();
        dispatch(createAction('accountsModel/getPrivateKey')({ key: accKey })).then(pk => {
            BIP38.encryptAsync(Buffer.from(pk, 'hex'), currentAccount.compressed === undefined ? true : currentAccount.compressed, state.password).then(bip38 => {
                refLoading.current.hide();
                navigation.navigate('signed_vault_export_private_key', { qrWord: bip38 });
            });
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
            }}
        >
            <Text style={{ ...defaultStyles.instruction, marginTop: 20, marginBottom: 20 }}>{strings('vault_bip38.desc_password')}</Text>
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
                <PasswordInputWithTitle
                    title={strings('vault_bip38.label_password')}
                    placeholder={strings('vault_bip38.hint_enter_password')}
                    value={state.password}
                    onChange={e => {
                        setState({
                            ...state,
                            password: e,
                        });
                    }}
                />
                <View style={{ marginBottom: 20 }} />
                <PasswordInputWithTitle
                    title={strings('vault_bip38.label_confirm_password')}
                    placeholder={strings('vault_bip38.hint_enter_confirm_password')}
                    value={state.password_confirm}
                    onChange={e => {
                        setState({
                            ...state,
                            password_confirm: e,
                        });
                    }}
                />
            </View>
            <ComponentButton style={{ width: width - 40 }} disabled={state.password === '' || state.password_confirm === ''} onPress={() => nextStep()} title={strings('vault_bip38.button_next')} />
            <Loading ref={refLoading} />
        </TouchableOpacity>
    );
};

bip38Export.navigationOptions = () => {
    return {
        title: strings('vault_bip38.title_export'),
    };
};

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
export default connect(mapToState)(bip38Export);
