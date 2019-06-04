import React, {Component} from 'react';
import { connect } from 'react-redux';
import {PixelRatio, StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, FlatList} from 'react-native';
import {accountKey} from '../../../utils';
import {mainBgColor, fixedHeight} from '../../style_util';
import {COINS} from '../../../coins/support_coin_list';
import SwipeableRow from '../../swipeCell';
import FastImage from 'react-native-fast-image';
import {getTokenIconUrl} from '../../../coins/api';
import {update_account_tokens, delete_account_token} from '../../../actions/accounts';

const {width} = Dimensions.get('window');

class AccountTokens extends Component {
    static navigationOptions = ({navigation}) => {
        return ({
            title: 'test',
            headerRight: (
                <TouchableOpacity onPress={()=> {
                    navigation.state.params.selectTokens();
                }}>
                    <Image style={{width: 20, height: 20, marginRight: 20, tintColor: 'white'}}
                           resizeMode={'contain'}
                           source={require('../../../assets/icon_add.png')}
                    />
                </TouchableOpacity>
            )
        });
    };
    constructor(props) {
        super(props);
        this.account = this.props.navigation.state.params.account;
        this.account_key = accountKey(this.account.symbol, this.account.address);

        const {setting, accounts} = this.props;
        let explorer_server = setting.explorer_server;
        let tokens = accounts[this.account_key].tokens;
        let tokensInfos = {};
        if (tokens !== undefined) {
            let tokenSymbols = Object.keys(tokens[explorer_server]);
            if (tokenSymbols.length > 0) {
                tokenSymbols.forEach(ts => {
                    tokensInfos[ts] = {};
                });
            }
        }
        this.state = {
            tokens: tokensInfos,
        };
        this.props.navigation.setParams({
            selectTokens: this.selectTokens,
        });
    }

    componentWillMount() {
        // TODO: get balances
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

    render_item=({item, index})=> {
        console.log("item:", item);
       const cellHeight = 80;
       let imageIcon;
       let fastImageUrl;
       if (index > 0) {
           try {
               fastImageUrl = getTokenIconUrl(this.account.symbol, item.symbol, item.contractAddr);
           } catch (err) {
               console.log("get token icon url failed: ", err);
               // TODO: replace with a default icon
               imageIcon = COINS[this.account.symbol].icon;
           }
       } else {
           imageIcon = COINS[this.account.symbol].icon;
       }
       return (
           <SwipeableRow
               maxSwipeDistance={fixedHeight(186)}
               swipeEnabled={false}
               preventSwipeRight={true}
               shouldBounceOnMount={true}
               isOpen={false}
               slideoutView={<View/>}
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
                   onPress={()=> {}}
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
                   <Text numberOfLines={1}>0.00</Text>
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
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
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
    return {
        setting: state.setting,
        accounts: state.accounts,
        user: state.user,
    };
})(AccountTokens);