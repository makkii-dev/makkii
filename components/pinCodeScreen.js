import React from  'react';
import {
    Animated,
    View,
    Text,
    Dimensions,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image, BackHandler
} from 'react-native';
import { connect } from 'react-redux';
import {mainColor, mainBgColor} from './style_util';
import {getStatusBarHeight, hashPassword} from '../utils';
import {user_update_pincode} from '../actions/user'
const {width,height} = Dimensions.get('window');
const KeyboardData = ["1", "2", "3", "4", "5", "6", "7", "8", "9", 'cancel', "0", "delete"];
const MaxPinCodeLength = 6;
class PinCodeScreen extends React.Component {

    /***********************************************************
     * 1. create pin Code process:
     *     create pinCode -> confirm pinCode -> another screen
     * (pinState)  1 -> 2
     * 2. modify pin Code process:
     *     enter old pinCode -> create  -> confirm -> another screen
     * (pinState) 0 -> 1 -> 2
     * 3. unlock screen
     *     enter pinCode -> another screen
     * (pinState) 0
     ***********************************************************/

    isShake = false;
    animatedValue = new Animated.Value(0);
    createPinCode = '';
    constructor(props){
        super(props);
        this.isModifyPinCode =  this.props.navigation.getParam('isModifyPinCode', false);
        this.onUnlockSuccess  = this.props.navigation.getParam('onUnlockSuccess', ()=>{});
        this.targetScreen = this.props.navigation.getParam('targetScreen');
        this.targetScreenArgs = this.props.navigation.getParam('targetScreenArgs',{});
        this.cancel = this.props.navigation.getParam('cancel', true);
        this.state={
            pinCode: '',
            pinState: 0,
        };
    }
    onGoback(){
        this.cancel&&this.props.navigation.goBack();
    }
    componentWillMount(): void {
        this.setState({
            // 0: unlock; 1: create pinCode; 2: confirm pinCode
            pinState: this.props.user.hashed_pinCode===''?1:0,
        });
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.onGoback(); // works best when the goBack is async
            return true;
        });
    }
    componentWillUnmount(): void {
        this.backHandler.remove();
    }

    renderDots(numberOfDots) {
        const dots = [];
        const { pinCode } = this.state;
        const pinTyped = pinCode.length;

        const styleDot = {
            width: 13,
            height: 13,
            borderRadius: 6.5,
            borderWidth: 1,
            borderColor: mainColor,
            marginHorizontal: 12
        };
        for (let i = 0; i < numberOfDots; i++) {
            const backgroundColor = i < pinTyped ? { backgroundColor: mainColor } : {};
            const dot = <View style={[styleDot, backgroundColor]} key={i} />;
            dots.push(dot)
        }
        return dots
    }

    handleErrorCode(){
        Animated.spring(
            this.animatedValue,
            {
                toValue: this.isShake ? 0 : 1,
                duration: 250,
                tension: 80,
                friction: 4
            }
        ).start();
        this.isShake=!this.isShake;
        this.setState({pinCode: ''})
    }

    handleCreateCode(){
        const { pinCode } = this.state;
        this.createPinCode = pinCode;
        this.setState({
            pinCode: '',
            pinState: 2,
        })
    }

    handleConfirmCode(){
        const {dispatch} = this.props;
        const { pinCode } = this.state;
        if (pinCode !== this.createPinCode){
            this.handleErrorCode();
            return false;
        }else {
            const hashed_pinCode = hashPassword(pinCode);
            dispatch(user_update_pincode(hashed_pinCode));
            return true;
        }
    }

    checkPinCode(){
        const {pinCode , pinState} = this.state;
        if(pinState === 0 ){
            // unlock
            const hashed_pinCode = hashPassword(pinCode);
            console.log('hashed_pinCode: ', hashed_pinCode);
            console.log('props.hashed_pinCode', this.props.user.hashed_pinCode);
            if(hashed_pinCode === this.props.user.hashed_pinCode){
                if(this.isModifyPinCode){
                    this.setState({
                        pinCode: '',
                        pinState: 1,
                    })
                }else {
                    setTimeout(()=>{
                        this.onUnlockSuccess&&this.onUnlockSuccess();
                        console.log('this.targetScreen', this.targetScreen);
                        this.targetScreen&&this.props.navigation.navigate(this.targetScreen,this.targetScreenArgs);
                        this.targetScreen||this.props.navigation.goBack();
                    },100);
                }
            }else {
                this.handleErrorCode()
            }
        }else if (pinState === 1) {
            this.handleCreateCode()
        }else if (pinState === 2) {
            this.handleConfirmCode() &&setTimeout(()=>{
                this.onUnlockSuccess&&this.onUnlockSuccess();
                console.log('this.targetScreen', this.targetScreen);
                this.targetScreen&&this.props.navigation.navigate(this.targetScreen,this.targetScreenArgs);
                this.targetScreen||this.props.navigation.goBack();
            },100);
        }
    };


    onPressNumber =(number)=>{
        this.state.pinCode.length<=MaxPinCodeLength&&(this.setState({
            pinCode: this.state.pinCode + number,
        },()=>{
            if(this.state.pinCode.length === MaxPinCodeLength){
                this.checkPinCode();
            }
        }));
    };

    onPressDelete = ()=>{
        this.setState({
            pinCode: this.state.pinCode.slice(0, this.state.pinCode.length-1)
        })
    };

    renderItem = ({item}) => {
        const itemBorder = item==='cancel'&&this.cancel===false?{}:{
            borderRadius : 75 / 2,
            borderWidth: 0.5,
            borderColor: mainColor};
        return (
            <TouchableOpacity
                disabled={item==='cancel'&&this.cancel===false}
                style={[styles.keyboardViewItem,itemBorder, {backgroundColor: mainColor}]}
                onPress={() => {
                    if(item!== 'cancel' && item !== 'delete'){
                        this.onPressNumber(item)
                    } else if (item === 'delete'){
                        this.onPressDelete()
                    } else {
                        this.cancel&&this.props.navigation.goBack(); // can cancel
                    }
                }}
                >
                <View style={[styles.keyboardViewItem,itemBorder,{backgroundColor: mainBgColor}]}>
                    { item !== 'cancel'&&item!=='delete'&&(<Text style={[styles.keyboardViewItemText, {color  : '#000',}]}>{item}</Text>)}
                    { this.cancel&&item === 'cancel'&& (<Text style={[styles.keyboardViewItemText, {color  : '#000',}]}>{item}</Text>) }
                    { item === 'delete'&& (<Image source={require('../assets/delete_button.png')} style={{width:20, height:20}} resizeMode={'contain'}/>)}
                </View>
            </TouchableOpacity>
        )
    };
    renderContent(unlockDescription,warningPincodeFail){
        const animationShake = this.animatedValue.interpolate({
            inputRange: [0, 0.3, 0.7, 1],
            outputRange: [0, -20, 20, 0],
            useNativeDriver: true
        });
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 30 }}>
                <Text style={styles.desText}>{unlockDescription}</Text>
                {warningPincodeFail &&
                <Text style={styles.warningField}>{warningPincodeFail}</Text>
                }
                <Animated.View
                    style={[styles.pinField, {
                        transform: [
                            {
                                translateX: animationShake
                            }
                        ]
                    }]}
                >
                    {this.renderDots(MaxPinCodeLength)}
                </Animated.View>
                <View style={{marginTop:35, alignItems:'center'}}>
                    <FlatList
                        contentContainerStyle={{
                            flexDirection: 'column',
                            alignItems   : 'flex-start',
                        }}
                        scrollEnabled={false}
                        horizontal={false}
                        vertical={true}
                        numColumns={3}
                        renderItem={this.renderItem}
                        data={KeyboardData}
                        keyExtractor={(val, index) => index.toString()}
                    />
                </View>
            </View>
        )
    }

    render(){
        const {pinState} = this.state;
        let descr;
        if (pinState === 0){
            descr = 'unlock'
        }else if (pinState === 1) {
            descr = 'create'
        }else {
            descr = 'confirm'
        }
        return (
          <View style={{flex:1, paddingTop:getStatusBarHeight(true),backgroundColor:mainBgColor, alignItems:'center'}}>
              {this.renderContent(descr)}
          </View>
        )
    }

}

export default connect(state => { return ({
    user:state.user,
}); })(PinCodeScreen);

const styles = StyleSheet.create({
    desText: {
        fontFamily: 'OpenSans-Bold',
    },
    pinField: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    warningField: {
        color: 'red',
        fontFamily: 'OpenSans-Semibold',
        fontSize: 16
    },
    keyboardViewItem: {
        alignItems : 'center',
        justifyContent : 'center',
        height : 75,
        width : 75,
        marginHorizontal : 20,
        marginVertical : 5,
    },
    keyboardViewItemText: {
        fontSize  : 22,
        fontWeight: '900',
    },
});
