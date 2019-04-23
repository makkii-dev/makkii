import {strings} from '../../../locales/i18n';
import { connect } from 'react-redux';
import React, {Component} from 'react';
import {View, FlatList, StyleSheet, PixelRatio, TouchableOpacity, Dimensions, Text, Image} from 'react-native';
import {fetchAccountTokenBalance} from '../../../utils';
import Loading from '../../loading';
import SwipeableRow from '../../swipeCell';
import {RightActionButton} from '../../common';
import {mainBgColor, fixedHeight} from '../../style_util';
import {update_account_tokens, delete_account_token} from '../../../actions/accounts';
import BigNumber from 'bignumber.js';

const {width} = Dimensions.get('window');

class SelectCoin extends Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: strings('select_coin.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <RightActionButton
                    btnTitle={strings('select_coin.btn_add_token')}
                    onPress={() => {
                        navigation.navigate('signed_add_token', {
                            address: navigation.getParam('address'),
                            tokenAdded: navigation.getParam('tokenAdded'),
                        });
                    }}
                />
            )
        });
    };

    constructor(props) {
        super(props);
        this.state = {
            openRowKey: null,
        };
        this.props.navigation.setParams({
            tokenAdded: this.tokenAdded,
        });
    }

    tokenAdded= (token) => {
        const {dispatch, navigation, setting, user} = this.props;
        dispatch(update_account_tokens(navigation.getParam('address'), token, setting.explorer_server, user.hashed_password));
    };

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

        const { dispatch } = this.props;
        popCustom.show(
            strings('alert_title_warning'),
            strings('select_coin.warning_delete_token'),
            [
                {text: strings('cancel_button'),onPress:()=>this.setState({openRowKey: null})},
                {text: strings('delete_button'), onPress:()=>{
                        this.setState({
                            openRowKey: null,
                        },()=>setTimeout(()=>
                        {
                            let address = this.props.navigation.getParam('address');
                            let explorer_server = this.props.setting.explorer_server;
                            const tokens = this.props.accounts[address].tokens[explorer_server];

                            this.loadingView.show();
                            // fetch account balance
                            fetchAccountTokenBalance(tokens[key].contractAddr, address)
                            .then(res => {
                                if (!res.eq(new BigNumber(0))) {
                                    this.loadingView.hide();
                                    AppToast.show(strings('select_coin.toast_delete_token_not_empty'), {
                                        position: 0
                                    });
                                    return;
                                }
                                dispatch(delete_account_token(address, key,
                                    explorer_server,
                                    this.props.user.hashed_password));
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

    render_item= ({item, index}) => {
        const cellHeight = 60;
        return (
                <SwipeableRow maxSwipeDistance={fixedHeight(186)}
                          onOpen={()=>this.onSwipeOpen(item.symbol)}
                          onClose={()=>this.onSwipeClose(item.symbol)}
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
                          isOpen={item.symbol === this.state.openRowKey}
                          swipeEnabled={this.state.openRowKey === null && index !== 0}
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
                                          console.log("selected: " + item.name);
                                          const {coinSelected} = this.props.navigation.state.params;
                                          coinSelected(item.symbol);
                                          this.props.navigation.goBack();
                                      } else {
                                          this.setState({openRowKey: null});
                                      }
                                  }
                  }>
                    <Text numberOfLines={1}>{item.name}</Text>
                    <Image style={{width: 24, height: 24}}
                           source={require('../../../assets/arrow_right.png')} />
                </TouchableOpacity>
            </SwipeableRow>
        )
    };

    render() {
        let address = this.props.navigation.getParam('address');
        let explorer_server = this.props.setting.explorer_server;
        let tokens = this.props.accounts[address].tokens[explorer_server];
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    flex: 1,
                    paddingTop: 20,
                }}
                onPress={()=> {
                    this.setState({openRowKey: null})
                }}
            >
                    <FlatList
                        style={{width: width}}
                        data={[{symbol: 'AION', name: 'AION'}, ...Object.values(tokens)]}
                        renderItem={this.render_item}
                        ItemSeparatorComponent={() => <View style={styles.divider}/>}
                        keyExtractor={(item, index) => item.symbol}
                    />
                <Loading ref={element => {
                    this.loadingView = element;
                }}/>
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

export default connect( state => {
    return {
        setting: state.setting,
        accounts: state.accounts,
        user: state.user,
    };
})(SelectCoin);
