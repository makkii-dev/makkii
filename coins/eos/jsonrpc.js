/* eslint-disable */
import KeyStore from 'react-native-makkii-core';

const getEndpoint = network => {
  if (network === 'mainnet') {
    return 'https://api.eosnewyork.io';
  }
  return 'https://eos-jungle.eosblocksmith.io:443';
};

const getBalance = (public_key, network) =>
  new Promise((resolve, reject) => {
    const get_key_accounts_url = `${getEndpoint(network)}/v1/history/get_key_accounts`;
  });

const getTransactionsByAddress = () =>
  new Promise((resolve, reject) => {
    resolve({});
  });

module.exports = {
  getBalance,
  getTransactionsByAddress,
};
