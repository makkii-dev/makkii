import * as React from 'react';
import {
	View,
	Image,
	Text,
	TextInput,
	TouchableWithoutFeedback, ActivityIndicator
} from 'react-native';
import {connect} from "react-redux";
import {strings} from "../../../locales/i18n";
import {ComponentButton} from '../../common';
import {createAction} from "../../../utils/dva";
import Loading from "../../loading";

class Home extends React.Component {
	static navigationOptions = ({navigation})=>{
		return({
			title: strings('token_exchange.title'),
		})
	};


	state = {
		srcToken: this.props.trade.srcToken,
		destToken: this.props.trade.destToken,
		srcQty: 0,
		destQty: 0,
		tradeRate: this.props.trade.tradeRate,
	};
	srcQtyFocused =false;
	destQtyFocused = false;

	componentWillReceiveProps(nextProps){
		const {isLoading, trade} = this.props;
		const {isLoading:nextisLoading, trade:nextTrade} = nextProps;
		const res =  isLoading!==nextisLoading || trade.destToken!==nextTrade.destToken
			|| trade.srcToken!== nextTrade.srcToken;
		if(res){
			const {srcQty, destQty} = this.state;
			let newState = {
				srcToken: nextTrade.srcToken,
				destToken: nextTrade.destToken,
				tradeRate: nextTrade.tradeRate,
			};
			if(this.srcQtyFocused||!this.destQtyFocused){
				newState={
					...newState,
					srcQty:srcQty,
					destQty: srcQty*nextTrade.tradeRate
				}
			}else{
				newState={
					...newState,
					srcQty: destQty/nextTrade.tradeRate,
					destQty:destQty,
				}
			}
			this.setState(newState)
		}
	}


	onExchangeSrc2dest = ()=>{
		const {srcToken,destToken} = this.props.trade;
		this.props.dispatch(createAction('ERC20Dex/updateTrade')({srcToken:destToken,destToken:srcToken}))
	};

	onChangeSrcToken = (st)=>{
		const {destToken} = this.props.trade;
		this.props.dispatch(createAction('ERC20Dex/updateTrade')({srcToken:st,destToken:destToken}))
	};

	onChangeDestToken = (dt)=>{
		const {srcToken} = this.props.trade;
		this.props.dispatch(createAction('ERC20Dex/updateTrade')({srcToken:srcToken,destToken:dt}))
	};

	onChangeSrcTokenValue = (v)=>{
		const {tradeRate} = this.state;
		this.setState({
			srcQty:v,
			destQty: v*tradeRate
		});
	};

	onChangeDestTokenValue = (v)=>{
		const {tradeRate} = this.state;
		this.setState({
			srcQty:v/tradeRate,
			destQty: v
		});
	};

	renderLoading = ()=>(
		<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
			<ActivityIndicator
				animating={true}
				color='red'
				size="large"
			/>
		</View>
	);

	renderContent = ()=>{

		const {srcToken,destToken,srcQty, destQty,tradeRate} = this.state;
		// const {srcToken,destToken,srcQty, destQty} = {srcToken:'ETH',destToken:'DAI',srcQty:0,destQty:0};

		return(
			<View style={{flex:1, paddingHorizontal:20}}>
				<View style={styles.container1}>
					<View style={{width:'100%'}}>

					</View>
					<View style={styles.tokenView}>
						<View style={styles.tokenNumberLabel}>
							<TextInput
								value={srcQty+''}
								onChangeText={this.onChangeSrcTokenValue}
								onFocus={()=>this.srcQtyFocused=true}
								onBlur={()=>this.srcQtyFocused=false}
								KeyboardType={'numeric'}
							/>
						</View>
						<View style={styles.tokenLabel}>
							<Text>{srcToken}</Text>
						</View>
					</View>
					<TouchableWithoutFeedback onPress={this.onExchangeSrc2dest}>
						<Image source={require('../../../assets/icon_exchange.png')} style={{marginRight:40,width:20,height:20}} resizeMode={'contain'}/>
					</TouchableWithoutFeedback>
					<View style={styles.tokenView}>
						<View style={styles.tokenNumberLabel}>
							<TextInput
								value={destQty+''}
								onChangeText={this.onChangeDestTokenValue}
								onFocus={()=>this.destQtyFocused=true}
								onBlur={()=>this.destQtyFocused=false}
								KeyboardType={'numeric'}
							/>
						</View>
						<View style={styles.tokenLabel}>
							<Text>{destToken+''}</Text>
						</View>
					</View>
					<View style={{width:'100%', alignItems:'flex-start'}}>
						<Text>current rate:{tradeRate}</Text>
					</View>
				</View>
				<ComponentButton
					title={'兑换'}
				/>
				<Loading isShow={this.props.isWaiting}/>
			</View>
		)
	};

	render(){
		const {isLoading} = this.props;
		return isLoading?this.renderLoading():this.renderContent();
	}

}

const mapToState = ({accounts, ERC20Dex})=>{
	return {
	    accounts:accounts,
		trade:ERC20Dex.trade,
		isLoading:ERC20Dex.isLoading,
		isWaiting:ERC20Dex.isWaiting,
    }
};


export default connect(mapToState)(Home);


const styles = {
	container1:{
		width:'100%',
		alignItems: 'flex-end',
	},
	tokenView:{
		width:'100%',
		flexDirection:'row',
		justifyContent:'space-between',
		alignItems:'center',
	},
	tokenLabel:{

	},
	tokenNumberLabel:{

	}
};