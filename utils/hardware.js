import { AionLedger } from 'makkii-coins/packages/app-aion';
import { BtcLedger } from 'makkii-coins/packages/app-btc';
import { EthLedger } from 'makkii-coins/packages/app-eth';

const aionLedger = new AionLedger();
const btcLedger = new BtcLedger();
const ethLedger = new EthLedger();

export default symbol => {
    if (symbol === 'AION') return aionLedger;
    if (symbol === 'ETH') return btcLedger;
    if (symbol === 'BTC') return ethLedger;
    throw new Error(`not supported coin: ${symbol} `);
};
