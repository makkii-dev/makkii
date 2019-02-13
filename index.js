/** @format */
import 'node-libs-react-native/globals';
import './globals';
import Web3 from "aion-web3";
global.Web3 = Web3;
global.web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.50.83:8545"));
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import App from './App';

AppRegistry.registerComponent(appName, () => App);