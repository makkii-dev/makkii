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
import { Header} from 'react-navigation';
const {width, height} = Dimensions.get('window');
const mWidth = 180;
const mHeight = 220;
const top = 60;

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
			title: 'Total: 0',
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

	_renderModalItem=(items)=>{
		let modalItem=[];
		let keyIndex = 0;
		for (let i = 0; i<items.length;i++){
			modalItem.push(
				<View key={keyIndex} style={styles.modalItemView}>
					<TouchableOpacity activeOpacity={0.3} onPress={()=>{items[i].onPress();this._closeModal()}} style={styles.modalItemView}>
						<Text numberOfLines={1} style={styles.modalText}>{items[i].title}</Text>
					</TouchableOpacity>
				</View>
			);
			if (i !==items.length-1){
				modalItem.push(
					<View key={keyIndex+1} style={styles.divider}/>
				);
				keyIndex = keyIndex + 1;
			}
			keyIndex = keyIndex + 1;
		}
		return modalItem;
	};

	_renderHeader() {
		const menuItems = [
			{title:'123',onPress:()=>console.log('123')},
			{title:'234',onPress:()=>console.log('123')},
			{title:'666',onPress:()=>console.log('123')},

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
					<View style={{position: 'absolute', top: Header.HEIGHT, left: 0, width: width, height: height}}>
						<Modal
							transparent={true}
							visible={this.state.showPop}
							animationType={'none'}
							onRequestClose={()=>{}}>
							<TouchableOpacity activeOpacity={1} style={{width,height}} onPress={this._closeModal}>
								<View style={styles.modal}>
									{this._renderModalItem(menuItems)}
								</View>

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
				isOpen={ Key === this.state.openRowKey }
				maxSwipeDistance={200}
				onOpen={()=> this._onOpen(Key)}
				onClose={() => this._onClose(Key)}
				shouldBounceOnMount={true}
				onSwipeEnd={()=>this._setListViewScrollableTo(true)}
				onSwipeStart={()=>this._setListViewScrollableTo(false)}
				slideoutView={
					<View style={styles.listBtnContainer}>
						<View style={{...styles.listBtn, backgroundColor: 'gray'}}>
							<Text>HIDE</Text>
						</View>
						<View style={{...styles.listBtn, backgroundColor: 'red'}}>
							<Text>DELETE</Text>
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
			<View>
				{this._renderHeader()}
				<FlatList
					style={{marginBottom: 50}}
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
		width: mWidth,
		height: 1 / PixelRatio.get(),
		backgroundColor: '#fff'
	},
	header: {
		height: Header.HEIGHT,
		width: width,
		backgroundColor: '#eeeeee',
		elevation: 5,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	headerEnds:{
		width: 50,
		justifyContent: 'center',
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
		marginLeft: 15,
		marginRight: 15,
	},
	modal: {
		backgroundColor: 'black',
		width: mWidth,
		height: mHeight,
		position: 'absolute',
		left: width - mWidth - 10,
		top: top,
		padding: 5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalItemView: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
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
	listBtnContainer:{
		flex:1,
		flexDirection: 'row',
		margin:0,
		justifyContent: 'center',
	},
	listBtn:{
		flex:1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	listItem: {
		height: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
        padding: 10,
        paddingBottom: 15,
        backgroundColor: '#ffffff',
	},
	listItemLeft: {
	},
	listItemRight: {
	    width: 60,
	},
	listItemText: {
		color: 'grey',
	}
});