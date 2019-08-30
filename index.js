/** @format */
import 'node-libs-react-native/globals';
import './globals';
import Web3 from 'aion-web3';
import { AppRegistry, Text, TextInput } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { useScreens } from 'react-native-screens';
import { name as appName } from './app.json';
import App from './App';

useScreens();

global.Web3 = Web3;
global.web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.50.105:8545'));
TextInput.defaultProps = Object.assign({}, TextInput.defaultProps, { defaultProps: false });
Text.defaultProps = Object.assign({}, Text.defaultProps, { allowFontScaling: false });
AppRegistry.registerComponent(appName, () => App);
