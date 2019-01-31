import React,{ Component } from 'react';
import {View, TextInput, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
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

module.exports = {
	ComponentLogo,
	Input,
	InputMultiLines,
	ComponentPassword,
	ImportListItem,
	ImportListfooter
};