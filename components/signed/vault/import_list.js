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

import {accounts_add} from "../../../actions/accounts";
import SelectList from '../../selectList';
import {ImportListfooter, RightActionButton} from "../../common";
import {strings} from '../../../locales/i18n';
import {accountKey, getLedgerMessage, range} from "../../../utils";
import keyStore from 'react-native-makkii-core';

const {width} = Dimensions.get('window');

class ImportHdWallet extends React.Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: navigation.getParam('title'),
            headerRight: (
                <RightActionButton
                    onPress={() => {
                        navigation.state.params.ImportAccount();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                    btnTitle={strings('import_button')}
                />
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
        this.symbol = this.props.navigation.getParam('symbol');
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

        this.props.navigation.navigate('signed_vault_change_account_name', {
            oldName: '',
            onUpdate: this.setAccountName,
            targetUri: 'signed_vault',
        });
    };
    setAccountName=(newName) => {
        let accounts = this.selectList.getSelect();
        let account = Object.values(accounts)[0];
        console.log('set account name=>', newName);
        account.name  = newName;


        const {dispatch} = this.props;
        dispatch(accounts_add({
            [accountKey(this.symbol, account.address)]: account
        }, this.props.user.hashed_password));

        setTimeout(() => {
            DeviceEventEmitter.emit('updateAccountBalance');
        }, 500);
    };


    componentWillMount(){
        const {dispatch} = this.props;
        this.props.navigation.setParams({
            ImportAccount : this.ImportAccount,
            isEdited: false
        });
        InteractionManager.runAfterInteractions(()=>{
            this.fetchAccount(20)
        });
        this.isUnmount = true;
    }
    componentWillUnmount(): void {
        this.isUnmount = false;
    }

    isAccountIsAlreadyImport(address){
        return typeof this.props.accounts[accountKey(this.symbol, address)] !== 'undefined';
    }

    fetchAccountFromMasterKey(n){
        //fetch n Accounts from MasterKey;
        return new Promise((resolve, reject) => {
            try{
                let accounts = {};
                const start = this.state.lastIndex;
                let promises = [];
                range(start, start+n, 1).forEach(index=>
                    promises.push(keyStore.getKey(425,0,0,index,true))
                );
                Promise.all(promises).then(accs=>{
                    accs.forEach(getAcc=>{
                        let acc = {};
                        acc.address = getAcc.address;
                        acc.private_key = getAcc.private_key;
                        acc.name = "";
                        acc.type = '[local]';
                        acc.transactions = {};
                        acc.tokens = {};
                        acc.symbol = this.symbol;
                        acc.transactions = {};
                        if (!this.isAccountIsAlreadyImport(acc.address)) {
                            accounts[acc.address] = acc
                        }
                    });
                    resolve({'accountsList': accounts, 'lastIndex':this.state.lastIndex + n })
                })

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
            acc.name = "";
            acc.type = '[ledger]';
            acc.transactions = {};
            acc.tokens = {};
            acc.symbol = this.symbol;
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
            popCustom.show(strings('alert_title_error'),
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
                    isMultiSelect={false}
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
                    onItemSelected={() => {
                        this.props.navigation.setParams({
                            isEdited: Object.keys(this.selectList.getSelect()).length > 0
                        });
                    }}
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
        backgroundColor: 'white'
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
