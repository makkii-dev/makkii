import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Platform, DeviceEventEmitter, Image, Text, TouchableOpacity, FlatList, View, Dimensions, StyleSheet, PixelRatio} from 'react-native';
import { strings } from '../../../locales/i18n';
import {mainBgColor} from '../../style_util';
import {IMPORT_SOURCE} from './constants';
import wallet from 'react-native-aion-hw-wallet';
import Loading from '../../loading.js';
import keyStore from 'react-native-makkii-core';
import {accounts_add } from "../../../actions/accounts";
import {update_index } from "../../../actions/user";
import {accountKey,getLedgerMessage} from '../../../utils';
import {alert_ok} from '../../common';
import {COINS} from "../../../coins/support_coin_list";

const {width} = Dimensions.get('window');

class ImportFrom extends Component {
    static navigationOptions = ({navigation}) => {
        return ({
            title: strings('vault_import_source.title'),
        });
    }

    constructor(props) {
        super(props);

        IMPORT_SOURCE[0].callback = this.importFromMasterKey;
        IMPORT_SOURCE[1].callback = this.importFromPrivateKey;
        IMPORT_SOURCE[2].callback = this.importFromKeystore;
        IMPORT_SOURCE[3].callback = this.importFromLedger;

        this.symbol = this.props.navigation.getParam('symbol');

        this.import_from = [ IMPORT_SOURCE[0], IMPORT_SOURCE[1] ];
        if (this.symbol === 'AION' && Platform.OS === 'android') {
            this.import_from.push(IMPORT_SOURCE[3]);
        }
    }

    importFromMasterKey=() => {
        const {dispatch} = this.props;

        let indexPathMap;
        if (this.props.user.hd_index !== undefined && this.props.user.hd_index[this.symbol] !== undefined) {
            indexPathMap = this.props.user.hd_index[this.symbol];
        }
        indexPathMap = typeof indexPathMap ==='object'? indexPathMap: {};
        let minIndex = 0;
        while(indexPathMap[minIndex]!==undefined){
            minIndex++;
        }

        this.loadingView.show();
        const getUniqueKey = (coinType, path1,path2,path3,isTestNet)=>{
            keyStore.getKey(coinType, path1, path2, path3, isTestNet).then(acc => {
                if (this.props.accounts[this.symbol+'+'+acc.address]!==undefined){
                    console.log('acc=>',acc);
                    dispatch(update_index(this.symbol, acc.index , 'add'+acc.address));
                    getUniqueKey(coinType,path1,path2,path3+1,isTestNet);
                }else{
                    this.loadingView.hide();
                    this.getAcc = acc;
                    console.log("imported acc:", acc);
                    this.props.navigation.navigate('signed_vault_change_account_name', {
                        oldName: '',
                        onUpdate: this.setAccountName,
                        targetUri: 'signed_vault',
                    });
                }
            });
        };
        getUniqueKey(keyStore.CoinType.fromCoinSymbol(this.symbol), 0, 0, minIndex, COINS[this.symbol.toUpperCase()].isTestNet);

    };

    setAccountName=(newName) => {
        console.log('set account name=>', newName)
        let acc = {};
        acc.address = this.getAcc.address;
        acc.private_key = this.getAcc.private_key;
        acc.balance = 0;
        acc.name = newName;
        acc.type = '[local]';
        acc.transactions = {};
        acc.symbol = this.symbol;
        acc.tokens = {};

        const {dispatch} = this.props;
        dispatch(accounts_add({
            [accountKey(this.symbol, acc.address)]: acc
        }, this.props.user.hashed_password));

        console.log("index:" + this.getAcc.index);
        dispatch(update_index(this.symbol, this.getAcc.index , 'add'+this.getAcc.address));

        setTimeout(() => {
            DeviceEventEmitter.emit('updateAccountBalance');
        }, 500);
    };

    importFromPrivateKey=() => {
        this.props.navigation.navigate('signed_vault_import_private_key', {
            symbol: this.symbol
        });
    }
    importFromKeystore=() => {

    }
    importFromLedger=() => {
        console.log("import " + this.symbol + " from ledger");
        if (this.symbol === 'AION') {
            this.loadingView.show(strings('ledger.toast_connecting'));
            listenApp.ignore = true;
            wallet.listDevice().then((deviceList) => {
                setTimeout(()=>listenApp.ignore=false,1000);
                if (deviceList.length <= 0) {
                    this.loadingView.hide();
                    alert_ok(strings('alert_title_error'), strings('ledger.error_device_count'));
                } else {
                    wallet.getAccount(0).then(account => {
                        this.loadingView.hide();
                        this.props.navigation.navigate('signed_vault_import_list',{
                            type:'ledger',
                            symbol: this.symbol,
                            title:strings('import_ledger.title')});
                    }, error => {
                        this.loadingView.hide();
                        alert_ok(strings('alert_title_error'), getLedgerMessage(error.code));
                    });
                }
            });
        }
    }

    render_item=({item, index})=> {
        const cellHeight = 60;
        return (
            <TouchableOpacity
                activeOpaicty={1}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#fff',
                    justifyContent: 'space-between',
                    height: cellHeight,
                }}
                onPress={() => {
                    this.import_from[index].callback();
                }}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image source={item.icon}
                           style={{
                               width: 30,
                               height: 30,
                           }}
                           resizeMode={'contain'}
                    />
                    <Text numberOfLines={1} style={{paddingLeft: 10}}>{strings(item.title)}</Text>
                </View>
                <Image
                    style={{width: 24, height: 24}}
                    source={require('../../../assets/arrow_right.png')}
                    resizeMode={'contain'}
                />
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={{
                backgroundColor: mainBgColor,
                alignItems: 'center',
                flex: 1,
                paddingTop: 20,
            }}>
                <FlatList
                    style={{ width: width }}
                    data={this.import_from}
                    renderItem={this.render_item}
                    ItemSeparatorComponent={()=><View style={styles.divider}/>}
                    keyExtractor={(item, index)=>item.title}
                />
                <Loading ref={(element)=> {
                    this.loadingView = element;
                }}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
   divider: {
       height: 1 / PixelRatio.get(),
       backgroundColor: '#dfdfdf'
   }
});

export default connect(state=> {
    return {
        user: state.user,
        accounts: state.accounts,
    };
})(ImportFrom);
