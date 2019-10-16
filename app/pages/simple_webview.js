import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ActivityIndicator, BackHandler, Dimensions, Image, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ProgressBar } from '../components/ProgressBar';

const { width } = Dimensions.get('window');

class SimpleWebView extends Component {
    static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        const GoBack = navigation.getParam('GoBack', () => {});
        const refreshEnable = navigation.getParam('refreshEnable', true);
        return {
            title: state.params.title,
            headerLeft: (
                <TouchableOpacity
                    onPress={() => {
                        GoBack();
                    }}
                    style={{
                        width: 48,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Image
                        source={require('../../assets/arrow_back.png')}
                        style={{
                            tintColor: 'white',
                            width: 20,
                            height: 20,
                        }}
                    />
                </TouchableOpacity>
            ),
            headerRight: (
                refreshEnable?
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        height: 48,
                        width: 48,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10,
                    }}
                    onPress={() => {
                        navigation.state.params.Reload && navigation.state.params.Reload();
                    }}
                >
                    <Image source={require('../../assets/icon_refresh.png')} style={{ height: 24, width: 24, tintColor: '#fff' }} resizeMode="contain" />
                </TouchableOpacity>
                    :<View/>
            ),
        };
    };

    constructor(props) {
        super(props);

        this.initialUrl = this.props.navigation.getParam('initialUrl');
        this.title = this.props.navigation.getParam('title');
        this.state = {
            WebViewProgress: 0,
            showProgressBar: true,
        };
        this.props.navigation.setParams({
            GoBack: () => this.onGoBack(),
            Reload: () => this.onReload(),
        });
    }

    componentWillMount() {
        this.mount = true;
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.onGoBack(); // works best when the goBack is async
            return true;
        });
    }

    componentWillUnmount() {
        this.mount = false;
        this.backHandler.remove();
    }

    handleProcessBar = v => {
        this.mount && this.setState({ WebViewProgress: 0, showProgressBar: v });
    };

    renderLoading = () => {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                }}
            >
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    };

    onGoBack = () => {
        if (this.canGoBack) {
            this.refs.refWebView.goBack();
        } else {
            this.props.navigation.goBack();
        }
    };

    onReload = () => {
        this.handleProcessBar(true);
        this.refs.refWebView.reload();
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                <WebView
                    source={this.initialUrl}
                    ref="refWebView"
                    useWebKit
                    cacheEnabled={false}
                    renderLoading={() => this.renderLoading()}
                    startInLoadingState
                    onShouldStartLoadWithRequest={() => true}
                    onLoadStart={navState => {
                        this.title || this.props.navigation.setParams({ title: navState.title });
                        this.handleProcessBar(true);
                    }}
                    onNavigationStateChange={navState => {
                        this.canGoBack = navState.canGoBack;
                        this.title || this.props.navigation.setParams({ title: navState.title });
                        this.mount && this.setState({ WebViewProgress: 0, showProgressBar: true });
                    }}
                    onLoadProgress={e => {
                        this.mount && this.setState({ WebViewProgress: e.nativeEvent.progress });
                    }}
                />
                {this.state.showProgressBar ? (
                    <ProgressBar
                        style={{ position: 'absolute', top: 0, width, height: 2 }}
                        width={width}
                        progress={this.state.WebViewProgress}
                        color="red"
                        onComplete={() => this.handleProcessBar(false)}
                    />
                ) : null}
            </View>
        );
    }
}
export default connect(state => {
    return { setting: state.setting };
})(SimpleWebView);
