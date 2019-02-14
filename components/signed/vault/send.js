import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Button, View, Text, Image, TouchableOpacity, ScrollView, Dimensions, TextInput, StyleSheet, Alert} from 'react-native';
import { strings } from '../../../locales/i18n';
import { validateAddress, validateAmount, validatePositiveInteger} from '../../../utils';
import {AionTransaction } from '../../../libs/aion-hd-wallet/index.js';
import { Ed25519Key } from '../../../libs/aion-hd-wallet/src/key/Ed25519Key';
import Loading from '../../loading';
import Toast from '../../toast.js';
import BigNumber from 'bignumber.js';
import {update_account_txs} from "../../../actions/accounts";

const {width, height} = Dimensions.get('window')
class Send extends Component {

	static navigationOptions=({navigation})=>{
		return {
			title: strings('send.title'),
			headerTitleStyle: {
				alignItems: 'center',
				textAlign: 'center',
				flex:1,
			},
			headerRight: <View></View>
		};
	};
	constructor(props){
		super(props);
		this.state={
			showAdvanced: false,
			amount: this.props.navigation.state.params.value? this.props.navigation.state.params.value: '0',
			recipient: '',
			gasPrice: '10',
			gasLimit: '21000',
		}
        this.addr=this.props.navigation.state.params.address;
		this.account = this.props.accounts[this.addr];
		console.log("selected account is: " + JSON.stringify(this.props.accounts[this.addr]));
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		const arrowImage =  this.state.showAdvanced? require('../../../assets/arrow_up.png') :  require('../../../assets/arrow_down.png')
		return (
			<View style={{flex:1,justifyContent:'center'}}>
                <ScrollView style={{width,height}}  contentContainerStyle={{justifyContent: 'center',padding:20}}>
                    <View>
                        <Text>{strings('send.label_receiver')}</Text>
                    </View>
                    <View style={st.text_input_cell}>
                        <TextInput
                            style={st.text_input}
                            value={this.state.receiver}
                            placeholder={strings('send.hint_recipient')}
                            onChangeText={text => {
                                this.setState({
                                    recipient: text,
                                });
                            }}
                        />
                        <TouchableOpacity onPress={()=> this.scan()}>
                            <Image source={require('../../../assets/scan.png')} style={{
                                width: 20,
                                height: 20,
                            }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        marginTop: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        <Text>{strings('send.label_amount')}</Text>
                        <Text style={{
                            color: 'blue',
                        }} onPress={()=>this.sendAll()}>{strings('send.button_send_all')}</Text>
                    </View>
                    <View style={st.text_input_cell}>
                        <TextInput
                            style={st.text_input}
                            value={this.state.amount}
                            onChangeText={text => {
                                this.setState({
                                    amount: text,
                                });
                            }}
                        />
                        <Text style={{
                            color: 'black',
                            fontWeight: 'normal',
                            fontSize: 16,
                        }}>AION</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{
                        this.setState({
                            showAdvanced: !this.state.showAdvanced,
                        })
                    }}>
                        <View style={{marginTop: 20, marginBottom: 10}}>
                            {
                                this.state.showAdvanced ?
                                <Text style={{color:'blue'}}>{strings('send.hide_advanced')}</Text>:
                                <Text style={{color:'blue'}}>{strings('send.show_advanced')}</Text>
                            }
                            {/*<Image source={arrowImage} style={{marginLeft:10, width:30, height:30, tintColor: '#fff'}}/>*/}
                        </View>
                    </TouchableOpacity>
                    {
                        this.state.showAdvanced ?
                            <View>
                                <View>
                                    <Text>{strings('send.label_gas_price')}</Text>
                                </View>
                                <View style={st.text_input_cell}>
                                    <TextInput
                                        style={st.text_input}
                                        value={this.state.gasPrice}
                                        onChangeText={text => {
                                            this.setState({
                                                gasPrice: text,
                                            });
                                        }}
                                    />
                                    <Text style={{
                                        color: 'black',
                                        fontWeight: 'normal',
                                        fontSize: 16,
                                    }}>AMP</Text>
                                </View>
                                <View style={{marginTop: 20}}>
                                    <Text>{strings('send.label_gas_limit')}</Text>
                                </View>
                                <TextInput
                                    style={{...st.text_input, marginRight: 0}}
                                    value={this.state.gasLimit}
                                    onChangeText={text => {
                                        this.setState({
                                            gasLimit: text,
                                        });
                                    }}
                                />
                            </View>: null
                    }
                    <View style={{ marginTop:40, }}>
                        <Button title={strings('send_button')}
                                onPress={this.transfer.bind(this)}
                                />
                    </View>
                </ScrollView>
                <Loading ref={element => {
                    this.loadingView = element;
				}}/>
                <Toast ref={"toast"}
					   duration={Toast.Duration.short}
					   onDismiss={() => this.props.navigation.goBack()}
					   />
			</View>
		)
	}

