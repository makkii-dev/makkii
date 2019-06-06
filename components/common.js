import React,{ Component } from 'react';
import {View, TextInput, Text, Image, Alert, TouchableOpacity, ActivityIndicator,PixelRatio,Dimensions} from 'react-native';
import styles from './styles.js';
import PropTypes from 'prop-types';
import {strings} from '../locales/i18n';
import {mainColor, fontColor, rightBtnColorDisable, rightBtnColorEnable, linkButtonColor} from './style_util';
import BigNumber from 'bignumber.js';
import {sameAddress} from "../coins/api";

const {width,height} = Dimensions.get('window');

class ComponentTabBar extends Component{
	static defaultProps={
		activeTintColor: mainColor,
		inactiveTintColor: '#adb0b5',
	};
	static propTypes= {
		activeTintColor: PropTypes.string,
		inactiveTintColor: PropTypes.string,
		active: PropTypes.string.isRequired,
	};
	render(){
		const wallet_tint_color =  this.props.active === 'wallet'?  this.props.activeTintColor:this.props.inactiveTintColor;
		const dapp_tint_color =  this.props.active === 'dapp'?  this.props.activeTintColor:this.props.inactiveTintColor;
		const settings_tint_color =  this.props.active === 'settings'?  this.props.activeTintColor:this.props.inactiveTintColor;
		return (
			<View style={{...this.props.style}}>
				<TouchableOpacity
					activeOpacity={1}
					style={{width:80,height:50, alignItems:'center', justifyContent:'center'}}
					onPress={e=>{
						this.props.onPress[0]()
					}}
				>
					<View
						style={{height:50,justifyContent:'center',alignItems:'center'}}
					>
						<Image source={require('../assets/tab_wallet.png')} style={{width:24, height: 24, marginTop:2, opacity: 0.6, tintColor: wallet_tint_color}} resizeMode={'contain'}/>
						<Text style={{fontSize: 8, color:wallet_tint_color }}>{strings('menuRef.title_wallet')}</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					activeOpacity={1}
					style={{width:60,height:50, alignItems:'center', justifyContent:'center'}}
					onPress={e=>{
						this.props.onPress[1]()
					}}
				>
					<View
						style={{height:50,justifyContent:'center',alignItems:'center'}}
					>
						<Image source={require('../assets/tab_app.png')} style={{width: 24, height: 24, marginTop:2,opacity: 0.6, tintColor: dapp_tint_color}} resizeMode={'contain'}/>
						<Text style={{fontSize: 8, color:dapp_tint_color }}>{strings('menuRef.title_dapps')}</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					activeOpacity={1}
					style={{width:80,height:50, alignItems:'center', justifyContent:'center'}}
					onPress={e=>{
						this.props.onPress[2]()
					}}
				>
					<View
						style={{height:50,justifyContent:'center',alignItems:'center'}}
					>
						<Image source={require('../assets/tab_settings.png')} style={{width: 24, height: 24, marginTop:2,opacity: 0.6, tintColor: settings_tint_color}} resizeMode={'contain'}/>
						<Text style={{fontSize: 8, color:settings_tint_color }}>{strings('menuRef.title_settings')}</Text>
					</View>
				</TouchableOpacity>
			</View>
		);
	}
}

class ComponentLogo extends Component{
	render(){
		return(
			<Image
				style={{
					...this.props.style,
					width:50,
					height:50,
				}}
				resizeMode={'contain'}
				source={require('../assets/icon_app_logo.png')}
			/>
		);
	}
}

class Input extends Component{
	static defaultProps = {
		supportVisibility: true
	};
	constructor(props){
		super(props);
	}
	render(){
		return (
			<View>
				<TextInput
					style={ styles.input.text_input }
			        onChangeText={ val => {
			        	this.props.onChange(val);
			        }}
			        value={ this.props.value }
			    />
				{this.props.supportVisibility &&
					<Text
						style={styles.input.text}
						onPress={e => {
							this.props.onClear(e);
						}}
					>CLR</Text>
				}
		    </View>
		);
	}
}

