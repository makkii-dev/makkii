import * as React from 'react';
import {
    View,
    Text,
    Image,
    Dimensions,
    Platform,
    NativeModules,
    NativeEventEmitter,
    TouchableOpacity
} from 'react-native';
import {connect} from 'react-redux'
import {strings} from "../../../locales/i18n";
import {mainBgColor} from "../../style_util";
import defaultStyles from "../../styles";
import {ComponentButton,MnemonicView} from "../../common";
import screenshotHelper from "react-native-screenshot-helper";
import {AppToast} from "../../../utils/AppToast";


const nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);
const {width} = Dimensions.get('window');

class MnemonicBackUp extends React.Component{
    static navigationOptions = ({navigation}) =>{
        return ({
            title: strings('backup.title_backup_mnemonic'),
        })
    };

    componentDidMount() {
        if (Platform.OS === 'android') {
            screenshotHelper.disableTakeScreenshot();
        } else {
            this.subscription = NativeModule.addListener('screenshot_taken',() => {
                AppToast.show(strings('toast_mnemonic_share_warning'), {
                    duration: AppToast.durations.LONG,
                    position: AppToast.positions.CENTER
                });
            });
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            screenshotHelper.enableTakeScreenshot();
        } else {
            this.subscription.remove();
        }
    }

    nextStep = ()=>{
        const {navigation} = this.props;
        const targetRoute = navigation.getParam('targetRoute');
        navigation.navigate('signed_confirm_mnemonic', {targetRoute});
    };

    renderMnemonic = ()=>{
        const {mnemonic} = this.props;
        return mnemonic.split(' ').map(str=>{
            return(
                <MnemonicView
                    key={str}
                    canDelete={false}
                    disabled={true}
                    onSelected={()=>{}}
                    text={str}
                />
            )
        })
    };

    render(){
        return (
            <View style={{
                flex:1,
                backgroundColor:mainBgColor,
                alignItems:'center'
            }}>
                <View style={styles.container}>
                    <Text>{strings('backup.label_header_backup_mnemonic')}</Text>
                    <Image source={require('../../../assets/icon_backup_mnemonic.png')} style={{width:40, height:40, marginVertical:10}} resizeMode={'contain'}/>
                    <View style={styles.MnemonicContainer}>
                        {this.renderMnemonic()}
                    </View>
                    <Text>{strings('backup.label_footer_backup_mnemonic')}</Text>
                </View>
                <ComponentButton
                    style={{width:width-40}}
                    onPress={this.nextStep}
                    title={strings('backup.button_next')}
                />
            </View>
        )
    }

}

const mapToState = ({userModel})=>({
    mnemonic: userModel.mnemonic,
    // mnemonic: "transfer exhibit feel document display chalk response whisper strong walk shock ivory",
});

export default connect(mapToState)(MnemonicBackUp);


const styles = {
    container:{
        ...defaultStyles.shadow,
        alignItems:'center',
        marginVertical:30,
        padding:10,
        width: width-40,
        borderRadius: 10,
        backgroundColor: 'white',
    },
    MnemonicContainer:{
        margin:10,
        width: width-60,
        paddingVertical:5,
        borderBottomWidth:1,
        borderTopWidth:1,
        borderColor: mainBgColor,
        flexDirection: 'row', flexWrap: 'wrap'
    }
};