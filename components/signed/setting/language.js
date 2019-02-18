import React, {Component} from 'react';
import {View, TouchableOpacity, Text, DeviceEventEmitter} from 'react-native';
import {connect} from 'react-redux';
import {strings, setLocale} from '../../../locales/i18n';
import SelectList from '../../selectList.js';
import {setting} from '../../../actions/setting';

class Language extends Component {
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
                    navigation.goBack();
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
    }

    componentWillMount() {
        this.props.navigation.setParams({
            updateLocale: this.updateLocale,
        });
    }

    updateLocale= () => {
        const {dispatch} = this.props;
        this.props.setting.lang = Object.keys(this.selectList.getSelect())[0];
        dispatch(setting(this.props.setting));

        DeviceEventEmitter.emit('locale_change');
    }

    render() {
        return (
            <View style={{
                backgroundColor: '#eeeeee',
                flex: 1,
            }}>
                <SelectList
                    ref={ref=>this.selectList=ref}
                    itemHeight={55}
                    data={{ 'auto': strings('language.auto'),
                        'en': strings('language.english'),
                        'zh': strings('language.chinese')}}
                    cellLeftView={item=>{
                        return (
                            <Text style={{flex: 1}}>{item}</Text>
                        )
                    }}
                    defaultKey={this.props.setting.lang}
                />
            </View>
        )
    }
}

export default connect( state => {
    return {
        setting: state.setting,
    };
})(Language);
