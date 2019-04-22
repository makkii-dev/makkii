import {strings} from '../../../locales/i18n';
import {Dimensions, View, TouchableOpacity, Keyboard, PixelRatio, StyleSheet, Image, ScrollView, Platform} from 'react-native';
import {connect} from 'react-redux';
import React, {Component} from 'react';
import {RightActionButton} from '../../common';
import {mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';
import {SubTextInput} from '../../common';
import {validateAddress} from '../../../utils';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

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
                ></RightActionButton>
            )
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            contractAddress: '',
            tokenName: '',
            symbol: '',
            decimals: '18',
        };
    }

    componentWillMount() {
        this.props.navigation.setParams({
            addToken: this.addToken,
            isEdited: false
        });
    }

    async componentWillReceiveProps(props) {
        let scannedData = props.navigation.getParam('scanned', '');
        if (scannedData != '') {
            this.setState({
                contractAddress: scannedData,
            });
            this.updateEditStatus(this.state.contractAddress, this.state.tokenName, this.state.symbol, this.state.decimals);
        }
    }

    addToken=() => {
        const {tokenAdded} = this.props.navigation.state.params;
        const {symbol, tokenName, decimals, contractAddress} = this.state;
        tokenAdded(
            {[symbol]: {
                symbol: symbol,
                contractAddr: contractAddress,
                name: tokenName,
                tokenDecimal: decimals,
                balance: new BigNumber(0),
                tokenTxs: {},
            }});
        this.props.navigation.goBack();
    }

    scan=() => {
        this.props.navigation.navigate('scan', {
            success: 'signed_add_token',
            validate: function(data) {
                let pass = validateAddress(data.data);
                return {
                    pass: pass,
                    err: pass? '': strings('error_invalid_qrcode')
                }
            }
        });
    }

    updateEditStatus=(contractAddress, tokenName, symbol, decimals)=>{
        let allFilled = contractAddress.length != 0
        && tokenName.length != 0
        && symbol.length != 0
        && decimals.length != 0;
        console.log("current isEdit:" + this.props.navigation.getParam('isEdited'));
        console.log("allFilled: " + allFilled);
        if (allFilled != this.props.navigation.getParam('isEdited')) {
            this.props.navigation.setParams({
                isEdited: allFilled
            })
        }
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
                                    this.setState({contractAddress: v});
                                    this.updateEditStatus(v, this.state.tokenName, this.state.symbol, this.state.decimals);
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
                                onChangeText={v=>{
                                    this.setState({tokenName: v});
                                    this.updateEditStatus(this.state.contractAddress, v, this.state.symbol, this.state.decimals);
                                }}
                                placeholder={strings('add_token.hint_token_name')}
                            />
                            <SubTextInput
                                title={strings('add_token.label_symbol')}
                                style={styles.text_input}
                                value={this.state.symbol}
                                multiline={false}
                                onChangeText={v=>{
                                    this.setState({symbol: v});
                                    this.updateEditStatus(this.state.contractAddress, this.state.tokenName, v, this.state.decimals);
                                }}
                                placeholder={strings('add_token.hint_symbol')}
                            />
                            <SubTextInput
                                title={strings('add_token.label_decimals')}
                                style={styles.text_input}
                                value={this.state.decimals}
                                multiline={false}
                                onChangeText={v=>{
                                    this.setState({symbol: v});
                                    this.updateEditStatus(this.state.contractAddress, this.state.tokenName, this.state.symbol, v);
                                }}
                                placeholder={strings('add_token.hint_decimals')}
                            />
                        </View>
                    </TouchableOpacity>
                </MyscrollView>
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
})

export default connect( state => {
    return {
        accounts: state.accounts,
        user: state.user,
        setting: state.setting,
    };

})(AddToken);