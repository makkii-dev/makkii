function validateAddress(address, network='mainnet') {
    return new Promise((resolve, reject) => {
        // do not verify prefix a0
        let reg = /^[0-9a-fA-F]{64}$/;
        address = address.startsWith('0x') ? address.substring(2) : address;
        resolve(reg.test(address));
    });
}

function formatAddress1Line(address) {
    let pre = address.startsWith('0x')? 2: 0;
    return address.substring(0, 10 + pre) + '...' + address.substring(address.length - 10);
}

module.exports = {
    validateAddress,
    formatAddress1Line
}
