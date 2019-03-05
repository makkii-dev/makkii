const Web3 = require('aion-web3');
const invoke = require('./webView-invoke/browser');
const formatters = require('aion-web3-core-helpers').formatters;
const {
    ETH,
    ETH_SENDTRANSACTION,
    ETH_ACCOUNTS,
    ETH_GETACCOUNTS,
    ETH_SIGNTRANSACTION,
    ETH_SIGN,
} = require('./constants');

let currentAddress;
const commonInfo = {
    type: 'FROM_PAGE',
};

function updateCurrentNetwork(current_network: string) {
    console.log("current_network",current_network);
    initializeWeb3(current_network);
}

function updateCurrentAddress(current_address: string) {
    console.log('current_address', current_address);
    currentAddress = current_address;
}

invoke.define("updateCurrentNetwork", updateCurrentNetwork)
    .define("updateCurrentAddress", updateCurrentAddress);

const getInitState = invoke.bind('getInitState');

const signTransactionFn = invoke.bind('eth_signTransaction');

const sendTransactionFn = invoke.bind('eth_sendTransaction');

const signFn = invoke.bind('eth_sign');

const getCurrentAddressFn = invoke.bind('eth_accounts');

const sendTransaction=(args)=>{
    args =formatters.inputTransactionFormatter(args);
    return sendTransactionFn(args);
};

function initializeWeb3(url) {
    let web3 = new Web3(new Web3.providers.HttpProvider(`${url}`));
    let handler = {
        get: (_aionweb3, key) => {
            switch (key) {
                case ETH:
                    return new Proxy(_aionweb3[key], handler);
                case ETH_SENDTRANSACTION:
                    return sendTransaction;
                case ETH_GETACCOUNTS:
                    return getCurrentAddressFn;
                case ETH_ACCOUNTS:
                    return currentAddress;
                case ETH_SIGNTRANSACTION:
                    return signTransactionFn;
                case ETH_SIGN:
                    return signFn;
                default:
            }
            return _aionweb3[key];
        },
        set: (_aionweb3, key, value) => {
            _aionweb3[key] = value;
        },
    };
    global.aionweb3 = new Proxy(web3, handler);
}

const enableFn = async () => {
    const data = {
        ...commonInfo,
        func: 'privacy',
    };
    const { result } = await activateStream(data);
    if (result.cancel) throw new Error(result.message);

    const address = result.connect_privacy.data;
    currentAddress = [address];
    return currentAddress;
};


getInitState().then(
    d=>{
        console.log('initState  res', d);
        initializeWeb3(d.network);
        currentAddress = d.wallet;
    },
    e=>console.log('initState err', e)
);


global.aiwa = {
    enable: enableFn,
};


