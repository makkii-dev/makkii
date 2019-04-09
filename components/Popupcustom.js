import React, {Component} from 'react'
import {
    Animated,
    Image,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native'
import {mainColor} from './style_util';
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
        valueInput: '',
        offsetY: new Animated.Value(0),
        image: null,
        cancelable: false,
    };



    componentDidMount() {

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
    ], cancelable = false, image = null) {
        this.setState({
            visible: true,
            content,
            buttons,
            title,
            image,
            cancelable
        })
    }

    hide() {
        this.setState({
            visible: false,
        })
    }

    _renderButons = () => {
        const {
            buttons,
        } = this.state;

        return buttons.map((btn, index) => {
            let textStyle = {};
            if (btn.text.length > 7) {
                textStyle = {fontSize: 14}
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
                        onPress={() => {
                            btn.onPress();
                            this.hide();
                        }}
                    >
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={[styles.textButton,  textStyle]}>{btn.text}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        })
    };



    render() {
        const {
            visible, title, content, image,
        } = this.state;
        const contentPaddingVertical =  {paddingVertical: 26};
        const titleColor = { color: '#000' };
        const contentMarginTop =  { marginTop: 20 };
        const renderContent =  <Text style={[styles.contentPopup, contentMarginTop]}>{content}</Text>;
        return (
            <Modal
                animationType="none"
                transparent
                visible={visible}
                onRequestClose={() => { }}
            >
                <TouchableWithoutFeedback onPress={() => {
                    this.state.cancelable&&this.hide()
                }}
                >
                    <Animated.View
                        style={[styles.overlayPopup, {
                            transform: [
                                {
                                    translateY: this.state.offsetY
                                }
                            ]
                        }]}
                    >
                        <View style={styles.popupCustom}>
                            <View style={[styles.contentField, contentPaddingVertical]}>
                                {image && <Image style={{ alignSelf: 'center', marginBottom: 20 }} source={image} />}
                                <Text style={[styles.titlePopup, titleColor]}>{title}</Text>
                                {content && renderContent}
                            </View>
                            <View style={styles.buttonField}>
                                {this._renderButons()}
                            </View>
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
        fontFamily: 'OpenSans-Semibold',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    buttonField: {
        borderTopWidth: 0.5,
        borderColor: 'blue',
        flexDirection: 'row',
        alignItems: 'center',
        height: 43
    },
    buttonView: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    textButton: {
        fontSize: 16,
        fontFamily: 'OpenSans-Semibold',
        color: mainColor
    },
    contentField: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 17
    },
    line: {
        height: 43,
        width: 0.5,
        backgroundColor: mainColor
    },
    contentPopup: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'OpenSans' : 'OpenSans-Regular',
        color: '#000',
        textAlign: 'center'
    },

});
