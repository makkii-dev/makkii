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
    Alert, DeviceEventEmitter
} from 'react-native';
import {connect} from 'react-redux';
import {accounts_add} from "../../../actions/accounts";
import {ImportListItem, ImportListfooter} from "../../common";
import wallet from 'react-native-aion-hw-wallet';
import {getLedgerMessage} from '../../../utils.js';
import {strings} from '../../../locales/i18n';
import SelectList from "./import_hd_wallet";
const {width} = Dimensions.get('window');

class ImportLedger extends React.Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: strings('import_ledger.title'),
            headerTitleStyle: {
                fontSize: 20,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <TouchableOpacity onPress={() => {
                    let acc = navigation.state.params.ImportAccount();
                    navigation.state.params.dispatch(accounts_add(acc, navigation.state.params.hashed_password));
                    DeviceEventEmitter.emit('updateAccountBalance');
                    navigation.navigate('signed_vault');
                }}>
                    <View style={{marginRight: 20}}>
                        <Text style={{color: 'blue'}}>{strings('import_button')}</Text>
                    </View>
                </TouchableOpacity>
            )
        });
    };

    constructor(props){
        super(props);
        this.selectList=null;
        this.state={
            isLoading: true,
            lastIndex: 0,
            accountsList: {},
            footerState: 0,
        };
    }

    ImportAccount= () => {
        return this.selectList.getSelect();
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
            dispatch: dispatch,
            hashed_password: this.props.user.hashed_password,
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
                accounts[acc.address] = acc
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
        },()=>{setTimeout(()=>this.fetchAccount(10),500)});
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

    renderData(){
        return (
            <View style={styles.container}>
                <SelectList
                    isMultiSelect={true}
                    itemHeight={80}
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
                    getItemLayout={(data, index)=>({length:80, offset:(81)*index, index})}
                    onEndReached={()=>{this._onEndReached()}}
                    onEndReachedThreshold={0.1}
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