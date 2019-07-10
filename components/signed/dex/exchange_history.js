import * as React from 'react';
import {
    FlatList,Dimensions,
    Image,
    Text, TouchableOpacity,
    View
} from 'react-native';
import {connect} from "react-redux";
import {accountKey} from "../../../utils";
import {strings} from "../../../locales/i18n";
import {fixedWidthFont, mainBgColor} from "../../style_util";
import Loading from "../../loading";
import {createAction, navigate} from "../../../utils/dva";
import CommonStyles from '../../styles';
import {PendingComponent} from '../../common';
const {width} = Dimensions.get('window');

class ExchangeHistory extends React.Component {
    static navigationOptions =({navigation})=>{
        return ({
            title:strings('token_exchange.title_exchange_history'),
            headerRight: (
                navigation.state.params.showButton?
                    <TouchableOpacity activeOpacity={1} style={{height:48, width:48, justifyContent: 'center', alignItems: 'center', marginRight:10}} onPress={()=>{
                        navigation.state.params.Reload&&navigation.state.params.Reload();
                    }}>
                        <Image source={require("../../../assets/refresh.png")} style={{height:24,width:24,tintColor:'#fff'}} resizeMode={'contain'}/>
                    </TouchableOpacity>
                    :<View/>
            ),
        })
    };

    onRefresh= ()=>{
        const {dispatch,currentAccount} = this.props;
        this.refs['refLoading'].show();
        dispatch(createAction('accountsModal/getExchangeHistory')({user_address:currentAccount.address})).then(r=>{
            this.refs['refLoading'].hide();
        })
    };

    toTxDetail = (item)=>{
        const {currentAccount} = this.props;
        const transaction= {
            to: '0x818e6fecd516ecc3849daf6845e3ec868087b755',
            from: currentAccount.address,
            timestamp:item.timestamp,
            status: item.status,
            blockNumber: item.blockNumber,
            hash: item.hash,
            amount: 0,
        };
        const additional_data = {
            type:'exchange',
            data: {
                srcToken: item.srcToken,
                srcQty: item.srcQty,
                destToken: item.destToken,
                destQty: item.destQty,
            }
        };
        navigate('signed_vault_transaction',{account:currentAccount, transaction, additional_data})(this.props);
    };

    constructor(props){
        super(props);
        const {currentAccount} = this.props;
        this.props.navigation.setParams({
            Reload: this.onRefresh,
            showButton: !!currentAccount
        });
    }

    renderNoAccount=()=>{
        return (
            <View style={styles.container}>
                <Image source={require('../../../assets/empty_transactions.png')}
                       style={{width: 80, height: 80, tintColor: 'gray', marginBottom: 20}}
                       resizeMode={'contain'}
                />
                <Text>{strings('token_exchange.label_please_select_account')}</Text>
            </View>
        )
    };

    renderNoExchangeHistory =()=>{
        return (
            <View style={styles.container}>
                <Image source={require('../../../assets/empty_transactions.png')}
                       style={{width: 80, height: 80, tintColor: 'gray', marginBottom: 20}}
                       resizeMode={'contain'}
                />
                <Text>{strings('token_exchange.label_no_exchange_history')}</Text>
            </View>
        )
    };

    renderItem = ({item})=>{
        const {status,timestamp:timestampSrc,srcToken,destToken,srcQty,destQty} = item;
        const timestamp = !timestampSrc? '': new Date(timestampSrc).Format("yyyy/MM/dd hh:mm");
        return(
            <TouchableOpacity onPress={()=>this.toTxDetail(item)}>
                <View style={styles.transactionContainer}>
                    <View style={styles.transactionHeader}>
                        <Text>{timestamp}</Text>
                        <PendingComponent status={status}/>
                    </View>
                    <View style={styles.transactionBody}>
                        <Image source={require('../../../assets/icon_curved_arrow.png')} style={{width:10,height:10}}/>
                        <View style={styles.transactionLabel1}>
                            <View style={styles.transactionLabel2}>
                                <Text style={{fontWeight: 'bold',fontFamily:fixedWidthFont}}>{srcToken}:</Text>
                                <Text style={{marginLeft: 20}}>{srcQty}</Text>
                            </View>
                            <View style={styles.transactionLabel2}>
                                <Text style={{fontWeight: 'bold',fontFamily:fixedWidthFont}}>{destToken}:</Text>
                                <Text style={{marginLeft: 20}}>{destQty}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    };

    renderExchangeHistory =(exchangeHistory)=>{
        return (
            <View style={styles.container}>
                <FlatList
                    data={exchangeHistory}
                    renderItem={this.renderItem}
                    keyExtractor={(item,index)=>index+''}
                />
            </View>
        )
    };



    render(){
        const {currentAccount,exchangeHistory} = this.props;
        let content;
        if(currentAccount){
            if(exchangeHistory.length){
                content = this.renderExchangeHistory(exchangeHistory)
            }else{
                content =  this.renderNoExchangeHistory();
            }
        }else{
            content = this.renderNoAccount();
        }
        return (
            <View style={{flex:1}}>
                {content}
                <Loading ref={'refLoading'}/>
            </View>
        )

    }
}

const mapToState = ({accountsModal})=>{
    const {currentAccount:key, accountsMap, transactionsMap} = accountsModal;
    const currentAccount = accountsMap[key];
    let exchangeHistory = [];
    let compareFn = (a, b) => {
        if (b.timestamp === undefined && a.timestamp !== undefined) return 1;
        if (b.timestamp === undefined && a.timestamp === undefined) return 0;
        if (b.timestamp !== undefined && a.timestamp === undefined) return -1;
        return b.timestamp - a.timestamp;
    };

    if (currentAccount){
        const tmp = transactionsMap[key+'+ERC20DEX']||{};
        exchangeHistory = Object.keys(tmp).map(k=>{
            return ({
                ...tmp[k],
                hash:k,
            })
        }).sort(compareFn);
    }
    return ({
        currentAccount: currentAccount,
        exchangeHistory: exchangeHistory,
    })
};


export default connect(mapToState)(ExchangeHistory);

const styles = {
    container:{
        flex:1,
        backgroundColor:mainBgColor,
        justifyContent:'center',
        alignItems:'center'
    },
    transactionContainer:{
        ...CommonStyles.shadow,
        marginHorizontal:20,
        marginVertical:10,
        borderRadius:10,
        width:width-40,
        backgroundColor:'#fff',
        justifyContent:'space-between',
        padding: 10
    },
    transactionHeader:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderBottomColor:'lightgray',
        borderBottomWidth:0.2,
        paddingVertical:5,
    },
    transactionBody:{
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems:'center',
        marginVertical:10,
        paddingHorizontal:10,
    },
    transactionLabel1:{
        marginLeft:10,
        alignItems:'flex-start',
        justifyContent:'center',
    },
    transactionLabel2:{
        flexDirection:'row',
    }
};