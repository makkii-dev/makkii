# Makkii Wallet

[![license](https://img.shields.io/badge/license-GPL3-green.svg?style=flat)](https://github.com/chaion/Makkii/LICENSE)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/chaion/wallet/issues)

<img src="chaion-logo.svg" alt="Chaion Logo" width="300"/>
Welcome to Makkii Wallet! Makkii wallet is a secure, convenient and trusted Crypto asset management tool.
<img src="static/iphone_cover.jpg" alt="iphone_show" width="800"/>

# Features
* Generate wallet for Aion(m/44'/425'/0'/0').
* Support Ledger
* Create, manage accounts.
* Send and receive transactions.
* View transaction history.
* Kyber DEX
* Blockchain News

# Prerequisites
* yarn or npm
* Android SDK(for android only)
* [React Native](https://facebook.github.io/react-native/docs/getting-started)

# Build
<pre>
$ git clone git clone https://github.com/chaion/makii.git
$ cd makkii
$ yarn
# android debug
$ react-native run-android
# build android package, apk is generated under android/app/outputs/apk/release/app-release.apk
# follow the <a href=https://facebook.github.io/react-native/docs/signed-apk-android target="_blank">Generating Signed APK</a>
$ cd android; ./gradlew assembleRelease
</pre>

If assembleRelease doesn't work, follow debugging steps below and set up project in Android Studio directly. Once project is set up, can go through the GUI wizard by clicking Build -> Generate Signed APK. Fill in the values for the keystore, should be the same ones as your gradle.properties file. In the case of this project:

`key.store=chaion-app.keystore
RELEASE_STORE_FILE=chaion-app.keystore
RELEASE_KEY_ALIAS=chaion-app-alias
RELEASE_STORE_PASSWORD={PROD PASS}
RELEASE_KEY_PASSWORD={PROD PASS}`

The wizard will generate whichever flavor/build variant you want, and output the resulting APK to a folder. There will be a popup allowing you to navigate to the APK.

# Contact
To keep up to date by joing the following channels:

- [Chaion Forum](https://forum.chaion.net/)
- [Chaion Telegram](https://t.me/Chaion)

# License
Makkii is released under the [GPL-V3 License](LICENSE)

# Documentation:
https://github.com/makkii-dev/makkii
https://aionnetwork.atlassian.net/wiki/spaces/COIN/pages/724501273/Makkii+Transfer

# Debugging Build Issues
Final state needed in order to test project:
1. Yarn install works and builds react native project
2. yarn start or npm start to start metro server
3. Android studio working and able to launch android emulator
4. Once metro server is started, launching the app in Android studio will launch the makkii app in the emulator

My environment and application versions:
Android Studio 4.1
`zaeem@MLAZaeem makkii % react-native -version
react-native-cli: 2.0.1
react-native: 0.63.3
zaeem@MLAZaeem makkii % npm -version
6.10.1
zaeem@MLAZaeem makkii % npx -version
6.10.1
zaeem@MLAZaeem makkii % lerna -v
3.22.1
zaeem@MLAZaeem makkii % yarn -v
1.22.5
zaeem@MLAZaeem makkii % java -version
openjdk version "11.0.7" 2020-04-14
OpenJDK Runtime Environment AdoptOpenJDK (build 11.0.7+10)
OpenJDK 64-Bit Server VM AdoptOpenJDK (build 11.0.7+10, mixed mode)
zaeem@MLAZaeem makkii % env
SSH_AUTH_SOCK=/private/tmp/com.apple.launchd.kKXnQIPqc7/Listeners
LC_TERMINAL_VERSION=3.3.12
COLORFGBG=0;15
ITERM_PROFILE=Default
XPC_FLAGS=0x0
LANG=en_CA.UTF-8
PWD=/Users/zaeem/Projects/makkii
SHELL=/bin/zsh
TERM_PROGRAM_VERSION=3.3.12
TERM_PROGRAM=iTerm.app
PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/share/dotnet:~/.dotnet/tools:/Library/Apple/usr/bin:/Library/Frameworks/Mono.framework/Versions/Current/Commands
LC_TERMINAL=iTerm2
COLORTERM=truecolor
TERM=xterm-256color
HOME=/Users/zaeem
TMPDIR=/var/folders/7b/l3_wj70j1mdb8dkxnvpcj6ph0000gq/T/
USER=zaeem
XPC_SERVICE_NAME=0`

# Build Issue Resolutions

1. Lerna Bootstrap errors

`npm ERR! code ELIFECYCLE
npm ERR! syscall spawn
npm ERR! file sh
npm ERR! errno ENOENT
npm ERR! makkiijs@1.0.0 postinstall: `lerna bootstrap`
npm ERR! spawn ENOENT
npm ERR!
npm ERR! Failed at the makkiijs@1.0.0 postinstall script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.`

You need to have a recent Node.js and Yarn installed.
You also need to install lerna globally.

Try using brew to install lerna:
Brew install lerna

`zaeem@MLAZaeem makkii % lerna bootstrap
info cli using local version of lerna
lerna notice cli v3.22.1
lerna ERR! ENOLERNA `lerna.json` does not exist, have you run `lerna init`?
zaeem@MLAZaeem makkii % lerna init
info cli using local version of lerna
lerna notice cli v3.22.1
lerna info Updating package.json
lerna info Creating lerna.json
lerna info Creating packages directory
lerna success Initialized Lerna files
zaeem@MLAZaeem makkii %`

After lerna is installed, yarn install should work for building the react native app. 

***
This command resets the app, removing all node modules, and any build specific outputs. Handy to reset the React Native app to its start state. 
watchman watch-del-all && rm -rf node_modules/ && yarn cache clean && yarn install && yarn start --reset-cache


***
2. If gradle build runs forever, it's probably being blocked by your network security. Disable it for Android to access google servers. 


***
3. If gradle builds fail due to missing string values. You can set the string values in a .env file stored in the makkii/android folder. This is what my .env file looked like by the end:

`is_testnet=false
app_server_static=https://makkii.net/
app_server_api=https://makkii.net/makkii
kyber_wallet_id={PROD VALUE}
client_id=makkii
client_secret={PROD VALUE}
BAIDU_MOBSTAT_KEY_android={PROD VALUE}
BAIDU_MOBSTAT_KEY_ios={PROD VALUE}`


***
4. Building a testable apk (used to install android apps on actual physical devices)
To build an debug apk that actually works:
https://dev.to/nitish173/how-to-generate-a-debug-apk-in-react-native-1gdg
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
./gradlew assembleDebug
APK can be found here: /makkii/android/app/build/outputs/apk/prod/debug


***
4. Could not list contents of '/Users/zaeem/Projects/makkii/.env'. Couldn't follow symbolic link.

The default .env file in the /makkii folder seems to be symlinked to a local file that doesn't exist. Can either update the symlink to point to correct /makkii/android/.env file, I just copy pasted it into both places.


***
5. Duplicate resources error. May be able to fix with this:
	https://shreyasnisal.medium.com/duplicate-resources-error-react-native-0-60-2200aa18d3e5

Try this step first?
react-native bundle --platform android --entry-file index.js --reset-cache --bundle-output android/app/src/main/assets/index.android.bundle --dev false --assets-dest android/app/src/main/res/


***
6. In order to get Android studio to work with the updated API versions, there are a series of changes required:

You need a gradle.properties for your system. Create it in ~/.gradle/

Mine had the following values:
`org.gradle.daemon=true
android.useAndroidX=true
android.enableJetifier=true
org.gradle.parallel=true
key.store=chaion-app.keystore
RELEASE_STORE_FILE=chaion-app.keystore
RELEASE_KEY_ALIAS=chaion-app-alias
RELEASE_STORE_PASSWORD={PROD PASS}
RELEASE_KEY_PASSWORD={PROD PASS}`

You also need to have the chaion-app.keystore to be in the /makkii/android/app folder. 

https://stackoverflow.com/questions/57934866/react-native-reanimated-error-execution-failed-for-task-react-native-reanimat

You will need to install jetifier.  

`zaeem@MLAZaeem makkii % sudo npm install -g jetifier
Password:
/usr/local/bin/jetifier-standalone -> /usr/local/lib/node_modules/jetifier/bin/jetifier-standalone
/usr/local/bin/jetify -> /usr/local/lib/node_modules/jetifier/bin/jetify
/usr/local/bin/jetifier -> /usr/local/lib/node_modules/jetifier/bin/jetify
+ jetifier@1.6.6`
added 1 package from 2 contributors in 0.267s
Hypothesis, jettifier, androidx being enabled is needed, but need everything fastforward at the same time. 
Rm -rf node_modules
Yarn install
Npx jetlify

Possible mismatch between react native version and android X
https://github.com/facebook/react-native/issues/25371

Made a new git push with changes, attempting to update the version of react native for project. 
Before:
`zaeem@MLAZaeem makkii % react-native -version
react-native-cli: 2.0.1
react-native: 0.59.9`
After:
`react-native-cli: 2.0.1
react-native: 0.63.3`

Fixing duplicate resources error:
Manually deleted the drawable folders in: /Users/zaeem/Projects/makkii/android/app/src/main
Manually deleted the "raw" folder in: /Users/zaeem/Projects/makkii/android/app/src/main

Updated values of the build.gradle for the wallet. You can grab the file from this branch. But the key change is:

 `maven {
            // Android JSC is installed from npm
            url("$rootDir/../node_modules/jsc-android/dist")
        }`

Updating the API version Android is using required new runtime permissions from the user. Added the logic to query that into the MainActivity. There may be other services/endpoints that we're connecting to that require additional runtime permissions. 




