import React from 'react';
import { View, StatusBar } from 'react-native';
import { getStatusBarHeight } from '../../utils';

const STATUSBAR_HEIGHT = getStatusBarHeight(true);
const GeneralStatusBar = ({ backgroundColor, ...props }) => (
    <View style={{ height: STATUSBAR_HEIGHT, backgroundColor }}>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
);
export default GeneralStatusBar;
