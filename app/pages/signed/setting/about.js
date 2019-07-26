import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Image, View, Text, Dimensions, TouchableOpacity } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-config';
import Cell from '../../../components/Cell';
import { strings } from '../../../../locales/i18n';
import defaultStyles from '../../../styles';
import { linkButtonColor, mainBgColor } from '../../../style_util';
import { navigate, createAction } from '../../../../utils/dva';

const { width, height } = Dimensions.get('window');

class About extends Component {
    static navigationOptions = () => {
        return {
            title: strings('about.title'),
        };
    };

    async componentDidMount() {
        console.log(`[route] ${this.props.navigation.state.routeName}`);
    }

    checkVersion = () => {
        this.props.dispatch(createAction('settingsModel/checkVersion')());
    };

    viewPrivacy = () => {
        navigate('simple_webview', {
            title: strings('privacy_policy.title'),
            initialUrl: { uri: `${Config.app_server_static}/privacy_policy.html` },
        })(this.props);
    };

    viewTerms = () => {
        navigate('simple_webview', {
            title: strings('terms_service.title'),
            initialUrl: { uri: `${Config.app_server_static}/terms_services.html` },
        })(this.props);
    };

    render() {
        return (
            <View
                style={{
                    backgroundColor: mainBgColor,
                    width,
                    height,
                    alignItems: 'center',
                    flex: 1,
                }}
            >
                <View
                    style={{
                        marginBottom: 40,
                        marginTop: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        style={{
                            width: 50,
                            height: 50,
                        }}
                        resizeMode="contain"
                        source={require('../../../../assets/logo_app.png')}
                    />
                    <Text
                        style={{
                            marginTop: 15,
                            fontSize: 22,
                            color: 'black',
                        }}
                    >
                        {strings('app_name')}
                    </Text>
                    <Text
                        style={{
                            marginTop: 15,
                            fontSize: 14,
                            color: 'black',
                        }}
                    >
                        {strings('about.version_label')} {DeviceInfo.getVersion()}
                    </Text>
                </View>
                <View
                    style={{
                        ...defaultStyles.shadow,
                        marginBottom: 150,
                        width: width - 40,
                        borderRadius: 5,
                        backgroundColor: 'white',
                        paddingLeft: 10,
                        paddingRight: 10,
                    }}
                >
                    <Cell
                        title={strings('about.version_update_button')}
                        onClick={this.checkVersion}
                    />
                </View>
                <View
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ marginBottom: 40 }}>Powered by Chaion</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 10,
                        }}
                    >
                        <TouchableOpacity onPress={this.viewTerms}>
                            <Text style={{ ...defaultStyles.center_text, color: linkButtonColor }}>
                                {' '}
                                {strings('about.terms_label')}{' '}
                            </Text>
                        </TouchableOpacity>
                        <Text style={defaultStyles.center_text}>{strings('about.label_and')}</Text>
                        <TouchableOpacity onPress={this.viewPrivacy}>
                            <Text style={{ ...defaultStyles.center_text, color: linkButtonColor }}>
                                {' '}
                                {strings('about.policy_label')}{' '}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={defaultStyles.center_text}>
                        {strings('about.copyright_label')}
                    </Text>
                </View>
            </View>
        );
    }
}
const mapToState = ({ settingsModel }) => ({
    lang: settingsModel.lang,
});
export default connect(mapToState)(About);
