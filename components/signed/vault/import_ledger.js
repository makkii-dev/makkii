import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Dimensions,
    Image, PixelRatio,
    ActivityIndicator,
    InteractionManager,
    Alert
} from 'react-native';
import {connect} from 'react-redux';
import {add_accounts} from "../../../actions/accounts";
import {ImportListItem, ImportListfooter} from "../../common";
import wallet from 'react-native-aion-hw-wallet';
import {getLedgerMessage} from '../../../utils.js';
import {strings} from '../../../locales/i18n';
const {width} = Dimensions.get('window');

class ImportLedger extends React.Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: 'Select Accounts',
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <TouchableOpacity onPress={() => {
                    let acc = navigation.state.params.ImportAccount();
                    navigation.state.params.dispatch(add_accounts(acc));
                    navigation.navigate('signed_vault');
                }}>
                    <View style={{marginRight: 20}}>
                        <Text style={{color: 'blue'}}>IMPORT</Text>
                    </View>
                </TouchableOpacity>
            )
        });
    };

    constructor(props){
        super(props);

        this.state={
            isLoading: true,
            lastIndex: 0,
            accountsList: {},
            footerState: 0,
        };
    }

    ImportAccount= () => {
        let acc = {};
        Object.values(this.state.accountsList).map(value =>{
            if( value.selected ){
                acc[value.account.address] = value.account;
            }
        });
        return acc;
    };

    componentDidMount() {
        // setTimeout(()=>{this.fetchAccount(10)},500);
        InteractionManager.runAfterInteractions(()=>{
            this.fetchAccount(10)
        });
    }

    componentWillMount(): void {
        const {dispatch} = this.props;
        this.props.navigation.setParams({
            ImportAccount : this.ImportAccount,
            dispatch: dispatch
        });
    }

    isAccountIsAlreadyImport(address){
        return typeof this.props.accounts[address] !== 'undefined';
    }

    getAccount(accounts, i, sum, n, resolve, reject) {
        console.log("i=" + i + ",sum=" + sum + ",n=" + n);
        if (sum >= n) {
            resolve({'accountsList': accounts, 'lastIndex':this.state.lastIndex + n })
            return;
        }
        wallet.getAccount(i).then(account => {
            let acc = {};
            acc.address = account.address;
            acc.balance = 0;
            acc.name = strings('default_account_name');
            acc.type = '[ledger]';
            acc.transactions = {};
            acc.derivationIndex = i;
            if (!this.isAccountIsAlreadyImport(acc.address)) {
                sum = sum + 1;
                accounts[acc.address] = {'account': acc, 'selected': false}
            }
            i = i + 1;
            this.getAccount(accounts, i, sum, n, resolve, reject);
        }, error => {
            reject(error);
        });
    }

    fetchAccount(n){
        //fetch n Accounts from MasterKey;
        return new Promise((resolve, reject) => {
            try{
                let accounts = {};
                let i = this.state.lastIndex;
                let sum = 0;
                this.getAccount(accounts, i, sum, n, resolve, reject);
            }catch (e) {
                reject(e)
            }
        }).then(value => {
            this.setState({
                isLoading: false,
                accountsList: Object.assign(this.state.accountsList, value.accountsList),
                lastIndex: value.lastIndex,
                footerState: 0,
            });
        },err=>{
            console.log('fetch accounts error:' + err);
            Alert.alert('Error',
                getLedgerMessage(err.code) + ". And reconnect to Ledger again.",
                [
                    {
                        text: 'OK',
                        onPress: () => this.props.navigation.goBack(),
                    }
                ]);
        });
    }

    _onEndReached(){
        // if not in fetching account
        if (this.state.footerState !== 0){
            return;
        }
        // set footer state
        this.setState({
            footerState: 2,
        },()=>{setTimeout(()=>this.fetchAccount(10),500)});
        console.log('after')
    }

    changeSelect(item){
        let {accountsList} = this.state;
        item.selected = !item.selected;
        accountsList[item.account.address] = item;
        this.setState({
            accountsList
        });
    }

    // loading page
    renderLoadingView() {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    animating={true}
                    color='red'
                    size="large"
                />
            </View>
        );
    }

    renderData(){
        return (
            <View style={styles.container}>
                <FlatList
                    style={{height: Dimensions.get('window').height-80}}
                    data={Object.values(this.state.accountsList)}
                    keyExtractor={(item,index)=>index.toString()}
                    ItemSeparatorComponent={()=>(
                        <View style={styles.divider}/>
                    )}
                    ListFooterComponent={()=>
                        <ImportListfooter
                            footerState={this.state.footerState}
                        />
                    }
                    onEndReached={()=>{this._onEndReached()}}
                    onEndReachedThreshold={0.1}
                    extraData={this.state.footerState}
                    getItemLayout={(data, index)=>({length:80, offset:(81)*index, index})}
                    renderItem={({item})=>(
                        <ImportListItem
                            item={item}
                            selected={item.selected}
                            onPress={()=>this.changeSelect(item)}
                        />
                    )}
                />
            </View>
        )
    }


    render() {
        // if first loading
        if (this.state.isLoading) {
            return this.renderLoadingView();
        }
        //show data
        return this.renderData();
    }
}
export default connect( state => {
  return {
      accounts: state.accounts,
      user: state.user,
  };
})(ImportLedger);

const styles=StyleSheet.create({
    divider: {
        marginLeft: 80,
        height: 1 / PixelRatio.get(),
        backgroundColor: '#000'
    },
    container:{
        paddingTop:10,
        paddingBottom: 10,
        width: width,
        flex:1,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    itemContainer:{
        flex:1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 10,
        backgroundColor:'#fff'
    },
    itemImage:{
        marginRight: 20,
        width: 50,
        height: 50,
    },
    itemText:{
        textAlign: 'right',
    },
    footer:{
        flexDirection:'row',
        height:24,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:10,
        marginTop: 10,
    }

});