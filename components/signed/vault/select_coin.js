import {strings} from '../../../locales/i18n';
import { connect } from 'react-redux';
import React, {Component} from 'react';
import {Keyboard, Button, ActivityIndicator, TextInput, View, FlatList, StyleSheet, PixelRatio, TouchableOpacity, Dimensions, Text, Image} from 'react-native';
import {accountKey} from '../../../utils';
import Loading from '../../loading';
import SwipeableRow from '../../swipeCell';
import {mainBgColor, fixedHeight} from '../../style_util';
import {delete_account_token} from '../../../actions/accounts';
import BigNumber from 'bignumber.js';
import {COINS} from '../../../coins/support_coin_list';
import {fetchAccountTokenBalance, searchTokens, getTopTokens, getTokenIconUrl} from '../../../coins/api';
import FastImage from 'react-native-fast-image';

const {width} = Dimensions.get('window');

class SelectCoin extends Component {
    static navigationOptions = ({navigation})=> {
        return ({
            headerTitle: <View style={{flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <TextInput
                        style={{
                            fontSize: 16,
                            color: 'white',
                            width: '100%',
                            paddingLeft: 5,
                            paddingRight: 5,
                        }}
                        value={navigation.state.params.searchstring}
                        placeholder={strings('select_coin.placeholder_search_token')}
                        onChangeText={e=> {
                            navigation.setParams({
                                isClearable: e.length > 0,
                                searchstring: e,
                            });

                            navigation.state.params.searchToken(e);
                        }}
                    />
                </View>,
            headerRight: (
                (navigation.state.params && navigation.state.params.isClearable)?
                    <TouchableOpacity onPress={()=> {
                            navigation.setParams({
                                searchstring: '',
                                isClearable: false
                            });
                            navigation.state.params.searchToken('');
                        }
                    }>
                        <Image style={{width: 20, height: 20, marginRight: 20, tintColor: 'white'}}
                               resizeMode={'contain'}
                               source={require('../../../assets/clear.png')}
                               />
                    </TouchableOpacity>
                        // navigation.navigate('signed_add_token', {
                        //     account: navigation.getParam('account'),
                        //     tokenAdded: navigation.getParam('tokenAdded'),
                :null
            )
        });
    };


    constructor(props) {
        super(props);
        this.account = this.props.navigation.state.params.account;
        this.account_key = accountKey(this.account.symbol, this.account.address);
        this.state = {
            isLoading: true,
            openRowKey: null,
            tokens: [],
        };
        this.props.navigation.setParams({
            searchToken: this.searchToken,
        });
    }

    searchToken = (keyword) => {
        let loadingView = this.loadingView;
        loadingView.show(null, {
            position: 'top'
        });

        if (keyword.length !== 0) {
            searchTokens(this.account.symbol, keyword).then(res => {
                console.log("search token res,", res);
                loadingView.hide();
                if (res.length === 0) {
                    Keyboard.dismiss();
                }
                this.setState({
                    tokens: res,
                });
            }).catch(err => {
                console.log("search token failed:", err);
                loadingView.hide();
            });
        } else {
            getTopTokens(this.account.symbol).then(res => {
                loadingView.hide();
                this.setState({
                    tokens: res,
                });
            }).catch(err => {
                loadingView.hide();
            });
        }
    }

    async componentWillMount() {
        getTopTokens(this.account.symbol).then(res => {
            this.setState({
                isLoading: false,
                tokens: res,
            });
        }).catch(err => {
            this.setState({
                isLoading: false,
                tokens: [],
            });
        });
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
                            const tokens = accounts[this.account_key].tokens[explorer_server];

                            this.loadingView.show();
                            // fetch account balance
                            fetchAccountTokenBalance(this.account.symbol,tokens[key].contractAddr, this.account.address)
                            .then(res => {
                                if (!res.eq(new BigNumber(0))) {
                                    this.loadingView.hide();
                                    AppToast.show(strings('select_coin.toast_delete_token_not_empty'), {
                                        position: 0
                                    });
                                    return;
                                }
                                dispatch(delete_account_token(account_key, key,
                                    explorer_server,
                                    user.hashed_password));
                                this.loadingView.hide();
                            }).catch(err => {
                                this.loadingView.hide();
                                AppToast.show(strings('select_coin.toast_get_token_balance_fail'), {
                                    position: 0
                                });
                            });
                        }, 500));
                    }}
            ],
            {cancelable:false}
        )
    }

    addCustomToken=()=> {
        this.props.navigation.navigate('signed_add_token', {
            account: this.account,
            tokenSelected: this.props.navigation.getParam('tokenSelected'),
            targetUri: 'signed_vault_account_tokens',
        });
    }

    render_item= ({item, index}) => {
        const cellHeight = 60;
        // prepare icon
        let icon = undefined;
        let fastIcon = undefined;
        try {
            fastIcon = getTokenIconUrl(this.account.symbol, item.symbol, item.contractAddr);
        } catch (err) {
            icon = COINS[this.account.symbol].icon;
        }
        // prepare right indicator
        const {setting, accounts} = this.props;
        let explorer_server = setting.explorer_server;
        let tokens = accounts[this.account_key].tokens;
        let isAdded = false;
        if (tokens !== undefined && tokens[explorer_server] !== undefined) {
            isAdded = Object.keys(tokens[explorer_server]).indexOf(item.symbol) >= 0;
        }
        return (
                <SwipeableRow maxSwipeDistance={fixedHeight(186)}
                          onOpen={()=>this.onSwipeOpen(item.address)}
                          onClose={()=>this.onSwipeClose(item.address)}
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
                          isOpen={item.address === this.state.openRowKey}
                          swipeEnabled={/*this.state.openRowKey === null && index !== 0*/false}
                          preventSwipeRight={true}
                          shouldBounceOnMount={true}
            >
                <TouchableOpacity activeOpacity={1}
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
                                      if (this.state.openRowKey === null) {
                                          if (!isAdded) {
                                              console.log("selected: " + item.name);

                                              this.loadingView.show(null, {
                                                  position: 'top'
                                              });

                                              const {tokenSelected} = this.props.navigation.state.params;
                                              fetchAccountTokenBalance(this.account.symbol, item.contractAddr, this.account.address).then(balance=> {
                                                  this.loadingView.hide();

                                                  tokenSelected({
                                                      symbol: item.symbol,
                                                      contractAddr: item.contractAddr,
                                                      name: item.name,
                                                      tokenDecimal: item.tokenDecimal,
                                                      balance: balance.shiftedBy(-(item.tokenDecimal-0)),
                                                      tokenTxs: {},
                                                  });
                                                  this.props.navigation.goBack();
                                              }).catch(err=> {
                                                  this.loadingView.hide();

                                                  tokenSelected({
                                                      symbol: item.symbol,
                                                      contractAddr: item.contractAddr,
                                                      name: item.name,
                                                      tokenDecimal: item.tokenDecimal,
                                                      balance: new BigNumber(0),
                                                      tokenTxs: {},
                                                  });
                                                  this.props.navigation.goBack();
                                              });

                                          }
                                      } else {
                                          this.setState({openRowKey: null});
                                      }
                                  }
                  }>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {
                            fastIcon !== undefined?
                                <FastImage
                                    style={{width: 30, height: 30}}
                                    source={{uri: fastIcon}}
                                    resizeMode={FastImage.resizeMode.contain}
                                />:
                                <Image style={{width: 30, height: 30}}
                                       source={icon}
                                       resizeMode={'contain'}
                                />
                        }
                        <Text numberOfLines={1} style={{paddingLeft: 10}}>{item.symbol + '-' + item.name}</Text>
                    </View>
                    {/*<Image style={{width: 24, height: 24}}*/}
                           {/*source={require('../../../assets/arrow_right.png')} />*/}
                    {
                        isAdded?<Text numberOfLines={1}>{strings('select_coin.label_is_added')}</Text>:null
                    }
                </TouchableOpacity>
            </SwipeableRow>
        )
    };

    // loading page
    renderLoadingView() {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator
                    animating={true}
                    color='red'
                    size="large"
                />
            </View>
        );
    }

    renderData() {
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    flex: 1,
                }}
                onPress={()=> {
                    this.setState({openRowKey: null})
                }}
            >
                <FlatList
                    style={{width: width}}
                    data={this.state.tokens}
                    renderItem={this.render_item}
                    ItemSeparatorComponent={() => <View style={styles.divider}/>}
                    keyExtractor={(item, index) => item.contractAddr}
                />
            </TouchableOpacity>
        )
    }

    renderEmptyView() {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: mainBgColor
            }}>
                <View style={{width: width, height: 180, justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('../../../assets/empty_account.png')}
                           style={{width: 80, height: 80, tintColor: 'gray', marginBottom: 20}}
                           resizeMode={'contain'}
                    />
                    <Text style={{color: 'gray', marginBottom: 20}}>{strings('select_coin.no_token_found')}</Text>
                    <Button title={strings('select_coin.btn_custom_token')} onPress={this.addCustomToken}/>
                </View>
            </View>
        );
    }

    render() {
        return (
            <View style={{flex: 1}}>
                {
                    this.state.isLoading? this.renderLoadingView(): this.state.tokens.length !== 0?this.renderData(): this.renderEmptyView()
                }
                <Loading ref={element => {
                    this.loadingView = element;
                }}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    divider: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#dfdfdf'
    }
});

export default connect( state => {
    return {
        setting: state.setting,
        accounts: state.accounts,
        user: state.user,
    };
})(SelectCoin);
