import React, {Component} from 'react';
import {connect} from 'react-redux';
import Toast from 'react-native-root-toast';
import {Alert, View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard} from 'react-native';
import {strings} from "../../../locales/i18n";
import {validatePositiveInteger} from '../../../utils';
import {setting} from "../../../actions/setting";

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
                <TouchableOpacity onPress={() => {
                    navigation.state.params.updateAdvancedSettings();
                }}>
                    <View style={{marginRight: 20}}>
                        <Text style={{color: 'blue'}}>{strings('save_button')}</Text>
                    </View>
                </TouchableOpacity>
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
        });
    }
    render() {
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>{Keyboard.dismiss()}}>
            <View style={styles.container}>
                <View>
                    <Text>{strings('advanced.label_default_account_name')}</Text>
                </View>
                <View style={styles.marginBottom20}>
                    <TextInput
                        style={st.text_input}
                        value={this.state.default_account_name}
                        onChangeText={text => {
                            this.setState({
                                default_account_name:text
                            });
                        }}
                    />
                </View>
                <View>
                    <Text>{strings('advanced.label_login_session_timeout')}</Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                }}>
                    <TextInput
                        style={{...st.text_input, marginRight: 10, flex: 1}}
                        value={this.state.login_session_timeout}
                        onChangeText={text => {
                            this.setState({
                                login_session_timeout: text
                            });
                        }}
                    />
                    <Text style={{ color: '#777676', fontSize: 16 }}>{strings('advanced.label_minute')}</Text>
                </View>
                <View>
                    <Text>{strings('advanced.label_exchange_refresh_interval')}</Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                }}>
                    <TextInput
                        style={{...st.text_input, marginRight: 10, flex: 1}}
                        value={this.state.exchange_refresh_interval}
                        onChangeText={text => {
                            this.setState({
                                exchange_refresh_interval: text
                            });
                        }}
                    />
                    <Text style={{ color: '#777676', fontSize: 16 }}>{strings('advanced.label_minute')}</Text>
                </View>
                {/*<View>*/}
                    {/*<Button title={strings('save_button')}*/}
                            {/*onPress={this.updateAdvancedSetting}*/}
                            {/*/>*/}
                {/*</View>*/}
            </View>
            </TouchableOpacity>
        )
    }

    updateAdvancedSettings = () => {
        if (this.state.default_account_name.length == 0) {
            Alert.alert(strings('alert_title_error'), strings('advanced.error_default_account_name_empty'));
            return;
        }

        if (!validatePositiveInteger(this.state.login_session_timeout)) {
            Alert.alert(strings('alert_title_error'), strings('advanced.error_invalid_login_session_timeout'));
            return;
        }

        if (!validatePositiveInteger(this.state.exchange_refresh_interval)) {
            Alert.alert(strings('alert_title_error'), strings('advanced.error_invalid_exchange_refresh_interval'));
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


        Toast.show(strings('toast_update_success'), {
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
