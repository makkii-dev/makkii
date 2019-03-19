import React from 'react';
import {connect} from 'react-redux';
import {
	Alert,
	DeviceEventEmitter,
	Dimensions,
	FlatList,
	Image,
	PermissionsAndroid,
	PixelRatio,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Linking,
	Platform,
	Keyboard,
	ImageBackground
} from 'react-native';
import SwipeableRow from '../../swipeCell';
import {accounts_add, delete_account, account_default} from '../../../actions/accounts.js';
import wallet from 'react-native-aion-hw-wallet';
import I18n, {strings} from "../../../locales/i18n";
import {ComponentTabBar, alert_ok} from '../../common.js';
import BigNumber from 'bignumber.js';
import Toast from "react-native-root-toast";
import {HomeComponent} from "../HomeComponent";
import GeneralStatusBar from "../../GeneralStatusBar";
import {SORT, FILTER, MENU} from "./home_contanst";
import {getLedgerMessage} from "../../../utils";
import Loading from '../../loading.js';
import {PopWindow} from "./home_popwindow";
import {fixedWidth, fixedHeight, mainColor} from "../../style_util";
import PropTypes from 'prop-types';
const {width, } = Dimensions.get('window');


function sortAccounts(src,select){
	let res = src;
	switch (select) {
		case SORT[0].title:
			res =  res.sort((a,b)=>{
				return b.balance-a.balance
			});
			break;
		case SORT[1].title:
			res =  res.sort((a,b)=>{
				return Object.keys(b.transactions).length - Object.keys(a.transactions).length;
			});
			break;
	}

	return res;
}

function filterAccounts(src,select){
	let res = src;
	switch (select) {
		case FILTER[1].title:
			res  = res.filter(a=>{
				return a.type === '[local]';
			});
			break;
		case FILTER[2].title:
			res  = res.filter(a=>{
				return a.type === '[pk]';
			});
			break;
		case FILTER[3].title:
			res  = res.filter(a=>{
				return a.type === '[ledger]';
			});
			break;
	}
	return res;
}

function searchAccounts(src,keyword){
	if(keyword==='')
		return src;
	return src.filter(a => {
		return a.name.indexOf(keyword) >= 0;
	});
}


class HomeCenterComponent extends  React.Component{

	state={
		showFilter: false,
		showSort: false,
	};

	static propTypes={
		closeFilter: PropTypes.func.isRequired,
		closeSort: PropTypes.func.isRequired,
		onTouch: PropTypes.func.isRequired,
		onChangeText: PropTypes.func.isRequired,
		currentFilter: PropTypes.string.isRequired,
		currentSort: PropTypes.string.isRequired,
	};

	closeAll=()=> {
		(this.state.showFilter || this.state.showSort) && this.setState({showFilter: false, showSort: false});
		this.props.closeFilter();
		this.props.closeSort();
	};
	isShow=()=>this.state.showSort||this.state.showFilter;

