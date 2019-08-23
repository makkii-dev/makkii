import React, { Component } from 'react';
import { View, Image, PixelRatio, Text, TouchableOpacity, TextInput } from 'react-native';
import PropTypes from 'prop-types';

export class Cell extends Component {
    render() {
        let titlePadLeft = 0;
        if (this.props.leadIcon) {
            titlePadLeft = 30;
        }
        return (
            <TouchableOpacity onPress={this.props.onClick}>
                <View style={styles.cellContainer}>
                    <Image
                        source={this.props.leadIcon}
                        style={{
                            width: 15,
                            height: 15,
                            position: 'absolute',
                            left: 5,
                        }}
                        resizeMode="contain"
                    />
                    <Text style={{ ...styles.titleText, paddingLeft: titlePadLeft }}>{this.props.title}</Text>
                    <Image style={styles.icon} source={require('../../assets/arrow_right.png')} />
                </View>
            </TouchableOpacity>
        );
    }
}

export class Cell2 extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
    };

    render() {
        return (
            <View style={{ ...styles.cellContainer, width: '100%', borderBottomWidth: 1 / PixelRatio.get(), borderColor: 'lightgray', paddingBottom: 5, marginBottom: 1 }}>
                <Text style={{ ...styles.titleText, fontWeight: 'bold' }}>{this.props.title}</Text>
                <Text style={{ fontSize: 12 }}>{this.props.value}</Text>
            </View>
        );
    }
}

export class CellInput extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        rightView: PropTypes.func,
        unit: PropTypes.string,
        isRequired: PropTypes.bool,
        textAlign: PropTypes.string,
    };

    render() {
        const { isRequired } = this.props;
        return (
            <View
                style={{
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100%',
                    paddingHorizontal: 14,
                    paddingTop: 14,
                    borderBottomWidth: 1 / PixelRatio.get(),
                    borderColor: 'lightgray',
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        height: 20,
                        width: '100%',
                    }}
                >
                    <Text style={{ ...styles.titleText, fontWeight: 'bold' }}>
                        {this.props.title} {isRequired && <Text style={{ ...styles.titleText, color: 'red' }}>*</Text>}
                    </Text>
                    {this.props.rightView()}
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <TextInput
                        {...this.props}
                        style={{ ...this.props.style, color: 'gray', padding: 0, width: '100%', paddingRight: this.props.unit ? 50 : 0, textAlign: this.props.textAlign || 'left' }}
                    />
                    {this.props.unit && (
                        <View style={{ position: 'absolute', right: 0, bottom: 5 }}>
                            <Text style={{ fontSize: 12 }}>{this.props.unit}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }
}

const styles = {
    titleText: {
        fontSize: 15,
        color: 'black',
        fontWeight: 'normal',
    },
    icon: {
        position: 'absolute',
        right: 0,
        width: 24,
        height: 24,
    },
    cellContainer: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
    },
};
