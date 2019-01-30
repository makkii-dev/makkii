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
    InteractionManager
} from 'react-native';
import {connect} from 'react-redux';
import {AionAccount} from "../../../libs/aion-hd-wallet";
import Account from "../../../types/account";
import {add_accounts} from "../../../actions/accounts";
const {width} = Dimensions.get('window');


class ImportHdWallet extends React.Component {
    static navigationOptions = ({navigation})=> {
        return ({
            title: 'SELECT ACCOUNTS',
            headerTitleStyle: {
                fontSize: 14,
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
            },
            headerRight: (
                <TouchableOpacity onPress={() => {
                    let acc = navigation.state.params.ImportAccount();
                    navigation.state.params.dispatch(add_accounts(acc));
                    navigation.navigate('VaultHome');
                }}>
                    <View style={{marginRight: 10}}>
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
            hardenedIndex: 0,
            error: false,
            errInfo: '',
            accountsList: {},
            footerState: 1,
        };
    }

    ImportAccount= () => {
        let acc = {};
        Object.entries(this.state.accountsList).map(([key, value])=>{
            if( value.selected ){
                acc[key] = value.account;
            }
        });
        return acc;
    };

    componentDidMount() {
        //setTimeout(()=>{this.fetchAccount(10)},500);
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
    fetchAccount(n){
        //fetch n Accounts from MasterKey;
        AionAccount.recoverAccount(this.props.user.mnemonic).then(
            masterKey => {
                let accounts = {};
                let i = this.state.hardenedIndex;
                let sum = 0;
                while (sum < n) {
                    let getAcc = masterKey.deriveHardened(i);
                    let acc = new Account();
                    acc.address = getAcc.address;
                    acc.private_key = getAcc.private_key;
                    acc.balance = 0;
                    acc.name = this.props.user.default_account_name;
                    acc.type = '[local]';
                    if (!this.isAccountIsAlreadyImport(acc.address)) {
                        sum = sum + 1;
                        accounts[acc.address] = {'account': acc, 'selected': false};
                    }
                    i = i + 1;
                }
                this.setState({
                    isLoading: false,
                    accountsList: Object.assign({}, this.state.accountsList, accounts),
                    hardenedIndex: this.state.hardenedIndex + n,
                    footerState: 0,
                });
            }, err => {
                this.setState({
                    error: true,
                    errInfo: err.toString(),
                });
            }
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
        },()=>{
            this.fetchAccount(5);
        });
    }

    _handleSelectBox(item){
        let newItem = {...item, 'selected': !item.selected};
        let {accountsList} = this.state;
        let tmpList = {};
        tmpList[newItem.account.address] = newItem;
        this.setState({
            accountsList: Object.assign({}, accountsList, tmpList)
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

    //error page
    renderErrorView() {
        return (
            <View style={styles.container}>
                <Text>
                    {this.state.errInfo}
                </Text>
            </View>
        );
    }


    _renderItem=({item, index}) => {
        let cbImage = item.selected? require('../../../assets/cb_enabled.png') : require('../../../assets/cb_disabled.png');
        let address = item.account.address;
        return (
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={e=>{
                    this._handleSelectBox(item);
                }} style={styles.itemContainer}>
                    <Image source={cbImage} style={styles.itemImage}/>
                    <Text style={styles.itemText}>{address.substring(0, 10) + '...'+ address.substring(address.length-10)}</Text>
                </TouchableOpacity>
            </View>
        )
    };

    _renderFooter=()=>{
        if (this.state.footerState === 1) {
            return (
                <View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
                    <Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
                        No More Accounts
                    </Text>
                </View>
            );
        } else if(this.state.footerState === 2) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator style={{paddingRight: 10}}/>
                    <Text>Fetching accounts</Text>
                </View>
            );
        } else if(this.state.footerState === 0){
            return (
                <View style={styles.footer}>
                    <Text></Text>
                </View>
            );
        }
    };

    renderData(){
        let renderLists = Object.values(this.state.accountsList).map(value => value);
        console.log('[accounts] '+ JSON.stringify(this.state.accountsList));
        return (
            <View style={styles.container}>
                <FlatList
                    data={renderLists}
                    renderItem={this._renderItem}
                    keyExtractor={(item,index)=>index.toString()}
                    ItemSeparatorComponent={()=>(
                        <View style={styles.divider}/>
                    )}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={()=>{this._onEndReached()}}
                    onEndReachedThreshold={0.1}
                    extraData={this.state}
                    getItemLayout={(data, index)=>({length:80, offset:(81)*index, index})}
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
  };
})(ImportHdWallet);

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