class InputMultiLines extends Component{
    static defaultProps = {
		numberOfLines: 4,
        borderRadius: 0,
		value: '',
		editable: true,
    };
	constructor(props){
		super(props);
	}
	render(){
		return (
				<TextInput
					style={{
					    ...this.props.style,
					}}
                    editable={this.props.editable}
					numberOfLines={this.props.numberOfLines}
					multiline={true}
					value={this.props.value}
			        onChangeText={ val => {
			        	this.props.onChangeText(val);
			        }}
			    />
		);
	}
}

class ImportListfooter extends React.PureComponent {

    static defaultProps = {
        hasSeparator: true,
    };
	render() {
		if (this.props.footerState === 1) {
			return (
				<View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
					{this.props.hasSeparator? <View style={{backgroundColor:'lightgray',height:1/PixelRatio.get()}}/>: null}
					<Text style={{color:'#000',fontSize:14, marginVertical: 5}}>{strings('no_more_data_label')}</Text>
				</View>
			);
		} else if(this.props.footerState === 2) {
			return (
				<View>
					{this.props.hasSeparator? <View style={{backgroundColor:'lightgray',height:1/PixelRatio.get()}}/>: null}
					<View style={styles.ImportList.footer}>
						<ActivityIndicator style={{paddingRight: 10}}/>
					<Text style={{color:'#000',fontSize:14}}>{strings('fetch_data_label')}</Text>
				</View>
				</View>
			);
		} else if(this.props.footerState === 0){
			return (
				<View style={styles.ImportList.footer}>
					<Text></Text>
				</View>
			);
		}
	}
}


class SubTextInput extends Component{
	static propTypes= {
		title: PropTypes.string.isRequired,
		rightView: PropTypes.func,
		unit: PropTypes.string,
		changeUnit: PropTypes.func,
	};
	render(){
		return(
			<View style={{justifyContent:'flex-start', alignItems:'center',width:width-100, flex:1, marginVertical: 10}}>
				<View style={{flexDirection: 'row', justifyContent:'flex-start', alignItems:'flex-start', height:20,flex:1}}>
					<Text style={{fontSize: 16,fontWeight: 'bold', color:'#000', flex:1}}>{this.props.title}</Text>
					{
						this.props.rightView&&this.props.rightView()
					}
				</View>
				<View style={{flexDirection:'row', justifyContent:'flex-start', alignItems:'flex-end',flex:1}}>
					<TextInput
						{...this.props}
					/>
					{
						this.props.unit !== undefined && this.props.changeUnit === undefined && <Text style={{fontSize:12, marginLeft:10}}>{this.props.unit}</Text>
					}
					{
						this.props.unit !== undefined && this.props.changeUnit !== undefined &&
						<TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}} onPress={this.props.changeUnit}>
                            <Text style={{fontSize:12, marginLeft:10, color: linkButtonColor}}>{this.props.unit}</Text>
                            <Image source={require('../assets/expand.png')} style={{width: 20, height: 20, tintColor:linkButtonColor}}/>
						</TouchableOpacity>
					}
				</View>
			</View>
		)
	}
}

class TransactionItemCell extends React.PureComponent {
	static propTypes={
		rightView: PropTypes.func,
		valueTextAlign: PropTypes.string.isRequired,
	};
	static defaultProps={
		valueTextAlign: 'right',
	};
	render(){
		return(
			<View style={{...this.props.style,backgroundColor: '#fff', padding:10,width:'100%',justifyContent:'space-between',alignItems:'center'}}>
				<View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'flex-start',width:'100%', height:20}}>
					<Text style={{fontSize: 16,fontWeight: 'bold', color:'#000'}}>{this.props.title}</Text>
					{
						this.props.rightView&&this.props.rightView()
					}
				</View>
				<TextInput style={{width:'100%',borderBottomColor:'#000',borderBottomWidth:1/PixelRatio.get(),
					textAlign:this.props.valueTextAlign,paddingBottom: 5}}
						   editable={false} multiline={true}
				>{this.props.value}</TextInput>
			</View>
		)
	}
}

// ======================== v2 ========================================
const Visible = () => <Image
	style={{width:20,height:20}}
	source={require('../assets/visible.png')}
    resizeMode={'contain'}
/>
const Invisible = () => <Image
	style={{width:20,height:20}}
    resizeMode={'contain'}
	source={require('../assets/invisible.png')}
