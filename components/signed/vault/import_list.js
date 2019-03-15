import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    PixelRatio,
    ActivityIndicator,
    InteractionManager,
    DeviceEventEmitter, Alert
} from 'react-native';
import {connect} from 'react-redux';
import wallet from "react-native-aion-hw-wallet";

import {AionAccount} from "../../../libs/aion-hd-wallet";
import {accounts_add} from "../../../actions/accounts";
import SelectList from '../../selectList';
import {ImportListfooter} from "../../common";
import {strings} from '../../../locales/i18n';
import {getLedgerMessage} from "../../../utils";
import {mainBgColor} from '../../style_util';

const {width} = Dimensions.get('window');

class ImportHdWallet extends React.Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: navigation.getParam('title'),
            headerRight: (
                <TouchableOpacity onPress={() => {
                    navigation.state.params.ImportAccount();
                }}>
                    <View style={{marginRight: 10}}>
                        <Text style={{color: '#8c8a8a'}}>{strings('import_button')}</Text>
                    </View>
                </TouchableOpacity>
            )
        });
    };

    constructor(props){
        super(props);
        if (this.props.navigation.getParam('type') === 'masterKey'){
            this.fetchAccount = this.fetchAccountFromMasterKey;
        }else{
            this.fetchAccount = this.fetchAccountFromLedger;
        }
        this.selectList=null;
        this.state={
            isLoading: true,
            lastIndex: 0,
            error: false,
            errInfo: '',
            accountsList: {},
            footerState: 0,
        };
    }

    ImportAccount= () => {
        let acc = this.selectList.getSelect();
        const {dispatch} = this.props;
        dispatch(accounts_add(acc,this.props.user.hashed_password));
        setTimeout(() => {
            DeviceEventEmitter.emit('updateAccountBalance');
        }, 500);
        this.props.navigation.goBack();
    };



    componentWillMount(){
        const {dispatch} = this.props;
        this.props.navigation.setParams({
            ImportAccount : this.ImportAccount,
        });
        InteractionManager.runAfterInteractions(()=>{
            this.fetchAccount(20)
        });
        this.isUnmount = true;
        console.log('ok')
    }
    componentWillUnmount(): void {
        this.isUnmount = false;
    }

    isAccountIsAlreadyImport(address){
        return typeof this.props.accounts[address] !== 'undefined';
    }

    fetchAccountFromMasterKey(n){
        //fetch n Accounts from MasterKey;
        return new Promise((resolve, reject) => {
            try{
                let masterKey = AionAccount.recoverAccount(this.props.user.mnemonic)
                let accounts = {};
                let i = this.state.lastIndex;
                let sum = 0;
                while (sum < n) {
                    let getAcc = masterKey.deriveHardened(i);  
                    let acc = {};
                    acc.address = getAcc.address;
                    acc.private_key = getAcc.private_key;
                    acc.balance = 0;
                    acc.name = this.props.setting.default_account_name;
                    acc.type = '[local]';
                    acc.transactions = {};
                    if (!this.isAccountIsAlreadyImport(acc.address)) {
                        sum = sum + 1;
                        accounts[acc.address] = acc
                    }
                    i = i + 1;
                }
                resolve({'accountsList': accounts, 'lastIndex':this.state.lastIndex + n })
            }catch (e) {
                reject(e)
            }
        }).then(value => {
            this.isUnmount&&this.setState({
                isLoading: false,
                accountsList: Object.assign(this.state.accountsList, value.accountsList),
                lastIndex: value.lastIndex,
                footerState: 0,
            });
        },err=>{
            this.isUnmount&&this.setState({
                error: true,
                errInfo: err.toString(),
            });
        });
    }

    getAccountFromLedger(accounts, i, sum, n, resolve, reject) {
        console.log("i=" + i + ",sum=" + sum + ",n=" + n);
        if (sum >= n) {
            resolve({'accountsList': accounts, 'lastIndex':this.state.lastIndex + n })
            return;
        }
        wallet.getAccount(i).then(account => {
            let acc = {};
            acc.address = account.address;
            acc.balance = 0;
            acc.name = this.props.setting.default_account_name;
            acc.type = '[ledger]';
            acc.transactions = {};
            acc.derivationIndex = i;
            if (!this.isAccountIsAlreadyImport(acc.address)) {
                sum = sum + 1;
                accounts[acc.address] = acc
            }
            i = i + 1;
            this.getAccountFromLedger(accounts, i, sum, n, resolve, reject);
        }, error => {
            reject(error);
        });
    }

    fetchAccountFromLedger(n){
        //fetch n Accounts from MasterKey;
        return new Promise((resolve, reject) => {
            try{
                let accounts = {};
                let i = this.state.lastIndex;
                let sum = 0;
                this.getAccountFromLedger(accounts, i, sum, n, resolve, reject);
            }catch (e) {
                reject(e)
            }
        }).then(value => {
            this.isUnmount&&this.setState({
                isLoading: false,
                accountsList: Object.assign(this.state.accountsList, value.accountsList),
                lastIndex: value.lastIndex,
                footerState: 0,
            });
        },err=>{
            this.isUnmount&&this.setState({
                error: true,
                errInfo: err.toString(),
            });
            console.log('fetch accounts error:' + err);
            Alert.alert(strings('alert_title_error'),
                getLedgerMessage(err.code),
                [
                    {
                        text: strings('alert_ok_button'),
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
        },()=>{setTimeout(()=>this.fetchAccount(5),500)});
        console.log('after')
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

    //error page
    renderErrorView() {
        return (
            <View style={styles.container}>
                <Text style={{alignSelf: 'center', textAlign:'center'}}>
                    {this.state.errInfo}
                </Text>
            </View>
        );
    }


    renderData(){
        return (
            <View style={styles.container}>
                <SelectList
                    isMultiSelect={true}
                    itemHeight={55}
                    ref={ref=>this.selectList=ref}
                    data={this.state.accountsList}
                    cellLeftView={item=>{
                        const address = item.address;
                        return(
                            <Text style={{flex:1}}>{address.substring(0, 10) + '...'+ address.substring(54)}</Text>
                        )}}
                    ListFooterComponent={()=>
                        <ImportListfooter
                            footerState={this.state.footerState}
                        />
                    }
                    onEndReached={()=>{this._onEndReached()}}
                    onEndReachedThreshold={0.1}
                />
            </View>
        )
    }


    render() {
        // if first loading
        if (this.state.isLoading && !this.state.error) {
            return this.renderLoadingView();
        } else if (this.state.error) {
            //if error
            return this.renderErrorView();
        }
        //show data
        return this.renderData();
    }
}
export default connect( state => {
  return {
      accounts: state.accounts,
      user: state.user,
      setting: state.setting,
  };
})(ImportHdWallet);

const styles=StyleSheet.create({
    divider: {
        marginLeft: 80,
        height: 1 / PixelRatio.get(),
        backgroundColor: '#000'
    },
    container:{
        width: width,
        flex:1,
        justifyContent: 'center',
        backgroundColor: mainBgColor
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