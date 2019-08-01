import React from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

export const DismissKeyboardView = ({ children }) => <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>{children}</TouchableWithoutFeedback>;
