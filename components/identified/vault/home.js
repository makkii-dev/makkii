import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	ScrollView,
	View,
	Modal,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	Platform,
	Image,
	FlatList, PixelRatio
} from 'react-native';
import SwipeableRow from '../../swipeCell';
import { account } from '../../../actions/account.js';
const {width, height} = Dimensions.get('window');
const mWidth = 180;
const mHeight = 220;
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
			title: 'Total: XXX RMB',
			openRowKey: null,
			scrollEnabled:true,
		};

	}
	componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(Object.keys(this.props.accounts).length);
	}

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
				title:'Master key',
				onPress:()=>{
					console.log('New Account');
					navigation.navigate('VaultImportHdWallet');
				},
				image:require('../../../assets/aion_logo.png'),
			},
			{
				title:'Private Key',
				onPress:()=>console.log('123'),
				image:require('../../../assets/key.png'),
			},
			{
				title:'Ledger',
				onPress:()=>console.log('123'),
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
											<Text style={{...styles.modalText}}>Import from:</Text>
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
		console.log('[onClose]');
		this.setState({
			openRowKey: null,
		})
	}

	_setListViewScrollableTo(value: boolean) {
		console.log('[_setListViewScrollableTo] ' + value);
		this.setState({
				scrollEnabled: value,
		})
	}
	_renderListItem=(item) => {
		const { dispatch } = this.props;
		const Key = item.key;
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
					<View style={styles.listBtnContainer}>
						<View style={{...styles.listBtn, backgroundColor: 'gray'}}>
							<Text>HIDE</Text>
						</View>
					</View>
				}
			>
				<TouchableOpacity
					activeOpacity={1}
					onPress={e => {
						if (this.state.openRowKey) {
							// if one of key is open, close it first
							this.setState({
								openRowKey: null,
							});
							return;
						}
						dispatch(account(this.props.accounts[item.key]));
						this.props.navigation.navigate('VaultAccount');
					}}
				>
					<View style={ styles.listItem }>
						<View style={styles.listItemLeft}>
							<Text style={styles.listItemText}>{ item.name }</Text>
							<Text style={styles.listItemText}>{ item.address.substring(0, 16) + ' ...' }</Text>
						</View>
						<View style={styles.listItemRight}>
							<Text style={styles.listItemText}>{ item.balance }</Text>
							<Text style={styles.listItemText}>{ item.type }</Text>
						</View>
					</View>
				</TouchableOpacity>

			</SwipeableRow>

		)
	};

	render(){
		let dataArray = Object.keys(this.props.accounts).map(key => {
			return {...this.props.accounts[key], key: key}
		});

		return (
			<View style={{flex:1}}>
				{this._renderHeader()}
				<FlatList
					style={{flex:1}}
					renderItem={({item})=>this._renderListItem(item)}
					scrollEnabled={this.state.scrollEnabled}
					data={dataArray}
					keyExtractor={(item)=>item.key}
					onScroll={(e)=>{
						this.setState({
							openRowKey: null,
						});
					}}
				/>

			</View>
		)
	}
}

export default connect(state => { return ({ accounts: state.accounts, ui: state.ui }); })(Home);

const styles = StyleSheet.create({
	divider: {
		marginLeft: 50,
		height: 1 / PixelRatio.get(),
		backgroundColor: '#fff'
	},
	header: {
		height: top,
		width: width,
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
		color: 'grey',
	}
});