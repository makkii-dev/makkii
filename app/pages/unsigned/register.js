import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, TouchableOpacity, Keyboard, Dimensions } from 'react-native';
import { ComponentButton, PasswordInput, alertOk } from '../../components/common';
import { strings } from '../../../locales/i18n';
import { mainColor, mainBgColor } from '../../style_util';
import defaultStyles from '../../styles';
import { createAction, popCustom } from '../../../utils/dva';
import { sendRegisterEventLog } from '../../../services/event_log.service';
import { validatePassword } from '../../../utils';

const { width, height } = Dimensions.get('window');

class Home extends Component {
    static navigationOptions = () => {
        return {
            title: strings('register.title'),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            password_confirm: '',
            // alert once if there is data loaded from db when user wanna register new account
            // user will lose data if register new one
        };
    }

    register = () => {
        const { dispatch, navigation } = this.props;
        const { password, password_confirm: passwordConfirm } = this.state;
        dispatch(createAction('userModel/register')({ password_confirm: passwordConfirm, password })).then(r => {
            if (r.result) {
                sendRegisterEventLog();
                navigation.navigate('unsigned_register_mnemonic', { mnemonic: r.data });
            } else {
                alertOk(strings('alert_title_error'), r.error);
            }
        });
    };

    beforeRegister = () => {
        const { dispatch, hashed_password: hashedPassword } = this.props;
        const { password, password_confirm: passwordConfirm } = this.state;

        if (!validatePassword(password)) {
            alertOk(strings('alert_title_error'), strings('register.error_password'));
        } else if (password !== passwordConfirm) {
            alertOk(strings('alert_title_error'), strings('register.error_dont_match'));
        } else if (hashedPassword !== '') {
            popCustom.show(strings('alert_title_warning'), strings('register.warning_register_again'), [
                { text: strings('cancel_button'), onPress: () => {} },
                {
                    text: strings('alert_ok_button'),
                    onPress: () => {
                        Promise.all([
                            dispatch(createAction('userModel/reset')()),
                            dispatch(createAction('accountsModel/reset')()),
                            dispatch(createAction('settingsModel/reset')()),
                            dispatch(createAction('ERC20Dex/reset')()),
                            dispatch(createAction('txSenderModel/reset')()),
                        ]).then(() => this.register());
                    },
                },
            ]);
        } else {
            this.register();
        }
    };

    render() {
        const { password, password_confirm: passwordConfirm } = this.state;
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
                    backgroundColor: mainBgColor,
                }}
            >
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        width,
                        height: 200,
                        backgroundColor: mainColor,
                    }}
                />
                <View
                    style={{
                        ...defaultStyles.shadow,
                        marginTop: 60,
                        width: width - 80,
                        height: 300,
                        borderRadius: 10,
                        backgroundColor: 'white',
                        paddingLeft: 20,
                        paddingRight: 20,
                        paddingTop: 40,
                    }}
                >
                    <PasswordInput
                        value={password}
                        placeholder={strings('register.hint_enter_password')}
                        onChange={e => {
                            this.setState({
                                password: e,
                            });
                        }}
                    />
                    <View style={{ marginTop: 30 }} />
                    <PasswordInput
                        value={passwordConfirm}
                        placeholder={strings('register.hint_enter_confirm_password')}
                        onChange={e => {
                            this.setState({
                                password_confirm: e,
                            });
                        }}
                    />
                    <View style={{ marginTop: 40 }} />
                    <ComponentButton disabled={passwordConfirm.length === 0 || password.length === 0} title={strings('register.button_register')} onPress={this.beforeRegister} />
                </View>
            </TouchableOpacity>
        );
    }
}

const mapToState = ({ userModel }) => ({
    hashed_password: userModel.hashed_password,
});
export default connect(mapToState)(Home);
