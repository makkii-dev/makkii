import React, {Component} from 'react';
import {View, ScrollView, Text, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {strings} from '../../../locales/i18n';
import SelectList from '../../selectList.js';
import {mainBgColor} from '../../style_util';
import {RightActionButton} from '../../common';
import defaultStyles from '../../styles';
import {createAction} from "../../../utils/dva";
import Loading from "../../loading";

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
        const {dispatch,navigation} = this.props;
        let newCurrency = Object.keys(this.refs['refSelectList'].getSelect())[0];
        this.refs['refLoading'].show();
        dispatch(createAction('settingsModal/updateFiatCurrency')({currency:newCurrency}))
            .then(r=>{
                this.refs['refLoading'].hide();
                if(r){
                    navigation.goBack();
                }
            })
    };

    render() {
        const {currentCurrency} = this.props;
        return (
            <View style={{
                flex: 1,
                backgroundColor: mainBgColor,
                alignItems: 'center'
            }}>
                <ScrollView
                    style={{width:width}}
                    contentContainerStyle={{alignItems: 'center'}}
                >
                <View style={{
                    ...defaultStyles.shadow,
                    width: width - 40,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    paddingLeft: 20,
                    paddingRight: 20,
                    marginVertical: 20,
                }} >
                        <SelectList
                            ref={'refSelectList'}
                            itemHeight={55}
                            data={{
                                'BTC': { name: strings('currency.BTC'), unit: strings('currency.BTC_unit') },
                                'CNY': { name: strings('currency.CNY'), unit: strings('currency.CNY_unit') },
                                'USD':{name: strings('currency.USD'), unit: strings('currency.USD_unit') },
                                'CAD':{name: strings('currency.CAD'), unit: strings('currency.CAD_unit') },
                                'ALL':{name: strings('currency.ALL'), unit: strings('currency.ALL_unit') },
                                'ARS':{name: strings('currency.ARS'), unit: strings('currency.ARS_unit') },
                                'AMD':{name: strings('currency.AMD'), unit: strings('currency.AMD_unit') },
                                'AUD':{name: strings('currency.AUD'), unit: strings('currency.AUD_unit') },
                                'AZN':{name: strings('currency.AZN'), unit: strings('currency.AZN_unit') },
                                'AED':{name: strings('currency.AED'), unit: strings('currency.AED_unit') },
                                'BHD':{name: strings('currency.BHD'), unit: strings('currency.BHD_unit') },
                                'BDT':{name: strings('currency.BDT'), unit: strings('currency.BDT_unit') },
                                'BYN':{name: strings('currency.BYN'), unit: strings('currency.BYN_unit') },
                                'BOB':{name: strings('currency.BOB'), unit: strings('currency.BOB_unit') },
                                'BAM':{name: strings('currency.BAM'), unit: strings('currency.BAM_unit') },
                                'BRL':{name: strings('currency.BRL'), unit: strings('currency.BRL_unit') },
                                'BGN':{name: strings('currency.BGN'), unit: strings('currency.BGN_unit') },
                                'CLP':{name: strings('currency.CLP'), unit: strings('currency.CLP_unit') },
                                'COP':{name: strings('currency.COP'), unit: strings('currency.COP_unit') },
                                'CRC':{name: strings('currency.CRC'), unit: strings('currency.CRC_unit') },
                                'CZK':{name: strings('currency.CZK'), unit: strings('currency.CZK_unit') },
                                'CHF':{name: strings('currency.CHF'), unit: strings('currency.CHF_unit') },
                                'DZD':{name: strings('currency.DZD'), unit: strings('currency.DZD_unit') },
                                'DOP':{name: strings('currency.DOP'), unit: strings('currency.DOP_unit') },
                                'DKK':{name: strings('currency.DKK'), unit: strings('currency.DKK_unit') },
                                'EGP':{name: strings('currency.EGP'), unit: strings('currency.EGP_unit') },
                                'EUR':{name: strings('currency.EUR'), unit: strings('currency.EUR_unit') },
                                'GEL':{name: strings('currency.GEL'), unit: strings('currency.GEL_unit') },
                                'GHS':{name: strings('currency.GHS'), unit: strings('currency.GHS_unit') },
                                'GTQ':{name: strings('currency.GTQ'), unit: strings('currency.GTQ_unit') },
                                'GBP':{name: strings('currency.GBP'), unit: strings('currency.GBP_unit') },
                                'HRK':{name: strings('currency.HRK'), unit: strings('currency.HRK_unit') },
                                'HNL':{name: strings('currency.HNL'), unit: strings('currency.HNL_unit') },
                                'HKD':{name: strings('currency.HKD'), unit: strings('currency.HKD_unit') },
                                'HUF':{name: strings('currency.HUF'), unit: strings('currency.HUF_unit') },
                                'ISK':{name: strings('currency.ISK'), unit: strings('currency.ISK_unit') },
                                'INR':{name: strings('currency.INR'), unit: strings('currency.INR_unit') },
                                'IDR':{name: strings('currency.IDR'), unit: strings('currency.IDR_unit') },
                                'IRR':{name: strings('currency.IRR'), unit: strings('currency.IRR_unit') },
                                'IQD':{name: strings('currency.IQD'), unit: strings('currency.IQD_unit') },
                                'ILS':{name: strings('currency.ILS'), unit: strings('currency.ILS_unit') },
                                'JMD':{name: strings('currency.JMD'), unit: strings('currency.JMD_unit') },
                                'JPY':{name: strings('currency.JPY'), unit: strings('currency.JPY_unit') },
                                'JOD':{name: strings('currency.JOD'), unit: strings('currency.JOD_unit') },
                                'KZT':{name: strings('currency.KZT'), unit: strings('currency.KZT_unit') },
                                'KES':{name: strings('currency.KES'), unit: strings('currency.KES_unit') },
                                'KWD':{name: strings('currency.KWD'), unit: strings('currency.KWD_unit') },
                                'KGS':{name: strings('currency.KGS'), unit: strings('currency.KGS_unit') },
                                'KRW':{name: strings('currency.KRW'), unit: strings('currency.KRW_unit') },
                                'KHR':{name: strings('currency.KHR'), unit: strings('currency.KHR_unit') },
                                'LKR':{name: strings('currency.LKR'), unit: strings('currency.LKR_unit') },
                                'LBP':{name: strings('currency.LBP'), unit: strings('currency.LBP_unit') },
                                'MKD':{name: strings('currency.MKD'), unit: strings('currency.MKD_unit') },
                                'MYR':{name: strings('currency.MYR'), unit: strings('currency.MYR_unit') },
                                'MUR':{name: strings('currency.MUR'), unit: strings('currency.MUR_unit') },
                                'MXN':{name: strings('currency.MXN'), unit: strings('currency.MXN_unit') },
                                'MDL':{name: strings('currency.MDL'), unit: strings('currency.MDL_unit') },
                                'MNT':{name: strings('currency.MNT'), unit: strings('currency.MNT_unit') },
                                'MAD':{name: strings('currency.MAD'), unit: strings('currency.MAD_unit') },
                                'MMK':{name: strings('currency.MMK'), unit: strings('currency.MMK_unit') },
                                'NAD':{name: strings('currency.NAD'), unit: strings('currency.NAD_unit') },
                                'NPR':{name: strings('currency.NPR'), unit: strings('currency.NPR_unit') },
                                'NZD':{name: strings('currency.NZD'), unit: strings('currency.NZD_unit') },
                                'NIO':{name: strings('currency.NIO'), unit: strings('currency.NIO_unit') },
                                'NGN':{name: strings('currency.NGN'), unit: strings('currency.NGN_unit') },
                                'NOK':{name: strings('currency.NOK'), unit: strings('currency.NOK_unit') },
                                'OMR':{name: strings('currency.OMR'), unit: strings('currency.OMR_unit') },
                                'PKR':{name: strings('currency.PKR'), unit: strings('currency.PKR_unit') },
                                'PAB':{name: strings('currency.PAB'), unit: strings('currency.PAB_unit') },
                                'PEN':{name: strings('currency.PEN'), unit: strings('currency.PEN_unit') },
                                'PHP':{name: strings('currency.PHP'), unit: strings('currency.PHP_unit') },
                                'PLN':{name: strings('currency.PLN'), unit: strings('currency.PLN_unit') },
                                'QAR':{name: strings('currency.QAR'), unit: strings('currency.QAR_unit') },
                                'RON':{name: strings('currency.RON'), unit: strings('currency.RON_unit') },
                                'RUB':{name: strings('currency.RUB'), unit: strings('currency.RUB_unit') },
                                'RSD':{name: strings('currency.RSD'), unit: strings('currency.RSD_unit') },
                                'SAR':{name: strings('currency.SAR'), unit: strings('currency.SAR_unit') },
                                'SGD':{name: strings('currency.SGD'), unit: strings('currency.SGD_unit') },
                                'SSP':{name: strings('currency.SSP'), unit: strings('currency.SSP_unit') },
                                'SEK':{name: strings('currency.SEK'), unit: strings('currency.SEK_unit') },
                                'TWD':{name: strings('currency.TWD'), unit: strings('currency.TWD_unit') },
                                'TTD':{name: strings('currency.TTD'), unit: strings('currency.TTD_unit') },
                                'TND':{name: strings('currency.TND'), unit: strings('currency.TND_unit') },
                                'TRY':{name: strings('currency.TRY'), unit: strings('currency.TRY_unit') },
                                'THB':{name: strings('currency.THB'), unit: strings('currency.THB_unit') },
                                'UGX':{name: strings('currency.UGX'), unit: strings('currency.UGX_unit') },
                                'UAH':{name: strings('currency.UAH'), unit: strings('currency.UAH_unit') },
                                'UYU':{name: strings('currency.UYU'), unit: strings('currency.UYU_unit') },
                                'UZS':{name: strings('currency.UZS'), unit: strings('currency.UZS_unit') },
                                'VES':{name: strings('currency.VES'), unit: strings('currency.VES_unit') },
                                'VND':{name: strings('currency.VND'), unit: strings('currency.VND_unit') },
                                'ZAR':{name: strings('currency.ZAR'), unit: strings('currency.ZAR_unit') },
                            }}
                            cellLeftView={item=>{
                                return (
                                        <Text style={{flex: 1}}>{item.name}/{item.unit}</Text>
                                )
                            }}
                            defaultKey={currentCurrency}
                            onItemSelected={() => {
                                this.props.navigation.setParams({
                                    isEdited: currentCurrency!== Object.keys(this.refs['refSelectList'].getSelect())[0],
                                })
                            }}
                        />
                </View>
                </ScrollView>
                <Loading ref={'refLoading'}/>
            </View>
        )
    }
}

const mapToState = ({settingsModal})=>({
    currentCurrency:settingsModal.fiat_currency,
});

export default connect(mapToState)(Currency);
