import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ImageBackground, Text } from 'react-native';
import { strings } from '../../locales/i18n';
import { ComponentLogo } from '../components/common';
import { createAction } from '../../utils/dva';
import { Storage } from '../../utils/storage';
import { getApiConfig } from '../../client/api';

const loadStorage = dispatch =>
    new Promise(resolve => {
        Storage.get('settings', { state_version: 2 }).then(setting => {
            const currentStateVersion = setting.state_version || 0;
            const payload = {
                state_version: currentStateVersion,
                options: { network: setting.network || 'mainnet' },
            };
            Promise.all([
                new Promise(resolve1 =>
                    getApiConfig().then(() =>
                        dispatch(createAction('userModel/loadStorage')(payload)).then(() =>
                            dispatch(createAction('accountsModel/loadStorage')(payload)).then(() =>
                                dispatch(createAction('settingsModel/loadStorage')(payload)).then(() =>
                                    dispatch(createAction('ERC20Dex/loadStorage')(payload)).then(() => dispatch(createAction('txsListener/loadStorage')(payload)).then(() => resolve1())),
                                ),
                            ),
                        ),
                    ),
                ),
                new Promise(resolve2 =>
                    setTimeout(() => {
                        resolve2();
                    }, 3 * 1000),
                ),
            ]).then(() => {
                resolve();
            });
        });
    });

class Splash extends Component {
    componentWillMount() {
        console.log(`[route] ${this.props.navigation.state.routeName}`);
        const { navigate } = this.props.navigation;
        const { dispatch } = this.props;
        loadStorage(dispatch).then(() => {
            navigate('unsigned_login', { transition: 'modal' });
        });
    }

    render() {
        return (
            <ImageBackground
                style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingTop: 150,
                }}
                source={require('../../assets/bg_splash.png')}
            >
                <ComponentLogo />
                <Text
                    style={{
                        fontSize: 24,
                        color: 'white',
                        marginTop: 20,
                    }}
                >
                    {strings('app_name')}
                </Text>
            </ImageBackground>
        );
    }
}

export default connect()(Splash);
