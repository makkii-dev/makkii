export const APPS = [
    {
        id: 'AionStaking',
        title: 'discoverApp.aion_staking',
        image: require('../../../../assets/app_aionStaking.png'),
        entry: {
            type: 'dapp', // to dapp launcher
            dappName: 'Aion Staking',
        },
    },
    {
        id: 'News',
        title: 'discoverApp.news',
        image: require('../../../../assets/app_news.png'),
        entry: {
            type: 'route', // navigate
            uri: 'signed_news',
        },
    },
    {
        id: 'BlockchainExplorer',
        title: 'discoverApp.blockChain_browser',
        image: require('../../../../assets/app_browser.png'),
        entry: {
            type: 'route', // navigate
            uri: 'signed_blockChain_browser',
        },
    },
    {
        id: 'Pokket',
        title: 'discoverApp.pokket',
        image: require('../../../../assets/app_pokket.png'),
        entry: {
            type: 'route', // navigate
            uri: 'signed_pokket',
        },
    },
];

export const BROWSERS = [
    {
        id: 'AION',
        title: 'blockChain.aion',
        image: require('../../../../assets/coin_aion.png'),
    },
    {
        id: 'BTC',
        title: 'blockChain.btc',
        image: require('../../../../assets/coin_btc.png'),
    },
    {
        id: 'ETH',
        title: 'blockChain.eth',
        image: require('../../../../assets/coin_eth.png'),
    },
    {
        id: 'LTC',
        title: 'blockChain.ltc',
        image: require('../../../../assets/coin_ltc.png'),
    },
    {
        id: 'TRON',
        title: 'blockChain.trx',
        image: require('../../../../assets/coin_trx.png'),
    },
];
