import React from 'react';
import { Dimensions, View, Text, PixelRatio, TextInput, Image, TouchableOpacity, ImageBackground, Modal, Platform, Keyboard } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import defaultStyles from '../../../styles';
import { ComponentButton } from '../../../components/common';
import { mainBgColor } from '../../../style_util';
import { createAction } from '../../../../utils/dva';
import { sendFeedBack, uploadImage } from '../../../../services/setting.service';
import Loading from '../../../components/Loading';
import { AppToast } from '../../../components/AppToast';

const { width } = Dimensions.get('window');

const FormItem = ({ title, children, ...props }) => {
    return (
        <View {...props}>
            <Text style={styles.form_label}>{title}</Text>
            {children}
        </View>
    );
};

const Upload = ({ onPress }) => {
    return (
        <TouchableOpacity style={[styles.image_container, styles.upload_button]} onPress={onPress}>
            <Image source={require('../../../../assets/icon_camera.png')} style={{ height: 30, width: 30, tintColor: '#ddd' }} resizeMode="contain" />
            <Text style={{ color: '#ddd', textAlign: 'center' }}>{strings('feedback.button_upload')}</Text>
        </TouchableOpacity>
    );
};

const ImageView = ({ handleDelete, uri }) => {
    return (
        <ImageBackground source={{ uri }} style={[styles.image_container, { backgroundColor: mainBgColor }]} resizeMode="contain">
            <TouchableOpacity onPress={() => handleDelete(uri)} style={{ position: 'absolute', right: -10, top: -10 }}>
                <Image source={require('../../../../assets/icon_popCustom_clear.png')} style={{ height: 24, width: 24, tintColor: '#000' }} resizeMode="contain" />
            </TouchableOpacity>
        </ImageBackground>
    );
};

const feedback = props => {
    const { navigation, dispatch } = props;
    const [state, setState] = React.useState({
        imageLists: [],
        feedback: '',
        modalVisible: false,
        contact: '',
    });
    let refLoading = React.useRef();
    const buttonEnabled = state.feedback.trim() !== '' && state.contact.trim() !== '';
    const handleDeleteScreenShot = uri => {
        console.log('handleDeleteScreenShot', uri);
        const newImageLists = state.imageLists.filter(i => i.url !== uri);
        setState({
            ...state,
            imageLists: newImageLists,
        });
    };
    const handelModalVisible = v => {
        setState({
            ...state,
            modalVisible: v || false,
        });
    };

    const selectFromPhotos = () => {
        handelModalVisible();
        dispatch(createAction('settingsModel/updateState')({ ignoreAppState: true }));
        const options = {
            title: 'Image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        ImagePicker.launchImageLibrary(options, res => {
            dispatch(createAction('settingsModel/updateState')({ ignoreAppState: false }));
            if (res.error) {
                console.log('error ', res.error);
            } else if (res.uri) {
                if (res.data.length / 1048576 > 0.5) {
                    AppToast.show(strings('feedback.toast_too_large_size'));
                } else {
                    const url = Platform.OS === 'ios' ? res.uri : `file://${res.path}`;
                    const newImageLists = [...state.imageLists, { url, name: res.fileName }];
                    setState({
                        ...state,
                        imageLists: newImageLists,
                        modalVisible: false,
                    });
                }
            }
        });
    };

    const handleSubmit = () => {
        refLoading.current.show();
        uploadImage(state.imageLists).then(res => {
            if (res.result) {
                sendFeedBack(state.feedback, state.contact, res.urls).then(r => {
                    refLoading.current.hide();
                    if (r) {
                        AppToast.show(strings('feedback.toast_submit_success'), {
                            onHide: () => navigation.goBack(),
                        });
                    } else {
                        AppToast.show(strings('feedback.toast_submit_fail'));
                    }
                });
            } else {
                refLoading.current.hide();
                AppToast.show(strings('feedback.toast_upload_fail'));
            }
        });
    };

    return (
        <TouchableOpacity activeOpacity={1} onPress={() => Keyboard.dismiss()} style={{ flex: 1, backgroundColor: mainBgColor, alignItems: 'center' }}>
            <View style={styles.container}>
                <FormItem title={strings('feedback.label_feedback')}>
                    <TextInput
                        value={state.feedback}
                        style={styles.text_input}
                        multiline
                        placeholder={strings('feedback.placeholder_feedback')}
                        onChangeText={t => {
                            setState({ ...state, feedback: t });
                        }}
                    />
                </FormItem>
                <FormItem title={strings('feedback.label_contact')}>
                    <TextInput
                        value={state.contact}
                        style={styles.text_input}
                        multiline
                        placeholder={strings('feedback.placeholder_contact')}
                        onChangeText={t => {
                            setState({ ...state, contact: t });
                        }}
                    />
                </FormItem>
                <FormItem title={strings('feedback.label_screenshot')}>
                    <View style={styles.image_lists}>
                        {state.imageLists.map((item, index) => (
                            <ImageView handleDelete={handleDeleteScreenShot} uri={item.url} key={`${index}`} />
                        ))}
                        {state.imageLists.length < 3 && (
                            <Upload
                                onPress={() =>
                                    setState({
                                        ...state,
                                        modalVisible: true,
                                    })
                                }
                            />
                        )}
                    </View>
                </FormItem>
            </View>
            <ComponentButton disabled={!buttonEnabled} title={strings('feedback.button_submit')} onPress={handleSubmit} style={{ width: width - 40 }} />
            <Modal animationType="none" transparent visible={state.modalVisible} onRequestClose={() => {}}>
                <TouchableOpacity activeOpacity={1} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }} onPress={() => handelModalVisible()}>
                    <TouchableOpacity style={styles.modal_button} onPress={selectFromPhotos}>
                        <Text style={styles.modal_button_test}>{strings('feedback.button_select_from_photos')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modal_button} onPress={() => handelModalVisible()}>
                        <Text style={styles.modal_button_test}>{strings('feedback.button_cancel')}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
            <Loading ref={refLoading} />
        </TouchableOpacity>
    );
};

feedback.navigationOptions = () => {
    return {
        title: strings('feedback.title'),
    };
};

export default connect()(feedback);

const styles = {
    container: {
        ...defaultStyles.shadow,
        marginTop: 20,
        width: width - 40,
        borderRadius: 5,
        backgroundColor: 'white',
        padding: 20,
    },
    form_label: {
        fontWeight: 'bold',
        color: '#000',
        marginTop: 10,
        fontSize: 17,
    },
    text_input: {
        fontSize: 16,
        color: '#777676',
        fontWeight: 'normal',
        height: 70,
        borderColor: '#8c8a8a',
        textAlignVertical: 'center',
        borderBottomWidth: 1 / PixelRatio.get(),
        padding: 10,
    },
    image_lists: {
        marginTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    image_container: {
        width: 75,
        marginTop: 10,
        marginRight: 10,
        height: 100,
    },
    upload_button: {
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dotted',
        borderColor: '#ddd',
    },
    modal_button: {
        width,
        backgroundColor: '#fff',
        alignItem: 'center',
        paddingVertical: 15,
        marginTop: 10,
    },
    modal_button_test: {
        fontWeight: '200',
        textAlign: 'center',
    },
};
