import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Alert,
	PermissionsAndroid,
	View,
	Modal,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	Platform,  
	Image,
	FlatList, PixelRatio, InteractionManager, RefreshControl
} from 'react-native';
import SwipeableRow from '../../swipeCell';
import { delete_account, accounts_add} from '../../../actions/accounts.js';
import {account} from '../../../actions/account.js';
import Loading from '../../loading.js';
import wallet from 'react-native-aion-hw-wallet';
import { getLedgerMessage, fetchRequest, getCoinPrice } from '../../../utils.js';
import otherStyles from  '../../styles';
import {strings} from "../../../locales/i18n";
import {ComponentTabBar} from '../../common.js';
import BigNumber from 'bignumber.js';
const {width, height} = Dimensions.get('window');
const mWidth = 180;
const top = 100;

class Home extends Component {

	static navigationOptions = ({ navigation }) => {
	    return {
	        header: null
	    };
    };
	constructor(props){
		super(props);
		this.state={
			showPop: false,
			title: `Total: XXX RMB`,
			openRowKey: null,
			scrollEnabled:true,
			refreshing: false,
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
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.accounts);
		this.requestStoragePermission();
	}
	
	componentWillMount(): void {
		InteractionManager.runAfterInteractions(()=> {
			this.fetchAccountsBalance();
		})
	}
	BalanceToRMB(amount){
		getCoinPrice('CNY',amount).then(res=>{
			this.setState({
				title : `Total: ${res.toFixed(2)} RMB`
			})
		})
	}

