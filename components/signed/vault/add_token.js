import {strings} from '../../../locales/i18n';
import {Dimensions, View, TouchableOpacity, Keyboard, PixelRatio, StyleSheet, Image, ScrollView, Platform} from 'react-native';
import {connect} from 'react-redux';
import React, {Component} from 'react';
import {RightActionButton,SubTextInput} from '../../common';
import {mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';
import {accountKey} from '../../../utils';
import {validateAddress, fetchTokenDetail, fetchAccountTokenBalance} from "../../../coins/api";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Loading from '../../loading';
import BigNumber from "./select_coin";

const MyscrollView = Platform.OS === 'ios'? KeyboardAwareScrollView:ScrollView;
const {width} = Dimensions.get('window');

class AddToken extends Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: strings('add_token.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <RightActionButton
                    btnTitle={strings('add_token.btn_add_token')}
                    onPress={() => {
                        const addToken = navigation.state.params.addToken;
                        addToken();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                />
            )
        })
    };

    constructor(props) {
        super(props);
        this.state = {
            contractAddress: '',
            tokenName: '',
            symbol: '',
            decimals: '',
        };
        this.account = props.navigation.getParam('account');
    }

    componentWillMount() {
        this.props.navigation.setParams({
            addToken: this.addToken,
            isEdited: false
        });
    }

    async componentWillReceiveProps(props) {
        let oldData = this.props.navigation.getParam('scanned');
        let scannedData = props.navigation.getParam('scanned', '');
        if (scannedData !== '' && oldData !== scannedData) {
            this.setState({
                contractAddress: scannedData,
            });
            this.fetchTokenDetail(scannedData);
        }
    }

    addToken=() => {
        const {tokenSelected, targetUri} = this.props.navigation.state.params;
        const {symbol, tokenName, decimals, contractAddress} = this.state;
        const {accounts, setting, navigation} = this.props;
        let account_key = accountKey(this.account.symbol, this.account.address);
        let tokens = accounts[account_key].tokens;
        if (tokens !== undefined &&
            tokens[symbol] !== undefined) {
            AppToast.show(strings('add_token.toast_token_exists'), {
                position: 0,
            });
            return;
        }
        this.loadingView.show();

        fetchAccountTokenBalance(this.account.symbol, contractAddress, this.account.address).then(balance=> {
            this.loadingView.hide();
            tokenSelected({
                symbol: symbol,
                contractAddr: contractAddress,
                name: tokenName,
                tokenDecimal: decimals,
                balance: balance.shiftedBy(-(decimals-0)),
                tokenTxs: {},
            });
            navigation.navigate(targetUri);
        }).catch(err=> {
            this.loadingView.hide();

            tokenSelected({
                symbol: symbol,
                contractAddr: contractAddress,
                name: tokenName,
                tokenDecimal: decimals,
                balance: new BigNumber(0),
                tokenTxs: {},
            });
            navigation.navigate(targetUri);

        });

    }

    scan=() => {
        this.props.navigation.navigate('scan', {
            success: 'signed_add_token',
            validate: (data, callback)=>{
                validateAddress(data.data, this.account.symbol).then(result => {
                    if (result) {
                        callback(true);
                    } else {
                        callback(false, strings('error_invalid_qrcode'));
                    }
                });
            }
        });
    }

    // updateEditStatus=(contractAddress, tokenName, symbol, decimals)=>{
    //     let allFilled = contractAddress.length !== 0
    //     && tokenName.length !== 0
    //     && symbol.length !== 0
    //     && decimals.length !== 0;
    //     console.log("current isEdit:" + this.props.navigation.getParam('isEdited'));
    //     console.log("allFilled: " + allFilled);
    //     if (allFilled !== this.props.navigation.getParam('isEdited')) {
    //         this.props.navigation.setParams({
    //             isEdited: allFilled
    //         })
    //     }
    // }

    fetchTokenDetail=(address) => {
        this.loadingView.show();
        fetchTokenDetail(this.account.symbol, address).then(symbol => {
            this.setState({
                contractAddress: address,
                tokenName: symbol.name,
                symbol: symbol.symbol,
                decimals: symbol.decimals
            });
            this.props.navigation.setParams({
                isEdited: true
            });
            this.loadingView.hide();
        }).catch(err=> {
            console.log("fetch token detail for address: " + address + " failed:", err);
            AppToast.show(strings('add_token.toast_fetch_token_detail_fail'));
            this.props.navigation.setParams({
                isEdited: false
            });
            this.loadingView.hide();
        });
    }

    render() {
        return (
            <View style={{flex:1, backgroundColor: mainBgColor}}>
                <MyscrollView
                    contentContainerStyle={{justifyContent: 'center'}}
                    keyboardShouldPersistTaps='always'
                >
                    <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={() => {Keyboard.dismiss()}}>
                        <View style={{...styles.containerView, marginVertical: 30}}>
                            <SubTextInput
                                title={strings('add_token.label_contract_address')}
                                style={styles.text_input}
                                value={this.state.contractAddress}
                                multiline={true}
                                onChangeText={v=>{
                                    this.setState({contractAddress: v},
                                        () => {
                                            validateAddress(v, this.account.symbol).then(result=> {
                                               if (result) {
                                                   this.fetchTokenDetail(v);
                                               } else {
                                                   this.props.navigation.setParams({
                                                       isEdited: false
                                                   })
                                               }
                                            });
                                            // this.updateEditStatus(v, this.state.tokenName, this.state.symbol, this.state.decimals);
                                        });

                                }}
                                placeholder={strings('add_token.hint_contract_address')}
                                rightView={()=>
                                    <TouchableOpacity onPress={()=> this.scan()}>
                                        <Image source={require('../../../assets/icon_scan.png')} style={{width: 20, height: 20,tintColor:'#000'}} resizeMode={'contain'} />
                                    </TouchableOpacity>}
                                />
                            <SubTextInput
                                title={strings('add_token.label_token_name')}
                                style={styles.text_input}
                                value={this.state.tokenName}
                                multiline={false}
                                editable={false}
                                // onChangeText={v=>{
                                //     this.setState({tokenName: v});
                                //     this.updateEditStatus(this.state.contractAddress, v, this.state.symbol, this.state.decimals);
                                // }}
                                // placeholder={strings('add_token.hint_token_name')}
                            />
                            <SubTextInput
                                title={strings('add_token.label_symbol')}
                                style={styles.text_input}
                                value={this.state.symbol}
                                multiline={false}
                                editable={false}
                                // onChangeText={v=>{
                                //     this.setState({symbol: v});
                                //     this.updateEditStatus(this.state.contractAddress, this.state.tokenName, v, this.state.decimals);
                                // }}
                                // placeholder={strings('add_token.hint_symbol')}
                            />
                            <SubTextInput
                                title={strings('add_token.label_decimals')}
                                style={styles.text_input}
                                value={this.state.decimals}
                                multiline={false}
                                editable={false}
                                // onChangeText={v=>{
                                //     this.setState({symbol: v});
                                //     this.updateEditStatus(this.state.contractAddress, this.state.tokenName, this.state.symbol, v);
                                // }}
                                // placeholder={strings('add_token.hint_decimals')}
                            />
                        </View>
                    </TouchableOpacity>
                </MyscrollView>
                <Loading ref={element=> {
                    this.loadingView = element;
                }}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    text_input: {
        flex: 1,
        fontSize: 16,
        color: '#777676',
        fontWeight: 'normal',
        borderColor: '#8c8a8a',
        textAlignVertical:'bottom',
        borderBottomWidth: 1/ PixelRatio.get(),
        // paddingVertical: 10,
    },
    containerView: {
        ...defaultStyles.shadow,
        width:width-40,
        marginHorizontal:20,
        marginVertical: 10,
        paddingHorizontal:30,
        paddingVertical:10,
        justifyContent:'center',
        alignItems:'center',
        borderWidth:1/ PixelRatio.get(),
        backgroundColor:'#fff',
        borderColor:'#eee',
        borderRadius:10,
        // flex: 1,
    }
});

export default connect( state => {
    return {
        accounts: state.accounts,
        user: state.user,
        setting: state.setting,
    };

})(AddToken);
