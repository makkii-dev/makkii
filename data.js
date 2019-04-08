let dapps = {};
dapps.mastery=[];
dapps.mainnet=[];
dapps.mastery.push({
	name: 'Pet Roulette',
	logo: require('./assets/apps/app1/app1_logo.png'),
	description: '\tWhen 7 bets have been placed - an animal will be randomly selected and a payout will occur.Winners who guessed correctly will split the amount in the AION pool! If no winner, total AION pool will rollover',
	// uri: 'http://192.168.50.83:8082'
	uri: 'https://aion-roulette.netlify.com/',
	author: 'KimCodeashian',
	type:'dapp.type_game',
	screenShot: require('./assets/apps/app1/app1_screenshot.png')
});
// dapps.mainnet.push({
// 	name: 'Pet Roulette',
// 	logo: require('./assets/apps/app1/app1_logo.png'),
// 	description: '\tWhen 7 bets have been placed - an animal will be randomly selected and a payout will occur.Winners who guessed correctly will split the amount in the AION pool! If no winner, total AION pool will rollover',
// 	// uri: 'http://192.168.50.83:8082'
// 	uri: 'https://www.chaion.net/DApp1/',
// 	author: 'KimCodeashian',
// 	type:'dapp.type_game',
// 	screenShot: require('./assets/apps/app1/app1_screenshot.png')
// });

export default data = {
	dapps,
}
