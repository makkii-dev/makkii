import React from 'react';
import {
    View,
    Dimensions,
    Text,
    Switch,
    TouchableOpacity,
    Image, StyleSheet,Platform
} from 'react-native';
import {connect} from "react-redux";
import {strings} from "../../../locales/i18n";
import {mainBgColor} from '../../style_util';
import defaultStyles from '../../styles';
import {hashPassword, navigationSafely} from '../../../utils';
import {setting_update_pincode_enabled} from '../../../actions/setting';
import {user_update_pincode} from '../../../actions/user';
import TouchID from 'react-native-touch-id';
const {width} = Dimensions.get('window');


class PinCode extends React.Component {

    static navigationOptions=({navigation})=>{
          return({
              title:  strings('pinCode.title'),
          })
    };

    constructor(props){
        super(props);
        const {pinCodeEnabled, touchIDEnabled}  = this.props.setting;
        this.state={
            pinCodeEnabled:pinCodeEnabled!==undefined?pinCodeEnabled:false,
            touchIDEnabled: touchIDEnabled!==undefined?touchIDEnabled:false,
        }
    }

    onVerifySuccess = ()=>{
        const {dispatch } = this.props;
        const {pinCodeEnabled}  = this.state;
        const {navigate} = this.props.navigation;
        if(!pinCodeEnabled===false){
            // close pin code
            this.setState({pinCodeEnabled:!pinCodeEnabled,touchIDEnabled:false},()=>{
                listenApp.handleActive = null;
                dispatch(user_update_pincode(''));
                dispatch(setting_update_pincode_enabled(this.state.pinCodeEnabled,false));
            })
        }else{
            navigate('unlock',{
                onUnlockSuccess:()=>{
                    this.setState({pinCodeEnabled:!pinCodeEnabled},()=>{
                        dispatch(setting_update_pincode_enabled(this.state.pinCodeEnabled));
                        listenApp.handleActive = ()=>navigate('unlock',{cancel:false});
                    });
                }
            })
        }
    };

    handleToggleSwitch(){
        const {hashed_password} = this.props.user;
        popCustom.show(
            strings('alert_title_warning'),
            strings('warning_dangerous_operation'),
            [
                {
                    text: strings('cancel_button'),
                    onPress:()=>{
                        popCustom.hide()
                    }
                },
                {
                    text: strings('alert_ok_button'),
                    onPress:(text)=>{
                        const _hashed_password = hashPassword(text);
                        if(_hashed_password === hashed_password){
                            popCustom.hide();
                            this.onVerifySuccess();
                        }else{
                            popCustom.setErrorMsg(strings('unsigned_login.error_incorrect_password'))
                        }
                    }
                }
            ],
            {
                cancelable: false,
                type:'input',
                canHide: false,
            }
        );

    }

    handleToggleTouchIDSwitch(){
        const {dispatch } = this.props;
        const {pinCodeEnabled,touchIDEnabled}  = this.state;
        if(!touchIDEnabled === false){
            this.setState({touchIDEnabled:!touchIDEnabled},()=>{
                dispatch(setting_update_pincode_enabled(pinCodeEnabled,false));
            })
        }else{
            const optionalConfigObject = {
                unifiedErrors: true,// use unified error messages (default false)
                passcodeFallback: false, // if true is passed, it will allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
            };
            TouchID.isSupported(optionalConfigObject).then(biometryType => {
                if((Platform.OS==='ios'&&biometryType==='TouchID')||Platform.OS==='android'){
                    this.setState({touchIDEnabled:!touchIDEnabled},()=>{
                        dispatch(setting_update_pincode_enabled(pinCodeEnabled,true));
                    })
                }else {
                    AppToast.show(strings(`pinCode.touchID_NOT_SUPPORTED`))
                }
            }).catch(error=>{
                AppToast.show(strings(`pinCode.touchID_${error.code}`))
            })
        }
    }

    render(){
        const {navigate} = this.props.navigation;
        const {pinCodeEnabled,touchIDEnabled} = this.state;
        const disableTextStyle = pinCodeEnabled?{}: { color: '#8A8D97' };
        return (
            <View style={{flex:1, backgroundColor:mainBgColor,alignItems:'center', paddingHorizontal: 20}}>
                <Text style={{...defaultStyles.instruction, marginTop: 20,textAlign: 'left', width:'100%'}}>{strings('pinCode.pinCode_prompt')}</Text>
                <View style={styles.CellView}>
                    <Text style={[styles.textStyle]}>{strings('pinCode.switch_button')}</Text>
                    <Switch
                        value={pinCodeEnabled}
                        onValueChange={()=>this.handleToggleSwitch()}
                    />
                </View>
                <View style={styles.CellView}>
                    <Text style={[styles.textStyle]}>{strings('pinCode.touchID_button')}</Text>
                    <Switch
                        disabled={!pinCodeEnabled}
                        value={touchIDEnabled}
                        onValueChange={()=>this.handleToggleTouchIDSwitch()}
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
