import aion_api from './aion';
import eth_api from './eth';

export const COINS = {
    'AION': {
        name: 'AION',
        symbol: 'AION',
        icon: require('../assets/coin_aion.png'),
        tokenSupport: true,
        gasPriceUnit: 'AMP',
        defaultGasPrice: '10',
        defaultGasLimit: '21000',
        defaultGasLimitForContract: '90000',
        network: 'mastery',
        api: aion_api,
    },
    'BTC': {
        name: 'BITCOIN',
        symbol: 'BTC',
        icon: require('../assets/coin_btc.png'),
        tokenSupport: false,
        gasPriceUnit: '',
    },
    'ETH': {
        name: 'ETHEREUM',
        symbol: 'ETH',
        icon: require('../assets/coin_eth.png'),
        tokenSupport: false,
        gasPriceUnit: 'Gwei',
        defaultGasPrice: '20',
        defaultGasLimit: '21000',
        network: 'ropsten',
        api: eth_api
    },
    'EOS': {
        name: 'EOS',
        symbol: 'EOS',
        icon: require('../assets/coin_eos.png'),
        tokenSupport: false,
        gasPriceUnit: '',
    },
    'LTC': {
        name: 'LITECOIN',
        symbol: 'LTC',
        icon: require('../assets/coin_ltc.png'),
        tokenSupport: false,
        gasPriceUnit: '',
    },
    'TRX': {
        name: 'TRON',
        symbol: 'TRX',
        icon: require('../assets/coin_trx.png'),
        tokenSupport: false,
        gasPriceUnit: '',
    }
};
