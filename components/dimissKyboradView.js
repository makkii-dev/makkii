import React from 'react';
import {Keyboard,  TouchableWithoutFeedback } from 'react-native';
export  const DismissKeyboard = ({ children }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        {children}
    </TouchableWithoutFeedback>
);
