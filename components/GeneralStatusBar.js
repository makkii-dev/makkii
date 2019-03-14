import React from 'react';
import { View, StatusBar, Platform} from 'react-native';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const GeneralStatusBar = ({ backgroundColor, ...props }) => (
    <View style={{height:STATUSBAR_HEIGHT,  backgroundColor }}>
        <StatusBar translucent={true} backgroundColor={backgroundColor} {...props} />
    </View>
);
export default GeneralStatusBar;
