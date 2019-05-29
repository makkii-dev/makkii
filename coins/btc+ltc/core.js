import {validateAmount} from "../../utils";
import {getUnspentTx} from "./jsonrpc";
const validateBalanceSufficiency = (account, symbol, amount, extra_params)=>new Promise((resolve, reject) => {
    if (!validateAmount(amount)) return {result: false, err: 'error_format_amount'};
    getUnspentTx(account.address, extra_params.network).then(utxos=>{
        let balance = new BigNumber(0);
        utxos.forEach(utxo=>{
            balance = balance.plus(new BigNumber(utxo.amount));
        });
        const fee = new BigNumber(148*utxos.length+34*2+10);
        const totalFee = new BigNumber(amount).shiftedBy(8).plus(fee);
        console.log('totalFee=>', totalFee, ', balance=>',balance);
        balance.isGreaterThan(totalFee)||resolve({result: false, err: 'error_insufficient_amount'})
        balance.isGreaterThan(totalFee)&&resolve({result: true})
    }).catch(e=>{
        reject({result: false, err: 'error_insufficient_amount'})
    })
});
module.exports = {
    validateBalanceSufficiency
};
