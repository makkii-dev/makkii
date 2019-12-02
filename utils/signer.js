import { AionLocalSigner } from 'makkii-coins/packages/app-aion';
import { BtcLocalSigner } from 'makkii-coins/packages/app-btc';
import { EthLocalSigner } from 'makkii-coins/packages/app-eth';
import { TronLocalSigner } from 'makkii-coins/packages/app-tron';

export default symbol => {
    if (symbol === 'AION') return new AionLocalSigner();
    if (symbol === 'ETH') return new EthLocalSigner();
    if (symbol === 'BTC' || symbol === 'LTC') return new BtcLocalSigner();
    if (symbol === 'TRX') return new TronLocalSigner();
    throw new Error(`not supported coin: ${symbol} `);
};
