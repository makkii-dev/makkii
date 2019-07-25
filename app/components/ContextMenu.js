import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';

const {width, height} = Dimensions.get('window');

export default class ContextMenu extends Component {
    static propTypes = {
        message: PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
        }
    }

    render() {
        return this.state.isShow ?(
            <TouchableWithoutFeedback onPress={() => this.hide()}>
                <View style={styles.container}>
                    <TouchableWithoutFeedback onPress={this.props.onClick}>
                        <View style={styles.menuContainer}>
                            <Text style={styles.defaultText}>{this.props.message}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        ): (null)
    }

    show() {
        this.setState({
            isShow: true,
        });
    }

    hide() {
        this.setState({
            isShow: false,
        });
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
        height: height,
        backgroundColor: 'rgba(0,0,0,.2)',
    },
    menuContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: 50,
        width: width - 20 * 2,
        borderRadius: 10,
        backgroundColor: 'white',
        paddingLeft: 20,
    },
    defaultText: {
        fontSize: 18,
        color: 'black',
    }
});
