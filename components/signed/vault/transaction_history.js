import React from 'react';
import {
    View,
    FlatList,
    Image,
    Text,
    ActivityIndicator,
    InteractionManager,
    Dimensions, Keyboard,
} from 'react-native';
import {strings} from "../../../locales/i18n";
import {fetchAccountTokenTransferHistory,fetchAccountTransactionHistory, accountKey} from "../../../utils";
import {connect} from "react-redux";
import {ImportListfooter, TransactionItem} from "../../common";
import {mainBgColor} from '../../style_util';

const {width} = Dimensions.get('window');

class TransactionHistory extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('account_view.transaction_history_label'),
        };
    };
    state={
        transactions:{},
        currentPage:0,
        footerState:0,
        isLoading: true,
    };
    constructor(props){
        super(props);
        this.account = this.props.navigation.state.params.account;
        this.account_key = accountKey(this.account.symbol, this.account.address);
    }

    componentWillMount(){
        InteractionManager.runAfterInteractions(()=>{
            this.fetchAccountTransactions(this.account,this.state.currentPage)
        });
        this.isMount = true;
    }


    componentWillUnmount(): void {
        this.isMount = false;
    }


    fetchAccountTransactions = (account, page=0, size=25)=>{
        let {currentPage,transactions} = this.state;
        const {explorer_server} = this.props.setting;
        console.log('get transactions page: '+page+' size: '+size);
        let symbol = this.props.navigation.getParam('symbol');
        console.log("account:", account);
        console.log("symbol:" + symbol);
        let promise;
        if (symbol === this.account.symbol) {
            promise = fetchAccountTransactionHistory(this.account.address, explorer_server, page, size);
        } else {
            let token = this.props.accounts[this.account_key].tokens[explorer_server][symbol];
            console.log("token: ", token);
            promise = fetchAccountTokenTransferHistory(this.account.address, token.contractAddr, explorer_server, page, size);
        }
        promise.then(txs => {
            if (Object.keys(txs).length === 0) {
                this.isMount && this.setState({
                    currentPage,
                    transactions,
                    isLoading: false,
                    footerState: 1
                });
                return;
            }
            transactions = Object.assign({}, transactions, txs);
            this.isMount && this.setState({
                currentPage: page,
                transactions,
                isLoading: false,
                footerState: Object.keys(transactions).length >= 25 ? 0 : 1
            })
        }).catch(error => {
            console.log(error);
            this.isMount && this.setState({
                currentPage,
                transactions,
                isLoading: false,
                footerState: 0
            })
        });
    };


    _onEndReached(){
        // if not in fetching account
        if (this.state.footerState !== 0){
            return;
        }
        // set footer state
        this.setState({
            footerState: 2,
        },()=>{setTimeout(()=>this.fetchAccountTransactions(this.account, this.state.currentPage+1),500)});
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
            let symbol = this.props.navigation.getParam('symbol');
            let transactions;
            if (symbol === this.account.symbol) {
                let propTxs = this.props.accounts[this.account_key].transactions[this.props.setting.explorer_server];
                transactions = Object.values(Object.assign({}, this.state.transactions, propTxs)).sort((a, b) => b.timestamp - a.timestamp);
            } else {
                let propTxs = this.props.accounts[this.account_key].tokens[this.props.setting.explorer_server][symbol].tokenTxs;
                transactions = Object.values(Object.assign({}, this.state.transactions, propTxs)).sort((a, b) => b.timestamp - a.timestamp);
            }
            return (
                <View style={{flex: 1, justifyContent:'center',alignItems:'center', backgroundColor: mainBgColor}}>
                    {
                        transactions.length ? <FlatList
                            data={transactions}
                            style={{backgroundColor: '#fff'}}
                            keyExtractor={(item, index) => index + ''}
                            renderItem={({item})=><TransactionItem
                                symbol={symbol}
                                transaction={item}
                                currentAddr={this.account.address}
                                onPress={()=>{
                                    Keyboard.dismiss();
                                    this.props.navigation.navigate('signed_vault_transaction',{
                                        account:this.account,
                                        transaction: item,
                                        symbol: this.props.navigation.getParam('symbol'),
                                    });
                                }}/>}
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
