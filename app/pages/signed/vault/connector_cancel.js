import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { GeneralButton } from './connector_confirm';
import { logout } from '../../../../services/connector.service';
import { STATUSBAR_HEIGHT } from '../../../styles';
import { mainColor } from '../../../style_util';
import { strings } from '../../../../locales/i18n';

const ConnectorCancel = () => {
    const navigation = useNavigation();
    const onClose = () => {
        navigation.goBack();
    };

    const onLogOut = () => {
        logout();
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <GeneralButton style={styles.btn_close} text={strings('connector.button_close')} textStyle={styles.btn_text} onPress={onClose} />
            <Image source={require('../../../../assets/icon_computer.png')} style={styles.img_connector} resizeMode="contain" />
            <Text style={styles.text_hint}>{strings('connector.hint_logout')}</Text>
            <GeneralButton style={styles.btn_login} text={strings('connector.button_logout')} textStyle={styles.btn_text_login} onPress={onLogOut} />
        </View>
    );
};

export default ConnectorCancel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btn_close: {
        position: 'absolute',
        top: STATUSBAR_HEIGHT,
        left: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btn_text: {
        fontSize: 16,
        color: mainColor,
    },
    btn_text_login: {
        fontSize: 18,
        color: mainColor,
    },
    btn_login: {
        position: 'absolute',
        bottom: 90,
        borderRadius: 6,
        backgroundColor: '#dfdfdf',
        height: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    img_connector: {
        position: 'absolute',
        top: 150,
        height: 100,
        width: 150,
        tintColor: mainColor,
    },
    text_hint: {
        position: 'absolute',
        top: 300,
    },
});
