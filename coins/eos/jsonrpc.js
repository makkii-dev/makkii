import ApiCaller from '../../utils/http_caller'
import KeyStore from 'react-native-makkii-core'
const EOS = KeyStore.CoinType.EOS;
const getEndpoint = (network) => {
    if(network === 'mainnet') {
        return 'https://api.eosnewyork.io'
    }else {
        return 'https://eos-jungle.eosblocksmith.io:443'
    }
};

const getBalance = (public_key, network) => new Promise((resolve,reject)=>{
    const get_key_accounts_url = getEndpoint(network)+'/v1/history/get_key_accounts';

});

const getTransactionsByAddress = ()=> new Promise((resolve,reject)=>{
    resolve({})
});


module.exports = {
    getBalance,
    getTransactionsByAddress
}
