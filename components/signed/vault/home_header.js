import React from "react";
import {Alert, Dimensions, Image, PixelRatio, Platform, StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback} from "react-native";
import {ModalList} from "../../modalList";
import {strings} from "../../../locales/i18n";
import wallet from "react-native-aion-hw-wallet";
import {getLedgerMessage} from "../../../utils";
import PropTypes from "prop-types";
import Loading from '../../loading.js';
import {connect} from "react-redux";
const {width, height} = Dimensions.get('window');
const mWidth = 180;
const top = 100;
const MENU = [
    {
        title:'wallet.menu_master_key',
        image:require('../../../assets/aion_logo.png'),
    },
    {
        title:'wallet.menu_private_key',
        image:require('../../../assets/key.png'),
    },
    {
        title:'wallet.menu_ledger',
        image:require('../../../assets/ledger_logo.png'),
    },
];


class HomeHeader extends React.Component{

    static propTypes={
        total:PropTypes.any.isRequired,
        navigation: PropTypes.object.isRequired,
    };

    constructor(props){
        super(props);
        this.loadingView=null;
        this.state={
            showMenu:false,
        }
    }

    closeMenu(){
        const {navigation} = this.props;
        const select = this.menuRef.getSelect();
        console.log('[select] ', select);
        this.setState({
            showMenu:false
        });
        switch (select) {
            case MENU[0].title:
                navigation.navigate('signed_vault_import_list',{type:'masterKey', title:strings('import_master_key.title')});
                break;
            case MENU[1].title:
                navigation.navigate('signed_vault_import_private_key');
                break;
            case MENU[2].title:
                this.onImportLedger();
                break;
            default:
        }
    }

    onImportLedger=()=> {
        console.log("click import ledger.");
        this.loadingView.show(strings('ledger.toast_connecting'));

        wallet.listDevice().then((deviceList) => {
            if (deviceList.length <= 0) {
                this.loadingView.hide();
                Alert.alert(strings('alert_title_error'), strings('ledger.error_device_count'));
            } else {
                wallet.getAccount(0).then(account => {
                    this.loadingView.hide();
                    this.props.navigation.navigate('signed_vault_import_list',{type:'ledger',title:strings('import_ledger.title')});
                }, error => {
                    this.loadingView.hide();
                    Alert.alert(strings('alert_title_error'), getLedgerMessage(error.code));
                });
            }
        });
    };


    render() {
        console.log("homeheader: " , this.props.total.toNumber());
        const balance = this.props.total.toNumber() * this.props.setting.coinPrice;
        return (
            <View style={styles.header}>
                <View style={styles.headerEnds}/>
                <View style={styles.headerTitle}>
                    <Text style={styles.headerTitleText}>{`${strings('wallet.fiat_total')}: ${balance.toFixed(2)} ${strings(`currency.${this.props.setting.fiat_currency}_unit`)}`}</Text>
                </View>
                <View style={styles.headerEnds}>
                    <TouchableOpacity
                        style={{width: 60, height: 60, justifyContent: 'center', alignItems: 'center'}}
                        activeOpacity={0.5}
                        onPress={()=>{
                            this.setState({showMenu:true});
                        }
                        }>
                        <Image
                            source={require('../../../assets/ic_add.png')}
                            style={styles.titleBarImg}
                        />
                    </TouchableOpacity>
                    {/*<ModalList*/}
                        {/*data={Platform.OS==="ios"?MENU.slice(0,2):MENU}*/}
                        {/*visible={this.state.showMenu}*/}
                        {/*ref={ref => this.menuRef = ref}*/}
                        {/*style={styles.menuContainer}*/}
                        {/*viewStyle={styles.menuStyle}*/}
                        {/*fontStyle={styles.menuFontStyle}*/}
                        {/*imageStyle={styles.menuImageStyle}*/}
                        {/*onClose={() => this.closeMenu()}*/}
                        {/*ItemSeparatorComponent={() => (<View style={styles.divider}/>)}*/}
                    {/*/>*/}
                </View>
                {
                    this.state.showMenu?
                        <View style={{position:'absolute', top:0, left:0, width:width, height:height}}>
                            <TouchableOpacity
                                style={{width:width, height:height, backgroundColor:'rgba(0,0,0,.54)'}}
                                onPress={()=>{
                                    this.setState({showMenu:false});
                                }}
                            >
                            </TouchableOpacity>
                        </View>:null
                }
                <Loading ref={(element) => {
                    this.loadingView = element;
                }}/>
            </View>
        )
    }
}

export default connect(state => {
    return ({
        setting: state.setting
    }); })(HomeHeader);

const styles = StyleSheet.create({
    divider: {
        marginLeft: 50,
        height: 1 / PixelRatio.get(),
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: top,
        fontWeight: 'normal',
    },
    headerEnds:{
        width: 50,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    headerTitle:{
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitleText:{
        fontSize: Platform.OS === 'ios' ? 17 : 20,
        fontWeight: 'normal', // Platform.OS === 'ios' ? '600' : '500',
        color: 'rgba(0, 0, 0, .9)',
        fontFamily:'SourceHanSansCN-Medium'
    },
    titleBarImg: {
        width: 25,
        height: 25,
        margin: 15,
    },
    menuContainer: {
        width: mWidth,
        position: 'absolute',
        left: width - mWidth - 10,
        top: 80,
        padding: 5,
        borderWidth: 1,
        borderColor: '#8c8a8a',
        backgroundColor: 'white',
        borderRadius: 5,
    },
    menuStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex:1,
        width: mWidth,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 8,
        paddingBottom: 8,
    },
    menuFontStyle:{
        color: '#8c8a8a',
        fontSize: 16,
        marginLeft: 5,
    },
    menuImageStyle:{
        width: 20, height:20,
        marginRight: 10,
        tintColor: '#8c8a8a'
    },
});
