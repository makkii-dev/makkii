import {AsyncStorage, DeviceEventEmitter} from 'react-native';
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
    let reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,16}$/;
    return reg.test(password);
}
 
function validateUrl(url) {
    // TODO: validate format http(s)://<host>(:<port>)/
    // TODO: validate port range
    return true;
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
    let reg= /^(0|[1-9][0-9]*)$/;
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
    } else if (errorCode === 'error_wrong_device') {
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
    const filePath = dirs.PictureDir + "/" + imageFileName;
    return new Promise((resolve, reject)=>{
        RNFS.writeFile(filePath, base64, 'base64').then(() => {
            resolve(filePath);
        }, error => {
            console.log("save image failed: ", error);
            reject(error);
        });
    })
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
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=AION&convert=${currency}`;
    const headers={
        'X-CMC_PRO_API_KEY': 'a4fa68bd-6ff6-468e-85e1-0baf709b658d'
    };
    return new Promise((resolve, reject) => {
        fetchRequest(url,'GET',headers).then(res=>{
            console.log('[res] ',res);
            const price = res.data['AION'].quote[currency].price;
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
                reject('timeout');
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
}