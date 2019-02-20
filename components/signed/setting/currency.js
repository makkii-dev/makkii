import React, {Component} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {connect} from 'react-redux';
import {strings} from '../../../locales/i18n';
import SelectList from '../../selectList.js';
import {setting} from '../../../actions/setting';

class Currency extends Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: strings('currency.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <TouchableOpacity onPress={() => {
                    navigation.state.params.updateCurrency();
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
            updateCurrency: this.updateCurrency,
        });
    }

    updateCurrency= () => {
        const {dispatch} = this.props;
        this.props.setting.fiat_currency = Object.keys(this.selectList.getSelect())[0];
        dispatch(setting(this.props.setting));
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
                    data={{ 'CNY': strings('currency.CNY'),
                        'USD': strings('currency.USD'),
                        'CAD': strings('currency.CAD')}}
                    cellLeftView={item=>{
                        return (
                            <Text style={{flex: 1}}>{item}</Text>
                        )
                    }}
                    defaultKey={this.props.setting.fiat_currency}
                />
            </View>
        )
    }
}

export default connect( state => {
    return {
        setting: state.setting,
    };
})(Currency);
