let dapps = {};
dapps.mastery = [];
dapps.mainnet = [];
dapps.mastery.push({
    name: 'Pet Roulette',
    logo: require('./assets/apps/app1/app1_logo.png'),
    description:
        '\tWhen 7 bets have been placed - an animal will be randomly selected and a payout will occur.Winners who guessed correctly will split the amount in the AION pool! If no winner, total AION pool will rollover',
    // uri: 'http://192.168.50.83:8082'
    uri: 'https://aion-roulette.netlify.com/',
    author: 'KimCodeashian',
    type: 'dapp.type_game',
    screenShot: require('./assets/apps/app1/app1_screenshot.png'),
});
// discover.mainnet.push({
// 	name: 'Pet Roulette',
// 	logo: require('./assets/discover/app1/app1_logo.png'),
// 	description: '\tWhen 7 bets have been placed - an animal will be randomly selected and a payout will occur.Winners who guessed correctly will split the amount in the AION pool! If no winner, total AION pool will rollover',
// 	// uri: 'http://192.168.50.83:8082'
// 	uri: 'https://www.chaion.net/DApp1/',
// 	author: 'KimCodeashian',
// 	type:'dapp.type_game',
// 	screenShot: require('./assets/discover/app1/app1_screenshot.png')
// });

const template = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const random = (n, m) => Math.floor(Math.random() * (m - n)) + n;
const genRandomStr = (n, m, length) => {
    let str = '';
    for (let i = 0; i < length; i++) {
        str += template.charAt(random(n, m));
    }
    return str;
};

const genProduct = base => {
    const token = genRandomStr(0, 26, 3);
    const tokenFullName = genRandomStr(26, 52, Math.floor(Math.random() * 5 + 3));
    const weeklyInterestRate = parseFloat((Math.random() * 10).toFixed(2));
    return {
        token,
        tokenFullName,
        weeklyInterestRate,
        yearlyInterestRate: parseFloat((weeklyInterestRate * 52).toFixed(2)),
        remainingQuota: random(10000, 100 * 10000),
        minInvestAmount: random(1, 10) * 200,
        token2Collateral: base ? parseFloat((Math.random() / 10).toFixed(2)) : 1 / parseFloat((Math.random() / 10).toFixed(2)),
    };
};

let products = [
    {
        token: 'BTC',
        tokenFullName: 'BitCoin',
        weeklyInterestRate: 3.12,
        yearlyInterestRate: 162.24,
        remainingQuota: 5 * 10 ** 3,
        minInvestAmount: 0.5,
        token2Collateral: parseFloat((Math.random() / 10).toFixed(2)),
    },
];
for (let i = 0; i < 10; i++) {
    products.push(genProduct(Math.floor(Math.random() * 5) % 5));
}

let orders = [];

for (let i = 0; i < 10; i++) {
    const weeklyInterestRate = parseFloat((Math.random() * 10).toFixed(2));
    const amount = random(1, 10) * 200;
    const base = Math.floor(Math.random() * 5) % 5;
    const token2Collateral = base ? parseFloat((Math.random() / 10).toFixed(2)) : 1 / parseFloat((Math.random() / 10).toFixed(2));
    orders.push({
        amount,
        autoRoll: random(0, 10) % 2,
        token2Collateral,
        depositTUSDTransactionHash: `0x${genRandomStr(26, 60, 10)}`,
        investTransactionHash: `0x${genRandomStr(26, 60, 10)}`,
        investorAddress: `0x${genRandomStr(26, 60, 10)}`,
        orderId: `${genRandomStr(52, 62, 21)}`,
        startTime: Date.now() - 24 * 3600 * 1000 * random(0, 7),
        status: ['WAIT_INVEST_TX_CONFIRM', 'WAIT_COLLATERAL_DEPOSIT', 'IN_PROGRESS', 'COMPLETE'][random(0, 4) % 3],
        token: genRandomStr(0, 26, 3),
        tokenFullName: genRandomStr(26, 52, Math.floor(Math.random() * 5 + 3)),
        weeklyInterestRate,
        yearlyInterestRate: parseFloat((weeklyInterestRate * 52).toFixed(2)),
    });
}

export default data = {
    dapps,
    products,
    orders,
};
