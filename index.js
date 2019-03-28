/** @format */
import 'node-libs-react-native/globals';
import './globals';
import Web3 from "aion-web3";
import {AppToast} from './utils';
global.Web3 = Web3;
global.web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.50.105:8545"));
global.AppToast = new AppToast();
import {AppRegistry, Text, TextInput} from 'react-native';
import {name as appName} from './app.json';
import App from './App';
TextInput.defaultProps = Object.assign({}, TextInput.defaultProps, {defaultProps:false});
Text.defaultProps = Object.assign({}, Text.defaultProps, {allowFontScaling: false});
AppRegistry.registerComponent(appName, () => App);