	render(){
		const sortTintColor = this.state.showSort?'blue':'black';
		const filterTintColor = this.state.showFilter?'blue':'black';
		return (
			<View style={this.props.style}>
				<View style={{flexDirection:'row', width:width-30,paddingHorizontal:20, alignItems:'center', justifyContent: 'space-between'}}>
					<View style={{flexDirection: 'row'}}>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this.props.onTouch();	Keyboard.dismiss();this.setState({showFilter: !this.state.showFilter,showSort:false})}}>
                            <Image source={require('../../../assets/filter.png')} style={{...styles.sortHeaderImageStyle, tintColor:filterTintColor}}/>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this.props.onTouch();Keyboard.dismiss();this.setState({showSort: !this.state.showSort, showFilter:false})}}>
                            <Image source={require('../../../assets/sort.png')} style={{...styles.sortHeaderImageStyle, tintColor:sortTintColor}}/>
                        </TouchableOpacity>
					</View>
                    <View style={{flexDirection: 'row'}}>
                        <TextInput multiline={false} maxLength={15} style={{...styles.searchStyle, marginRight: -10, paddingRight: 15}} onChangeText={v=>this.props.onChangeText(v)}
                                   onFocus={() => {
                                       this.props.onTouch();
                                       (this.state.showFilter || this.state.showSort) && (this.closeAll());
                                   }}
                                   onBlur={()=>{
                                        this.closeAll();
                                   }}
                        />
                        <View style={{height:40,width:40,justifyContent:'center', alignItems:'center', backgroundColor:mainColor, borderRadius:fixedWidth(10)}}>
                            <Image source={require('../../../assets/search.png')} style={{...styles.sortHeaderImageStyle, resizeMode: 'contain', marginRight: 0, tintColor:'#fff'}}/>
                        </View>
					</View>
				</View>
				{
					// filter list
					this.state.showFilter?<FlatList
						style={{marginTop:10}}
						data={FILTER}
						renderItem={({item}) =>
							<TouchableOpacity activeOpacity={0.3} onPress={() => {
								this.props.closeFilter(item.title);
								this.closeAll();
							}}>
								<View style={{width:width-30,flexDirection:'row',height:30, alignItems:'center',paddingLeft:20}}>
									{item.image ?
										<Image source={item.image} style={{width:20,height:20}}/> : null}
									<Text numberOfLines={1}
										  style={{marginLeft:40,color:item.title===this.props.currentFilter?'blue':'black'}}>{strings(item.title)}</Text>
								</View>
							</TouchableOpacity>

						}
						ItemSeparatorComponent={()=><View style={styles.divider}/>}
						keyExtractor={(item, index) => index.toString()}
					/>:null
				}
				{
					// sort list
					this.state.showSort?<FlatList
						style={{marginTop:10}}
						data={SORT}
						renderItem={({item}) =>
							<TouchableOpacity activeOpacity={0.3} onPress={() => {
								this.props.closeSort(item.title);
								this.closeAll();
							}}>
								<View style={{width:width-30,flexDirection:'row',height:30, alignItems:'center',paddingLeft:20}}>
									{item.image ?
										<Image source={item.image} style={{width:20,height:20}}/> : null}
									<Text numberOfLines={1}
										  style={{marginLeft:40,color:item.title===this.props.currentSort?'blue':'black'}}>{strings(item.title)}</Text>
								</View>
							</TouchableOpacity>

						}
						ItemSeparatorComponent={()=><View style={styles.divider}/>}
						keyExtractor={(item, index) => index.toString()}
					/>:null
				}
			</View>
		)
	}
}

class Home extends HomeComponent {

	static navigationOptions = ({ navigation }) => {
	    return {
	        header: null
	    };
    };
	constructor(props){
		super(props);
		this.menuRef=null;
		this.state={
			showMenu: false,
			sortOrder: SORT[0].title,
			filter: FILTER[0].title,
			totalBalance: new BigNumber(0),
			openRowKey: null,
			swipeEnable: true,
			scrollEnabled:true,
			refreshing: false,
			keyWords:'',
		};

	}

