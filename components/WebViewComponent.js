import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View} from 'react-native';
import {WebView} from "react-native-webview";

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
    }

    async componentDidMount(){
        console.log('[route] ' + this.props.navigation.state.routeName);
        console.log(this.props.setting);
    }
    render(){
        return (
            <View style={{flex: 1}}>
                <WebView
                    source={{uri: this.initialUrl}}
                    cacheEnabled={true}
                />
            </View>
        )
    }
}
export default connect(state => { return ({ setting: state.setting }); })(WebViewComponent);
