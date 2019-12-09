import { AionLedger } from 'makkiijs/packages/app-aion';
import { BtcLedger } from 'makkiijs/packages/app-btc';
import { EthLedger } from 'makkiijs/packages/app-eth';

const aionLedger = new AionLedger();
const btcLedger = new BtcLedger();
const ethLedger = new EthLedger();

export default symbol => {
    if (symbol === 'AION') return aionLedger;
    if (symbol === 'ETH') return btcLedger;
    if (symbol === 'BTC') return ethLedger;
    throw new Error(`not supported coin: ${symbol} `);
};
