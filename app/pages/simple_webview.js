import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ActivityIndicator, BackHandler, Dimensions, Image, TouchableOpacity, View, Text } from 'react-native';
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
            headerRight: refreshEnable ? (
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
            ) : (
                <View />
            ),
        };
    };

    constructor(props) {
        super(props);

        this.initialUrl = this.props.navigation.getParam('initialUrl');
        this.title = this.props.navigation.getParam('title');
        this.state = {
            error: false,
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
                    backgroundColor: '#fff',
                }}
            >
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    };

    renderError = ({ url, code, description }) => {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                }}
            >
                <Image source={require('../../assets/empty_under_construction.png')} style={{ height: 80, width: 80, marginBottom: 20, tintColor: '#ddd' }} resizeMode="contain" />
                <View style={{ alignItems: 'flex-start' }}>
                    <Text>{`Domain: ${url}`}</Text>
                    <Text>{`Error Code: ${code}`}</Text>
                    <Text>{`Description: ${description}`}</Text>
                </View>
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
        this.mount && this.setState({ WebViewProgress: 0, showProgressBar: true, error: false });
        this.refs.refWebView && this.refs.refWebView.reload();
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.error ? (
                    this.renderError(this.state.error)
                ) : (
                    <WebView
                        source={this.initialUrl}
                        ref="refWebView"
                        cacheEnabled={false}
                        renderLoading={this.renderLoading}
                        onError={e => {
                            this.setState({
                                error: e.nativeEvent,
                            });
                        }}
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
                        onLoadProgress={({ nativeEvent }) => {
                            this.mount && this.setState({ WebViewProgress: nativeEvent.progress });
                        }}
                    />
                )}
                {!this.state.error && this.state.showProgressBar ? (
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
