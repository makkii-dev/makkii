import React,{Component} from 'react';
import {connect} from 'react-redux';
import {ActivityIndicator, BackHandler, Dimensions, Image, TouchableOpacity, View} from 'react-native';
import {WebView} from "react-native-webview";
import {ProgressBar} from "./processbar";
const {width} = Dimensions.get('window');

class WebViewComponent extends Component {
    static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        const GoBack = navigation.getParam('GoBack',()=>{});
        return {
            title: state.params.title,
            headerLeft:(
                <TouchableOpacity onPress={()=>{GoBack()}} style={{
                    width: 48,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image source={require('../assets/arrow_back.png')} style={{
                        tintColor: 'white',
                        width: 20,
                        height: 20,
                    }} />
                </TouchableOpacity>
            ),
        };
    };

    constructor(props){
        super(props);

        this.initialUrl = this.props.navigation.state.params.initialUrl;
        this.state={
            WebViewProgress: 0,
            showProgressBar: true,
        };

        this.props.navigation.setParams({
            GoBack: ()=>this.onGoBack(),
        })

    }

    componentWillUnmount() {
        this.backHandler.remove();
    }

    componentWillMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.onGoBack(); // works best when the goBack is async
            return true;
        });
    }

    handleProcessBar = (v) =>{
        this.setState({WebViewProgress:0,showProgressBar:v})
    };

    renderLoading = () => {
        return (
            <View style={{flex: 1,justifyContent: 'center', alignItems:'center', backgroundColor:'#fff'}}>
                <ActivityIndicator
                    animating={true}
                    color='red'
                    size="large"
                />
            </View>
        );
    };

    onGoBack = ()=>{
        if(this.canGoBack) {
            this.refs['refWebView'].goBack();
        }else{
            this.props.navigation.goBack();
        }
    };


    render(){
        return (
            <View style={{flex: 1}}>
                <WebView
                    source={this.initialUrl}
                    ref={'refWebView'}
                    useWebKit={true}
                    cacheEnabled={false}
                    renderLoading={()=>this.renderLoading()}
                    startInLoadingState={true}
                    onLoadStart={()=>this.handleProcessBar(true)}
                    onNavigationStateChange={(navState)=>{
                        this.canGoBack = navState.canGoBack;
                        this.setState({WebViewProgress:0,showProgressBar:true})
                    }}
                    onLoadProgress={(e)=>{
                        this.setState({WebViewProgress: e.nativeEvent.progress});
                    }}
                />
                {
                    this.state.showProgressBar?<ProgressBar
                        style={{position:'absolute',top:0,width:width,height:2}}
                        width={width}
                        progress={this.state.WebViewProgress}
                        color={'red'}
                        onComplete={()=>this.handleProcessBar(false)}
                    />:null
                }
            </View>
        )
    }
}
export default connect(state => { return ({ setting: state.setting }); })(WebViewComponent);
