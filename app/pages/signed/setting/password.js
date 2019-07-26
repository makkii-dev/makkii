import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dimensions, View, Text, Keyboard, TouchableOpacity } from 'react-native';
import { AppToast } from '../../../components/AppToast';
import { PasswordInputWithTitle, RightActionButton, alertOk } from '../../../components/common';
import defaultStyles from '../../../styles';
import { mainBgColor } from '../../../style_util';
import { validatePassword, hashPassword } from '../../../../utils';
import { strings } from '../../../../locales/i18n';
import { createAction } from '../../../../utils/dva';

const { width } = Dimensions.get('window');

class Password extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('password.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <RightActionButton
                    onPress={() => {
                        navigation.state.params.updatePassword();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            password_current: '',
            password_new: '',
            password_confirm: '',
        };
    }

    componentWillMount() {
        this.props.navigation.setParams({
            updatePassword: this.updatePassword,
            isEdited: false,
        });
    }

    componentDidMount() {
        console.log(`[route] ${this.props.navigation.state.routeName}`);
    }

    updateEditStatus = (currentp, newp, confirmp) => {
        const allFilled = currentp.length !== 0 && newp.length !== 0 && confirmp.length !== 0;
        this.props.navigation.setParams({
            isEdited: allFilled,
        });
    };

    updatePassword = () => {
        // validate old password correctness
        const hashedPassword = hashPassword(this.state.password_current);
        if (hashedPassword !== this.props.hashed_password) {
            alertOk(strings('alert_title_error'), strings('invalid_old_password'));
            return;
        }

        // validate new password format
        if (!validatePassword(this.state.password_new)) {
            alertOk(strings('alert_title_error'), strings('invalid_new_password'));
            return;
        }

        if (hashedPassword === hashPassword(this.state.password_new)) {
            alertOk(strings('alert_title_error'), strings('same_old_new_passwords'));
            return;
        }

        // validate new password and confirmed password consistency
        if (this.state.password_new !== this.state.password_confirm) {
            alertOk(strings('alert_title_error'), strings('inconsistent_passwords'));
            return;
        }

        // update password
        const { dispatch } = this.props;
        const newHashedPassword = hashPassword(this.state.password_new);
        dispatch(
            createAction('userModel/updatePassword')({ hashed_password: newHashedPassword }),
        ).then(() => {
            AppToast.show(strings('toast_update_success'), {
                position: AppToast.positions.CENTER,
                onHidden: () => {
                    this.props.navigation.goBack();
                },
            });
        });
    };

    render() {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                    Keyboard.dismiss();
                }}
                style={{
                    backgroundColor: mainBgColor,
                    flex: 1,
                    paddingLeft: 20,
                    paddingRight: 20,
                }}
            >
                <Text style={{ ...defaultStyles.instruction, marginTop: 20, marginBottom: 20 }}>
                    {strings('password.password_format')}
                </Text>
                <View
                    style={{
                        ...defaultStyles.shadow,
                        width: width - 40,
                        borderRadius: 5,
                        backgroundColor: 'white',
                        padding: 20,
                    }}
                >
                    <PasswordInputWithTitle
                        title={strings('password.current_password_label')}
                        placeholder={strings('password.hint_enter_current_password')}
                        value={this.state.password_current}
                        onChange={e => {
                            this.setState({
                                password_current: e,
                            });
                            this.updateEditStatus(
                                e,
                                this.state.password_new,
                                this.state.password_confirm,
                            );
                        }}
                    />
                    <View style={{ marginBottom: 20 }} />
                    <PasswordInputWithTitle
                        title={strings('password.new_password_label')}
                        placeholder={strings('password.hint_enter_new_password')}
                        value={this.state.password_new}
                        onChange={e => {
                            this.setState({
                                password_new: e,
                            });
                            this.updateEditStatus(
                                e,
                                this.state.password_confirm,
                                this.state.password_current,
                            );
                        }}
                    />
                    <View style={{ marginBottom: 20 }} />
                    <PasswordInputWithTitle
                        title={strings('password.confirm_password_label')}
                        placeholder={strings('password.hint_enter_confirm_password')}
                        value={this.state.password_confirm}
                        onChange={e => {
                            this.setState({
                                password_confirm: e,
                            });
                            this.updateEditStatus(
                                e,
                                this.state.password_new,
                                this.state.password_current,
                            );
                        }}
                    />
                </View>
            </TouchableOpacity>
        );
    }
}
const mapToState = ({ userModel }) => ({
    hashed_password: userModel.hashed_password,
});
export default connect(mapToState)(Password);
