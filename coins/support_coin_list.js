import aion_api from './aion';
import eth_api from './eth';
import tron_api from './tron';
// import eos_api from './eos';
import btc_api from './btc+ltc';
import Config from 'react-native-config';

const isTestNet = Config.is_testnet === 'true';

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
        defaultGasLimitForContract: '90000',
        network: isTestNet? 'mastery': 'mainnet',
        isTestNet: isTestNet,
        api: aion_api,
    },
    'BTC': {
        name: 'BITCOIN',
        symbol: 'BTC',
        icon: require('../assets/coin_btc.png'),
        tokenSupport: false,
        gasPriceUnit: '',
        network: isTestNet? 'BTCTEST': 'BTC',
        isTestNet: isTestNet,
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
        network: isTestNet? 'ropsten': 'mainnet',
        isTestNet: isTestNet,
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
        network: isTestNet? 'LTCTEST': 'LTC',
        isTestNet: isTestNet,
        api: btc_api,

    },
    'TRX': {
        name: 'TRON',
        symbol: 'TRX',
        icon: require('../assets/coin_trx.png'),
        tokenSupport: false,
        txFeeSupport: false,
        network: isTestNet? 'shasta': 'mainnet',
        isTestNet: isTestNet,
        api: tron_api,
    }
};
