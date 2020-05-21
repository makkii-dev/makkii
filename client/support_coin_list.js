/* eslint-disable import/no-mutable-exports */
import Config from 'react-native-config';
import { HttpClient } from 'lib-common-util-js';

const isTestNet = Config.is_testnet === 'true';

async function getCoinFee(coin) {
    const url = `https://api.blockcypher.com/v1/${coin}/main`;
    try {
        const { data } = await HttpClient.get(url);
        if (coin.match('ltc|btc')) {
            return {
                maxByteFee: parseInt(data.high_fee_per_kb / 1000),
                minByteFee: parseInt(data.low_fee_per_kb / 1000),
                defaultFee: parseInt((data.high_fee_per_kb - data.low_fee_per_kb) / 1000),
            };
        }
        return {
            maxGasPrice: parseInt(data.high_gas_price / 10 ** 9),
            minGasPrice: parseInt(data.low_gas_price / 10 ** 9),
            defaultGasPrice: parseInt(data.medium_gas_price / 10 ** 9),
        };
    } catch (err) {
        return {};
    }
}

export let COINS = {
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
        bip38Supported: false,
        ledgerSupport: true,
        viewOnlyAddressSupport: true,
        minGasLimit: 21000,
        maxGasLimit: 150000,
        minGasPrice: 10,
        maxGasPrice: 30,
        minUnit: 'nAMP',
        defaultTokenIcon: require('../assets/token_default_ats.png'),
        isTestNet,
    },
    BTC: {
        name: 'BITCOIN',
        symbol: 'BTC',
        icon: require('../assets/coin_btc.png'),
        txFeeSupport: true,
        tokenSupport: false,
        network: isTestNet ? 'BTCTEST' : 'BTC',
        bip38Supported: true,
        WIFSupported: true,
        ledgerSupport: true,
        viewOnlyAddressSupport: true,
        minByteFee: 10,
        maxByteFee: 180,
        defaultFee: 50,
        gasPriceUnit: 'SAT',
        isTestNet,
    },
    ETH: {
        name: 'ETHEREUM',
        symbol: 'ETH',
        icon: require('../assets/coin_eth.png'),
        tokenSupport: true,
        txFeeSupport: true,
        tokenExchangeSupport: true,
        gasPriceUnit: 'Gwei',
        defaultGasPrice: '20',
        defaultGasLimit: '21000',
        defaultGasLimitForContract: '60000',
        network: isTestNet ? 'ropsten' : 'mainnet',
        bip38Supported: false,
        ledgerSupport: true,
        defaultTokenIcon: require('../assets/token_default_erc20.png'),
        viewOnlyAddressSupport: true,
        minGasLimit: 21000,
        maxGasLimit: 150000,
        minGasPrice: 10,
        maxGasPrice: 30,
        minUnit: 'Wei',
        isTestNet,
    },
    LTC: {
        name: 'LITECOIN',
        symbol: 'LTC',
        icon: require('../assets/coin_ltc.png'),
        txFeeSupport: true,
        tokenSupport: false,
        network: isTestNet ? 'LTCTEST' : 'LTC',
        bip38Supported: true,
        WIFSupported: true,
        ledgerSupport: false,
        viewOnlyAddressSupport: true,
        minByteFee: 10,
        maxByteFee: 180,
        defaultFee: 50,
        gasPriceUnit: 'SAT',
        isTestNet,
    },
    TRX: {
        name: 'TRON',
        symbol: 'TRX',
        icon: require('../assets/coin_trx.png'),
        tokenSupport: false,
        txFeeSupport: false,
        network: isTestNet ? 'shasta' : 'mainnet',
        bip38Supported: false,
        ledgerSupport: false,
        viewOnlyAddressSupport: true,
        isTestNet,
    },
};

export const updateCoinFee = () => {
    getCoinFee('btc').then(res => {
        COINS.BTC = {
            ...COINS.BTC,
            ...res,
        };
    });

    getCoinFee('ltc').then(res => {
        COINS.LTC = {
            ...COINS.LTC,
            ...res,
        };
    });

    getCoinFee('eth').then(res => {
        COINS.ETH = {
            ...COINS.ETH,
            ...res,
        };
    });
};
