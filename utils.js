import {AsyncStorage, DeviceEventEmitter, Platform, CameraRoll, Dimensions, StatusBar, AppState} from 'react-native';
import blake2b from "blake2b";
import wallet from 'react-native-aion-hw-wallet';
import fetch_blob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import {strings} from './locales/i18n';
import {update_account_txs} from "./actions/accounts";
import {setting} from "./actions/setting";
import Toast from 'react-native-root-toast';
import {user_update_timestamp} from "./actions/user";

const tripledes = require('crypto-js/tripledes');
const CryptoJS = require("crypto-js");


function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            charcode = ((charcode&0x3ff)<<10)|(str.charCodeAt(i)&0x3ff)
            utf8.push(0xf0 | (charcode >>18),
                0x80 | ((charcode>>12) & 0x3f),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

function hexString2Array(str) {
    if (str.startsWith('0x')) {
        str = str.substring(2);
    }

    var result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }

    return result;
}

function encrypt(plain, seed){
    return tripledes.encrypt(plain, seed).toString();
}

function decrypt(encrypted, seed){
    return tripledes.decrypt(encrypted, seed).toString(CryptoJS.enc.Utf8);
}

function dbSet(key, value){
    return new Promise((resolve, reject)=>{

    });
}

function dbGet(key){
    return new Promise((resolve, reject)=>{
        AsyncStorage
        .getItem(key)
        .then(json=>{
            if(json){
                resolve(json);
            } else {
                reject('[dbGet] db.' + key + ' null');
            }
        });
    });
}

