import React from 'react';
import {
    View,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    InteractionManager,
    Dimensions,
} from 'react-native';
import {strings} from "../../../locales/i18n";
import BigNumber from "bignumber.js";
import {fetchRequest} from "../../../utils";
import {connect} from "react-redux";
import {ImportListfooter} from "../../common";
import defaultStyles from '../../styles';
import {mainBgColor} from '../../style_util';
import PendingComponent from "./pendingComponent";

const {width} = Dimensions.get('window');

class TransactionHistory extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('account_view.transaction_history_label'),
        };
    };
    state={
        transactions:{},
        totalPages:0,
        currentPage:0,
        footerState:0,
        isLoading: true,
    };
    constructor(props){
        super(props);
        this.account = this.props.navigation.state.params.account;
    }



    componentWillMount(){
        InteractionManager.runAfterInteractions(()=>{
            this.fetchAccountTransacions(this.account,this.state.currentPage)
        });
        this.isMount = true;
    }


    componentWillUnmount(): void {
        this.isMount = false;
    }


    fetchAccountTransacions = (address, page=0, size=25)=>{
        let {currentPage,totalPages,transactions} = this.state;
        const url = `https://${this.props.setting.explorer_server}-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address}&page=${page}&size=${size}`;
        fetchRequest(url).then(res=>{
            let txs = {};
            if(!res.page){
                this.isMount&&this.setState({
                    currentPage,
                    totalPages,
                    transactions,
                    isLoading: false,
                    footerState:1
                });
                return;
            }
            if(res.page){
                currentPage = res.page.number;
                totalPages  = res.page.totalPages;
            }
            if(res.content&&res.content.length>0){
                res.content.forEach(value=>{
                    let tx={};
                    tx.hash = '0x'+value.transactionHash;
                    tx.timestamp = value.transactionTimestamp/1000;
                    tx.from = '0x'+value.fromAddr;
                    tx.to = '0x'+value.toAddr;
                    tx.value = this.props.setting.explorer_server==='mastery'?new BigNumber(value.value,10).toNumber():new BigNumber(value.value,16).shiftedBy(-18).toNumber();
                    tx.status = value.txError === ''? 'CONFIRMED':'FAILED';
                    tx.blockNumber = value.blockNumber;
                    txs[tx.hash]=tx;
                });
                transactions = Object.assign({},transactions,txs);
            }
            this.isMount&&this.setState({
                    currentPage,
                    totalPages,
                    transactions,
                    isLoading: false,
                    footerState:Object.values(transactions).length>=25?0:1
                })
        },error => {
            console.log(error);
            this.isMount&&this.setState({
                currentPage,
                totalPages,
                transactions,
                isLoading: false,
                footerState:0
            })
        })
    };

    _renderTransaction(transaction){
        if(transaction.status === 'PENDING'){
            console.log('try to get transaction '+transaction.hash+' status');
            listenTx.addTransaction(transaction);
        }

        const timestamp = new Date(transaction.timestamp).Format("yyyy/MM/dd hh:mm");
        const isSender = transaction.from === this.account;
        const value = isSender? '-'+new BigNumber(transaction.value).toNotExString(): '+'+new BigNumber(transaction.value).toNotExString();
        const valueColor = isSender? 'red':'green';
        return (
            <TouchableOpacity
                style={{...defaultStyles.shadow,marginHorizontal:20,marginVertical:10, borderRadius:10,
                    width:width-40,height:80,backgroundColor:'#fff', justifyContent:'space-between', padding:10}}
                onPress={e => {
                    this.props.navigation.navigate('signed_vault_transaction',{
                        account:this.account,
                        transaction: transaction,
                    });
                }}
            >
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <Text>{timestamp}</Text>
                    <PendingComponent status={transaction.status}/>
                </View>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end'}}>
                    <Text>{transaction.hash.substring(0, 16) + '...' }</Text>
                    <Text style={{color:valueColor}}>{value} <Text>AION</Text></Text>
                </View>
            </TouchableOpacity>
        )
    }


    _onEndReached(){
        // if not in fetching account
        if (this.state.footerState !== 0){
            return;
        }
        // set footer state
        this.setState({
            footerState: 2,
        },()=>{setTimeout(()=>this.fetchAccountTransacions(this.account, this.state.currentPage+1),500)});
    }



    // loading page
    renderLoadingView() {
        return (
            <View style={{flex:1,alignItems:'center', justifyContent:'center', backgroundColor: mainBgColor}}>
                <ActivityIndicator
                    animating={true}
                    color='red'
                    size="large"
                />
            </View>
        );
    }

    render() {
        if (this.state.isLoading) {
            return this.renderLoadingView();
        } else {

            let propTxs = this.props.accounts[this.account].transactions[this.props.setting.explorer_server]
            const transactions = Object.values(Object.assign({}, this.state.transactions, propTxs)).sort((a, b) => b.timestamp - a.timestamp);
            return (
                <View style={{flex: 1, justifyContent:'center',alignItems:'center', backgroundColor: mainBgColor}}>
                    {
                        transactions.length ? <FlatList
                            data={transactions}
                            style={{backgroundColor: '#fff'}}
                            keyExtractor={(item, index) => index + ''}
                            renderItem={({item}) => this._renderTransaction(item)}
                            onEndReached={() => {
                                this._onEndReached()
                            }}
                            ListFooterComponent={() =>
                                <ImportListfooter
                                    hasSeparator={false}
                                    footerState={this.state.footerState}
                                />
                            }

                        /> : <View style={{width: width, height: 180, justifyContent: 'center', alignItems: 'center'}}>
                            <Image source={require('../../../assets/empty_transactions.png')}
                                   style={{width: 80, height: 80, tintColor: 'gray', marginBottom: 20}}
                                   resizeMode={'contain'}
                            />
                            <Text style={{color: 'gray'}}>{strings('account_view.empty_label')}</Text>
                        </View>
                    }
                </View>
            )
        }
    }

}

export default connect(state => {
    return ({
        setting: state.setting,
        accounts: state.accounts,
    });
})(TransactionHistory);
