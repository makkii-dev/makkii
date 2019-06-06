import React, {Component} from 'react';
import {strings} from '../../../locales/i18n';
import { connect } from 'react-redux';
import {Platform, PixelRatio, StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, FlatList} from 'react-native';
import {navigationSafely, getStatusBarHeight, accountKey} from '../../../utils';
import {mainBgColor, fixedHeight} from '../../style_util';
import {COINS} from '../../../coins/support_coin_list';
import SwipeableRow from '../../swipeCell';
import FastImage from 'react-native-fast-image';
import {getTokenIconUrl, fetchAccountTokenBalance, getBalance} from '../../../coins/api';
import {update_account_name, accounts as update_accounts, update_account_tokens, delete_account_token} from '../../../actions/accounts';
import BigNumber from 'bignumber.js';
import {PopWindow} from "./home_popwindow";
import {Header} from 'react-navigation';
import {ACCOUNT_MENU} from "./constants";

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
        this.loadBalances();
    }

    loadBalances=() => {
        const {setting, accounts, dispatch, user} = this.props;
        getBalance(this.account.symbol, this.account.address).then(balance => {
            console.log("get balance " + this.account.symbol + ": " + balance);
            accounts[this.account_key].balance = balance;

            let explorer_server = setting.explorer_server;
            let tokens = accounts[this.account_key].tokens;

            let executors = [];
            Object.values(tokens[explorer_server]).map(token => {
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
            }, errors => {
                console.log("get token balances failed: ", errors);
            });
        }).catch(err=>{
            console.log("get balance: symbol=" + this.account.symbol + ",address=" + this.account.address + " failed.", err);
        });
    }

    selectTokens = () => {
        this.props.navigation.navigate('signed_select_coin', {
            account: this.account,
            tokenSelected: this.tokenSelected,
        });
    }

    tokenSelected=(token) => {
        const {dispatch, setting, user} = this.props;
        dispatch(update_account_tokens(this.account_key, {
            [token.symbol]: token
        }, setting.explorer_server, user.hashed_password));
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
                            let explorer_server = setting.explorer_server;

                            dispatch(delete_account_token(this.account_key, key,
                                explorer_server,
                                user.hashed_password));
                        }, 500));
                    }}
            ],
            {cancelable:false}
        )
    }

    render_item=({item, index})=> {
        const {setting, accounts} = this.props;
        let explorer_server = setting.explorer_server;
        let tokens = accounts[this.account_key].tokens;
        let token;

        const cellHeight = 80;
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
            token = tokens[explorer_server][item.symbol];
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
                       justifyContent:'flex-end'}}>
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
                       flexDirection: 'row',
                       alignItems: 'center',
                       paddingVertical: 10,
                       paddingHorizontal: 20,
                       backgroundColor: '#fff',
                       justifyContent: 'space-between',
                       height: cellHeight,
                   }}
                   onPress={()=> {
                       this.props.navigation.navigate('signed_vault_account', {
                           account: this.account,
                           token: index === 0? undefined: token,
                       });
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
        const {setting, accounts} = this.props;
        let explorer_server = setting.explorer_server;
        let tokens = accounts[this.account_key].tokens;
        let tokenList;
        if (tokens !== undefined && tokens[explorer_server] !== undefined) {
            tokenList = Object.values(tokens[explorer_server]);
        } else {
            tokenList = [];
        }
        tokenList = [{symbol: this.account.symbol, name: COINS[this.account.symbol].name}, ...tokenList];

        const popwindowTop = Platform.OS==='ios'?(getStatusBarHeight(true)+Header.HEIGHT):Header.HEIGHT;
        let menuArray = [ACCOUNT_MENU[0]];
        if (this.account.type !== '[ledger]') {
            menuArray.push(ACCOUNT_MENU[1]);
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
            >
                <FlatList
                    style={{width: width}}
                    data={tokenList}
                    renderItem={this.render_item}
                    ItemSeparatorComponent={() => <View style={styles.divider}/>}
                    keyExtractor={(item, index) => item.symbol}
                />
                {/*Menu Pop window*/}
                {
                    this.state.showMenu?
                        <PopWindow
                            backgroundColor={'rgba(52,52,52,0.54)'}
                            onClose={(select)=>this.onCloseMenu(select)}
                            data={menuArray}
                            containerPosition={{position:'absolute', top:popwindowTop,right:5}}
                            imageStyle={{width: 20, height: 20, marginRight:10}}
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