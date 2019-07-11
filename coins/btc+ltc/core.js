import {validateAmount} from "../../utils";
import {getUnspentTx} from "./jsonrpc";
import BigNumber from "bignumber.js";

const validateBalanceSufficiency = (account, symbol, amount, extra_params)=>new Promise((resolve, reject) => {
    if (!validateAmount(amount)) return {result: false, err: 'error_format_amount'};
    getUnspentTx(account.address, extra_params.network).then(utxos=>{
        let balance = BigNumber(0);
        utxos.forEach(utxo=>{
            balance = balance.plus(BigNumber(utxo.amount));
        });

        const BTCfee = BigNumber(148*utxos.length+34*2+10).times(2);
        const LTCfee = BigNumber(40000);
        const fee =symbol==='LTC'?LTCfee:BTCfee;
        const totalFee = BigNumber(amount).shiftedBy(8).plus(fee);
        balance.isGreaterThan(totalFee)||resolve({result: false, err: 'error_insufficient_amount'})
        balance.isGreaterThan(totalFee)&&resolve({result: true})
    }).catch(e=>{
        reject({result: false, err: 'error_insufficient_amount'})
    })
});
const sendAll = async  (address, symbol, network) =>{
    try{
        const utxos  = await getUnspentTx(address, network);
        let balance = BigNumber(0);
        utxos.forEach(utxo=>{
            balance = balance.plus(BigNumber(utxo.amount));
        });
        const BTCfee = BigNumber(148*utxos.length+34*2+10).times(2);
        const LTCfee = BigNumber(40000);
        return Math.max(balance.minus(symbol==='LTC'?LTCfee:BTCfee).shiftedBy(-8).toNumber(),0)
    }catch (e) {
        return 0;
    }
};

const formatAddress1Line =(address) => address.slice(0,12)+'...'+address.slice(-10);

module.exports = {
    validateBalanceSufficiency,
    formatAddress1Line,
    sendAll
};
