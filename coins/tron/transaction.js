import {getLatestBlock} from './jsonrpc';
import keyStore from 'react-native-makkii-core';

function sendTransaction(account, symbol, to, value, extra_params, data, network='mainnet') {
    getLatestBlock(network).then(block => {
        let blk_header = block.block_header;
        let now = new Date().getTime();
        let expire = now + 10 * 60 * 60 * 1000;
        let tx = {
            timestamp: now,
            expiration : expire,
            to_address: to,
            amount: value,
            owner_address: this.account.address,
            private_key : this.account.private_key,
            block_header: blk_header,
        };
        keyStore.signTransaction(tx, keyStore.CoinType[this.account.symbol]).then(res=> {
            let signedTx = {
                signature: res.signature,
                txID: res.txID,
                raw_data: {
                    contract: [
                        {
                            parameter: {
                                value: {
                                    amount: tx.amount,
                                    owner_address: tx.owner_address,
                                    to_address: tx.to_address
                                },
                                type_url: "type.googleapis.com/protocol.TransferContract"
                            },
                            type: "TransferContract"
                        }
                    ],
                    ref_block_bytes:res.ref_block_bytes,
                    ref_block_hash:res.ref_block_hash,
                    expiration:tx.expiration,
                    timestamp:tx.timestamp
                }
            };
        });
    });
}

module.exports = {
    sendTransaction,
}