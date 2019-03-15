import React, {Component} from 'react';
import {Dimensions, View, TouchableOpacity, Text, DeviceEventEmitter} from 'react-native';
import {connect} from 'react-redux';
import {strings} from '../../../locales/i18n';
import SelectList from '../../selectList.js';
import {setting} from '../../../actions/setting';

const {width,height} = Dimensions.get('window');

class Language extends Component {
    static navigationOptions = ({navigation})=> {
        let textColor;
        if (navigation.state.params && navigation.state.params.isEdited) {
            textColor = 'rgba(255, 255, 255, 1.0)';
        } else {
            textColor = 'rgba(255, 255, 255, 0.3)';
        }
        return ({
            title: strings('language.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <TouchableOpacity
                    onPress={() => {
                        navigation.state.params.updateLocale();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                >
                    <View style={{marginRight: 20}}>
                        <Text style={{
                            color: textColor,
                            fontWeight: 'bold'
                        }}>{strings('save_button')}</Text>
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
            isEdited: false
        });
    }
    updateLocale= () => {
        const {dispatch} = this.props;
        this.props.setting.lang = Object.keys(this.selectList.getSelect())[0];
        dispatch(setting(this.props.setting));

        DeviceEventEmitter.emit('locale_change');
        this.props.navigation.goBack();
    }

    render() {
        return (
            <View style={{
                backgroundColor: '#eeeeee',
                alignItems: 'center',
                flex: 1,
                paddingTop: 40
            }}>
                <View style={{
                    width: width - 40,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    elevation: 3,
                    paddingLeft: 20,
                    paddingRight: 20,
                }} >
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
                        onItemSelected={() => {
                            this.props.navigation.setParams({
                                isEdited: this.props.setting.lang != Object.keys(this.selectList.getSelect())[0],
                            });
                        }}
                    />
                </View>
            </View>
        )
    }
}

export default connect( state => {
    return {
        setting: state.setting,
    };
})(Language);
