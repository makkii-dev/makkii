const SORT = [
    {
        title: 'sort.balance',
        image: require('../../../assets/sort_by_balance.png'),
    },
    {
        title: 'sort.transaction',
        image: require('../../../assets/sort_by_transactions.png'),
    },
];

const FILTER = [
    {
        title: 'filter.all',
        image: require('../../../assets/account_all_symbol.png'),
    },
    {
        title: 'filter.masterKey',
        image: require('../../../assets/account_mk_symbol.png'),
    },
    {
        title: 'filter.privateKey',
        image: require('../../../assets/account_pk_symbol.png'),
    },
    {
        title: 'filter.ledger',
        image: require('../../../assets/account_le_symbol.png'),
    },
];

const MENU = [
    {
        title: 'wallet.menu_master_key',
        image: require('../../../assets/account_mk_symbol.png'),
    },
    {
        title: 'wallet.menu_private_key',
        image: require('../../../assets/account_pk_symbol.png'),
    },
    {
        title: 'wallet.menu_ledger',
        image: require('../../../assets/account_le_symbol.png'),
    },
];

const ACCOUNT_MENU = [
    {
        title: 'account_view.menu_change_name',
        image: require('../../../assets/icon_account_edit.png'),
    },
    {
        title: 'account_view.menu_export_private_key',
        image: require('../../../assets/icon_account_export.png'),
    },
    {
        title: 'account_view.menu_switch_token',
        image: require('../../../assets/icon_switch_coin.png'),
    }
];

const COINS = {
    'AION': {
        name: 'AION',
        symbol: 'AION',
        icon: require('../../../assets/coin_aion.png'),
        tokenSupport: true,
        gasPriceUnit: 'AMP',
        defaultGasPrice: '10',
        defaultGasLimit: '21000',
        defaultGasLimitForContract: '90000',
    },
    'BTC': {
        name: 'BITCOIN',
        symbol: 'BTC',
        icon: require('../../../assets/coin_btc.png'),
        tokenSupport: false,
        gasPriceUnit: '',
    },
    'ETH': {
        name: 'ETHEREUM',
        symbol: 'ETH',
        icon: require('../../../assets/coin_eth.png'),
        tokenSupport: false,
        gasPriceUnit: 'Gwei',
        defaultGasPrice: '20',
        defaultGasLimit: '21000',
    },
    'EOS': {
        name: 'EOS',
        symbol: 'EOS',
        icon: require('../../../assets/coin_eos.png'),
        tokenSupport: false,
        gasPriceUnit: '',
    },
    'LTC': {
        name: 'LITECOIN',
        symbol: 'LTC',
        icon: require('../../../assets/coin_ltc.png'),
        tokenSupport: false,
        gasPriceUnit: '',
    },
    'TRON': {
        name: 'TRON',
        symbol: 'TRX',
        icon: require('../../../assets/coin_trx.png'),
        tokenSupport: false,
        gasPriceUnit: '',
    }
};

const IMPORT_SOURCE = [
    {
        title: 'Create',
        icon: require('../../../assets/account_mk_symbol.png'),
    },
    {
        title: 'Import from Private Key',
        icon: require('../../../assets/account_pk_symbol.png'),
    },
    {
        title: 'Import from KeyStore',
        icon: require('../../../assets/account_pk_symbol.png'),
    },
    {
        title: 'Import from Ledger',
        icon: require('../../../assets/account_le_symbol.png'),
    }
];

module.exports={
    SORT: SORT,
    FILTER: FILTER,
    MENU: MENU,
    ACCOUNT_MENU:ACCOUNT_MENU,
    COINS: COINS,
    IMPORT_SOURCE: IMPORT_SOURCE,
};
