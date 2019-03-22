import React, {Component} from 'react';
import {connect} from 'react-redux';
import Toast from 'react-native-root-toast';
import {Dimensions, View, StyleSheet, TouchableOpacity, Keyboard} from 'react-native';
import {strings} from "../../../locales/i18n";
import {validatePositiveInteger, toUTF8Array} from '../../../utils';
import {setting} from "../../../actions/setting";
import {TextInputWithTitle, RightActionButton, alert_ok} from '../../common';
import {mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';

const {width} = Dimensions.get('window');

class Advanced extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('advanced.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <RightActionButton
                    onPress={() => {
                        navigation.state.params.updateAdvancedSettings();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                >
                </RightActionButton>
            )
        };
    };
    constructor(props) {
        super(props);
        console.log("advanced: ", props.setting);
        this.state = {
            default_account_name: props.setting.default_account_name,
            login_session_timeout: props.setting.login_session_timeout,
            exchange_refresh_interval: props.setting.exchange_refresh_interval,
        };
    }
    componentWillMount() {
        this.props.navigation.setParams({
            updateAdvancedSettings: this.updateAdvancedSettings,
            isEdited: false
        });
    }
    render() {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={()=>{Keyboard.dismiss()}}
                style={{
                    backgroundColor: mainBgColor,
                    flex:1,
                    alignItems: 'center'
                }}
            >
                <View style={{
                    ...defaultStyles.shadow,
                    marginTop: 20,
                    width: width - 40,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    padding: 20,
                }} >
                    <TextInputWithTitle
                        title={strings('advanced.label_default_account_name')}
                        value={this.state.default_account_name}
                        onChange={text => {
                            if (toUTF8Array(text).length <= 15) {
                                this.setState({
                                    default_account_name: text
                                });
                                this.updateEditStatus(text, this.state.login_session_timeout, this.state.exchange_refresh_interval);
                            }
                        }}
                    />
                    <View style={{marginTop: 20}} />
                    <TextInputWithTitle
                        title={strings('advanced.label_login_session_timeout')}
                        value={this.state.login_session_timeout}
                        trailingText={strings('advanced.label_minute')}
                        keyboardType={'number-pad'}
                        onChange={text => {
                            this.setState({
                                login_session_timeout: text
                            });
                            this.updateEditStatus(this.state.default_account_name ,text, this.state.exchange_refresh_interval);
                        }}
                    />
                    <View style={{marginTop: 20}} />
                    <TextInputWithTitle
                        title={strings('advanced.label_exchange_refresh_interval')}
                        value={this.state.exchange_refresh_interval}
                        trailingText={strings('advanced.label_minute')}
                        keyboardType={'number-pad'}
                        onChange={text => {
                            this.setState({
                                exchange_refresh_interval: text
                            });
                            this.updateEditStatus(this.state.default_account_name, this.state.login_session_timeout, text);
                        }}
                    />
                </View>
            </TouchableOpacity>
        )
    }

    updateEditStatus = (name, time, interval) => {
        let allFill = name.length > 0 && time.length > 0 && interval.length > 0;
        let anyChange = (name != this.props.setting.default_account_name
            || time != this.props.setting.login_session_timeout
            || interval != this.props.setting.exchange_refresh_interval);
        this.props.navigation.setParams({
            isEdited: allFill && anyChange,
        });
    }

    updateAdvancedSettings = () => {
        if (this.state.default_account_name.length == 0) {
            alert_ok(strings('alert_title_error'), strings('advanced.error_default_account_name_empty'));
            return;
        }

        if (!validatePositiveInteger(this.state.login_session_timeout)) {
            alert_ok(strings('alert_title_error'), strings('advanced.error_invalid_login_session_timeout'));
            return;
        }

        if (!validatePositiveInteger(this.state.exchange_refresh_interval)) {
            alert_ok(strings('alert_title_error'), strings('advanced.error_invalid_exchange_refresh_interval'));
            return;
        }

        const {dispatch} = this.props;

        let _setting = this.props.setting;
        if (this.state.exchange_refresh_interval != _setting.exchange_refresh_interval) {
            listenPrice.setInterval(this.state.exchange_refresh_interval);
        }

        _setting.default_account_name = this.state.default_account_name;
        _setting.login_session_timeout = this.state.login_session_timeout;
        _setting.exchange_refresh_interval = this.state.exchange_refresh_interval;
        dispatch(setting(_setting));
        listenApp.timeOut = this.state.login_session_timeout;

        Toast.show(strings('toast_update_success'), {
            position: Toast.positions.CENTER,
            onHidden: () => {
                this.props.navigation.goBack();
            }
        });
    }
}

const st = StyleSheet.create({
    text_input: {
        fontSize: 16,
        color: '#777676',
        fontWeight: 'normal',
        lineHeight: 20,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 5,
        borderColor: '#8c8a8a',
        borderBottomWidth: 1,
    }
})

export default connect(state => { return ({ setting: state.setting }); })(Advanced);
