import {AsyncStorage} from 'react-native';
import blake2b from "blake2b";
import wallet from 'react-native-aion-hw-wallet';
import fetch_blob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import BigNumber from 'bignumber.js';

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
                    reject(e);
                } 
            } else {
                reject();
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

function validateAmount(amount) {
    let reg = /^[0-9]?((\.[0-9]+)|([0-9]+(\.[0-9]+)?))$/;
    return reg.test(amount);
}

function hashPassword(password) {
    let passwordHash = blake2b(32).update(Buffer.from(password, 'utf8')).digest('hex')
    return passwordHash;
}

function getLedgerMessage(errorCode) {
    if (errorCode === wallet.APP_INACTIVATED) {
        return 'Please activate Aion App on Ledger Device';
    } else if (errorCode === wallet.INVALID_DEVICE_NUMBER) {
        return 'No connected Ledger device';
    } else if (errorCode === wallet.USER_REJECTED) {
        return 'User cancelled this transaction';
    } else if (errorCode === wallet.NO_PERMISSION) {
        return 'Please grant usb device permission';
    } else if (errorCode === wallet.GENERAL_ERROR || errorCode === wallet.INVALID_ACCOUNT_TYPE || errorCode === wallet.INVALID_TX_PAYLOAD || errorCode === wallet.OPEN_DEVICE_FAIL) {
        return 'Internal error';
    } else {
        return 'Internal error';
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

module.exports = {
    dbGet,
    validatePassword,
    validateUrl,
    hashPassword,
    getLedgerMessage,
    validatePrivateKey,
    generateQRCode,
    validateAmount,
    saveImage,
    fetchRequest,
}
