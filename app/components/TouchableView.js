import React from 'react';
import { View, PanResponder, Dimensions } from 'react-native';

const TouchableContext = React.createContext();
const { width, height } = Dimensions.get('window');
const reducer = (preState, action) => {
    if (action.type === 'update') {
        return { preState, ...action.payload };
    }
    return preState;
};
const THRESHOLD = 5;
let presentState = false;
const TouchableView = props => {
    const { currentRight, currentBottom, style, onPress } = props;
    const touchBackView = React.useRef(null);
    const { posState, dispatchToPosState } = React.useContext(TouchableContext);
    const right = posState.right || currentRight;
    const bottom = posState.bottom || currentBottom;
    let newRight;
    let newBottom;
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: () => false,
        onPanResponderGrant: () => {
            presentState = false;
        },
        onPanResponderMove: (evt, gestureState) => {
            console.log('gestureState', gestureState);
            if (gestureState.dx < THRESHOLD && gestureState.dx > -THRESHOLD && gestureState.dy < THRESHOLD && gestureState.dy > -THRESHOLD) {
                presentState = false;
            } else {
                presentState = true;
                newRight = right - gestureState.dx;
                newBottom = bottom - gestureState.dy;
                newRight = newRight > 0 && newRight < width - 40 ? newRight : right;
                newBottom = newBottom > 0 && newBottom < height - 100 ? newBottom : bottom;
                touchBackView.current.setNativeProps({
                    style: {
                        right: newRight,
                        bottom: newBottom,
                    },
                });
            }
        },
        onPanResponderRelease: () => {
            if (presentState) {
                dispatchToPosState({ type: 'update', payload: { right: newRight, bottom: newBottom } });
            } else {
                onPress();
            }
        },
    });

    return (
        <View style={{ ...style, position: 'absolute', right: currentRight, bottom: currentBottom }} {...panResponder.panHandlers} ref={touchBackView}>
            {props.children}
        </View>
    );
};

export const ContextProvider = props => {
    const [state, dispatch] = React.useReducer(reducer, {});
    return <TouchableContext.Provider value={{ posState: state, dispatchToPosState: dispatch }}>{props.children}</TouchableContext.Provider>;
};

export const connectToTouchAble = WrappedComponent => props => {
    return (
        <ContextProvider>
            <WrappedComponent {...props} />
        </ContextProvider>
    );
};

export default TouchableView;
