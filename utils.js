import {AsyncStorage, DeviceEventEmitter, Platform, CameraRoll} from 'react-native';
import blake2b from "blake2b";
import wallet from 'react-native-aion-hw-wallet';
import fetch_blob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import {strings} from './locales/i18n';
import {update_account_txs} from "./actions/accounts";
import {setting} from "./actions/setting";
import Toast from 'react-native-root-toast';

const tripledes = require('crypto-js/tripledes');
const CryptoJS = require("crypto-js");

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
    const url = `http://45.118.132.89:8080/price?crypto=AION&fiat=${currency}`;
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

class listenCoinPrice{
    constructor(store) {
        this.store = store;
        this.interval = store.getState().setting.exchange_refresh_interval;
        this.currency = store.getState().setting.fiat_currency;
    }

    setInterval(interval) {
        this.interval = interval;
        this.stopListen();
        this.startListen();
    }

    setCurrency(currency) {
        this.currency = currency;
        this.stopListen();
        this.startListen();
    }

    startListen() {
        console.log('===================================')
        const thusStore = this.store;
        getCoinPrice(this.currency).then(price => {
            console.log('------------------------------')
            let settings = thusStore.getState().setting;
            settings.coinPrice = price;
            DeviceEventEmitter.emit('updateAccountBalance');
            thusStore.dispatch(setting(settings));
        }, error => {
            console.log("get coin price error", error);
        });

        this.listener = setInterval(function() {
             getCoinPrice(this.currency).then(price => {
                 console.log('------------------------------')
                let settings = thusStore.getState().setting;
                settings.coinPrice = price;
                DeviceEventEmitter.emit('updateAccountBalance');
                thusStore.dispatch(setting(settings));
            }, error => {
                console.log("get coin price error", error);
             });
        }, this.interval * 60 * 1000);
    }

    stopListen() {
        clearInterval(this.listener);
    }

}

class listenTransaction{
    constructor(store, timeOut=60*1000){
        this.txMap={};
        this.timeOut = timeOut;
        this.store = store;
    }
    addTransaction(tx){
        let thusMap = this.txMap;
        const thusTimeOut = this.timeOut;
        const thusStore = this.store;
        const {user}= this.store.getState();
        if(typeof thusMap[tx.hash] !== 'undefined')
            return;
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
                removeTransaction(tx);
            }
            web3.eth.getTransactionReceipt(tx.hash).then(
                res=>{
                    if(res){
                        console.log(res);
                        tx.status = res.status? 'CONFIRMED':'FAILED';
                        tx.blockNumber = res.blockNumber;
                        thusStore.dispatch(update_account_txs(tx.from,{[tx.hash]:tx}, user.hashed_password));
                        thusStore.dispatch(update_account_txs(tx.to,{[tx.hash]:tx}, user.hashed_password));
                        DeviceEventEmitter.emit('updateAccountBalance');
                        removeTransaction(tx);
                    }
                },
                err=>{
                    Toast.show("Unable to connect to remote server");
                    removeTransaction(tx);
                }
            )
        }, 2000);

    }

}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    dbGet: dbGet,
    validatePassword: validatePassword,
    validateUrl: validateUrl,
    hashPassword: hashPassword,
    getLedgerMessage: getLedgerMessage,
    validatePrivateKey: validatePrivateKey,
    generateQRCode: generateQRCode,
    validateAmount: validateAmount,
    saveImage: saveImage,
    validatePositiveInteger: validatePositiveInteger,
    validateAddress: validateAddress,
    fetchRequest: fetchRequest,
    getCoinPrice: getCoinPrice,
    listenTransaction:listenTransaction,
    listenCoinPrice: listenCoinPrice,
    validateRecipient: validateRecipient,
    hexString2Array: hexString2Array,
}