function validatePassword(password) {
    let reg = /^[A-Za-z0-9!?#]{8,16}$/;
    return reg.test(password);
}

function validateUrl(url) {
    let reg = /^(https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.?)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&amp;a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
    return reg.test(url);
}

function validatePrivateKey(privateKey) {
    privateKey = privateKey.startsWith('0x')? privateKey.substring(2): privateKey;
    let reg = /^[0-9a-fA-F]{128}$/;
    return reg.test(privateKey);
}

function validateAddress(address) {
    // do not verify prefix a0
    let reg = /^[0-9a-fA-F]{64}$/;
    address = address.startsWith('0x')? address.substring(2): address;
    return reg.test(address);
}

function validateAmount(amount) {
    let reg = /^[0-9]?((\.[0-9]+)|([0-9]+(\.[0-9]+)?))$/;
    return reg.test(amount);
}

function validatePositiveInteger(input) {
    let reg= /^[1-9][0-9]*$/;
    return reg.test(input);
}

function validateRecipient(recipientQRCode) {
    if (validateAddress(recipientQRCode)) {
        return true;
    }
    try {
        let receiverObj = JSON.parse(recipientQRCode);
        if (!receiverObj.receiver) {
            return false;
        }
        if (!validateAddress(receiverObj.receiver)) {
            return false;
        }
        if (receiverObj.amount) {
            if (!validateAmount(receiverObj.amount)) {
                return false;
            }
        }
    } catch (error) {
        console.log("recipient qr code is not a json");
        return false;
    }
    return true;
}

function hashPassword(password) {
    let passwordHash = blake2b(32).update(Buffer.from(password, 'utf8')).digest('hex')
    return passwordHash;
}

function getLedgerMessage(errorCode) {
    if (errorCode === wallet.APP_INACTIVATED) {
        return strings('ledger.error_application_inactive');
    } else if (errorCode === wallet.INVALID_DEVICE_NUMBER) {
        return strings('ledger.error_device_count');
    } else if (errorCode === wallet.USER_REJECTED) {
        return strings('ledger.error_user_rejected');
    } else if (errorCode === wallet.NO_PERMISSION) {
        return strings('ledger.error_permission_denied');
    } else if (errorCode === wallet.GENERAL_ERROR || errorCode === wallet.INVALID_ACCOUNT_TYPE || errorCode === wallet.INVALID_TX_PAYLOAD || errorCode === wallet.OPEN_DEVICE_FAIL) {
        return strings('ledger.error_general');
    } else if (errorCode === 'error.wrong_device') {
        return strings('ledger.error_wrong_device');
    } else {
        return strings('ledger.error_general');
    }
}

function generateQRCode(amount, address) {
    let obj ={};
    obj['receiver'] = address;
    obj['amount'] = amount;
    return JSON.stringify(obj);
}

function saveImage(base64, imageFileName) {
    const dirs = fetch_blob.fs.dirs;
    if (Platform.OS === 'android') {
        const filePath = dirs.PictureDir + "/" + imageFileName;
        return new Promise((resolve, reject)=>{
            RNFS.writeFile(filePath, base64, 'base64').then(() => {
                resolve(filePath);
            }, error => {
                console.log("save image failed: ", error);
                reject(error);
            });
        })
    } else {
        const filePath = dirs.DocumentDir + "/" + imageFileName;
        return new Promise((resolve, reject)=> {
            RNFS.writeFile(filePath, base64, 'base64').then(() => {
                CameraRoll.saveToCameraRoll(filePath).then(result => {
                    deleteFile(filePath);
                    resolve(result);
                }).catch(error => {
                    deleteFile(filePath);
                    console.log("save image fail: " + error);
                    reject(error);
                });
            }, error => {
                console.log("save image failed: ", error);
                reject(error);
            });
        });
    }
}

function deleteFile(filePath) {
    RNFS.unlink(filePath).then(() => {
        console.log("delete " + filePath + " succeed");
    }).catch(err=> {
        console.log("delete " + filePath + " failed: " + err);
    });
}

function fetchRequest(url, method='GET', headers={}) {
    return new Promise((resolve, reject) => {
        fetch(url,{
            method,
            headers,
        }).then((response)=>response.json())
            .then((responseJson)=>{
                resolve(responseJson)
            })
            .catch(err=>{
                console.log('[fetch request error] ', err);
                reject(err);
            })
    })

}
function getCoinPrice(currency='CNY',amount=1) {
    const url = `https://www.chaion.net/makkii/price?crypto=AION&fiat=${currency}`;
    return new Promise((resolve, reject) => {
        fetchRequest(url,'GET').then(res=>{
            console.log('[res] ',res);
            const price = res.price;
            resolve(amount*price)
        },err=>{
            console.log('[err] ', err);
            reject(err)
        });
    })
}

function getLatestVersion(platform, currentVersionCode, language) {
    const url = "http://45.118.132.89:8080/appVersion/latest" +
        "?versionCode=" + currentVersionCode +
        "&platform=" + platform +
        "&lang=" + language;
    console.log("request get latest version: " + url);

    return fetchRequest(url, 'GET');
}
function generateUpdateMessage(version) {
    let message = strings('version_upgrade.label_version') + ': ' + version.version;
    if (version.updatesMap) {
        let keys = Object.keys(version.updatesMap);
        if (keys.length > 0) {
            message = message + '\n' + strings('version_upgrade.label_updates') + ': \n' + version.updatesMap[keys[0]];
        }
    }
    return message;
}

class AppToast {
    constructor() {
        this.toast = null;
    }
    show(message, options = {position: Toast.positions.BOTTOM, duration: Toast.durations.SHORT}){
        this.close();
        this.toast= Toast.show(message,options);
    }
    close(){
        if(this.toast){
            Toast.hide(this.toast);
            this.toast = null;
        }
    }
}

class listenCoinPrice{
    constructor(store, interval=30) {
        this.store = store;
        this.interval = interval;
    }

    reset(exchange_refresh_interval, fiat_currency) {
        this.interval = exchange_refresh_interval;
        this.currency = fiat_currency;
    }

    setInterval(interval) {
        this.interval = interval;
        this.startListen();
    }

    setCurrency(currency) {
        this.currency = currency;
        this.startListen();
    }

    startListen() {
        this.stopListen();
        const thusStore = this.store;
        getCoinPrice(this.currency).then(price => {
            let settings = thusStore.getState().setting;
            settings.coinPrice = price;
            if (this.currency) {
                settings.fiat_currency = this.currency;
            }
            DeviceEventEmitter.emit('updateAccountBalance');
            thusStore.dispatch(setting(settings));
        }, error => {
            console.log("get coin price error", error);
            Toast.show(strings('error_connect_remote_server'), {
                position: Toast.positions.CENTER,
            })
        });

        this.listener = setInterval(() => {
             getCoinPrice(this.currency).then(price => {
                let settings = thusStore.getState().setting;
                settings.coinPrice = price;
                if (this.currency) {
                    settings.fiat_currency = this.currency;
                }
                DeviceEventEmitter.emit('updateAccountBalance');

                thusStore.dispatch(setting(settings));
            }, error => {
                console.log("get coin price error", error);
             });
        }, this.interval * 60 * 1000);
    }

    stopListen() {
        if (this.listener) {
            clearInterval(this.listener);
        }
    }

}

class listenTransaction{
    constructor(store, timeOut=60*1000){
        this.txMap={};
        this.pendingMap = {};
        this.timeOut = timeOut;
        this.store = store;
    }
    hasPending() {
        return Object.keys(this.pendingMap).length > 0;
    }
    addTransaction(tx){
        let thusMap = this.txMap;
        let thusPendingMap = this.pendingMap;
        const thusTimeOut = this.timeOut;
        const thusStore = this.store;
        const {user, setting}= this.store.getState();
        if(typeof thusMap[tx.hash] !== 'undefined')
            return;
        this.pendingMap[tx.hash] = tx;
        let removeTransaction = function(tx){
            if(typeof thusMap[tx.hash] !== 'undefined'){
                console.log('clear listener');
                clearInterval(thusMap[tx.hash]);
                delete thusMap[tx.hash];
            }
        };
        let start = Date.now();
        thusMap[tx.hash]=setInterval(function(){
            if (Date.now() - start > thusTimeOut) {
                delete thusPendingMap[tx.hash];
                removeTransaction(tx);
            }
            web3.eth.getTransactionReceipt(tx.hash).then(
                res=>{
                    if(res){
                        tx.blockNumber = res.blockNumber;
                        if (res.status !== 'FAILED') {
                            if (thusMap[tx.hash]) {
                                let blockNumberInterval = setInterval(() => {
                                    web3.eth.getBlockNumber().then(
                                        number => {
                                            if (number > tx.blockNumber + 6) {
                                                delete thusPendingMap[tx.hash];

                                                tx.status = res.status ? 'CONFIRMED' : 'FAILED';
                                                thusStore.dispatch(update_account_txs(tx.from, {[tx.hash]: tx}, setting.explorer_server, user.hashed_password));
                                                thusStore.dispatch(update_account_txs(tx.to, {[tx.hash]: tx}, setting.explorer_server, user.hashed_password));
                                                DeviceEventEmitter.emit('updateAccountBalance');
                                                clearInterval(blockNumberInterval);
                                            }
                                        }
                                    )
                                }, 1000 * 5);
                            }
                        }
                        removeTransaction(tx);
                    }
                },
                err=>{
                    Toast.show(strings('error_connect_remote_server'));
                    removeTransaction(tx);
                }
            )
        }, 5 * 1000);

    }
}

class listenAppState{
    constructor(){
        this.timeOut = '30';
        this.timestamp = Date.now('milli');
    }
    handleActive = null;
    handleTimeOut = null;
    _handleAppStateChange=(nextAppState)=>{
        console.log('appState change');
        if (nextAppState != null && nextAppState === 'active') {
            // in active
            const max_keep_signed = 60000*parseInt(this.timeOut);
            console.log('max_keep_signed ', max_keep_signed);
            const time_diff = Date.now('milli') - this.timestamp;
            if (time_diff > max_keep_signed) {
                this.handleTimeOut&&this.handleTimeOut();
            }else{
                this.handleActive&&this.handleActive();
            }
        } else if (nextAppState === 'background') {
            this.timestamp = Date.now('milli');
            console.log('update timestamp ', this.timestamp)
        }
    };
    start(){
        console.log('start listen app state');
        AppState.addEventListener('change',this._handleAppStateChange);
    }
    stop(cb=()=>{}){
        console.log('stop listen app state');
        AppState.removeEventListener('change',this._handleAppStateChange);
        cb();
    }

}
function isIphoneX() {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        ((dimen.height === 812 || dimen.width === 812) || (dimen.height === 896 || dimen.width === 896))
    );
}

