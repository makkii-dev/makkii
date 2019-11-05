/** @format */
import 'node-libs-react-native/globals';
import './globals';
import Web3 from 'aion-web3';
import { AppRegistry, Text, TextInput, YellowBox } from 'react-native';
import _ from 'lodash';
import { name as appName } from './app.json';
import App from './App';

global.Web3 = Web3;
global.web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.50.105:8545'));
TextInput.defaultProps = Object.assign({}, TextInput.defaultProps, { defaultProps: false });
Text.defaultProps = Object.assign({}, Text.defaultProps, { allowFontScaling: false });
AppRegistry.registerComponent(appName, () => App);

YellowBox.ignoreWarnings(['Setting a timer', 'WebView has been', 'Async Storage has', 'requires main queue setup.', 'Accessing view manager']);
const _console = _.clone(console);
console.warn = message => {
    if (!message.match(/|Setting a timer|WebView has been|Async Storage has|Accessing view manager|/)) {
        _console.warn(message);
    }
};
