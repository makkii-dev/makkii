/* eslint-disable no-unused-vars */
import React from 'react';
import { View } from 'react-native';
import Proptypes from 'prop-types';

const Slider = props => {
    const { height, width, minValue, maxValue, value, onValueChange } = props;

    return <View />;
};

Slider.propTypes = {
    height: Proptypes.number,
    width: Proptypes.number,
    minValue: Proptypes.number,
    maxValue: Proptypes.number,
    value: Proptypes.number,
    onValueChange: Proptypes.func,
};
export default Slider;
