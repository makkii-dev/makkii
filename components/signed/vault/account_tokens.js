import React, {Component} from 'react';
import {strings} from '../../../locales/i18n';
import { connect } from 'react-redux';
import {RefreshControl, Platform, PixelRatio, StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, FlatList} from 'react-native';
import {navigationSafely, getStatusBarHeight, accountKey} from '../../../utils';
import {mainBgColor, fixedHeight, mainColor} from '../../style_util';
import {COINS} from '../../../coins/support_coin_list';
import SwipeableRow from '../../swipeCell';
import FastImage from 'react-native-fast-image';
import {getTokenIconUrl, fetchAccountTokenBalance, getBalance, formatAddress1Line} from '../../../coins/api';
import {update_account_name, accounts as update_accounts, update_account_tokens, delete_account_token} from '../../../actions/accounts';
import BigNumber from 'bignumber.js';
import {PopWindow} from "./home_popwindow";
import {Header} from 'react-navigation';
import {ACCOUNT_MENU} from "./constants";
import {AddressComponent} from '../../common';
import defaultStyles from "../../styles";

const {width} = Dimensions.get('window');

class AccountTokens extends Component {
    static navigationOptions = ({navigation}) => {
        const title = navigation.getParam('title');
        const showMenu = navigation.getParam('showMenu', ()=>{});
        return ({
            headerTitle: <Text style={{flex: 1, textAlign: 'center', color: 'white', fontSize: 16, fontWeight: 'bold'}}>{title}</Text>,
            headerRight: (
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <TouchableOpacity
                        style={{width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',}}
                        onPress={()=> {
                        navigation.state.params.selectTokens();
                        }}
                    >
                        <Image style={{width: 25, height: 25, tintColor: 'white'}}
                               resizeMode={'contain'}
                               source={require('../../../assets/icon_add.png')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',}}
                        onPress={showMenu}
                    >
                        <Image source={require('../../../assets/icon_account_menu.png')}
                               style={{width:25,height:25, tintColor:'#fff'}}
                               resizeMode={'contain'}/>
                    </TouchableOpacity>
                </View>
            )
        });
    };
    constructor(props) {
        super(props);
        this.account = this.props.navigation.state.params.account;
        this.account_key = accountKey(this.account.symbol, this.account.address);
        this.state = {
            openRowKey: null,
            showMenu: false,
            refreshing: false,
        };
        this.props.navigation.setParams({
            title: this.account.name,
            selectTokens: this.selectTokens,
            showMenu: this.openMenu,
        });
    }

    openMenu = () => {
        this.setState({
            showMenu:true
        })
    };

    onCloseMenu = (select) => {
        const {navigation} = this.props;
        const {pinCodeEnabled} = this.props.setting;
        const {hashed_password} = this.props.user;
        this.setState({
            showMenu:false
        },()=>{
            switch(select){
                case ACCOUNT_MENU[0].title:
                    navigation.navigate('signed_vault_change_account_name',{
                        name: this.account.name,
                        onUpdate: this.updateAccountName,
                    });
                    break;
                case ACCOUNT_MENU[1].title:
                    navigationSafely(
                        pinCodeEnabled,
                        hashed_password,
                        navigation,
                        {
                            url:'signed_vault_export_private_key',
                            args:{privateKey: this.account.private_key},
                        });
                    break;
                default:
            }
        })
    };

    updateAccountName = (newName) =>{
        const {dispatch} = this.props;
        dispatch(update_account_name(this.account_key, newName, this.props.user.hashed_password));
        const {name} = this.props.accounts[this.account_key];
        this.props.navigation.setParams({
            title: name,
        })
    };

    async componentDidMount() {
        this.isMount = true;
        this.loadBalances();
    }

    componentWillUnmount() {
        this.isMount = false;
    }

    loadBalances=() => {
        const {accounts, dispatch, user} = this.props;
        getBalance(this.account.symbol, this.account.address).then(balance => {
            console.log("get balance " + this.account.symbol + ": " + balance);
            accounts[this.account_key].balance = balance;

            let tokens = accounts[this.account_key].tokens;

            let executors = [];
            Object.values(tokens).map(token => {
                executors.push(
                    new Promise((resolve, reject)=>{
                        fetchAccountTokenBalance(this.account.symbol, token.contractAddr, this.account.address).then(balance => {
                            console.log("get token " + token.name + " balance: " + balance);
                            token.balance = balance.shiftedBy(-(token.tokenDecimal-0));
                            resolve(token);
                        }, error => {
                            console.log("get token balance: failed.", error);
                            reject(error);
                        });
                    })
                );
            });
            Promise.all(executors).then(res=> {
                dispatch(update_accounts(accounts));
                console.log("isMount:" + this.isMount);
                this.isMount && this.setState({
                    refreshing: false,
                });
            }, errors => {
                console.log("get token balances failed: ", errors);
                this.isMount && this.setState({
                    refreshing: false,
                });
            });
        }).catch(err=>{
            console.log("get balance: symbol=" + this.account.symbol + ",address=" + this.account.address + " failed.", err);
            this.isMount && this.setState({
                refreshing: false,
            });
        });
    }

    selectTokens = () => {
        this.props.navigation.navigate('signed_select_coin', {
            account: this.account,
            tokenSelected: this.tokenSelected,
        });
    }

    tokenSelected=(token) => {
        const {dispatch, user} = this.props;
        dispatch(update_account_tokens(this.account_key, {
            [token.symbol]: token
        },user.hashed_password));
    }

    onSwipeOpen(Key: any) {
        this.setState({
            openRowKey: Key,
        });
    }

    onSwipeClose(Key: any) {
        this.setState({
            openRowKey: null,
        })
    }

    onDeleteToken(key) {
        console.log("delete key: " + key);

        const { dispatch, accounts, setting, user } = this.props;
        popCustom.show(
            strings('alert_title_warning'),
            strings('select_coin.warning_delete_token'),
            [
                { text: strings('cancel_button'), onPress:()=>this.setState({openRowKey: null})},
                { text: strings('delete_button'), onPress:()=>{
                        this.setState({
                            openRowKey: null,
                        },()=>setTimeout(()=>
                        {
                            dispatch(delete_account_token(this.account_key, key,
                                user.hashed_password));
                        }, 500));
                    }}
            ],
            {cancelable:false}
        )
    }
    onRefresh=() => {
        this.setState({
            refreshing: true
        });
        setTimeout(()=> {
            this.loadBalances();
        }, 1000);
    }

    render_item=({item, index})=> {
        const {setting, accounts} = this.props;
        let tokens = accounts[this.account_key].tokens;
        console.log('tokens=>',tokens);
        let token;

        const cellHeight = 60;
        // prepare image
        let imageIcon;
        let fastImageUrl;
        let balance;
        if (index > 0) {
            try {
                fastImageUrl = getTokenIconUrl(this.account.symbol, item.symbol, item.contractAddr);
            } catch (err) {
                console.log("get token icon url failed: ", err);
                // TODO: replace with a default icon
                imageIcon = COINS[this.account.symbol].icon;
            }
            token = tokens[item.symbol];
            balance = token.balance;
        } else {
            imageIcon = COINS[this.account.symbol].icon;
            balance = this.account.balance;
        }

       return (
           <SwipeableRow
               maxSwipeDistance={fixedHeight(186)}
               swipeEnabled={this.state.openRowKey === null && index !== 0}
               preventSwipeRight={true}
               shouldBounceOnMount={true}
               onOpen={() => this.onSwipeOpen(item.symbol)}
               onClose={() => this.onSwipeClose(item.symbol)}
               isOpen={item.symbol === this.state.openRowKey}
               slideoutView={
                   <View style={{
                       flexDirection: 'row',
                       alignItems: 'center',
                       flex: 1,
                       backgroundColor:'transparent',
                       height: cellHeight,
                       justifyContent:'flex-end',
                       borderRadius:5,
                       marginVertical:10,
                       marginHorizontal:20}}>
                       <TouchableOpacity
                           onPress={()=>{
                               this.onDeleteToken(item.symbol);
                           }}>
                           <View style={{
                               width: fixedHeight(186),
                               justifyContent: 'center',
                               height: cellHeight,
                               alignItems: 'center',
                               backgroundColor: '#fe0000',
                               borderRadius:5,
                           }}>
                               <Text style={{fontSize:14,color:'#fff'}}>{strings('delete_button')}</Text>
                           </View>
                       </TouchableOpacity>
                   </View>
               }
           >
               <TouchableOpacity
                   activeOpacity={1}
                   style={{
                       ...defaultStyles.shadow,
                       flexDirection: 'row',
                       borderRadius:5,
                       alignItems: 'center',
                       paddingVertical: 10,
                       paddingHorizontal: 20,
                       backgroundColor: '#fff',
                       justifyContent: 'space-between',
                       marginVertical:10,
                       marginHorizontal:20,
                       height: cellHeight,
                   }}
                   onPress={()=> {
                       if (this.state.openRowKey) {
                           this.setState({openRowKey: null});
                       } else {
                           this.props.navigation.navigate('signed_vault_account', {
                               account: this.account,
                               token: index === 0 ? undefined : token,
                           });
                       }
                   }}
               >
                   <View style={{flexDirection: 'row', alignItems: 'center'}}>
                       {
                           imageIcon !== undefined?
                               <Image style={{width: 30, height: 30}}
                                      source={imageIcon}
                                      resizeMode={'contain'}
                               />:
                               <FastImage style={{width: 30, height: 30}}
                                          source={{uri: fastImageUrl}}
                                          resizeMode={FastImage.resizeMode.contain}
                                          />
                       }
                       <Text numberOfLines={1} style={{paddingLeft: 10}}>{item.name}</Text>
                   </View>
                   <Text numberOfLines={1}>{new BigNumber(balance).toFixed(4) + ' ' + item.symbol}</Text>
                   </TouchableOpacity>
           </SwipeableRow>
       )
    };

    render() {
        const {accounts} = this.props;
        let tokens = accounts[this.account_key].tokens;
        let tokenList;
        if (tokens !== undefined) {
            tokenList = Object.values(tokens);
        } else {
            tokenList = [];
        }
        tokenList = [{symbol: this.account.symbol, name: COINS[this.account.symbol].name}, ...tokenList];

        const popwindowTop = Platform.OS==='ios'?(getStatusBarHeight(true)+Header.HEIGHT):Header.HEIGHT;
        let menuArray = [ACCOUNT_MENU[0]];
        if (this.account.type !== '[ledger]') {
            menuArray.push(ACCOUNT_MENU[1]);
        }

        const titleFontSize = 32;

        let typeIcon, typeText;
        switch(this.account.type) {
            case '[ledger]':
                typeIcon = require('../../../assets/account_le_symbol.png');
                typeText = strings('vault_import_source.from_ledger');
                break;
            case '[pk]':
                typeIcon = require('../../../assets/account_pk_symbol.png');
                typeText = strings('vault_import_source.from_private_key');
                break;
            default:
                typeIcon = require('../../../assets/account_mk_symbol.png');
                typeText = strings('vault_import_source.from_hd_wallet');
        }

        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                }}
                onPress={()=>{
                    this.state.openRowKey && this.setState({openRowKey: null});
                }}
            >
                <View style={{backgroundColor: mainColor, width: "100%", paddingVertical: 20, paddingHorizontal: 20}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10}}>
                        <Image style={{width: 20, height: 20, marginRight: 10}} resizeMode={'contain'} source={COINS[this.account.symbol].icon}/>
                        <Text style={{color: '#fff', marginRight: 20}}>{COINS[this.account.symbol].name}</Text>
                    {/*</View>*/}
                    {/*<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>*/}
                        <Image style={{width: 20, height: 20, marginRight: 10, tintColor:'#fff'}} resizeMode={'contain'} source={typeIcon}/>
                        <Text style={{color: '#fff'}}>{typeText}</Text>
                    </View>
                    <AddressComponent address={this.account.address} symbol={this.account.symbol}/>
                </View>
                <FlatList
                    style={{width: width}}
                    data={tokenList}
                    renderItem={this.render_item}
                    ItemSeparatorComponent={() => <View style={styles.divider}/>}
                    keyExtractor={(item, index) => item.symbol}
                    onScroll={e=> {
                        this.setState({
                            openRowKey: null,
                        });
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh}
                            title={'Loading'}
                            />
                    }
                />
                {/*Menu Pop window*/}
                {
                    this.state.showMenu?
                        <PopWindow
                            backgroundColor={'rgba(52,52,52,0.54)'}
                            onClose={(select)=>this.onCloseMenu(select)}
                            data={menuArray}
                            containerPosition={{position:'absolute', top:popwindowTop,right:5}}
                            imageStyle={{width: titleFontSize, height: 20, marginRight:10}}
                            fontStyle={{fontSize:12, color:'#000'}}
                            itemStyle={{flexDirection:'row',justifyContent:'flex-start', alignItems:'center', marginVertical: 10}}
                            containerBackgroundColor={'#fff'}
                            ItemSeparatorComponent={()=><View style={styles.divider}/>}
                        />
                        :null
                }
            </TouchableOpacity>
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
    return ({
        setting: state.setting,
        accounts: state.accounts,
        user: state.user,
    });
})(AccountTokens);