	async requestStoragePermission() {
		try {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
				{
					title: strings('permission_storage_title'),
					message: strings('permission_storage_message'),
					buttonPositive: strings('ok_button'),
					buttonNegative: strings('cancel_button'),
				}
			);
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.log('storage permission is granted');
			} else {
				console.log('storage permission is denied.');
			}
		} catch (err) {
			console.error("request permission error: ", err);
		}
	}

	componentDidMount(){
	    console.log("mount home");
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log('[route] ' + this.props.accounts);
		if (Platform.OS === 'android') {
			this.requestStoragePermission();
		}
		this.isMount = true;
		this.listener = DeviceEventEmitter.addListener('updateAccountBalance',()=>this.fetchAccountsBalance());

		Linking.getInitialURL().then(url => {
			console.log("linking url: " + url);
		});
		Linking.addEventListener('url', this.handleOpenURL);
	}

	handleOpenURL = (event) => {
		console.log("linking url=" + event.url);
		// if (event.url.startsWith('chaion://')) {
		// 	let urlObj = parseUrl(event.url);
		// 	if (urlObj.query.address) {
		// 		this.props.navigation.navigate('signed_vault_send', {
		// 			address: urlObj.query.address,
		// 		});
		// 	} else {
		// 		console.log("invalid chaion send schema");
		// 	}
		// }
	};

	componentWillUnmount(): void {
		console.log("unmount home");
		Linking.removeEventListener('url', this.handleOpenURL);

		this.isMount = false;
		this.listener.remove();
	}

	fetchAccountsBalance = ()=> {
		console.log('fetchAccountsBalance')
		const {dispatch,accounts} = this.props;
		console.log("accounts：", accounts);
		if (Object.keys(accounts).length === 0) {
			if (this.isMount) {
				this.setState({
					refreshing: false,
				});
			}
			return;
		}
		let executors=[];
		Object.values(accounts).map(value => {
			executors.push(
				new Promise((resolve, reject) => {
					console.log("getbalance: " + value.address);
					web3.eth.getBalance(value.address).then(balance=>{
						value.balance = new BigNumber(balance).shiftedBy(-18);
						resolve(value)
					},error => {
						reject(error)
					})
				}));
		});
		Promise.all(executors).then(
			res=>{
				let newAccounts={};
				let totalBalance=new BigNumber(0);
				res.forEach(account=>{
					console.log(account.balance);
					totalBalance = totalBalance.plus(account.balance);
					newAccounts[account.address] = account;
				});
				console.log('totalBalance', totalBalance);
				dispatch(accounts_add(newAccounts, this.props.user.hashed_password));
				this.isMount&&this.setState({
					refreshing: false,
					totalBalance,
				})
			},errors=>{
				console.log(errors);
				this.isMount&&this.setState({
					refreshing: false,
				}, () => {
					Toast.show(strings("error_connect_remote_server"));
				})
			}
		)
	};

	onRefresh = () => {
		this.setState({
			refreshing: true
		});
		setTimeout(()=>{
			this.fetchAccountsBalance();
		}, 1000);
	};



	onSwipeOpen (Key: any) {
		this.setState({
			openRowKey: Key,
			scrollEnabled: false,
		})
	}

	onSwipeClose(Key: any) {
		this.setState({
			openRowKey: null,
			scrollEnabled: true,
		})
	}


	onDeleteAccount(key){
		const { dispatch } = this.props;
		Alert.alert(
			strings('alert_title_warning'),
			strings('warning_delete_account'),
			[
				{text: strings('cancel_button'),onPress:()=>{}},
				{text: strings('delete_button'), onPress:()=>{
						this.setState({
							openRowKey: null,
						},()=>setTimeout(()=>
						{
							dispatch(delete_account(key,this.props.user.hashed_password));
							DeviceEventEmitter.emit('updateAccountBalance');
						}, 500));
					}}
				],
			{cancelable:false}
		)
	}

	onSetDefaultAccount(key) {
		const {dispatch} = this.props;
		this.setState({
			openRowKey:null
		},()=>{
			dispatch(account_default(key,this.props.user.hashed_password));
		});
	}

	onImportLedger=()=> {
		console.log("click import ledger.");
		this.loadingView.show(strings('ledger.toast_connecting'));

		wallet.listDevice().then((deviceList) => {
			if (deviceList.length <= 0) {
				this.loadingView.hide();
				alert_ok(strings('alert_title_error'), strings('ledger.error_device_count'));
			} else {
				wallet.getAccount(0).then(account => {
					this.loadingView.hide();
					this.props.navigation.navigate('signed_vault_import_list',{type:'ledger',title:strings('import_ledger.title')});
				}, error => {
					this.loadingView.hide();
					alert_ok(strings('alert_title_error'), getLedgerMessage(error.code));
				});
			}
		});
	};

	_renderListItem=(item) => {
		const Key = item.address;
		let accountImage = '';
		switch (item.type) {
			case '[ledger]':
				accountImage = require('../../../assets/account_le.png');break;
			case '[pk]':
				accountImage = require('../../../assets/account_pk.png');break;
			default:
				accountImage = require('../../../assets/account_mk.png');
		}
		const defaultImage = I18n.locale.indexOf('zh')>=0? require('../../../assets/default_zh.png'):require('../../../assets/default_en.png');
		return (
			<SwipeableRow
				isOpen={ Key === this.state.openRowKey }
				swipeEnabled={ this.state.openRowKey === null&&this.state.swipeEnable}
				preventSwipeRight={true}
				maxSwipeDistance={item.isDefault? fixedHeight(186): fixedHeight(186)*2}
				onOpen={()=>this.onSwipeOpen(Key)}
				onClose={() => this.onSwipeClose(Key)}
				shouldBounceOnMount={true}
				slideoutView={
						<View style={{...styles.accountContainer, justifyContent:'flex-end'}}>
							{
								item.isDefault?null:
									<TouchableOpacity onPress={()=>{
										this.onSetDefaultAccount(Key);
									}}>
										<View style={{...styles.accountSlideButton, backgroundColor: '#c8c7ed'}}>
											<Text style={{fontSize:14,color:'#000'}}>{strings('set_default_button')}</Text>
										</View>
									</TouchableOpacity>
							}
							<TouchableOpacity onPress={()=>{
								this.onDeleteAccount(Key);
							}}>
								<View style={{...styles.accountSlideButton, backgroundColor: '#fe0000'}}>
									<Text style={{fontSize:14,color:'#fff'}}>{strings('delete_button')}</Text>
								</View>
							</TouchableOpacity>
						</View>
				}
			>
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => {
					    Keyboard.dismiss();
					    if (this.HomeCenterRef.isShow()){
					    	this.HomeCenterRef.closeAll();
					    	return;
						}
                        this.state.openRowKey&&this.setState({openRowKey:null});
						this.state.openRowKey||this.props.navigation.navigate('signed_vault_account',{address: item.address});
					}}
				>
					<View style={{...styles.accountContainer, justifyContent:'flex-start', elevation:3}}>
						<Image source={accountImage} style={{width:fixedHeight(186), height:fixedHeight(186)}}/>
						<View style={{flex:1, paddingVertical: 10}}>
							<View style={{...styles.accountSubContainer, flex:1, alignItems:'center'}}>
								<Text style={styles.accountSubTextFontStyle1}>{item.name}</Text>
								<Text style={{...styles.accountSubTextFontStyle1, fontWeight: 'bold'}}>{new BigNumber(item.balance).toFixed(4)}</Text>
							</View>
							<View style={{...styles.accountSubContainer, flex:1, alignItems:'center'}}>
								<Text style={styles.accountSubTextFontStyle2}>{ item.address.substring(0, 10) + '...' + item.address.substring(54)}</Text>
								<Text style={styles.accountSubTextFontStyle2}>AION</Text>
							</View>
						</View>
						{
							item.isDefault?<Image source={defaultImage} style={{width:30,height:30,position:'absolute', top:0, right:0}}/>:null
						}
					</View>
				</TouchableOpacity>

			</SwipeableRow>

		)
	};

	closeMenu(select){
		const {navigation} = this.props;
		this.setState({
			showMenu:false
		},()=>{
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
		})
	}
	closeSort(select){
		select&&this.setState({
			sortOrder:select,
			swipeEnable:true,
		});
		select||this.setState({
			swipeEnable:true,
		})
	}

	closeFilter(select){
		select&&this.setState({
			filter:select,
			swipeEnable:true,
		});
		select||this.setState({
			swipeEnable:true,
		})
	}

	onTouchCenter(){
		this.setState({openRowKey:null,swipeEnable:false});
	}



	render(){
		let renderAccounts= sortAccounts(Object.values(this.props.accounts),this.state.sortOrder);
		renderAccounts = filterAccounts(renderAccounts, this.state.filter);
		renderAccounts = searchAccounts(renderAccounts, this.state.keyWords);

		const total_currency = (this.state.totalBalance.toNumber() * this.props.setting.coinPrice).toFixed(2);
		return (
			<View style={{flex:1}}>
				<GeneralStatusBar backgroundColor={mainColor}/>
				<TouchableOpacity style={{flex:1}}  activeOpacity={1} onPress={()=>{
					this.state.openRowKey&&this.setState({openRowKey:null});
					this.HomeCenterRef&&this.HomeCenterRef.closeAll();
					Keyboard.dismiss();
				}}>
				<ImageBackground source={require("../../../assets/vault_home_bg.png")} style={{flex:1}} imageStyle={{width:width, height: fixedHeight(686)}}>
					{/*title bar*/}
					<View style={{flexDirection:'row', justifyContent:'flex-end', marginTop:15, marginLeft:10,marginRight:10}}>
						<TouchableOpacity style={{height:40, width:48, justifyContent:'center', alignItems:'center'}} onPress={()=>{
							this.HomeCenterRef&&this.HomeCenterRef.closeAll();
							Keyboard.dismiss();
							this.setState({openRowKey:null, showMenu:true})
						}}>
							<Image source={require('../../../assets/ic_add.png')} style={{height:24, width:24, tintColor:"#fff"}}/>
						</TouchableOpacity>
					</View>
					<View style={{flexDirection:'row', justifyContent:'flex-start'}}>
						<Text style={{marginLeft:30,color:'#fff', fontSize: 20}}>{strings('wallet.fiat_total')}:</Text>
					</View>
					<View style={{flexDirection:'row', justifyContent:'center'}}>
						<Text style={{color:'#fff', fontSize:40}} numberOfLines={1}>{total_currency}{strings(`currency.${this.props.setting.fiat_currency}_unit`)}</Text>
					</View>

                    {/*accounts bar*/}
                    {
                        renderAccounts.length > 0 ? <FlatList
                            style={styles.accountView}
                            renderItem={({item}) => this._renderListItem(item)}
                            scrollEnabled={this.state.scrollEnabled}
                            data={renderAccounts}
                            keyExtractor={(item, index) => index + ''}
                            onScroll={(e) => {
                                this.setState({
                                    openRowKey: null,
                                });
                            }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.onRefresh}
                                    title={'Loading'}
                                />
                            }
                        />:<View style={{...styles.accountView, justifyContent:'center', alignItems:'center'}}>
                            <Image source={require('../../../assets/empty_account.png')} style={{height:80,width:80, tintColor:'gray', marginBottom:30}}/>
                            <Text style={{fontSize:16,color:'gray'}}>
								{Object.keys(this.props.accounts).length? strings('wallet.no_satisfied_accounts'): strings('wallet.import_accounts_hint')}
                            </Text>
                        </View>
                    }


					{/*center bar*/}
					<HomeCenterComponent
						ref={ref=>this.HomeCenterRef=ref}
						style={{...styles.shadow,justifyContent:'center', alignItems:'center', backgroundColor:'#fff',
							width:fixedWidth(970), position:'absolute', top: fixedHeight(466), right: fixedWidth(55), paddingVertical:20
						}}
						closeFilter={(item)=>this.closeFilter(item)}
						closeSort={(item)=>this.closeSort(item)}
						onChangeText={(value)=>this.setState({keyWords:value})}
						onTouch={()=>this.onTouchCenter()}
						currentFilter={this.state.filter}
						currentSort={this.state.sortOrder}
					/>



				</ImageBackground>
				<ComponentTabBar
					style={{
						position: 'absolute',
						height: fixedHeight(156),
						bottom: 0,
						right: 0,
						left: 0,
						backgroundColor: 'white',
						flexDirection: 'row',
						justifyContent: 'space-around',
						borderTopWidth: 0.3,
						borderTopColor: '#8c8a8a'
					}}
					active={'wallet'}
					onPress={[
						()=>{
							this.state.openRowKey&&this.setState({openRowKey: null});
							this.state.openRowKey||this.props.navigation.navigate('signed_vault');
						},
						()=>{
							this.state.openRowKey&&this.setState({openRowKey: null});
							this.state.openRowKey||this.props.navigation.navigate('signed_dapps_launch');
						},
						()=>{
							this.state.openRowKey&&this.setState({openRowKey: null});
							this.state.openRowKey||this.props.navigation.navigate('signed_setting');
						},
					]}
				/>
				</TouchableOpacity>
				<Loading ref={(element) => {
					this.loadingView = element;
				}}/>
				{/*Menu Pop window*/}
				{
					this.state.showMenu?
						<PopWindow
							backgroundColor={'rgba(52,52,52,0.54)'}
							onClose={(select)=>this.closeMenu(select)}
						 	data={Platform.OS==='android'?MENU:MENU.slice(0,2)}
							containerPosition={{position:'absolute', top:80,right:10,width:150,height:180}}
							imageStyle={{width: 20, height: 20, marginLeft:10,marginRight:20, resizeMode:'contain'}}
							fontStyle={{fontSize:12, color:'#000'}}
							itemStyle={{width:150,height:30,flexDirection:'row',justifyContent:'flex-start', alignItems:'center'}}
							containerBackgroundColor={'#fff'}
							ItemSeparatorComponent={()=><View style={styles.divider}/>}
							ListHeaderComponent={()=><View style={{width:180,height:40, padding:10}}>
								<Text style={{fontSize:16}}>{strings('wallet.title_import_from')}</Text>
							</View>}
						/>
						 :null
				}


			</View>
		)
	}
}



