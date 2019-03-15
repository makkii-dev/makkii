import React, {Component} from 'react';
import {View, TouchableOpacity, Text, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {strings} from '../../../locales/i18n';
import SelectList from '../../selectList.js';
import {setting} from '../../../actions/setting';

const {width,height} = Dimensions.get('window');

class Currency extends Component {
    static navigationOptions = ({navigation})=> {
        let textColor;
        if (navigation.state.params && navigation.state.params.isEdited) {
            textColor = 'rgba(255, 255, 255, 1.0)';
        } else {
            textColor = 'rgba(255, 255, 255, 0.3)';
        }
        return ({
            title: strings('currency.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <TouchableOpacity
                    onPress={() => {
                        navigation.state.params.updateCurrency();
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
            updateCurrency: this.updateCurrency,
            isEdited: false
        });
    }

    updateCurrency= () => {
        const {dispatch} = this.props;
        let newCurrency = Object.keys(this.selectList.getSelect())[0];
        if (newCurrency != this.props.setting.fiat_currency) {
            listenPrice.setCurrency(newCurrency);
        }

        this.props.setting.fiat_currency = newCurrency;
        dispatch(setting(this.props.setting));
        this.props.navigation.goBack();
    }

    render() {
        return (
            <View style={{
                flex: 1,
                paddingTop: 40,
                backgroundColor: '#eeeeee',
                alignItems: 'center'
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
                        data={{ 'CNY': strings('currency.CNY'),
                            'USD': strings('currency.USD'),
                            'CAD': strings('currency.CAD')}}
                        cellLeftView={item=>{
                            return (
                                <Text style={{flex: 1}}>{item}</Text>
                            )
                        }}
                        defaultKey={this.props.setting.fiat_currency}
                        onItemSelected={() => {
                            this.props.navigation.setParams({
                                isEdited: this.props.setting.fiat_currency != Object.keys(this.selectList.getSelect())[0],
                            })
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
})(Currency);
