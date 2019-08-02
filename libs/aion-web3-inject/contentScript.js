/* eslint-disable */
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

global.aionweb3 = 'not injected';

let currentAddress;

function updateCurrentNetwork(current_network: string) {
  console.log('current_network', current_network);
  initializeWeb3(current_network);
}

function updateCurrentAddress(current_address: string) {
  console.log('current_address', current_address);
  currentAddress = current_address;
}

invoke
  .define('updateCurrentNetwork', updateCurrentNetwork)
  .define('updateCurrentAddress', updateCurrentAddress);

const getInitState = invoke.bind('getInitState');

const signTransactionFn = invoke.bind('eth_signTransaction');

const sendTransactionFn = invoke.bind('eth_sendTransaction');

const signFn = invoke.bind('eth_sign');

const getCurrentAddressFn = invoke.bind('eth_accounts');

const sendTransaction = args => {
  args = formatters.inputTransactionFormatter(args);
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

getInitState().then(
  d => {
    console.log('initState  res', d);
    initializeWeb3(d.network);
    currentAddress = d.wallet;
  },
  e => console.log('initState err', e),
);

initializeWeb3(
  'https://api.nodesmith.io/v1/aion/mainnet/jsonrpc?apiKey=c8b8ebb4f10f40358b635afae72c2780',
);
