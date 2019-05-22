function validateAddress(address) {
    // do not verify prefix a0
    let reg = /^[0-9a-fA-F]{64}$/;
    address = address.startsWith('0x') ? address.substring(2) : address;
    return reg.test(address);
}

module.exports = {
    validateAddress,
}
