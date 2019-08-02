import React, { Component } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

const { width, height } = Dimensions.get('window');

export default class Loading extends Component {
    static propTypes = {
        isShow: PropTypes.bool,
        message: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            message: null,
            isShow: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { message, isShow } = this.props;
        const { message: nextMessage, isShow: nextIsShow } = nextProps;
        if (message !== nextMessage || isShow !== nextIsShow) {
            this.setState({
                message: nextMessage,
                isShow: nextIsShow,
            });
        }
    }

    show(message = null, params) {
        if (params !== undefined) {
            this.position = params.position;
        }
        this.setState({
            isShow: true,
            message,
        });
    }

    hide() {
        this.position = 'center';
        this.setState({
            isShow: false,
            message: null,
        });
    }

    render() {
        let align;
        let paddingTop;
        if (this.position === 'top') {
            paddingTop = 50;
            align = 'flex-start';
        } else {
            paddingTop = 0;
            align = 'center';
        }
        return this.state.isShow ? (
            <View style={{ ...styles.container, paddingTop, justifyContent: align }}>
                <View style={styles.progressContainer}>
                    <ActivityIndicator animating size="large" color="white" />
                    {this.state.message && (
                        <Text style={styles.defaultText} numberOfLines={1}>
                            {this.state.message}
                        </Text>
                    )}
                </View>
            </View>
        ) : null;
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 9999,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height,
    },
    progressContainer: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,.8)',
        padding: 20,
    },
    defaultText: {
        color: '#FFF',
        fontSize: 15,
    },
});
