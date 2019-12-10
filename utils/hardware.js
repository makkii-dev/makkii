import { AionLedger } from 'makkiijs/packages/app-aion';
import { BtcLedger } from 'makkiijs/packages/app-btc';
import { EthLedger } from 'makkiijs/packages/app-eth';
import { COINS } from '../client/support_coin_list';

const aionLedger = new AionLedger();
const btcLedger = new BtcLedger(COINS.BTC.network);
const ethLedger = new EthLedger();

export default symbol => {
    if (symbol === 'AION') return aionLedger;
    if (symbol === 'ETH') return ethLedger;
    if (symbol === 'BTC') return btcLedger;
    throw new Error(`not supported coin: ${symbol} `);
};
