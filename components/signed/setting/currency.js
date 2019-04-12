import React, {Component} from 'react';
import {View, TouchableOpacity, Text, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {strings} from '../../../locales/i18n';
import SelectList from '../../selectList.js';
import {setting} from '../../../actions/setting';
import {mainBgColor} from '../../style_util';
import {RightActionButton} from '../../common';
import defaultStyles from '../../styles';

const {width} = Dimensions.get('window');

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
                <RightActionButton
                    onPress={() => {
                        navigation.state.params.updateCurrency();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                />
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

        this.props.navigation.goBack();
    }

    render() {
        return (
            <View style={{
                flex: 1,
                paddingTop: 40,
                backgroundColor: mainBgColor,
                alignItems: 'center'
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
                        ref={ref=>this.selectList=ref}
                        itemHeight={55}
                        data={{
                            'CNY': strings('currency.CNY'),
                            'USD': strings('currency.USD'),
                            'CAD': strings('currency.CAD'),
                            'BTC': strings('currency.BTC'),
                        }}
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
