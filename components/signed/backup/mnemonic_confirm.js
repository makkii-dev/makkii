import * as React from 'react';
import {connect} from "react-redux";
import defaultStyles from "../../styles";
import {mainBgColor} from "../../style_util";
import {
    Dimensions,
    Image,
    NativeEventEmitter,
    NativeModules,
    Platform,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {strings} from "../../../locales/i18n";
import {ComponentButton, MnemonicView} from "../../common";
import screenshotHelper from "react-native-screenshot-helper";
import {AppToast} from "../../../utils/AppToast";
import {createAction} from "../../../utils/dva";


const nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);
const {width} = Dimensions.get('window');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
    return array;
}

class MnemonicConfirm extends React.Component{
    static navigationOptions = ({navigation}) =>{
        return ({
            title: strings('backup.title_confirm_mnemonic'),
        })
    };

    state = {
        toBeSelected: shuffle(this.props.mnemonic.split(' ')),
        selected:[],
        error: false,
        confirmed: false,
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

    renderSelected =()=>{
        const {selected} = this.state;
        const mnemonic = selected.map(str=>{
            return(
                <MnemonicView
                    key={str}
                    canDelete={true}
                    disabled = {false}
                    onSelected={()=>this.onDelete(str)}
                    text={str}
                />
            )
        });
        const height = Math.max(2, Math.max(2,Math.ceil(selected.length/4)))*35 +20;

        return(
            <View style={{...styles.MnemonicContainerWithBorder, height}}>
                {mnemonic}
            </View>
        )
    };

    renderToBeSelected = ()=>{
        const {toBeSelected} = this.state;
        const mnemonic = toBeSelected.map(str=>{
            return(
                <MnemonicView
                    key={str}
                    color={'white'}
                    canDelete={false}
                    disabled = {false}
                    onSelected={()=>this.onSelected(str)}
                    text={str}
                />
            )
        });
        const height = Math.max(2, Math.max(2,Math.ceil(toBeSelected.length/4)))*35 +20;
        return(
            <View style={{...styles.MnemonicContainer, height}}>
                {mnemonic}
            </View>
        )
    };
    onSelected = (item)=>{
        let {toBeSelected,selected} = {...this.state};
        toBeSelected.remove(item);
        selected.push(item);
        const res = this.checkSelected(selected);
        this.setState({
            toBeSelected,
            selected,
            error: !res,
            confirmed: res&&selected.length===12
        })
    };

    onDelete = (item)=>{
        let {toBeSelected,selected} = {...this.state};
        selected.remove(item);
        toBeSelected.push(item);
        const res = this.checkSelected(selected);
        this.setState({
            toBeSelected,
            selected,
            error: !res,
            confirmed: res&&selected.length===12
        })
    };

    onFinish =()=>{
        const {navigation, dispatch} = this.props;
        const targetRoute = navigation.getParam('targetRoute');
        dispatch(createAction('userModel/backupFinish')());
        AppToast.show(strings('backup.toast_backup_succeed'),{
            onHidden:()=>{
                if(targetRoute){
                    navigation.navigate(targetRoute);
                }else{
                    dispatch(createAction('userModel/login')());
                }
            }
        });
    };

    checkSelected = (selected)=>{
        const {mnemonic} = this.props;
        const selectedStr = selected.join(' ');
        return selectedStr === mnemonic.substr(0, selectedStr.length);
    };

    render(){
        const {confirmed ,error} = this.state;
        return (
            <View style={{
                flex:1,
                backgroundColor:mainBgColor,
                alignItems:'center'
            }}>
                <View style={styles.container}>
                    <Text>{strings('backup.label_header_confirm_mnemonic')}</Text>
                    <Image source={require('../../../assets/icon_confirm_mnemonic.png')} style={{width:40, height:40, marginVertical:10}} resizeMode={'contain'}/>
                    <Text style={{...styles.WarningText, backgroundColor:error?'#FFCC33':'transparent'}}>{error?strings('backup.label_warning_incorrect_mnemonic'):null}</Text>
                    {this.renderSelected()}
                    {this.renderToBeSelected()}
                </View>
                <ComponentButton
                    disabled={!confirmed}
                    style={{width:width-40}}
                    onPress={this.onFinish}
                    title={strings('backup.button_finish')}
                />
            </View>
        )
    }
}

const mapToState = ({userModel})=>({
    mnemonic: userModel.mnemonic,
    // mnemonic: "transfer exhibit feel document display chalk response whisper strong walk shock ivory",
});
export default connect(mapToState)(MnemonicConfirm);


const styles = {
    container:{
        ...defaultStyles.shadow,
        alignItems:'center',
        marginVertical:30,
        padding:10,
        width: width-40,
        height:350,
        borderRadius: 10,
        backgroundColor: 'white',
    },
    MnemonicContainerWithBorder:{
        marginTop:10,
        width: width-60,
        paddingVertical:5,
        borderBottomWidth:1,
        borderTopWidth:1,
        borderColor: mainBgColor,
        flexDirection: 'row', flexWrap: 'wrap'
    },
    MnemonicContainer:{
        marginTop:10,
        width: width-60,
        paddingVertical:5,
        flexDirection: 'row', flexWrap: 'wrap'
    },
    WarningText:{
        backgroundColor:'#FFCC33',
        color: 'black',
        padding:2,
        fontSize:12,
        borderRadius: 5,
    }
};