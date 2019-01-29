import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Dimensions,
    Image, PixelRatio,
    ActivityIndicator
} from 'react-native';
import {connect} from 'react-redux';
import data from '../../../data';
import {MasterKey} from "../../../libs/aion-hd-wallet/src/key/MasterKey";

const {width} = Dimensions.get('window');

const generateSelectList = (accounts) =>{
    let acc = {};
    Object.values(accounts).map(value => {
        acc[value.address]={'account': value, 'selected': false};
    });
    return acc;
};

class ImportHdWallet extends React.Component {
    static navigationOptions = ({navigation})=>({
        title: 'SELECT ACCOUNTS',
        headerTitleStyle:{
            fontSize: 14,
            alignSelf: 'center',
            textAlign: 'center',
            flex:1,
        },
        headerRight:(
            <TouchableOpacity>
                <View style={{marginRight: 10}}>
                    <Text style={{color:'blue'}}>IMPORT</Text>
                </View>
            </TouchableOpacity>
        )
    });

    constructor(props){
        super(props);
        this.state={
            isLoading: true,
            error: false,
            accountsList: generateSelectList(data.accounts),
            footerState: 1,
        };
    }

    componentDidMount(): void {
        this.fetchAccount(10);
    }

    fetchAccount(n){
        //fetch n Accounts from MasterKey;

        this.setState({
            isLoading: false,
        })
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
                    Fail
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
                    <ActivityIndicator />
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
        console.log('[accounts len] = '+ renderLists.length);
        console.log('[accounts] = '+ JSON.stringify(this.state.accountsList));

        return (
            <View style={styles.container}>
                <FlatList
                    data={renderLists}
                    renderItem={this._renderItem}
                    keyExtractor={(item,index)=>index.toString()}
                    ItemSeparatorComponent={()=>(
                        <View style={styles.divider}/>
                    )}
                    ListFooterComponent={this._renderFooter}
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
        marginLeft: 50,
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
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor:'#fff'
    },
    itemImage:{
        marginRight: 10,
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
    }

});