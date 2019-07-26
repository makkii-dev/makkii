import Config from 'react-native-config';
import aionApi from './aion';
import ethApi from './eth';
import tronApi from './tron';
// import eos_api from './eos';
import btcApi from './btc+ltc';

const isTestNet = Config.is_testnet === 'true';

export const COINS = {
    AION: {
        name: 'AION',
        symbol: 'AION',
        icon: require('../assets/coin_aion.png'),
        tokenSupport: true,
        txFeeSupport: true,
        gasPriceUnit: 'AMP',
        defaultGasPrice: '10',
        defaultGasLimit: '21000',
        defaultGasLimitForContract: '90000',
        network: isTestNet ? 'mastery' : 'mainnet',
        isTestNet,
        api: aionApi,
    },
    BTC: {
        name: 'BITCOIN',
        symbol: 'BTC',
        icon: require('../assets/coin_btc.png'),
        tokenSupport: false,
        gasPriceUnit: '',
        network: isTestNet ? 'BTCTEST' : 'BTC',
        isTestNet,
        api: btcApi,
    },
    ETH: {
        name: 'ETHEREUM',
        symbol: 'ETH',
        icon: require('../assets/coin_eth.png'),
        tokenSupport: true,
        txFeeSupport: true,
        tokenExchangeSupport: true,
        gasPriceUnit: 'Gwei',
        defaultGasPrice: '10',
        defaultGasLimit: '21000',
        defaultGasLimitForContract: '60000',
        network: isTestNet ? 'ropsten' : 'mainnet',
        isTestNet,
        api: ethApi,
    },
    // 'EOS': {
    //     name: 'EOS',
    //     symbol: 'EOS',
    //     icon: require('../assets/coin_eos.png'),
    //     tokenSupport: false,
    //     gasPriceUnit: '',
    //     api: eos_api,
    // },
    LTC: {
        name: 'LITECOIN',
        symbol: 'LTC',
        icon: require('../assets/coin_ltc.png'),
        tokenSupport: false,
        gasPriceUnit: '',
        network: isTestNet ? 'LTCTEST' : 'LTC',
        isTestNet,
        api: btcApi,
    },
    TRX: {
        name: 'TRON',
        symbol: 'TRX',
        icon: require('../assets/coin_trx.png'),
        tokenSupport: false,
        txFeeSupport: false,
        network: isTestNet ? 'shasta' : 'mainnet',
        isTestNet,
        api: tronApi,
    },
};