function ifIphoneX(iphoneXStyle, regularStyle) {
    if (isIphoneX()) {
        return iphoneXStyle;
    }
    return regularStyle;
}

function getStatusBarHeight(safe) {
    return Platform.select({
        ios: ifIphoneX(safe ? 44 : 30, 20),
        android: StatusBar.currentHeight
    });
}

function strLen(str){
    let len = 0;
    for (let i=0; i<str.length; i++) {
        let c = str.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
            len++;
        }
        else {
            len+=2;
        }
    }
    return len;
}

const mainnet_url = 'https://api.nodesmith.io/v1/aion/mainnet/jsonrpc?apiKey=c8b8ebb4f10f40358b635afae72c2780';
const mastery_url = 'https://api.nodesmith.io/v1/aion/testnet/jsonrpc?apiKey=651546401ff0418d9b0d5a7f3ebc2f8c';

function navigationSafely(pinCodeEnabled, hashed_password,navigation,
                          route={
                                    url: '',
                                    args:{},
                                    onVerifySuccess:undefined,
                                }) {
    const newRoute = {
        url: '',
        args:{},
        onVerifySuccess:undefined,
        ...route
    };
    pinCodeEnabled||popCustom.show(
        strings('alert_title_warning'),
        strings('warning_dangerous_operation'),
        [
            {
                text: strings('cancel_button'),
                onPress:()=>{
                    popCustom.hide()
                }
            },
            {
                text: strings('alert_ok_button'),
                onPress:(text)=>{
                    const _hashed_password = hashPassword(text);
                    if(_hashed_password === hashed_password){
                        popCustom.hide();
                        newRoute.onVerifySuccess&&newRoute.onVerifySuccess();
                        newRoute.onVerifySuccess||navigation.navigate(newRoute.url,newRoute.args)
                    }else{
                        popCustom.setErrorMsg(strings('unsigned_login.error_incorrect_password'))
                    }
                }
            }
        ],
        {
            cancelable: false,
            type:'input'
        }
    );
    pinCodeEnabled&&navigation.navigate('unlock',{
        targetScreen: newRoute.url,
        targetScreenArgs: newRoute.args,
        onUnlockSuccess: newRoute.onVerifySuccess
    });

}
module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    dbGet: dbGet,
    validatePassword: validatePassword,
    hashPassword: hashPassword,
    getLedgerMessage: getLedgerMessage,
    validatePrivateKey: validatePrivateKey,
    generateQRCode: generateQRCode,
    validateAmount: validateAmount,
    saveImage: saveImage,
    validatePositiveInteger: validatePositiveInteger,
    validateAddress: validateAddress,
    fetchRequest: fetchRequest,
    listenTransaction:listenTransaction,
    listenCoinPrice: listenCoinPrice,
    validateRecipient: validateRecipient,
    hexString2Array: hexString2Array,
    mainnet_url: mainnet_url,
    mastery_url: mastery_url,
    getStatusBarHeight:getStatusBarHeight,
    listenAppState:listenAppState,
    strLen: strLen,
    AppToast: AppToast,
    navigationSafely,
    getLatestVersion: getLatestVersion,
    generateUpdateMessage: generateUpdateMessage,
};
