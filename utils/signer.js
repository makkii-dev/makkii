import { AionLocalSigner } from 'makkiijs/packages/app-aion';
import { BtcLocalSigner } from 'makkiijs/packages/app-btc';
import { EthLocalSigner } from 'makkiijs/packages/app-eth';
import { TronLocalSigner } from 'makkiijs/packages/app-tron';
import { COINS } from '../client/support_coin_list';

export default symbol => {
    if (symbol === 'AION') return new AionLocalSigner();
    if (symbol === 'ETH') return new EthLocalSigner();
    if (symbol === 'BTC' || symbol === 'LTC') return new BtcLocalSigner(COINS[symbol].network);
    if (symbol === 'TRX') return new TronLocalSigner();
    throw new Error(`not supported coin: ${symbol} `);
};
