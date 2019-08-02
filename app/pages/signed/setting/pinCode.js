import React from 'react';
import { View, Dimensions, Text, Switch, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import { mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { hashPassword } from '../../../../utils';
import { createAction, popCustom } from '../../../../utils/dva';
import Loading from '../../../components/Loading';

const { width } = Dimensions.get('window');

class PinCode extends React.Component {
    static navigationOptions = () => {
        return {
            title: strings('pinCode.title'),
        };
    };

    onVerifySuccess = () => {
        const { dispatch, pinCodeEnabled, navigation } = this.props;
        this.refs.refLoading.show();
        if (!pinCodeEnabled === false) {
            // close pin code
            dispatch(createAction('settingsModel/switchPinCode')()).then(() => {
                this.refs.refLoading.hide();
            });
        } else {
            navigation.navigate('unlock', {
                onUnlockSuccess: () => {
                    dispatch(createAction('settingsModel/switchPinCode')()).then(() => {
                        this.refs.refLoading.hide();
                    });
                },
            });
        }
    };

    handleTogglePinCodeSwitch = () => {
        const { hashed_password: hashedPassword } = this.props;
        popCustom.show(
            strings('alert_title_warning'),
            strings('warning_dangerous_operation'),
            [
                {
                    text: strings('cancel_button'),
                    onPress: () => {
                        popCustom.hide();
                    },
                },
                {
                    text: strings('alert_ok_button'),
                    onPress: text => {
                        const _hashedPassword = hashPassword(text);
                        if (_hashedPassword === hashedPassword) {
                            popCustom.hide();
                            this.onVerifySuccess();
                        } else {
                            popCustom.setErrorMsg(strings('unsigned_login.error_incorrect_password'));
                        }
                    },
                },
            ],
            {
                cancelable: false,
                type: 'input',
                canHide: false,
            },
        );
    };

    handleToggleTouchIDSwitch = () => {
        const { dispatch } = this.props;
        this.refs.refLoading.show();
        dispatch(createAction('settingsModel/switchTouchId')()).then(() => {
            this.refs.refLoading.hide();
        });
    };

    render() {
        const { navigate } = this.props.navigation;
        const { pinCodeEnabled, touchIDEnabled } = this.props;
        const disableTextStyle = pinCodeEnabled ? {} : { color: '#8A8D97' };
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    paddingHorizontal: 20,
                }}
            >
                <Text
                    style={{
                        ...defaultStyles.instruction,
                        marginTop: 20,
                        textAlign: 'left',
                        width: '100%',
                    }}
                >
                    {strings('pinCode.pinCode_prompt')}
                </Text>
                <View style={styles.CellView}>
                    <Text style={[styles.textStyle]}>{strings('pinCode.switch_button')}</Text>
                    <Switch value={pinCodeEnabled} onValueChange={this.handleTogglePinCodeSwitch} />
                </View>
                <View style={styles.CellView}>
                    <Text style={[styles.textStyle]}>{strings('pinCode.touchID_button')}</Text>
                    <Switch disabled={!pinCodeEnabled} value={touchIDEnabled} onValueChange={this.handleToggleTouchIDSwitch} />
                </View>
                <TouchableOpacity
                    disabled={!pinCodeEnabled}
                    onPress={() => {
                        navigate('unlock', {
                            isModifyPinCode: true,
                            onUnlockSuccess: () => {
                                navigate('signed_setting_pinCode');
                            },
                        });
                    }}
                >
                    <View style={styles.CellView}>
                        <Text style={[styles.textStyle, disableTextStyle]}>{strings('pinCode.modify_button')}</Text>
                        <Image source={require('../../../../assets/arrow_right.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    </View>
                </TouchableOpacity>
                <Loading ref="refLoading" />
            </View>
        );
    }
}

const mapToState = ({ settingsModel, userModel }) => ({
    pinCodeEnabled: settingsModel.pinCodeEnabled,
    touchIDEnabled: settingsModel.touchIDEnabled,
    hashed_password: userModel.hashed_password,
});

export default connect(mapToState)(PinCode);

const styles = StyleSheet.create({
    CellView: {
        ...defaultStyles.shadow,
        width: width - 40,
        height: 50,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 20,
        borderRadius: 5,
    },
    textStyle: {
        color: '#000',
    },
});