	transfer=() => {
		console.log("transfer clicked.");
		if (!this.validateFields()) return;

		let sender = this.account.address;
		if (!sender.startsWith('0x')) {
			sender = '0x' + sender;
		}
		let thisLoadingView = this.loadingView;
		let thisToast = this.refs.toast;
		const {dispatch} = this.props;
		thisLoadingView.show(strings('send.progress_sending_tx'));
		web3.eth.getTransactionCount(sender).then(count => {
			console.log('get transaction count: ' + count);

			let amount = this.state.amount;
			let tx = new AionTransaction({
				nonce: count,
				gasPrice: this.state.gasPrice * 1e9,
				gas: this.state.gasLimit - 0,
				to: this.state.recipient,
                value: new BigNumber(amount).shiftedBy(18).toNumber(),
				type: 1,
			});
			console.log("tx to send:" , tx);
			try {
				tx.sign(Ed25519Key.fromSecretKey(this.account.private_key));
				web3.eth.sendSignedTransaction(tx.getEncoded()).on('transactionHash', function(hash) {
					console.log("transaction sent: hash=" + hash);

					let txs = {};
					let pendingTx={};
					pendingTx.hash = hash;
					pendingTx.timestamp = tx.timestamp;
                    pendingTx.from = sender;
                    pendingTx.to = tx.to;
                    pendingTx.value = amount - 0;
                    pendingTx.status = 'PENDING';
                    txs[hash]=pendingTx;

					dispatch(update_account_txs(sender, txs));

					thisLoadingView.hide();
					thisToast.show(strings('send.toast_tx_sent'));
				});
			} catch (error) {
				console.log("sign tx error:", error);
				thisLoadingView.hide();
				Alert.alert(strings('alert_title_error'), strings('send.error_send_transaction'));
			}
		}, error => {
			console.log('get transaction count failed:', error);
			thisLoadingView.hide();
			Alert.alert(strings('alert_title_error'), strings('send.error_send_transaction'));
		});
	}

	validateFields=() => {
		// validate recipient
		if (!validateAddress(this.state.recipient)) {
			Alert.alert(strings('alert_title_error'), strings('send.error_format_recipient'));
			return false;
		}

		// validate amount
		// 1. amount format
		if (!validateAmount(this.state.amount)) {
			Alert.alert(strings('alert_title_error'), strings('send.error_format_amount'));
			return false;
		}
		// 2. < total balance
		console.log("gasPrice(" + this.state.gasPrice + ") * gasLimit(" + this.state.gasLimit + "):" + parseFloat(this.state.gasPrice) * parseInt(this.state.gasLimit));
		console.log("amount+gasfee:" + (parseFloat(this.state.amount) + parseFloat(this.state.gasPrice) * parseInt(this.state.gasLimit) / Math.pow(10, 9)));
		console.log("total balance: " + this.account.balance);
		if (parseFloat(this.state.amount) + parseFloat(this.state.gasPrice) * parseInt(this.state.gasLimit) / Math.pow(10, 9) > this.account.balance) {
			Alert.alert(strings('alert_title_error'), strings('send.error_insufficient_amount'));
			return false;
		}

		// validate gas price
		if (!validateAmount(this.state.gasPrice)) {
			Alert.alert(strings('alert_title_error'), strings('send.error_invalid_gas_price'));
			return false;
		}

		// validate gas limit
		if (!validatePositiveInteger(this.state.gasLimit)) {
			Alert.alert(strings('alert_title_error'), strings('send.error_invalid_gas_limit'));
			return false;
		}

		return true;
	}

	sendAll=() => {
		console.log("send all clicked.");
		let all = this.account.balance - parseInt(this.state.gasLimit) * parseFloat(this.state.gasPrice) / Math.pow(10, 9);
		this.setState({
			amount: '' + (all > 0? all: 0)
		});

	}
	scan=() => {
		console.log("scan clicked.");
	}
}

const st = StyleSheet.create({
	text_input: {
		flex: 1,
		fontSize: 16,
		color: '#777676',
		fontWeight: 'normal',
		lineHeight: 20,
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 5,
		paddingRight: 60,
		borderColor: '#8c8a8a',
		borderBottomWidth: 1,
		marginRight: 10,
	},
	text_input_cell: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	}
});

export default connect(state => { return ({
	setting: state.setting,
    accounts: state.accounts,
}); })(Send);
