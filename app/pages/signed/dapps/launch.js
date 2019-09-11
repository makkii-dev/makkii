import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import { mainColor, mainBgColor } from '../../../style_util';
import defaultStyles from '../../../styles';
import { CustomHeader } from '../../../components/CustomHeader';

const { width } = Dimensions.get('window');

class Launch extends Component {
    constructor(props) {
        super(props);
        this.dapp = this.props.dapps[this.props.setting.explorer_server][0];
    }

    onLaunch() {
        console.log('launch ');
        this.props.navigation.navigate('signed_dapps_dapp', {
            uri: this.dapp.uri,
            dappName: this.dapp.name,
        });
    }

    renderUnavailable() {
        return (
            <View
                style={{
                    ...defaultStyles.shadow,
                    borderRadius: 10,
                    backgroundColor: 'white',
                    flex: 1,
                    width: width - 20,
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Image source={require('../../../../assets/empty_under_construction.png')} style={{ width: 80, height: 80, tintColor: 'gray' }} resizeMode="contain" />
                <Text style={{ color: 'gray', textAlign: 'center', marginTop: 20 }}>{strings('dapp.unavailable_hint')}</Text>
            </View>
        );
    }

    renderDApp() {
        return (
            <View
                style={{
                    ...defaultStyles.shadow,
                    borderRadius: 10,
                    backgroundColor: 'white',
                    flex: 1,
                    width: width - 20,
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        height: 120,
                        width: width - 20,
                        flexDirection: 'row',
                        paddingHorizontal: 30,
                    }}
                >
                    <Image
                        source={this.dapp.logo}
                        style={{
                            width: 80,
                            height: 100,
                            borderColor: '#eee',
                            borderWidth: 1,
                            borderRadius: 10,
                        }}
                        resizeMode="contain"
                    />
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginLeft: 20,
                            paddingHorizontal: 10,
                        }}
                    >
                        <Text style={styles.dappName}>{this.dapp.name}</Text>
                        <Text>
                            {strings('dapp.author_label')} :<Text style={{ color: '#33691e' }}> {this.dapp.author}</Text>
                        </Text>
                        <Text>
                            {strings('dapp.type_label')} :<Text style={{ color: '#33691e' }}> {strings(this.dapp.type)}</Text>
                        </Text>
                        <View
                            style={{
                                width: width - (20 + 80 + 60 + 40),
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                            }}
                        >
                            <TouchableOpacity onPress={() => this.onLaunch()}>
                                <View
                                    style={{
                                        width: 80,
                                        height: 30,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: mainColor,
                                        borderRadius: 5,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{strings('dapp.launch_button')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        marginVertical: 10,
                        paddingLeft: 20,
                        width: width - 20,
                        alignItems: 'flex-start',
                    }}
                >
                    <Text>{`${strings('dapp.desc_label')} :`}</Text>
                </View>
                <View
                    style={{
                        flex: 1,
                        width: width - 40,
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: '#33691e',
                        padding: 10,
                        alignItems: 'center',
                    }}
                >
                    <Image source={this.dapp.screenShot} style={{ width: width - 40, height: 80 }} resizeMode="contain" />
                    <Text style={{ marginHorizontal: 10, marginTop: 20 }}>{this.dapp.description}</Text>
                </View>
            </View>
        );
    }

    render() {
        this.dapp = this.props.dapps[this.props.setting.explorer_server][0];
        return (
            <View style={{ flex: 1, padding: 10, backgroundColor: mainBgColor }}>
                <CustomHeader title={strings('menuRef.title_dapps')} />
                {this.dapp ? this.renderDApp() : this.renderUnavailable()}
            </View>
        );
    }
}

export default connect(state => {
    return { dapps: state.dappsModel, setting: state.settingsModel };
})(Launch);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    subContainer: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
    },
    ImgContainer: {
        flex: 2,
        padding: 10,
        aspectRatio: 1,
    },
    dappContainer: {
        flex: 3,
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 10,
        paddingLeft: 10,
    },
    dappName: {
        fontSize: 20,
    },
    descriptionContainer: {
        flex: 2,
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 10,
        paddingLeft: 10,
    },
    description: {
        fontSize: 15,
    },
});
