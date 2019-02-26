import React, {Component} from 'react';
import {connect} from 'react-redux';
import {ActivityIndicator, View, Dimensions} from 'react-native';
import {WebView} from 'react-native-webview';
import * as RNFS from'react-native-fs';
const {height, width} = Dimensions.get('window');
class Dapp extends Component {
    constructor(props) {
        super(props);
        this.uri = this.props.navigation.state.params.uri;
        this.state={
            injectJavaScripts: '',
            loading: true,
        }
    }
    async componentDidMount() {
        console.log('[route]' + this.props.navigation.state.routeName);
    }
    componentWillMount(): void {
        RNFS.readFileAssets('contentScript.bundle.js', 'utf8').then((content)=>{
            this.setState({
                injectJavaScripts: content,
                loading:false,
            })
        })
    }
    // loading page
    renderLoadingView() {
        return (
            <View style={{height,width,justifyContent: 'center',alignItems:'center'}}>
                <ActivityIndicator
                    animating={true}
                    color='red'
                    size="large"
                />
            </View>
        );
    }


    render() {
        if (this.state.loading)
            return this.renderLoadingView();
        else {
            return (
                <View style={{flex: 1, backgroundColor: "orange"}}>
                    <WebView
                        source={{uri: this.uri}}
                        injectedJavaScript={this.state.injectJavaScripts}
                    />
                </View>
            )
        }
    }
}
export default connect(state => {return ({dapps: state.dapps});})(Dapp);
