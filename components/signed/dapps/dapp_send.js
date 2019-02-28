import * as React from 'react';
import {View, Button, DeviceEventEmitter,TouchableOpacity,Text,BackHandler} from 'react-native';
import {strings} from "../../../locales/i18n";

class DappSend extends React.Component{
    static navigationOptions = ({ navigation }) => ({
        title: strings('send.title'),
        headerLeft:<View style={{marginLeft: 10}}>
            <TouchableOpacity onPress={()=>navigation.state.params.onGoback()}>
                <Text>{strings('send.cancel')}</Text>
            </TouchableOpacity>
        </View>
    });

    onGoback=()=>{
        this.state.isSend || DeviceEventEmitter.emit(this.message,{cancel: true, data:"I'm cancel"});
        this.props.navigation.goBack();
    };

    constructor(props) {
        super(props);
        this.message = this.props.navigation.state.params.message;
        this.state={
            isSend: false,
        };
        this.props.navigation.setParams({
            onGoback: this.onGoback,
        });
        console.log('[message] ', this.message);
    }

    componentWillMount(): void {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.onGoback(); // works best when the goBack is async
            return true;
        });
    }

    componentWillUnmount(): void {
        this.backHandler.remove();
    }

    render(){
        return(
            <View style={{flex:1}}>
                <Button title={'test'} onPress={
                    (e)=>{
                        this.setState({
                            isSend: true,
                        });
                        DeviceEventEmitter.emit(this.message,{data:"I'm ok"})
                        this.props.navigation.goBack();
                    }
                }/>
            </View>
        )
    }
}

export default DappSend;
