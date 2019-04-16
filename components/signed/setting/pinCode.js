import React from 'react';
import {
    View,
    Dimensions,
    Text,
    Switch,
    TouchableOpacity,
    Image, StyleSheet
} from 'react-native';
import {connect} from "react-redux";
import {strings} from "../../../locales/i18n";
import {mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';
import {hashPassword} from '../../../utils';
import {setting_update_pincode_enabled} from '../../../actions/setting';
import {user_update_pincode} from '../../../actions/user';
const {width} = Dimensions.get('window');


class PinCode extends React.Component {

    static navigationOptions=({navigation})=>{
          return({
              title:  strings('pinCode.title'),
          })
    };

    constructor(props){
        super(props);
        const {pinCodeEnabled}  = this.props.setting;
        this.state={
            pinCodeEnabled:pinCodeEnabled!==undefined?pinCodeEnabled:false
        }
    }

    handleToggleSwitch(){
        const {dispatch } = this.props;
        const {navigate} = this.props.navigation;
        popCustom.show(
            strings('pinCode.verify_title'),
            strings('pinCode.verify_desc'),
            [
                {
                    text: strings('cancel_button'),
                    onPress:()=>{
                        popCustom.hide()
                    }
                },
                {
                    text: strings('alert_ok_button'),
                    onPress: (text)=>{
                        const hashed_password = hashPassword(text);
                        if(hashed_password === this.props.user.hashed_password){
                            popCustom.hide();
                            if(!this.state.pinCodeEnabled===false){
                                dispatch(user_update_pincode(''));
                                listenApp.handleActive = null;
                                this.setState({pinCodeEnabled:!this.state.pinCodeEnabled},()=>{
                                    dispatch(setting_update_pincode_enabled(this.state.pinCodeEnabled));
                                })
                            }else{
                                navigate('unlock',{
                                    onUnlockSuccess:()=>{
                                        this.setState({pinCodeEnabled:!this.state.pinCodeEnabled},()=>{
                                            dispatch(setting_update_pincode_enabled(this.state.pinCodeEnabled));
                                            listenApp.handleActive = ()=>navigate('unlock',{cancel:false});
                                        });
                                    }
                                })
                            }
                        }else {
                            popCustom.setErrorMsg(strings('unsigned_login.error_incorrect_password'))
                        }
                    }
                }
            ],
            {
                type:'input',
                cancelable: false,
                canHide: false,
            }
        )
    }

    render(){
        const {navigate} = this.props.navigation;
        const {pinCodeEnabled} = this.state;
        const disableTextStyle = pinCodeEnabled?{}: { color: '#8A8D97' };
        return (
            <View style={{flex:1, backgroundColor:mainBgColor,alignItems:'center', paddingHorizontal: 20}}>
                <Text style={{...defaultStyles.instruction, marginTop: 20,textAlign: 'left', width:'100%'}}>{strings('pinCode.pinCode_prompt')}</Text>
                <View style={styles.CellView}>
                    <Text style={[styles.textStyle]}>{strings('pinCode.switch_button')}</Text>
                    <Switch
                        value={this.state.pinCodeEnabled}
                        onValueChange={()=>this.handleToggleSwitch()}
                    />
                </View>
                <TouchableOpacity
                    disabled={!pinCodeEnabled}
                    onPress={()=>{
                        navigate('unlock',{
                            isModifyPinCode:true,
                            onUnlockSuccess:()=>{
                                navigate('signed_setting_pinCode');
                            }
                        })
                    }}
                >
                    <View style={styles.CellView}>
                        <Text style={[styles.textStyle,disableTextStyle]}>{strings('pinCode.modify_button')}</Text>
                        <Image source={require('../../../assets/arrow_right.png')} style={{width:20,height:20}} resizeMode={'contain'}/>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

export default connect( state => {
    return {
        setting: state.setting,
        user: state.user,
    };
})(PinCode);

const styles = StyleSheet.create({
   CellView:{
       ...defaultStyles.shadow,width: width-40,  height:50,backgroundColor:'#fff',
       flexDirection:'row', alignItems:'center', justifyContent:'space-between',
       paddingHorizontal: 20, marginTop: 20, borderRadius:5,
   },
   textStyle:{
     color: '#000',
   }

});
