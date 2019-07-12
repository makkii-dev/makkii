import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Dimensions, View, TouchableOpacity, Keyboard, Image} from 'react-native';
import {strings} from "../../../locales/i18n";
import {validatePositiveInteger} from '../../../utils';
import {setting} from "../../../actions/setting";
import {TextInputWithTitle, RightActionButton, alert_ok} from '../../common';
import {mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';
import {AppToast} from "../../../utils/AppToast";
import {createAction} from "../../../utils/dva";

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
        this.state = {
            login_session_timeout: props.login_session_timeout,
            exchange_refresh_interval: props.exchange_refresh_interval,
        };
        this.props.navigation.setParams({
            updateAdvancedSettings: this.updateAdvancedSettings,
            isEdited: false
        });
    }

    render() {
        const {login_session_timeout, exchange_refresh_interval} = this.state;
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
                        value={login_session_timeout}
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
                            this.updateEditStatus(text, exchange_refresh_interval);
                        }}
                        onFocus={()=>AppToast.close()}
                    />
                    <View style={{marginTop: 20}} />
                    <TextInputWithTitle
                        title={strings('advanced.label_exchange_refresh_interval')}
                        value={exchange_refresh_interval}
                        trailingText={strings('advanced.label_minute')}
                        keyboardType={'number-pad'}
                        onChange={text => {
                            this.setState({
                                exchange_refresh_interval: text
                            });
                            this.updateEditStatus(login_session_timeout, text);
                        }}
                        onFocus={()=>AppToast.close()}
                    />
                </View>
            </TouchableOpacity>
        )
    }

    updateEditStatus = (time, interval) => {
        const {login_session_timeout, exchange_refresh_interval} = this.props;
        let allFill = time.length > 0 && interval.length > 0;
        let anyChange = (time !== login_session_timeout
            || interval !== exchange_refresh_interval);
        this.props.navigation.setParams({
            isEdited: allFill && anyChange,
        });
    };

    updateAdvancedSettings = () => {
        const {login_session_timeout:_login_session_timeout, exchange_refresh_interval:_exchange_refresh_interval,dispatch} = this.props;
        const {login_session_timeout, exchange_refresh_interval} = this.state;
        if (!validatePositiveInteger(login_session_timeout)) {
            alert_ok(strings('alert_title_error'), strings('advanced.error_invalid_login_session_timeout'));
            return;
        }

        if (!validatePositiveInteger(exchange_refresh_interval)) {
            alert_ok(strings('alert_title_error'), strings('advanced.error_invalid_exchange_refresh_interval'));
            return;
        }
        if(_login_session_timeout!== login_session_timeout){
            dispatch(createAction('settingsModal/updateLoginSessionTimeOut')({time:login_session_timeout}))
        }
        if(_exchange_refresh_interval!==exchange_refresh_interval){
            dispatch(createAction('settingsModal/updateExchangeRefreshInterval')({interval:exchange_refresh_interval}));
        }

        AppToast.show(strings('toast_update_success'), {
            position: AppToast.positions.CENTER,
            onHidden: () => {
                this.props.navigation.goBack();
            }
        });
    }
}

const mapToState = ({settingsModal})=>({
    login_session_timeout: settingsModal.login_session_timeout,
    exchange_refresh_interval: settingsModal.exchange_refresh_interval,
});

export default connect(mapToState)(Advanced);
