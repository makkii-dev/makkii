export const APPS = [
    {
        id: 'aion_staking',
        title: 'discoverApp.aion_staking',
        image: require('../../../../assets/app_aionStaking.png'),
        entry: {
            type: 'dapp', // to dapp launcher
            uri: 'http://192.168.50.100:8080/staking/home',
            dappName: 'Aion Staking',
        },
    },
    {
        id: 'news',
        title: 'discoverApp.news',
        image: require('../../../../assets/app_news.png'),
        entry: {
            type: 'route', // navigate
            uri: 'signed_news',
        },
    },
    {
        id: 'browser',
        title: 'discoverApp.blockChain_browser',
        image: require('../../../../assets/app_browser.png'),
        entry: {
            type: 'route', // navigate
            uri: 'signed_blockChain_browser',
        },
    },
];

export const BROWSERS = [
    {
        id: 'AION',
        title: 'blockChain.aion',
        image: require('../../../../assets/coin_aion.png'),
        uri: 'https://mainnet.aion.network/',
    },
    {
        id: 'BTC',
        title: 'blockChain.btc',
        image: require('../../../../assets/coin_btc.png'),
        uri: 'https://live.blockcypher.com/btc/',
    },
    {
        id: 'ETH',
        title: 'blockChain.eth',
        image: require('../../../../assets/coin_eth.png'),
        uri: 'https://etherscan.io/',
    },
    {
        id: 'LTC',
        title: 'blockChain.ltc',
        image: require('../../../../assets/coin_ltc.png'),
        uri: 'https://live.blockcypher.com/ltc/',
    },
    {
        id: 'TRX',
        title: 'blockChain.trx',
        image: require('../../../../assets/coin_trx.png'),
        uri: 'https://tronscan.org/#/',
    },
];
