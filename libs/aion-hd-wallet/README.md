Aion HD wallet javascript library
=================================
Library to generate Aion address from a hierarchical deterministic wallet according to the BIP44 standard.

## How to use
Generate account
```javascript
    import {AionAccount, generateMnemonic} from aion-hd-wallet;
    
    let mnemonic = generateMnemonic();
    async() => {
        let masterkey = await AionAccount.recoverAccount(mnemonic);
        //get account 0
        let res = await masterkey.deriveHardened(0);
        console.log(res.keypair);
        console.log(res.address);
    } 
    
```
Import account

```javascript
    import {AionAccount} from aion-hd-wallet;
    async()=> {
        let res = await = AionAccoutn.importAccount(sk);
        console.log(res.keypair);
        console.log(res.address);
    }
```

sign transaction

```javascript
    import {AionTransaction} from aion-hd-wallet;
    let tx = AionTransaction(params)
    tx.sign(keyPair)
    let rawtx = tx.getEncoded();
    
```

