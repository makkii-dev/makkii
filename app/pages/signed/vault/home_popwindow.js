import React from 'react';
import { FlatList, Text, TouchableOpacity, View, Image, Animated, Modal } from 'react-native';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';

export class PopWindow extends React.Component {
    static propTypes = {
        data: PropTypes.array.isRequired,
        onClose: PropTypes.func.isRequired,
        containerPosition: PropTypes.object.isRequired,
        itemStyle: PropTypes.object,
        fontStyle: PropTypes.object,
        imageStyle: PropTypes.object,
        backgroundColor: PropTypes.string,
        containerBackgroundColor: PropTypes.string,
        visible: PropTypes.bool,
    };

    static defaultProps = {
        backgroundColor: 'rgba(0,0,0,0)',
        containerPosition: {},
        fontStyle: {
            color: '#fff',
            fontSize: 16,
            marginLeft: 5,
        },
        imageStyle: {
            width: 20,
            height: 20,
            marginRight: 10,
            tintColor: '#fff',
        },
        itemStyle: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: 1,
            width: 180,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 8,
            paddingBottom: 8,
        },
    };

    state = {
        animation: new Animated.Value(0.3),
    };

    componentDidMount(): void {
        Animated.timing(this.state.animation, {
            toValue: 1,
            duration: 100,
        }).start();
    }

    render() {
        const { visible } = this.props;
        return (
            <Modal animationType="none" transparent visible={visible} onRequestClose={() => {}}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        backgroundColor: this.props.backgroundColor,
                    }}
                    onPress={() => this.props.onClose()}
                >
                    <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
                        <Animated.View
                            style={{
                                ...this.props.containerPosition,
                                transform: [{ scale: this.state.animation }],
                            }}
                        >
                            <View style={{ alignItems: 'flex-end' }}>
                                <Image
                                    source={require('../../../../assets/arrow_up.png')}
                                    style={{
                                        marginRight: 15,
                                        width: 20,
                                        height: 10,
                                        tintColor: this.props.containerBackgroundColor,
                                    }}
                                />
                            </View>
                            <FlatList
                                {...this.props}
                                style={{
                                    backgroundColor: this.props.containerBackgroundColor,
                                    borderRadius: 5,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                }}
                                data={this.props.data}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        activeOpacity={0.3}
                                        onPress={() => {
                                            this.props.onClose(item.title);
                                        }}
                                    >
                                        <View style={this.props.itemStyle}>
                                            {item.image ? <Image source={item.image} style={this.props.imageStyle} resizeMode="contain" /> : null}
                                            <Text numberOfLines={1} style={this.props.fontStyle}>
                                                {strings(item.title)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </Animated.View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}