/>

class RightActionButton extends Component {
    render() {
		let textColor = this.props.disabled? rightBtnColorDisable: rightBtnColorEnable;
        return (
			<TouchableOpacity
				onPress={this.props.onPress}
				disabled={this.props.disabled}
			>
				<View style={{marginRight: 20}}>
					<Text style={{
						color: textColor,
						fontWeight: 'bold'
					}}>{this.props.btnTitle ? this.props.btnTitle: strings('save_button')}</Text>
				</View>
			</TouchableOpacity>
		);
    }
}


class ComponentButton extends Component{
	render(){
		return (
			<TouchableOpacity onPress={this.props.onPress}
							  style={{
								  ...this.props.style,
								  backgroundColor: mainColor,
								  borderRadius: 5,
							  }}
			>
				<Text style={{
					color: 'white',
					paddingTop: 10,
					paddingBottom: 10,
					width: '100%',
					textAlign: 'center',
					fontWeight: 'bold',
					fontSize: 18,
				}}>
					{this.props.title}
				</Text>
			</TouchableOpacity >
		);
	}
}

class PasswordInputWithTitle extends Component {
	constructor(props){
		super(props);
		this.state = {
			secure: true
		};
	};

	render(){
		return (
			<View>
				<Text style={{
					marginBottom: 5,
					fontSize: 16,
					fontWeight: 'bold'
				}}>{this.props.title}</Text>
				<View style={{
					flexDirection: 'row',
					height: 50,
					alignItems: 'center',
				}}
				>
					<TextInput
						style={{
							fontSize: 16,
							color: fontColor,
							fontWeight: 'normal',
							lineHeight: 20,
							height: 50,
							paddingRight: 45,
							borderColor: 'lightgray',
							borderBottomWidth: 1,
							flex: 1,
						}}
						placeholder={this.props.placeholder}
						onChangeText={e=>{
							this.props.onChange(e);
						}}
						onBlur={e=>{
							this.setState({
								secure: true
							});
						}}
						secureTextEntry={this.state.secure}
						value={this.props.value}
					/>
					<TouchableOpacity
						style={styles.password.display}
						onPress={e=>{
							this.setState({
								secure: !this.state.secure
							});
						}}
					>
						{
							this.state.secure ?
								<Invisible />: <Visible />
						}
					</TouchableOpacity>
				</View>
			</View>
		);
	};
}

class PasswordInput extends Component {
	constructor(props){
		super(props);
		this.state = {
			secure: true
		};
	};

	render(){
		return (
			<View style={styles.password.view}>
				<Image
					style={{
						width: 20,
						height: 20,
						position: 'absolute',
						left: 0,
					}}
					resizeMode={'contain'}
					source={require('../assets/icon_password.png')}
				/>
				<TextInput
					style={styles.password.text_input}
					placeholder={this.props.placeholder}
					onChangeText={e=>{
						this.props.onChange(e);
					}}
					onBlur={e=>{
						this.setState({
							secure: true
						});
					}}
					secureTextEntry={this.state.secure}
					value={this.props.value}
				/>
				<TouchableOpacity
					style={styles.password.display}
					onPress={e=>{
						this.setState({
							secure: !this.state.secure
						});
					}}
				>
					{
						this.state.secure ?
							<Invisible />: <Visible />
					}
				</TouchableOpacity>
			</View>
		);
	};
}

class TextInputWithTitle extends Component {

	static defaultProps={
		onFocus:()=>{},
	};

	constructor(props){
		super(props);
	};

	render(){
		return (
			<View>
				<View style={{flexDirection:'row', width:'100%', justifyContent:'space-between'}}>
					<Text style={{
						marginBottom: 5,
						fontSize: 16,
						fontWeight: 'bold'
					}}>{this.props.title}</Text>
					{
						this.props.rightView?this.props.rightView():null
					}
				</View>
				<View style={{
					flexDirection: 'row',
					height: 50,
					alignItems: 'center',
				}}
				>
					<TextInput
						style={{
							fontSize: 16,
							color: fontColor,
							fontWeight: 'normal',
							paddingRight: 45,
							borderColor: 'lightgray',
							borderBottomWidth: 1,
							flex: 1,
							paddingVertical:10,
						}}
						placeholder={this.props.placeholder}
						keyboardType={this.props.keyboardType}
						onChangeText={e=>{
							this.props.onChange(e);
						}}
						onFocus={()=>this.props.onFocus()}
						value={this.props.value}
					/>
					{this.props.trailingText ?
						<Text style={{color: fontColor, fontSize: 16}}>{this.props.trailingText}</Text>: null
					}
				</View>
			</View>
		);
	};
}

