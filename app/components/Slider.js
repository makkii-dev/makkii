import React from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import Proptypes from 'prop-types';
import { mainBgColor, linkButtonColor } from '../style_util';

const ScreenWidth = Dimensions.get('window').width;

const cal_process = (minimumValue, maximumValue, value) => (value - minimumValue) / (maximumValue - minimumValue);

const step_process = (minimumValue, maximumValue, process, step) => {
    const v = process * (maximumValue - minimumValue).toFixed(2);
    const newValue = Math.round(v / step) * step + minimumValue;
    const newProcess = (newValue - minimumValue) / (maximumValue - minimumValue);
    return [newValue, newProcess];
};

class Slider extends React.Component {
    constructor(props) {
        super(props);
        this.wathcer = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => false,
            onPanResponderGrant: this.onPanResponderGrant,
            onPanResponderMove: this.onPanResponderMove,
        });
        const { minimumValue, maximumValue, value } = props;
        const process_ = cal_process(minimumValue, maximumValue, value);
        this.state = {
            process: process_,
        };
    }

    onPanResponderGrant = (e, gestureState) => {
        const { minimumValue, maximumValue, onValueChange, step, thumbSize } = this.props;
        const process_ = (gestureState.x0 - thumbSize / 2) / (ScreenWidth - thumbSize);
        const [newValue, newProcess] = step_process(minimumValue, maximumValue, process_, step);
        if (newProcess >= 0 && newProcess <= 1 && newProcess !== this.state.process) {
            onValueChange(newValue);
            this.setState({
                process: newProcess,
            });
        }
    };

    onPanResponderMove = (e, gestureState) => {
        const { minimumValue, maximumValue, onValueChange, step, thumbSize } = this.props;
        const process_ = (gestureState.x0 - thumbSize / 2 + gestureState.dx) / (ScreenWidth - thumbSize);
        const [newValue, newProcess] = step_process(minimumValue, maximumValue, process_, step);
        if (newProcess >= 0 && newProcess <= 1 && newProcess !== this.state.process) {
            onValueChange(newValue);
            this.setState({
                process: newProcess,
            });
        }
    };

    render() {
        const { height, width, fgColor, bgColor, thumbSize, thumbColor } = this.props;
        const { process } = this.state;
        return (
            <View
                style={[
                    styles.container,
                    {
                        height,
                        width,
                    },
                ]}
                {...this.wathcer.panHandlers}
            >
                <View
                    style={{
                        borderTopLeftRadius: 3,
                        borderBottomLeftRadius: 3,
                        backgroundColor: fgColor,
                        width: process * width,
                        height: 6,
                    }}
                />
                <View
                    style={{
                        borderTopRightRadius: 3,
                        borderBottomRightRadius: 3,
                        backgroundColor: bgColor,
                        flex: 1,
                        height: 6,
                    }}
                />
                {/* thumb view */}
                <View
                    style={{
                        width: thumbSize,
                        height: thumbSize,
                        position: 'absolute',
                        left: process * width - thumbSize / 2,
                        borderRadius: thumbSize / 2,
                        backgroundColor: thumbColor,
                    }}
                />
            </View>
        );
    }
}

Slider.propTypes = {
    height: Proptypes.number.isRequired,
    width: Proptypes.number.isRequired,
    minimumValue: Proptypes.number.isRequired,
    maximumValue: Proptypes.number.isRequired,
    value: Proptypes.number.isRequired,
    step: Proptypes.number.isRequired,
    onValueChange: Proptypes.func.isRequired,
    bgColor: Proptypes.string,
    fgColor: Proptypes.string,
    thumbSize: Proptypes.number,
    thumbColor: Proptypes.string,
};

Slider.defaultProps = {
    step: 1,
    bgColor: mainBgColor,
    fgColor: linkButtonColor,
    thumbSize: 10,
    thumbColor: linkButtonColor,
};
export default Slider;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
