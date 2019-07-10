import React, {Component} from 'react';
import {connect} from 'react-redux';
import Toast from 'react-native-root-toast';
import {Dimensions, View, TouchableOpacity, Keyboard, Image} from 'react-native';
import {strings} from "../../../locales/i18n";
import {validatePositiveInteger} from '../../../utils';
import {setting} from "../../../actions/setting";
import {TextInputWithTitle, RightActionButton, alert_ok} from '../../common';
import {mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';
import {AppToast} from "../../../utils/AppToast";

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
                        title={strings('advanced.label_login_session_timeout')}
                        value={this.state.login_session_timeout}
                        rightView={()=>
                            <TouchableOpacity onPress={()=>{
                                Keyboard.dismiss();
                                AppToast.show(strings('advanced.description_login_session_timeout'), {
                                    position: AppToast.positions.CENTER,
                                })
                            }}>
                                <Image source={require('../../../assets/question.png')} style={{width:20, height:20, tintColor: 'gray'}} resizeMode={'contain'}/>
                            </TouchableOpacity>
                        }
                        trailingText={strings('advanced.label_minute')}
                        keyboardType={'number-pad'}
                        onChange={text => {
                            this.setState({
                                login_session_timeout: text
                            });
                            this.updateEditStatus(text, this.state.exchange_refresh_interval);
                        }}
                        onFocus={()=>AppToast.close()}
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
                            this.updateEditStatus(this.state.login_session_timeout, text);
                        }}
                        onFocus={()=>AppToast.close()}
                    />
                </View>
            </TouchableOpacity>
        )
    }

    updateEditStatus = (time, interval) => {
        let allFill = time.length > 0 && interval.length > 0;
        let anyChange = (time !== this.props.setting.login_session_timeout
            || interval !== this.props.setting.exchange_refresh_interval);
        this.props.navigation.setParams({
            isEdited: allFill && anyChange,
        });
    }

    updateAdvancedSettings = () => {
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
        if (this.state.exchange_refresh_interval !== _setting.exchange_refresh_interval) {
            listenPrice.setInterval(this.state.exchange_refresh_interval);
        }

        _setting.login_session_timeout = this.state.login_session_timeout;
        _setting.exchange_refresh_interval = this.state.exchange_refresh_interval;
        dispatch(setting(_setting));
        listenApp.timeOut = this.state.login_session_timeout;

        AppToast.show(strings('toast_update_success'), {
            position: AppToast.positions.CENTER,
            onHidden: () => {
                this.props.navigation.goBack();
            }
        });
    }
}

export default connect(state => { return ({ setting: state.setting }); })(Advanced);
