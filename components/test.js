import React, {Component} from 'react';
import {WebView} from 'react-native';
const app0  = require('../apps/app0/index.html');

export default class Test extends Component {
    render() {
    	return (
    		<WebView
    			originWhitelist={['*']} 
    			style={{flex: 1}}
    			source={app0}
    		></WebView>
		);
    }
}