const SORT = [
    {
        title: 'sort.balance',
    },
    {
        title: 'sort.transaction',
    },
];

const FILTER = [
    {
        title: 'filter.all',
    },
    {
        title: 'filter.masterKey',
    },
    {
        title: 'filter.privateKey',
    },
    {
        title: 'filter.ledger',
    },
];

const MENU = [
    {
        title:'wallet.menu_master_key',
        image:require('../../../assets/account_mk_symbol.png'),
    },
    {
        title:'wallet.menu_private_key',
        image:require('../../../assets/account_pk_symbol.png'),
    },
    {
        title:'wallet.menu_ledger',
        image:require('../../../assets/account_le_symbol.png'),
    },
];

module.exports={
    SORT: SORT,
    FILTER: FILTER,
    MENU: MENU,
};
