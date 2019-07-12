import React, {Component} from 'react';
import {Dimensions, View, Text, DeviceEventEmitter} from 'react-native';
import {connect} from 'react-redux';
import {strings} from '../../../locales/i18n';
import SelectList from '../../selectList.js';
import {setting} from '../../../actions/setting';
import {mainBgColor} from '../../style_util';
import {RightActionButton} from '../../common';
import defaultStyles from '../../styles';
import {createAction} from "../../../utils/dva";

const {width,height} = Dimensions.get('window');

class Language extends Component {
    static navigationOptions = ({navigation, screenProps:{t,lang}})=> {
        return ({
            title: t('language.title',{locale:lang}),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <RightActionButton
                    onPress={() => {
                        navigation.state.params.updateLocale();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                >
                </RightActionButton>
            )
        });
    };

    constructor(props) {
        super(props);
        this.props.navigation.setParams({
            updateLocale: this.updateLocale,
            isEdited: false
        });
    }

    updateLocale= () => {
        const {dispatch, navigation} = this.props;
        const lang = Object.keys(this.refs['refSelectList'].getSelect())[0];
        dispatch(createAction('settingsModal/updateState')({lang}));
        navigation.goBack();
    };

    render() {
        const {currentLanguage} = this.props;
        return (
            <View style={{
                backgroundColor: mainBgColor,
                alignItems: 'center',
                flex: 1,
                paddingTop: 40
            }}>
                <View style={{
                    ...defaultStyles.shadow,
                    width: width - 40,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    paddingLeft: 20,
                    paddingRight: 20,
                }} >
                    <SelectList
                        ref={'refSelectList'}
                        itemHeight={55}
                        data={{ 'auto': strings('language.auto'),
                            'en': strings('language.english'),
                            'zh': strings('language.chinese')}}
                        cellLeftView={item=>{
                            return (
                                <Text style={{flex: 1}}>{item}</Text>
                            )
                        }}
                        defaultKey={currentLanguage}
                        onItemSelected={() => {
                            this.props.navigation.setParams({
                                isEdited: currentLanguage !== Object.keys(this.refs['refSelectList'].getSelect())[0],
                            });
                        }}
                    />
                </View>
            </View>
        )
    }
}

const mapToState = ({settingsModal})=>({
    currentLanguage: settingsModal.lang,
});

export default connect(mapToState)(Language);