function alert_ok(title, msg) {
	popCustom.show(title, msg, [
		{
			text: strings('alert_ok_button'), onPress: ()=> {}
		}
	]);
}

class PendingComponent extends React.Component {
	static propTypes ={
		status: PropTypes.string.isRequired,
	};
	state={
		waiting:0,
	};

	constructor(props){
		super(props);
	}

	componentWillMount() {
		this.mount = true;
		if(this.props.status === 'PENDING') {
			this.interval = setInterval(() => {
				const {waiting} = this.state;
				this.mount && this.setState({waiting: (waiting + 1) % 5})
			}, 500)
		}
	}
	componentWillUnmount() {
		this.mount = false;
		this.interval&&clearInterval(this.interval);
	}

	componentWillUpdate(nextProps){
		if(this.props.status !== nextProps.status) {
			if (nextProps.status === 'PENDING') {
				this.interval = setInterval(() => {
					const {waiting} = this.state;
					this.mount && this.setState({waiting: (waiting + 1) % 5})
				}, 500)
			}
		}
	}

	render(){
		if(this.props.status === 'FAILED' || this.props.status === 'CONFIRMED'){
			return <Text style={{textAlign: 'left'}}>{strings(`transaction_detail.${this.props.status}`)}</Text>
		}else{
			const tail = '.'.repeat(this.state.waiting);
			return <Text style={{textAlign: 'left'}}>{strings(`transaction_detail.${this.props.status}`)+tail}</Text>
		}
	}
}


class TransactionItem extends React.PureComponent{
	static propTypes ={
		account: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
		onPress: PropTypes.func.isRequired,
        currentAddr: PropTypes.string.isRequired,
		symbol: PropTypes.string.isRequired,
	};


	render(){
		const {transaction, onPress,currentAddr,symbol, account} = this.props;
        const timestamp = transaction.timestamp === undefined? '': new Date(transaction.timestamp).Format("yyyy/MM/dd hh:mm");
		const isSender = sameAddress(account.symbol, transaction.from, currentAddr);
		const m = new BigNumber(transaction.value).toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
		const fixed = Math.min(8,Math.max(0, (m[1] || '').length - m[2]));
		const value = isSender? '-'+new BigNumber(transaction.value).toFixed(fixed): '+'+new BigNumber(transaction.value).toFixed(fixed);
		const valueColor = isSender? 'red':'green';
		if(transaction.status === 'PENDING'){
			console.log('account:' + currentAddr +' try to get transaction '+transaction.hash+' status');
			listenTx.addTransaction(transaction, account.symbol, account.symbol === symbol? undefined: symbol);
		}

		return (
			<TouchableOpacity
				style={{...styles.shadow,marginHorizontal:20,marginVertical:10, borderRadius:10,
					width:width-40,height:80,backgroundColor:'#fff', justifyContent:'space-between',padding: 10}}
				onPress={onPress}
			>
				<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
					<Text>{timestamp}</Text>
					<PendingComponent status={transaction.status}/>
				</View>
				<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end'}}>
					<Text>{transaction.hash.substring(0, 16) + '...' }</Text>
					<Text style={{color:valueColor}}>{value} <Text>{symbol}</Text></Text>
				</View>
			</TouchableOpacity>
		)
	}
}


module.exports = {
	ComponentButton,
	ComponentTabBar,
	ComponentLogo,
	Input,
	InputMultiLines,
	TextInputWithTitle,
	PasswordInput,
	PasswordInputWithTitle,
	ImportListfooter,
	TransactionItemCell,
	RightActionButton,
	SubTextInput,
	alert_ok,
	TransactionItem,
	PendingComponent
};