	fetchAccountsBalance = ()=> {
		const {dispatch,accounts} = this.props;
		if (Object.keys(accounts).length === 0) {
			this.setState({
				refreshing: false,
			});
			return;
		}
		let executors=[];
		Object.values(accounts).map(value => {
			executors.push(
				new Promise((resolve, reject) => {
					web3.eth.getBalance(value.address).then(balance=>{
						value.balance = new BigNumber(balance).shiftedBy(-18).toNumber();
						resolve(value)
					},error => {
						console.log('[error] account: ', value.address);
						console.log(error);
						console.log(web3);
						reject(error)
					})
				}));
		});  
		Promise.all(executors).then(
			res=>{
				console.log('[accounts promise] ', res) ;
				let newAccounts={};
				let totalBalance=0;
				res.forEach(account=>{
					totalBalance+=account.balance;
					newAccounts[account.address] = account;
				});
				this.BalanceToRMB(totalBalance);
				dispatch(accounts_add(newAccounts, this.props.user.hashed_password));
				this.setState({
					refreshing: false,
				})
			},errors=>{
				console.log(errors);
				this.setState({
					refreshing: false,
				},()=>{
					Alert.alert('Error', 'get Balance error');
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
					this.props.navigation.navigate('signed_vault_import_ledger');
				}, error => {
					this.loadingView.hide();
					Alert.alert(strings('alert_title_error'), getLedgerMessage(error.code));
				});
			}
		});
	};

	_handleAddClick=()=>{this.setState({showPop:!this.state.showPop})};

	_closeModal=()=>{this.setState({showPop:false})};

	_renderModalItem=(item)=>{
		return (
			<View style={styles.modalItemView}>
				<TouchableOpacity activeOpacity={0.3} onPress={()=>{item.onPress();this._closeModal()}} style={styles.modalItemView}>
					<Image source={item.image} style={styles.modalImage}/>
					<Text numberOfLines={1} style={styles.modalText}>{item.title}</Text>
				</TouchableOpacity>
			</View>
		);
	};

	_renderHeader() {
		const {navigation} = this.props;
		const menuItems = [
			{
				title:strings('wallet.menu_master_key'),
				onPress:()=>{
					navigation.navigate('signed_vault_import_hdwallet');
				},
				image:require('../../../assets/aion_logo.png'),
			},
			{
				title:strings('wallet.menu_private_key'),
				onPress:()=>{
					navigation.navigate('signed_vault_import_private_key');
				},
				image:require('../../../assets/key.png'),
			},
			{
				title:strings('wallet.menu_ledger'),
				onPress:()=>this.onImportLedger(),
				image:require('../../../assets/ledger_logo.png'),
			},
		];
		return (
			<View style={styles.header}>
				<View style={styles.headerEnds}/>
				<View style={styles.headerTitle}>
					<Text style={styles.headerTitleText}>{this.state.title}</Text>
				</View>
				<View style={styles.headerEnds}>
					<TouchableOpacity activeOpacity={0.5} onPress={this._handleAddClick}>
						<Image
							source={require('../../../assets/ic_add.png')}
							style={styles.titleBarImg}
						/>
					</TouchableOpacity>
					<View style={{position: 'absolute', top: 10, left: 0, width: width, height: height}}>
						<Modal
							transparent={true}
							visible={this.state.showPop}
							animationType={'none'}
							onRequestClose={()=>{}}>
							<TouchableOpacity activeOpacity={1} style={{width,height}} onPress={this._closeModal}>
								<FlatList
									style={styles.modalContainer}
									data={menuItems}
									renderItem={({item})=>this._renderModalItem(item)}
									keyExtractor={(item,index)=>index.toString()}
									ItemSeparatorComponent={()=>(<View style={styles.divider}/>)}
									ListHeaderComponent={()=>(
										<View style={{flex:1, height:50, justifyContent:'space-between', paddingTop: 10}}>
											<Text style={{...styles.modalText}}>{strings('wallet.title_import_from')}</Text>
											<View style={{...styles.divider, marginLeft: 0}}/>
										</View>)}
								/>
							</TouchableOpacity>
						</Modal>
					</View>
				</View>
			</View>
		)
	}


	_onOpen (Key: any) {
		console.log('[onOpen]');
		this.setState({
			openRowKey: Key,
		})
	}

	_onClose(Key: any) {
		this.setState({
			openRowKey: null,
		})
	}

	_setListViewScrollableTo(value: boolean) {
		this.setState({
				scrollEnabled: value,
		})
	}

	onDeleteAccount(key){
		const { dispatch } = this.props;
		Alert.alert(
			'WARNING',
			'Are you sure you want to delete this account?',
			[
				{text:'CANCEL',onPress:()=>{}},
				{text: 'DELETE', onPress:()=>{
						dispatch(delete_account(key));
						console.log('delete account: ', key );
					}}
				],
			{cancelable:false}
		)
	}

	_renderListItem=(item) => {
		const { dispatch } = this.props;
		const Key = item.address;
		let backgroundColor = '';
		let accountImage = '';
		switch (item.type) {
			case '[ledger]':
				backgroundColor = '#000';
				accountImage = require('../../../assets/ledger_logo.png');break;
			case '[pk]':
				backgroundColor = '#6600ff';
				accountImage = require('../../../assets/key.png');break;
			default:
				backgroundColor = '#3399ff';
				accountImage = require('../../../assets/aion_logo.png');
		}
		return (
			<SwipeableRow
				style={{padding:10}}
				isOpen={ Key === this.state.openRowKey }
				swipeEnabled={ this.state.openRowKey === null }
				preventSwipeRight={true}
				maxSwipeDistance={100}
				onOpen={()=> {
					this._onOpen(Key);
					this._setListViewScrollableTo(false)
				}}
				onClose={() => {
					this._onClose(Key);
					this._setListViewScrollableTo(true)
				}}
				shouldBounceOnMount={true}
				slideoutView={
					<TouchableOpacity style={otherStyles.VaultHome.slideOutContainer} onPress={()=>{
						this.onDeleteAccount(Key);
					}}>
						<View style={otherStyles.VaultHome.slideOutContainer}>
							<View style={{...otherStyles.VaultHome.slideBtn, backgroundColor: 'orange'}}>
								<Text>DELETE</Text>
							</View>
						</View>
					</TouchableOpacity>
				}
			>
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => {
						if (this.state.openRowKey) {
							// if one of key is open, close it first
							this.setState({
								openRowKey: null,
							});
							return;
						}
						dispatch(account(this.props.accounts[item.address]));
						this.props.navigation.navigate('signed_vault_account',{address: item.address});
					}}
				>
					<View style={ {...otherStyles.VaultHome.accountContainer, backgroundColor:backgroundColor} }>
						<View style={otherStyles.VaultHome.accountLeftView}>
							<View style={otherStyles.VaultHome.accountNameView}>
								<Image source={accountImage} style={{width:15, height:15, tintColor:'#fff', marginRight:10}}/>
								<Text style={styles.listItemText}>{ item.name }</Text>
							</View>
							<Text style={otherStyles.VaultHome.addressFontStyle}>{ item.address.substring(0, 10) + '...' + item.address.substring(54)}</Text>
						</View>
						<View style={otherStyles.VaultHome.accountRightView}>
							<Text style={styles.listItemText} numberOfLines={1}>{ (item.balance-0).toFixed(4) } AION</Text>
						</View>
					</View>
				</TouchableOpacity>

			</SwipeableRow>

		)
	};

	render(){
		return (
			<View style={{flex:1}}>
				{this._renderHeader()}
				<FlatList
					style={{flex:1}}
					renderItem={({item})=>this._renderListItem(item)}
					scrollEnabled={this.state.scrollEnabled}
					data={Object.values(this.props.accounts)}
					keyExtractor={(item, index)=>index + ''}
					onScroll={(e)=>{
						this.setState({
							openRowKey: null,
						});
					}}
					ListEmptyComponent={()=>
						<View>
							<Text style={{alignSelf: 'center', textAlign:'center'}}>
								Please Import a account
							</Text>
						</View>
					}
					refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={this.onRefresh}
							title={'Loading'}
						/>
					}
				/>
				<Loading ref={(element) => {
					this.loadingView = element;
				}}/>
				<ComponentTabBar
					style={{
						position: 'absolute',
						bottom: 0,  
						backgroundColor: 'white', 
						flexDirection: 'row',
						justifyContent: 'space-around',
						right: 0,
						left: 0,
						borderTopWidth: 0.3,
						borderTopColor: '#8c8a8a'  
					}}
					active={'wallet'}
					onPress={[
						()=>{this.props.navigation.navigate('signed_vault');},
						()=>{this.props.navigation.navigate('signed_dapps');},
						()=>{this.props.navigation.navigate('signed_setting');},
					]}
				/>
			</View>
		)
	}
}

