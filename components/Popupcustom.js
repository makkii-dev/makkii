import React, {Component} from 'react'
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Image,
    TextInput,
    Keyboard,
    Platform,
} from 'react-native'
import {mainColor, mainBgColor} from './style_util';
import {ProgressBar} from "./processbar";
// import PropTypes from 'prop-types'

export default class PopupCustom extends Component {
    state = {
        visible: false,
        title: 'Alert',
        content: null,
        buttons: [
            {
                text: 'OK',
                onPress: () => {
                    this.setState({
                        visible: false
                    })
                }
            }
        ],
        type: 'normal',
        valueInput: '',
        errorMsg: '',
        offsetY: new Animated.Value(0),
        cancelable: false,
        progress:0,
        canHide: true,
        forceExist: false,
        callback: ()=>{},
    };

    componentWillMount() {
        const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        this.keyboardDidShowListener = Keyboard.addListener(show, e => this._keyboardDidShow(e));
        this.keyboardDidHideListener = Keyboard.addListener(hide, e => this._keyboardDidHide(e));
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove()
    }

    componentDidMount() {

    }

    _runKeyboardAnim(toValue) {
        // if (!isNaN(this.state.bottom)) return

        // this.setState({bottom: toValue})
        Animated.timing(
            // Animate value over time
            this.state.offsetY, // The value to drive
            {
                toValue: -toValue, // Animate to final value of 1
                duration: 250,
                useNativeDriver: true
            }
        ).start()
    }
    _keyboardDidShow(e) {
        const value = Platform.OS === 'ios' ? e.endCoordinates.height / 2 : 0;
        this._runKeyboardAnim(value)
    }

    _keyboardDidHide(e) {
        this._runKeyboardAnim(0)
    }

    show(title = this.state.title, content, buttons = [
        {
            text: 'OK',
            onPress: () => {
                this.setState({
                    visible: false
                })
            }
        }
    ], otherArgs={}) {
        let Args={};
        Args.cancelable = otherArgs.cancelable !==undefined?otherArgs.cancelable:true;
        Args.type = otherArgs.type || 'normal';
        Args.canHide = otherArgs.canHide !== undefined ? otherArgs.canHide : true;
        Args.callback = otherArgs.callback !== undefined? otherArgs.callback: ()=>{};
        Args.progress = otherArgs.progress !== undefined? otherArgs.progress: 0;
        Args.forceExist = otherArgs.forceExist !== undefined? otherArgs.forceExist: false;
        this.setState({
            visible: true,
            content,
            buttons,
            title,
            ...Args
        })
    }

    hide() {
        this.setState({
            visible: false,
            errorMsg: '',
            valueInput: '',
            canHide: true,
        })
    }

