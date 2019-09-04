import React, { Component } from 'react';
import { Dimensions, Keyboard, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { PasswordInputWithTitle, ComponentButton, alertOk } from '../../components/common';
import { strings } from '../../../locales/i18n';
import defaultStyles from '../../styles';
import { mainBgColor } from '../../style_util';
import { createAction, popCustom } from '../../../utils/dva';
import { sendRecoveryEventLog } from '../../../services/event_log.service';
import { validatePassword } from '../../../utils';

const { width } = Dimensions.get('window');

class Password extends Component {
    static navigationOptions = () => {
        return {
            title: strings('recovery_password.title'),
        };
    };

    constructor(props) {
        super(props);
        this.mnemonic = this.props.navigation.getParam('mnemonic', '');
        this.state = {
            password: '',
            password_confirm: '',
        };
    }

    recovery = () => {
        const { dispatch } = this.props;
        const { password, password_confirm: passwordConfirm } = this.state;
        dispatch(
            createAction('userModel/recovery')({
                password_confirm: passwordConfirm,
                password,
                mnemonic: this.mnemonic,
            }),
        ).then(r => {
            if (r.result) {
                sendRecoveryEventLog();
                dispatch(createAction('userModel/login')());
            } else {
                alertOk(strings('alert_title_error'), r.error);
            }
        });
    };

    beforeRecovery = () => {
        const { dispatch, hashed_password: hashedPassword } = this.props;
        const { password, password_confirm: passwordConfirm } = this.state;
        if (!validatePassword(password)) {
            alertOk(strings('alert_title_error'), strings('register.error_password'));
        } else if (password !== passwordConfirm) {
            alertOk(strings('alert_title_error'), strings('register.error_dont_match'));
        } else if (hashedPassword !== '') {
            popCustom.show(strings('alert_title_warning'), strings('recovery.warning_mnemonic'), [
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
                        ]).then(this.recovery);
                    },
                },
            ]);
        } else {
            this.recovery();
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
                    padding: 40,
                    backgroundColor: mainBgColor,
                }}
                accessibilityLabel={this.props.navigation.state.routeName}
            >
                <View
                    style={{
                        ...defaultStyles.shadow,
                        marginBottom: 40,
                        width: width - 80,
                        height: 220,
                        borderRadius: 10,
                        backgroundColor: 'white',
                        padding: 20,
                    }}
                >
                    <PasswordInputWithTitle
                        title={strings('recovery_password.label_password')}
                        placeholder={strings('recovery_password.hint_enter_password')}
                        value={password}
                        onChange={e => {
                            this.setState({
                                password: e,
                            });
                        }}
                    />
                    <View style={{ marginBottom: 20 }} />
                    <PasswordInputWithTitle
                        title={strings('recovery_password.label_confirm_password')}
                        placeholder={strings('recovery_password.hint_enter_confirm_password')}
                        value={passwordConfirm}
                        onChange={e => {
                            this.setState({
                                password_confirm: e,
                            });
                        }}
                    />
                </View>
                <ComponentButton disabled={passwordConfirm.length === 0 || password.length === 0} title={strings('recovery_password.button_reset')} onPress={this.beforeRecovery} />
            </TouchableOpacity>
        );
    }
}

const mapToState = ({ userModel }) => ({
    hashed_password: userModel.hashed_password,
});
export default connect(mapToState)(Password);