export default connect(state => {
	return ({
		user: state.user,
		accounts: state.accounts,
		ui: state.ui,
		settings: state.settings
	}); })(Home);

const styles = StyleSheet.create({
	divider: {
		marginLeft: 50,
		height: 1 / PixelRatio.get(),
		backgroundColor: '#fff'
	},
	header: {
		height: top,
		backgroundColor: '#eeeeee',
		elevation: 5,
		flexDirection: 'row',
		justifyContent: 'space-between',
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
		fontWeight: Platform.OS === 'ios' ? '600' : '500',
		color: 'rgba(0, 0, 0, .9)',
	},
	titleBarImg: {
		width: 25,
		height: 25,
		margin: 15,
	},
	modalContainer: {
		backgroundColor: 'black',
		width: mWidth,
		position: 'absolute',
		left: width - mWidth - 10,
		top: 50,
		padding: 5,
	},
	modalItemView: {
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
	modalText:{
		color: '#fff',
		fontSize: 16,
		marginLeft: 5,
	},
	modalImage:{
		width: 20,
		height:20,
		marginRight: 10,
		tintColor: '#fff'
	},
	listBtnContainer:{
		flex:1,
		flexDirection: 'row',
		margin:0,
		justifyContent: 'flex-end',
	},
	listBtn:{
		width: 100,
		justifyContent: 'center',
		alignItems: 'center'
	},
	listItem: {
		height: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
		backgroundColor: '#fff'
	},
	listItemLeft: {
		justifyContent: 'space-between'
	},
	listItemRight: {
	    width: 80,
	},
	listItemText: {
		textAlign:'left',
		color: '#fff',
	}
});