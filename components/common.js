import React,{ Component } from 'react';
import {View, TextInput, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator,PixelRatio} from 'react-native';
import styles from './styles.js'

class ComponentLogo extends Component{
	render(){
		return(
			<Image
				style={{
					width:60,
					height:60,
				}}
				source={require('../assets/wallet.png')}
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

class ComponentPassword extends Component {
	static defaultProps = {
		supportVisibility: true
	};

	constructor(props){
		super(props);
		this.state = {
			secure: true
		};
	}
	render(){
		return (
			<View style={ styles.password.view }>
				<TextInput
					style={ styles.password.text_input }
					placeholder={this.props.placeholder}
			        onChangeText={ val => {
			        	this.props.onChange(val);
			        }}
			        secureTextEntry={ this.state.secure }
			        value={ this.props.value }
			    />
			    {this.props.supportVisibility &&
				    <Text
				    	style={ styles.password.text }
				    	onPress={ e =>{
				    		this.setState({
				    			secure: !this.state.secure
				    		});
				    	}}
				    >
				    	{
				    		this.state.secure ?
				    		'SHOW' : 'HIDE'
				    	}
				    </Text>
				}
		    </View>
		);
	}
}

class ImportListItem extends React.Component {

	shouldComponentUpdate(nextProps, nextState, nextContext): boolean {
		return this.props.selected !== nextProps.selected;
	}

	render(){
		console.log('render Item')
		const {item} = this.props;
		const cbImage =  this.props.selected? require('../assets/cb_enabled.png') : require('../assets/cb_disabled.png');
		const address = item.account.address;
		return (
			<View style={{...this.props.style}}>
				<TouchableOpacity style={styles.ImportList.container} onPress={this.props.onPress}>
					<Image source={cbImage} style={styles.ImportList.itemImage}/>
					<Text style={styles.ImportList.itemText}>{address.substring(0, 10) + '...'+ address.substring(address.length-10)}</Text>
				</TouchableOpacity>
			</View>
		)
	}
}

class ImportListfooter extends React.PureComponent {

	render() {
		if (this.props.footerState === 1) {
			return (
				<View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
					<Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
						No More Accounts
					</Text>
				</View>
			);
		} else if(this.props.footerState === 2) {
			return (
				<View style={styles.ImportList.footer}>
					<ActivityIndicator style={{paddingRight: 10}}/>
					<Text>Fetching accounts</Text>
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

class EditableView extends  React.PureComponent {

	static defaultProps={
		value: 'Account Name',
		color: 'black',
		type: 0,
		endInput: ()=>{},
	};
	constructor(props){
		super(props);
		this.state={
			value:this.props.value,
			editable:false,
		};
		this.textInputRef=null;
	}
	_onPress(){
		const {editable} = this.state;
		this.setState({
			editable: !editable,
		},()=>{
			if (this.state.editable){
				this.textInputRef.focus();
			}else {
				this.textInputRef.blur();
				this.props.endInput(this.state.value);
			}
		})
	}

	render(){
		let typeImage ='';
		switch (this.props.type) {
			case '[ledger]':
				typeImage = require('../assets/ledger_logo.png');
				break;
			case '[pk]':
				typeImage = require('../assets/key.png');
				break;
			default:
				typeImage = require('../assets/aion_logo.png')
		}
		return(
			<View style={{flexDirection: 'row',alignItems: 'center'}}>
				<Image source={typeImage} style={{width:20, height:20, marginRight:10}}/>
				<View style={{marginRight: 30}}>
					<TextInput
						ref={ref=>this.textInputRef=ref}
						numberOfLines={1}
						value={this.state.value}
						editable={this.state.editable}
						style={{color:this.props.color, padding:0}}
						onChangeText={value=>this.setState({value})}
					/>
					{
						this.state.editable?<View style={{backgroundColor:'#000',height:1/ PixelRatio.get()}}/>:null
					}
				</View>
				<TouchableOpacity onPress={()=>this._onPress()} style={{right: 0, position:'absolute'}}>
					{
						this.state.editable?<Image source={require('../assets/ok-s.png')} style={{width:20,height:20}}/>
						:<Image source={require('../assets/edit.png')} style={{width:20,height:20}}/>
					}
				</TouchableOpacity>
			</View>
		)
	}
}



module.exports = {
	ComponentLogo,
	Input,
	InputMultiLines,
	ComponentPassword,
	ImportListItem,
	ImportListfooter,
	EditableView
};