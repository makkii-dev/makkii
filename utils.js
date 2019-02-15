import {AsyncStorage} from 'react-native';
import blake2b from "blake2b";
import wallet from 'react-native-aion-hw-wallet';
import fetch_blob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import {strings} from './locales/i18n';
import {update_account_txs} from "./actions/accounts";

function dbGet(key){
    return new Promise((resolve, reject)=>{
        AsyncStorage 
        .getItem(key) 
        .then(json=>{
            if(json){
                try{
                    let data = JSON.parse(json);
                    resolve(data);
                }catch(e){
                    reject('[dbGet] ' + e);
                } 
            } else {
                reject('[dbGet] db.user null');
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

function hashPassword(password) {
    let passwordHash = blake2b(32).update(Buffer.from(password, 'utf8')).digest('hex')
    return passwordHash;
}

function getLedgerMessage(errorCode) {
    if (errorCode === wallet.APP_INACTIVATED) {
        return strings('ledger.error.application_inactive');
    } else if (errorCode === wallet.INVALID_DEVICE_NUMBER) {
        return strings('ledger.error.device_count');
    } else if (errorCode === wallet.USER_REJECTED) {
        return strings('ledger.error.user_rejected');
    } else if (errorCode === wallet.NO_PERMISSION) {
        return strings('ledger.error.permission_denied');
    } else if (errorCode === wallet.GENERAL_ERROR || errorCode === wallet.INVALID_ACCOUNT_TYPE || errorCode === wallet.INVALID_TX_PAYLOAD || errorCode === wallet.OPEN_DEVICE_FAIL) {
        return strings('ledger.error.general');
    } else if (errorCode === 'error.wrong_device') {
        return strings('ledger.error.wrong_device');
    } else {
        return strings('ledger.error.general');
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

class listenTransaction{
    constructor(store, timeOut=60*1000){
        this.txMap={};
        this.timeOut = timeOut;
        this.store = store;
    }
    addTransaction(tx){
        let thusMap = this.txMap;
        let thusTimeOut = this.timeOut;
        let thusStore = this.store;
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
                        thusStore.dispatch(update_account_txs(tx.from,{[tx.hash]:tx}));
                        thusStore.dispatch(update_account_txs(tx.to,{[tx.hash]:tx}));
                        removeTransaction(tx);
                    }
                },
                err=>{
                    removeTransaction(tx);
                }
            )
        }, 2000);

    }

}

module.exports = {
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
    listenTransaction:listenTransaction,
}