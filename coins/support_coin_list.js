import aion_api from './aion';
import eth_api from './eth';
import tron_api from './tron';
// import eos_api from './eos';
import btc_api from './btc+ltc';
export const COINS = {
    'AION': {
        name: 'AION',
        symbol: 'AION',
        icon: require('../assets/coin_aion.png'),
        tokenSupport: true,
        txFeeSupport: true,
        gasPriceUnit: 'AMP',
        defaultGasPrice: '10',
        defaultGasLimit: '21000',
        defaultGasLimitForContract: '60000',
        network: 'mastery',
        isTestNet: true,
        api: aion_api,
    },
    'BTC': {
        name: 'BITCOIN',
        symbol: 'BTC',
        icon: require('../assets/coin_btc.png'),
        tokenSupport: false,
        gasPriceUnit: '',
        network: 'BTCTEST',
        isTestNet: true,
        api: btc_api,
    },
    'ETH': {
        name: 'ETHEREUM',
        symbol: 'ETH',
        icon: require('../assets/coin_eth.png'),
        tokenSupport: true,
        txFeeSupport: true,
        gasPriceUnit: 'Gwei',
        defaultGasPrice: '10',
        defaultGasLimit: '21000',
        defaultGasLimitForContract: '60000',
        network: 'ropsten',
        isTestNet: true,
        api: eth_api,
    },
    // 'EOS': {
    //     name: 'EOS',
    //     symbol: 'EOS',
    //     icon: require('../assets/coin_eos.png'),
    //     tokenSupport: false,
    //     gasPriceUnit: '',
    //     api: eos_api,
    // },
    'LTC': {
        name: 'LITECOIN',
        symbol: 'LTC',
        icon: require('../assets/coin_ltc.png'),
        tokenSupport: false,
        gasPriceUnit: '',
        network: 'LTCTEST',
        isTestNet: true,
        api: btc_api,

    },
    'TRX': {
        name: 'TRON',
        symbol: 'TRX',
        icon: require('../assets/coin_trx.png'),
        tokenSupport: false,
        txFeeSupport: false,
        network: 'shasta',
        isTestNet: true,
        api: tron_api,
    }
};
