import React, {Component} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {connect} from 'react-redux';
import {strings, setLocale} from '../../../locales/i18n';
import DeviceInfo from 'react-native-device-info';

class SettingLanguage extends Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: strings('language.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <TouchableOpacity onPress={() => {
                    navigation.state.params.updateLocale();
                    this.props.navigation.goBack();
                }}>
                    <View style={{marginRight: 20}}>
                        <Text style={{color: 'blue'}}>{strings('save_button')}</Text>
                    </View>
                </TouchableOpacity>
            )
        });
    };

    constructor(props) {
        super(props);
        this.state = {
            lang: props.setting.lang,
        };
    }

    componentWillMount() {
        this.props.navigation.setParams({
            updateLocale: this.updateLocale,
        });
    }

    updateLocale= () => {
        const {dispatch} = this.props;
        setLocale(this.state.lang);
        this.props.setting.lang = this.state.lang;
        dispatch(setting(this.props.setting));
    }

    selectLang(lang) {
        this.setState({
            lang: lang,
        })
    }

    selectAuto() {
        this.setState({
            lang: DeviceInfo.getDeviceLocale(),
        })
    }

    render() {
        return (
            <View />
        )
    }
}

export default connect( state => {
    return {
        setting: state.setting,
    };
})(SettingLanguage);
