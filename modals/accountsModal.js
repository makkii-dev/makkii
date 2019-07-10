export default {
    namespace: 'accounts',
    state:{
        lists:{},
        /*
            example:
           "AION+0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963":{  // key format is <symbol>'+'<address>
                  "address":"0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963",
                  "private_key":"0e7ff5ec5e46ba057e0a9cfcb610a8560260fbfc2db92b08faba826dacac485eb6a639de25c0ca499d4161409b02f3a6e0ed0555bdbd56017f5fc9f3ce34e3d0",
                  "balance":"15309.17544544050208896",
                  "name":"aion1",
                  "derivationIndex": 1, // this only exists for ledger account
                  "type":"[ledger]", // [pk], [local], [ledger]
                  "transactions":{ // only store latest 5 transactions
                     "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b":{
                        "hash":"0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b",
                        "timestamp":1560500875132,
                        "from":"0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963",
                        "to":"a01b56b8292c4af5404f765f1fb6eee877b84868c1b9989124f8c0d0e188cb4f",
                        "value":"0",
                        "status":"CONFIRMED",
                        "blockNumber":2639993
                     }
                  },
                  "symbol":"AION",
                  "tokens":{
                     "MAK":{  // token symbol
                        "symbol":"MAK",
                        "contractAddr":"0xa01b56b8292c4af5404f765f1fb6eee877b84868c1b9989124f8c0d0e188cb4f",
                        "name":"Makkii coin",
                        "tokenDecimal":"18",
                        "balance":"999828.9",
                        "tokenTxs":{  // only store latest 5 transactions
                           "0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b":{
                              "hash":"0xccb97f2911f4a9315643574117946b6e8a1de038b4d810d7da494637b3f65f7b",
                              "timestamp":1560500875132,
                              "from":"0xa0e08bf1df768bb3f40e795dd5c487889c17f6c54111f8d9a5553783a1e6c963",
                              "to":"0xa0ada7e2aff49daec0dfaf16ad062ce2514941f9848a04156445ae5bd17740b0",
                              "value":"10",
                              "status":"CONFIRMED",
                              "blockNumber":2639993
                           }
                        }
                     }
                  }
               }
         */

    },
    reducers:{
        updateState(state,{payload}){
            return {...state, payload};
        }
    },
    effects:{
        *loadStorage(action,{call,put}){

        },
        *saveAccount(action, {call,select,take}){
            yield take('updateState/@@end');
            const lists = yield select(({accounts})=>accounts.lists);
            const hashed_password = yield select(({user})=>user.hashed_password);
            yield call(Storage.set(''))
        }
    }
}

const upgradeAccountsV0_V1 = (old_accounts, options)=>{
    let new_accounts = {};
    Object.keys(old_accounts).forEach(k=>{
        // check key is satisfy 'symbol+address'
        let new_key = k;
        new_key = new_key.indexOf('+')>=0? new_key: 'AION+'+new_key;
        let account = Object.assign({},accs[k]);
        // remove account network in transactions and tokens
        delete account['isDefault'];
        account.transactions = typeof  account.transactions === 'object'? account.transactions:{};
        account.tokens = typeof  account.tokens === 'object'? account.tokens:{};
        account.transactions= account.transactions[options.network]? account.transactions[options.network]:{};
        account.tokens= account.tokens[options.network]? account.tokens[options.network]:{};
        account.symbol = account.symbol? account.symbol: 'AION';

        new_accounts[new_key] = account;
    });
    return new_accounts;
}