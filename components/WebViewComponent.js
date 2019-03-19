import React,{Component} from 'react';
import {connect} from 'react-redux';
import {ActivityIndicator, Dimensions, View} from 'react-native';
import {WebView} from "react-native-webview";
import {ProgressBar} from "./processbar";
const {width} = Dimensions.get('window');

class WebViewComponent extends Component {
    static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        return {
            title: state.params.title,
        };
    };

    constructor(props){
        super(props);

        this.initialUrl = this.props.navigation.state.params.initialUrl;
        this.state={
            WebViewProgress: 0,
            showProgressBar: true,
        };
    }

    async componentDidMount(){
        console.log('[route] ' + this.props.navigation.state.routeName);
        console.log(this.props.setting);
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

    render(){
        return (
            <View style={{flex: 1}}>
                <WebView
                    source={{uri: this.initialUrl}}
                    cacheEnabled={true}
                    renderLoading={()=>this.renderLoading()}
                    startInLoadingState={true}
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