    _renderButons = () => {
        const {
            buttons,
            type,
            valueInput,
            canHide,
            forceExist
        } = this.state;

        return buttons.map((btn, index) => {
            let textStyle = {};
            if (btn.text.length > 7) {
                textStyle = {fontSize: 14}
            }
            let disable = false;
            let styleTextDisable = {};
            if (index === 1 && type === 'input' && valueInput === '') {
                disable = true;
                styleTextDisable = { color: '#8A8D97' };
            }
            let hide = false;
            if ((index !== 0 || buttons.length === 1) && !canHide && type === 'input'){
                hide = true;
            }
            const lineBetween = index > 0
                ? <View style={styles.line}/>
                : <View/>;
            return (
                <View
                    key={index}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1
                    }}
                >
                    {lineBetween}
                    <TouchableOpacity
                        style={[styles.buttonView]}
                        disabled={disable}
                        onPress={() => {
                            btn.onPress(valueInput);
                            forceExist || hide || this.hide();
                        }}
                    >
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={[styles.textButton, styleTextDisable, textStyle]}>{btn.text}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        })
    };

    setErrorMsg =(text)=>{
        this.setState({
            errorMsg: text,
        })
    };


    onChangeText = (text) => {
        this.setState({valueInput:text})
    };
    clearText = () => {
        this.setState({ valueInput: '' })
    };

    renderIconClear = () => {
        const { valueInput } = this.state;
        if (valueInput === '') {
            return <View key="invisible" />
        }
        return (
            <View key="visible" style={{ position: 'absolute', right: 0, top: Platform.OS === 'ios' ? 13 : 17 }}>
                <TouchableOpacity onPress={this.clearText}>
                    <Image source={require('../assets/icon_popCustom_clear.png')} style={styles.iconClose} />
                </TouchableOpacity>
            </View>
        )
    };

    setProgress = (progress) => {
        if (this.state.type === 'progress') {
            this.setState({
                progress: progress,
            });
        }
    }

    render() {
        const {
            visible, title, content,type,errorMsg,valueInput,buttons,callback,cancelable,offsetY,progress
        } = this.state;
        const contentPaddingVertical = type === 'input'
            ? {
                paddingTop: 18,
                paddingBottom: 12
            }
            : {
                paddingVertical: 26
            };
        const titleColor = mainColor;
        const contentMarginTop = type === 'input'
            ? { marginTop: 8 }
            : { marginTop: 20 };
        const renderContent =  <Text style={[styles.contentPopup, contentMarginTop]}>{content}</Text>;
        return (
            <Modal
                animationType="none"
                transparent
                visible={visible}
                onRequestClose={() => { }}
            >
                <TouchableWithoutFeedback onPress={() => {
                    cancelable&&this.hide()
                }}
                >
                    <Animated.View
                        style={[styles.overlayPopup, {
                            transform: [
                                {
                                    translateY: offsetY
                                }
                            ]
                        }]}
                    >
                        <View style={styles.popupCustom}>
                            <View style={[styles.contentField, contentPaddingVertical]}>
                                <Text style={[styles.titlePopup, titleColor]}>{title}</Text>
                                {content !== '' && renderContent}
                                {errorMsg !== '' && <Text style={styles.errorText}>{errorMsg}</Text>}
                                {
                                    type === 'input'
                                    &&<View>
                                        <TextInput
                                            secureTextEntry={true}
                                            autoFocus={true}
                                            autoCorrect={false}
                                            style={styles.textInput}
                                            underlineColorAndroid="transparent"
                                            onChangeText={this.onChangeText}
                                            value={valueInput}
                                        />
                                        {this.renderIconClear()}
                                    </View>
                                }
                                {
                                    type === 'progress'
                                    &&<View style={{marginTop: 10, flexDirection: 'row', width: 250}}>
                                        <ProgressBar style={{height: 20}} width={200} progress={progress} color={mainColor} onComplete={callback}/>
                                        <Text style={{marginLeft: 10, width: 40, textAlign: 'right'}}>{Math.round(progress * 100)}%</Text>
                                    </View>
                                }
                            </View>
                            {buttons.length>0
                                &&
                            <View style={{alignItems:'center', justifyContent:'center'}}>
                                <View style={{width:250, height:0.5, backgroundColor:mainColor}}/>
                                <View style={styles.buttonField}>
                                    {this._renderButons()}
                                </View>
                            </View>
                            }
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    popupCustom: {
        width: 270,
        borderRadius: 14,
        backgroundColor: '#fff'
    },
    overlayPopup: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.75)'
    },
    titlePopup: {
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        color:mainColor,
    },
    buttonField: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 43
    },
    line: {
        height: 43,
        width: 0.5,
        backgroundColor: mainColor
    },
    buttonView: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    textButton: {
        fontSize: 16,
        color: mainColor
    },
    contentField: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 17
    },

    contentPopup: {
        fontSize: 14,
        color: '#000',
        textAlign: 'center'
    },
    textInput: {
        width: 236,
        marginTop: 10,
        paddingLeft: 10,
        paddingRight: 40,
        paddingVertical: 5,
        color: '#000',
        fontSize: 14,
        backgroundColor: mainBgColor,
        borderColor: mainColor,
        borderWidth: 0.5,
    },
    errorText: {
        fontSize: 14,
        color: '#D0021B',
        alignSelf: 'center',
        marginTop: 10
    },
    iconClose: {
        width: 25,
        height: 25,
        marginRight: 15
    },

});
