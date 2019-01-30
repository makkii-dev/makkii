import {blake2bHex} from'blakejs';

function validatePassword(password) {
    let reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,16}$/;
    return reg.test(password);
}

function validateUrl(url) {
    // TODO: validate format http(s)://<host>(:<port>)/
    // TODO: validate port range
    return true;
}

function hashPassword(password) {
    let passwordHash = blake2bHex(Buffer.from(password, 'utf8'), null, 32);
    return passwordHash;
}

module.exports = {
    validatePassword: validatePassword,
    validateUrl: validateUrl,
    hashPassword: hashPassword,
}