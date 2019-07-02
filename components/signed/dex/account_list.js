import * as React from 'react';
import {
    View,
    FlatList, Image, Text
} from 'react-native';
import {mainBgColor} from '../../style_util';
import {connect} from "react-redux";
import {COINS} from "../../../coins/support_coin_list";
import {renderAddress} from "./home";
import BigNumber from 'bignumber.js';
import commonStyles from "../../styles";

class AccountList extends React.Component{

    static navigationOptions={

    };
    renderItem = ({item})=>{
        return (
            <View style={styles.accountContainerWithShadow}>
                <Image source={COINS[item.symbol].icon} style={{marginRight: 10, width: 24, height: 24}}/>
                <View style={{flex: 1, paddingVertical: 10}}>
                    <View style={{...styles.accountSubContainer, width: '100%', alignItems: 'center'}}>
                        <Text style={{...styles.accountSubTextFontStyle1, width: '70%'}}
                              numberOfLines={1}>{item.name}</Text>
                        <Text style={{
                            ...styles.accountSubTextFontStyle1,
                            fontWeight: 'bold'
                        }}>{new BigNumber(item.balance).toFixed(4)}</Text>
                    </View>
                    <View style={{...styles.accountSubContainer, alignItems: 'center'}}>
                        {renderAddress(item.address)}
                        <Text style={styles.accountSubTextFontStyle2}>{item.symbol}</Text>
                    </View>
                </View>
            </View>
        )
    };
    render(){
        const {accounts} = this.props;

        return(
            <View style={{flex:1,backgroundColor:mainBgColor}}>
                <FlatList
                   data={accounts}
                   renderItem={this.renderItem}
                   keyExtractor={(item,index)=>index+''}
                />
            </View>
        )
    }
}

const mapToState = ({accounts})=>{
    return {
        accounts:Object.values(Object.keys(accounts).filter(k=>k.toLowerCase().startsWith('eth')).reduce((map,el)=>{map[el]=accounts[el];return map},{})),
    }
};

export default connect(mapToState)(AccountList);

const styles={
    accountContainerWithShadow:{
        ...commonStyles.shadow,
        borderRadius:10,
        backgroundColor: 'white',
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems: 'center',
        paddingHorizontal:15,
    },
    accountSubContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
    },
    accountSubTextFontStyle1:{
        fontSize:14,
        color:'#000'
    },
    accountSubTextFontStyle2:{
        fontSize:12,
        color:'gray'
    },
}