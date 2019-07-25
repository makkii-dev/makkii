import React,{Component} from 'react';
import {connect} from 'react-redux';
import {
	ActivityIndicator,
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
	ImageBackground,
	StatusBar
} from 'react-native';
import SwipeCell from '../../../components/SwipeCell';
import wallet from 'react-native-aion-hw-wallet';
import {strings} from "../../../../locales/i18n";
import {OptionButton, ComponentButton} from '../../../components/common.js';
import BigNumber from 'bignumber.js';
import {SORT} from "./constants";
import Loading from '../../../components/Loading.js';
import {fixedWidth, fixedHeight, mainColor, linkButtonColor, mainBgColor,fixedWidthFont} from "../../../style_util";
import defaultStyles from '../../../styles';
import PropTypes from 'prop-types';
import {accountKey, getStatusBarHeight} from '../../../../utils';
import {COINS} from '../../../../coins/support_coin_list';
import {formatAddress1Line} from '../../../../coins/api';
import {AppToast} from "../../../components/AppToast";
import {createAction, navigate, popCustom} from "../../../../utils/dva";

const {width} = Dimensions.get('window');


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
				return b.txNumber - a.txNumber;
			});
			break;
	}

	return res;
}

function filterAccounts(src,filters){
	let res = src;
	if (filters.length > 0) {
		let typeFilters = {};
		for (let i = 0; i < filters.length; i++) {
			let f = typeFilters[filters[i].type];
			if (typeof f !== 'object') f = [];
			f.push(filters[i].key);
			typeFilters[filters[i].type] = f;
		}

		res = res.filter(a => {
			let match = true;
			Object.keys(typeFilters).forEach(f => {
				match = match && typeFilters[f].indexOf(a[f]) >= 0;
			});
			return match;
		});
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

class HomeCenterComponent extends React.Component{

	state={
		showFilter: false,
		showSort: false,
		currentFilter: this.props.currentFilter,
	};

	static propTypes={
		closeFilter: PropTypes.func.isRequired,
		closeSort: PropTypes.func.isRequired,
		onTouch: PropTypes.func.isRequired,
		onChangeText: PropTypes.func.isRequired,
		currentFilter: PropTypes.array.isRequired,
		currentSort: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		let addFromKey = strings('wallet.section_title_add_from');
		let filters = {
			[addFromKey] : [
				{
					text: strings('filter.masterKey'),
					key: '[local]',
					type: 'type'
				},
				{
					text: strings('filter.privateKey'),
					key: '[pk]',
					type: 'type'
				},
				{
					text: strings('filter.ledger'),
					key: '[ledger]',
					type: 'type'
				}
			]
		};
		if (Platform.OS === 'ios') {
			filters[addFromKey] = filters[addFromKey].slice(0, 2);
		}
		let coinKeys = Object.values(COINS);
		if (coinKeys.length > 0) {
			let coinTypeKey = strings('wallet.section_title_coin_type');
			filters[coinTypeKey] = [];
			coinKeys.forEach(coin => {
				filters[coinTypeKey].push({
					text: coin.symbol,
					key: coin.symbol,
					type: 'symbol',
				});
			});
		}
		this.filters = filters;
	}

	closeAll=()=> {
		(this.state.showFilter || this.state.showSort) && this.setState({showFilter: false, showSort: false});
		this.setState({
			currentFilter: this.props.currentFilter,
		});
		this.props.closeFilter();
		this.props.closeSort();
	};
	isShow=()=>this.state.showSort||this.state.showFilter;

	containsOption=(option)=>{
		if (this.state.currentFilter.length > 0) {
			for (let i = 0; i < this.state.currentFilter.length; i++) {
				if (this.state.currentFilter[i].type === option.type && this.state.currentFilter[i].key === option.key) {
					return true;
				}
			}
		}
		return false;
	}

	unselectOption=(option)=> {
		if (this.state.currentFilter.length > 0) {
			for (let i = 0; i < this.state.currentFilter.length; i++) {
				if (this.state.currentFilter[i].type === option.type && this.state.currentFilter[i].key === option.key) {
					let cf = this.state.currentFilter;
					this.setState({
						currentFilter: cf.filter((value, index, arr)=> index != i )
					});
					return;
				}
			}
		}
	}

	render_filters=()=> {
		let filterKeys = Object.keys(this.filters);
		let ret=[];
		filterKeys.forEach(filterKey => {
			ret.push(<View key={filterKey} style={{width: '100%', marginTop: 10}}>
				<Text style={{color: 'black', fontSize: 16}}>{filterKey}</Text>
				{ this.render_filter_options(this.filters[filterKey]) }
			</View>);
		});
		return ret;
	};
	render_filter_options = (options) => {
		let ret = [];
		let cols = Math.min(options.length, 4);
		let rows = ((options.length-1) / 4 + 1);
		for (let i = 0; i < rows; i++) {
			ret.push(<View key={'line' + i} style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems:'space-between', }}>{this.render_options_byline(options, i, cols)}</View>);
		}
		return ret;
	};

	render_options_byline=(options, line, cols) => {
		let space = 10;
		let btnWidth = (width - 40 - 40 - space * (cols-1)) / cols;
		let ret = [];
		for (let i = line * 4; i < Math.min((line + 1) * 4, options.length); i++) {
			let currentOption = options[i];
			console.log("currentOption: ", currentOption);
			let selected = this.containsOption(currentOption);
			console.log("contains:" + selected);
			ret.push(<OptionButton
				key={i + ''}
				title={currentOption.text}
				style={{
					marginRight: space,
					width: btnWidth,
					height: 36,
					marginVertical: 5,
				}}
				selected={selected}
				onPress={() =>{
					if (this.containsOption(currentOption)) {
						this.unselectOption(currentOption);
					} else {
						let cf = this.state.currentFilter;
						this.setState({
							currentFilter: [...cf, currentOption],
						});
					}
				}}/>);
		}
		return ret;
	}

	render(){
		const sortTintColor = this.state.showSort?linkButtonColor:'black';
		const filterTintColor = this.state.showFilter?linkButtonColor:'black';
		return (
			<View style={this.props.style}>
				<View style={{flexDirection:'row', width:width-80, alignItems:'center', justifyContent: 'space-between'}}>
					<View style={{flexDirection: 'row'}}>
						<TouchableOpacity activeOpacity={1} onPress={()=>{
							this.props.onTouch();
							Keyboard.dismiss();
							this.state.showFilter&&this.props.closeFilter();
							this.setState({showFilter: !this.state.showFilter,showSort:false});
						}}>
							<Image source={require('../../../../assets/icon_filter.png')} style={{...styles.sortHeaderImageStyle, tintColor:filterTintColor}}/>
						</TouchableOpacity>
						<TouchableOpacity activeOpacity={1} onPress={()=>{
							this.props.onTouch();
							Keyboard.dismiss();
							this.state.showSort&&this.props.closeSort();
							this.setState({showSort: !this.state.showSort, showFilter:false});
						}}>
							<Image source={require('../../../../assets/icon_sort.png')} style={{...styles.sortHeaderImageStyle, tintColor:sortTintColor}}/>
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
							<Image source={require('../../../../assets/icon_search.png')}
								   style={{...styles.sortHeaderImageStyle, marginRight: 0, tintColor:'#fff'}}
								   resizeMode={'contain'}
							/>
						</View>
					</View>
				</View>
				{
					// filter list
					this.state.showFilter?
						<TouchableOpacity activeOpacity={1} style={{marginTop: 10, width: '100%'}} onPress={()=>{}}>
							{this.render_filters()}
							<ComponentButton title={strings('confirm_button')} style={{marginTop: 10}} onPress={()=>{
								this.props.closeFilter(this.state.currentFilter);
								this.setState({showFilter: false});
							}}/>
						</TouchableOpacity>
						:null
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
								<View style={{width:width-30,flexDirection:'row',height:30, alignItems:'center', marginVertical: 10}}>
									{item.image ?
										<Image source={item.image} style={{width:20,height:20}} resizeMode={'contain'}/> : null}
									<Text numberOfLines={1}
										  style={{marginLeft:40,color:item.title===this.props.currentSort?linkButtonColor:'black'}}>{strings(item.title)}</Text>
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

class Home extends Component {

	static navigationOptions = ({ navigation }) => {
		return {
			header: null
		};
	};
	constructor(props){
		super(props);
		this.menuRef=null;
		this.state={
			sortOrder: SORT[0].title,
			filter: ['[local]','[pk]'],
			totalBalance: undefined,
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

	componentWillMount(){
		console.log("mount home");
		console.log('[route] ' + this.props.navigation.state.routeName);
		if (Platform.OS === 'android') {
			this.requestStoragePermission();
		}

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
	}

	fetchAccountsBalance = ()=> {
		const {dispatch, accounts} = this.props;
		this.setState({
			refreshing: true
		},()=>{
			dispatch(createAction('accountsModel/loadBalances')({keys:Object.keys(accounts)}))
				.then(r=>{
					if(r) {
						this.setState({
							refreshing: false,
						})
					}else{
						AppToast.show(strings('wallet.toast_has_pending_transactions'), {
							position: AppToast.positions.CENTER,
						})
					}
				})
		});


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

	closeSort(select){
		select&&this.setState({
			sortOrder:select,
			swipeEnable:true,
		});
		select||this.setState({
			swipeEnable:true,
		})
	}

	closeFilter=(select)=>{
		select&&this.setState({
			filter:select,
			swipeEnable:true,
		});
		select||this.setState({
			swipeEnable:true,
		})
	};

	onChangeText(t){
		const {keyWords} = this.state;
		if(keyWords!==t.trim()){
			this.setState({keyWords:t.trim()});
		}
	}
	onTouchCenter(){
		this.setState({openRowKey:null,swipeEnable:false});
	}


	goToAccountDetail = (item)=>{
		Keyboard.dismiss();
		if (this.refs['refHomeCenter'].isShow()){
			this.refs['refHomeCenter'].closeAll();
			return;
		}
		if(this.state.openRowKey){
			this.setState({openRowKey:null});
		}else{
			const {dispatch} = this.props;
			const targetUri = COINS[item.symbol].tokenSupport? 'signed_vault_account_tokens': 'signed_vault_account';
			dispatch(createAction('accountsModel/updateState')({currentAccount:accountKey(item.symbol, item.address), currentToken:''}));
			navigate(targetUri)({dispatch})
		}
	};


	onDeleteAccount(key){
		const { dispatch } = this.props;
		popCustom.show(
			strings('alert_title_warning'),
			strings('warning_delete_account'),
			[
				{text: strings('cancel_button'),onPress:()=>this.setState({openRowKey: null})},
				{text: strings('delete_button'), onPress:()=>{
						this.setState({
							openRowKey: null,
						},()=>setTimeout(()=>
						{
                            dispatch(createAction('accountsModel/deleteAccounts')({keys:[key]}))
						}, 500));
					}}
			],
			{cancelable:false}
		)
	}


	_renderListItem=(item) => {
		const Key = accountKey(item.symbol, item.address);
		return (
			<SwipeCell
				isOpen={ Key === this.state.openRowKey }
				swipeEnabled={ this.state.openRowKey === null&&this.state.swipeEnable}
				preventSwipeRight={true}
				maxSwipeDistance={fixedHeight(186)}
				onOpen={()=>this.onSwipeOpen(Key)}
				onClose={() => this.onSwipeClose(Key)}
				shouldBounceOnMount={true}
				slideoutView={
					<View style={{...styles.accountContainer, backgroundColor:'transparent', justifyContent:'flex-end'}}>
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
					onPress={() => this.goToAccountDetail(item)}
				>
					<View style={{...styles.accountContainerWithShadow, justifyContent:'flex-start',  alignItems: 'center'}}>
						<Image source={COINS[item.symbol].icon} style={{marginLeft: 15, width:fixedHeight(100), height:fixedHeight(100)}}/>
						<View style={{flex:1, paddingVertical: 10}}>
							<View style={{...styles.accountSubContainer, width:'100%',flex:1, alignItems:'center'}}>
								<Text style={{...styles.accountSubTextFontStyle1, width:'70%'}} numberOfLines={1}>{item.name}</Text>
								<Text style={{...styles.accountSubTextFontStyle1, fontWeight: 'bold'}}>{new BigNumber(item.balance).toFixed(4)}</Text>
							</View>
							<View style={{...styles.accountSubContainer, flex:1, alignItems:'center'}}>
								<Text style={{...styles.accountSubTextFontStyle2, fontFamily:fixedWidthFont}}>{formatAddress1Line(item.symbol, item.address)}</Text>
								<Text style={styles.accountSubTextFontStyle2}>{item.symbol}</Text>
							</View>
						</View>
					</View>
				</TouchableOpacity>

			</SwipeCell>

		)
	};


	render(){
		const {accounts, totalBalance, fiat_currency,isGettingBalance} = this.props;
		let renderAccounts= sortAccounts(Object.values(accounts),this.state.sortOrder);
		renderAccounts = filterAccounts(renderAccounts, this.state.filter);
		renderAccounts = searchAccounts(renderAccounts, this.state.keyWords);
		const header_marginTop = getStatusBarHeight(false);
		return (
			<View style={{flex:1}}>
				<TouchableOpacity style={{flex:1}}  activeOpacity={1} onPress={()=>{
					this.state.openRowKey&&this.setState({openRowKey:null});
					this.refs['refHomeCenter']&&this.refs['refHomeCenter'].closeAll();
					Keyboard.dismiss();
				}}>
					<ImageBackground source={require("../../../../assets/bg_vault_home.png")} style={{flex:1,paddingTop:header_marginTop, backgroundColor: mainBgColor}} imageStyle={{width:width, height: fixedHeight(686)}}>
						{/*title bar*/}
						<View style={{flexDirection:'row', justifyContent:'flex-end', marginTop:15, marginLeft:10,marginRight:10}}>
							<TouchableOpacity style={{height:40, width:48, justifyContent:'center', alignItems:'center'}} onPress={()=>{
								this.refs['refHomeCenter']&&this.refs['refHomeCenter'].closeAll();
								Keyboard.dismiss();
								this.setState({openRowKey:null});
								this.props.navigation.navigate('signed_vault_select_coin', {
									usage: 'import'
								});
							}}>
								<Image source={require('../../../../assets/icon_add.png')} style={{height:24, width:24, tintColor:"#fff"}}/>
							</TouchableOpacity>
						</View>
						<View style={{flexDirection:'row', justifyContent:'flex-start'}}>
							<Text style={{marginLeft:30,color:'#fff', fontSize: 20}}>{strings('wallet.fiat_total')}:</Text>
						</View>
						<View style={{alignItems:'center', justifyContent: 'center', height: 80}}>
							{!isGettingBalance ?
								<Text style={{color: '#fff', fontSize: 40}}
									  numberOfLines={1}>{totalBalance.toNumber().toFixed(2)} {strings(`currency.${fiat_currency}_unit`)}
								</Text> :
								<View style={{flexDirection: 'row'}}>
									<ActivityIndicator
										animating={true}
										color='white'
										size="small"
									/>
									<Text style={{marginLeft: 10, fontSize: 16, color: 'white'}}>{strings('label_loading')}</Text>
								</View>
							}
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
										onRefresh={this.fetchAccountsBalance}
										title={'Loading'}
									/>
								}
							/>:<View style={{...styles.accountView, justifyContent:'center', alignItems:'center'}}>
								<Image source={require('../../../../assets/empty_account.png')} style={{height:80,width:80, tintColor:'gray', marginBottom:30}} resizeMode={'contain'}/>
								<Text style={{fontSize:16,color:'gray'}}>
									{Object.keys(this.props.accounts).length? strings('wallet.no_satisfied_accounts'): strings('wallet.import_accounts_hint')}
								</Text>
							</View>
						}


						{/*center bar*/}
						<HomeCenterComponent
							ref={'refHomeCenter'}
							style={{...defaultStyles.shadow, borderRadius: fixedWidth(20),justifyContent:'center', alignItems:'center', backgroundColor:'#fff',
								width:width - 40, position:'absolute', top: fixedHeight(500)+ (Platform.OS==='ios'?20:StatusBar.currentHeight), right: 20, padding:20
							}}
							closeFilter={this.closeFilter}
							closeSort={(item)=>this.closeSort(item)}
							onChangeText={(value)=>this.onChangeText(value)}
							onTouch={()=>this.onTouchCenter()}
							currentFilter={this.state.filter}
							currentSort={this.state.sortOrder}
						/>
					</ImageBackground>
				</TouchableOpacity>
			</View>
		)
	}
}

const mapToState = ({accountsModel, settingsModel})=>{
	const {accountsMap, accountsKey, transactionsMap} = accountsModel;
	let totalBalance = BigNumber(0);
	const accounts = accountsKey.reduce((map,el)=>{
		map[el]={
			...accountsMap[el],
			txNumber: Object.keys(transactionsMap[el]).length,
		};
		totalBalance = totalBalance.plus(BigNumber(accountsMap[el].balance).multipliedBy(BigNumber(settingsModel.coinPrices[accountsMap[el].symbol])));
		return map;
	},{});
	return ({
        isGettingBalance: accountsModel.isGettingBalance,
		totalBalance: totalBalance,
		fiat_currency:settingsModel.fiat_currency,
		accounts: accounts,
		lang: settingsModel.lang
	})
};

export default connect(mapToState)(Home);

const styles = StyleSheet.create({
	accountView:{
		flex: 1, marginTop: fixedHeight(300)
	},
	accountContainerWithShadow:{
		...defaultStyles.shadow,
		borderRadius:fixedHeight(10),
		flexDirection:'row',
		marginHorizontal: fixedWidth(55),
		marginVertical: fixedHeight(15),
		height:fixedHeight(186),
		backgroundColor:'#fff',
	},
	accountContainer:{
		borderRadius:fixedHeight(10),
		flexDirection:'row',
		marginHorizontal: fixedWidth(55),
		marginVertical: fixedHeight(15),
		height:fixedHeight(186),
		backgroundColor:'#fff',
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
		borderRadius:fixedHeight(10),
		justifyContent:'center', alignItems:'center',
		height:fixedHeight(186),
		width: fixedHeight(186),
	},
	divider: {
		height: 1 / PixelRatio.get(),
		backgroundColor: '#dfdfdf'
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
