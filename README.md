# Makkii Wallet

[![license](https://img.shields.io/badge/license-GPL3-green.svg?style=flat)](https://github.com/chaion/Makkii/LICENSE)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/chaion/wallet/issues)

<img src="chaion-logo.svg" alt="Chaion Logo" width="300"/>

Greeting! This is project wallet build from react native. Goal is serving aion ecosystem with extendable functionality. 
# Features
* Generate wallet for Aion(m/44'/425'/0'/0').
* Support Ledger
* Create, manage accounts.
* Send and receive transactions.
* View transaction history.
* DApp Market

# Prerequisites
* yarn or npm
* Android SDK(for android only)
* [React Native](https://facebook.github.io/react-native/docs/getting-started)

# Build
``` bash
$ git clone git clone https://github.com/chaion/wallet.git
$ cd wallet
$ yarn
$ yarn build-inject
# android debug
$ react-native run-android
# build android package, apk is generated under android/app/outputs/apk/release/app-release.apk
$ cd android; ./gradlew assembleRelease
```

# Contact
To keep up to date by joing the following channels:

- [Chaion Forum](https://forum.chaion.net/)
- [Chaion Telegram](https://t.me/Chaion)

# License
Makkii is released under the [GPL-V3 License](LICENSE)