export default connect(state => {
	return ({
		user: state.user,
		accounts: state.accounts,
		ui: state.ui,
		setting: state.setting
	}); })(Home);

const styles = StyleSheet.create({
    accountView:{
        flex: 1, marginTop: fixedHeight(400), marginBottom: fixedHeight(156)
    },
	accountContainer:{
		shadowColor:'#eee',shadowOffset:{width:10,height:10},borderRadius:fixedHeight(10),
		flexDirection:'row', marginHorizontal: fixedWidth(55), marginVertical: fixedHeight(32),
		height:fixedHeight(186), backgroundColor:'#fff',
	},
	accountSubContainer:{
		flexDirection:'row',
		justifyContent:'space-between',
		paddingHorizontal: 18,
	},
	accountSubTextFontStyle1:{
		fontSize:14,
		color:'#000'
	},
	accountSubTextFontStyle2:{
		fontSize:12,
		color:'gray'
	},
	accountSlideButton:{
		shadowColor:'#eee',shadowOffset:{width:10,height:10},borderRadius:fixedHeight(10),
		justifyContent:'center', alignItems:'center',
		height:fixedHeight(186),
		width: fixedHeight(186),
	},
	divider: {
		marginHorizontal: 10,
		height: 1 / PixelRatio.get(),
		backgroundColor: '#eee'
	},
	shadow:{
		shadowColor:'#eee',shadowOffset:{width:10,height:10},borderRadius:fixedWidth(20),
		elevation:10,
	},
	sortHeaderImageStyle:{
		width:25,
		height:25,
		marginRight:20,
		tintColor:'blue'
	},
	searchStyle:{
		borderWidth: 1/PixelRatio.get(),
		borderColor:'gray',
		height: 40,
		width: fixedWidth(500),
        borderTopLeftRadius: fixedWidth(10),
        borderBottomLeftRadius: fixedWidth(10),
        borderBottomRightRadius: 0,
	},
	listItem: {
		height: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
		backgroundColor: '#fff'
	},
	listItemText: {
		textAlign:'left',
		color: '#fff',
	}
});
