import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { login } from '../../../../services/connector.service';
import { strings } from '../../../../locales/i18n';
import { STATUSBAR_HEIGHT } from '../../../styles';
import { mainColor } from '../../../style_util';
import { popCustom } from '../../../../utils/dva';

export const GeneralButton = ({ style, textStyle, text, onPress }) => {
    return (
        <TouchableOpacity style={style} onPress={onPress}>
            <Text style={textStyle}>{text}</Text>
        </TouchableOpacity>
    );
};

const ConnectorConfirm = () => {
    // toolings
    const navigation = useNavigation();
    const connection = navigation.getParam('connection');

    // handelers
    const onRegister = () => {
        const { signature, channel } = connection;
        login(signature, channel)
            .then(() => {
                navigation.goBack();
            })
            .catch(err => {
                console.log('err=>', err);
                popCustom.show(strings('alert_title_warning'), err.body, [
                    {
                        text: strings('alert_ok_button'),
                        onPress: () => {},
                    },
                ]);
            });
    };

    const onClose = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <GeneralButton style={styles.btn_close} text={strings('connector.button_close')} textStyle={styles.btn_text} onPress={onClose} />
            <Image source={require('../../../../assets/icon_computer.png')} style={styles.img_connector} resizeMode="contain" />
            <Text style={styles.text_hint}>{strings('connector.hint_confirm')}</Text>
            <GeneralButton style={styles.btn_login} text={strings('connector.button_login')} textStyle={styles.btn_text_login} onPress={onRegister} />
            <GeneralButton style={styles.btn_cancel} text={strings('connector.button_cancel')} textStyle={styles.btn_text_cancel} onPress={onClose} />
        </View>
    );
};

export default ConnectorConfirm;

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
    btn_text_cancel: {
        fontSize: 18,
    },
    btn_login: {
        position: 'absolute',
        bottom: 90,
        borderRadius: 6,
        backgroundColor: '#dfdfdf',
        height: 30,
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btn_cancel: {
        position: 'absolute',
        bottom: 40,
        height: 30,
        width: 120,
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
