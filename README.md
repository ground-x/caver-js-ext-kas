# caver-js-ext-kas

caver-js-ext-kas is [caver-js](https://github.com/klaytn/caver-js)'s extension library for using KAS (Klaytn API Service).

## Table of contents 
   * [Installation](#build/install)
   * [Getting Started](#getting-started)
      * [Set Auth](#set-auth)
	  * [Use Node API](#use-node-api)
	  * [Use Token History API](#use-token-history-api)
	  * [Use Wallet API](#use-wallet-api)
	  * [Use Anchor API](#use-anchor-api)
	  * [Use KIP7, KIP17 and Contract with KAS account](#use-kip7-kip17-and-contract-with-kas-account)

## Build/Install

To try it out, install caver-js-ext-kas with npm like following command:

```bash
$ npm install caver-js-ext-kas
```

**Note** "package.json" file should exist on the same install path.  If it does not exist, "package.json" should be generated via `npm init`.

To install a specific version of caver-js, try the following command:

```bash
$ npm install caver-js-ext-kas@X.X.X
```

You can build it with the command below.

```bash
$ npm run build
```

The result of the build is located in "dist/" and is named "caver-js-ext-kas.min.js".

## Test

This library contains tests. Create `.env` file to define environment variables before performing the test like below.

```
SENDER_PRV_KEY=''
ACCESS_KEY=''
SECRET_ACCESS_KEY=''
PRESET=
FEE_PAYER_ADDR=''
OPERATOR=''
```

You just need to fill in the values in the format above. After creating the `.env` file you can run the test using the command below.

```bash
$ npm run test
```

## Getting Started

### Set Auth

You can use KAS' Node API, Token History API, Wallet API, and Anchor API through this library. To use KAS, you need your "access key id", "secret access key" and chain id of the Klaytn blochain network.

Set your authorization using the `constructor` or the `caver.initKASAPI` function as shown below. Below code sets the authentication key used by the node api, token history api, wallet api and anchor api at once.

Depending on the useKASWallet parameter, it is determined whether to use the [in-memory wallet](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet) or KAS Wallet API in `caver.wallet`. If useKASWallet is `true`, the account stored in KAS Wallet API is used to sign.

```javascript
// Set an authorization through constructor
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey [, useKASWallet])
```

```javascript
// Set an authorization through 'caver.initKASAPI' function
const caver = new CaverExtKAS()
caver.initKASAPI(chainId, accessKeyId, secretAccessKey [, useKASWallet])
```

The following describes how to set auth key for each node, tokenHistory, wallet, and anchor api.

Each initialization function is provided so that you can pass an optional endpoint url as the last parameter. If the endpoint url is not passed as the last parameter, the KAS production url is set by default.

```javascript
caver.initNodeAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initWalletAPI(chainId, accessKeyId, secretAccessKey [, useKASWallet] [, url])
caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey [, url])
```

In the `caver.initWalletAPI` function, if useKASWallet is `true`, the KAS Wallet API is used by replacing the in-memory wallet.

### Use Node API

You can now use KAS's Node API through caver-js-ext-kas. You can send a Node API request to the KAS as shown below and check the results.

```javascript
const blockNumber = await caver.rpc.klay.getBlockNumber()
console.log(blockNumber)
```

### Use Token History API

You can now use KAS's Token History API through caver-js-ext-kas. You can send a Token History API request to the KAS as shown below and check the results.

```javascript
const ftContracts = await caver.kas.tokenHistory.getFTContractList()
console.log(ftContracts)
```

The query options used in the token history api can be used as follows.

```javascript
const queryOptions = new caver.kas.tokenHistory.queryOptions({ kind, range, size ... })
console.log(queryOptions)
```

Enum used in query option used in token history api is as follows.

```javascript
caver.kas.tokenHistory.queryOptions.kind // KLAY, FT, NFT
caver.kas.tokenHistory.queryOptions.status // COMPLETED, PROCESSING, FAILED, CANCELLED
caver.kas.tokenHistory.queryOptions.type // KIP7, KIP17, ERC20, ERC721
```

### Use Wallet API

You can now use KAS's Wallet API through caver-js-ext-kas. You can send a Wallet API request to the KAS as shown below and check the results.

```javascript
const account = await caver.kas.wallet.createAccount()
console.log(account)
```

The query options used in the wallet api can be used as follows.

```javascript
const queryOptions = new caver.kas.wallet.queryOptions({ size, fromTimestamp, toTimestamp, ... })
console.log(queryOptions)
```

### Use Anchor API

You can now use KAS's Anchor API through caver-js-ext-kas. You can send a Anchor API request to the KAS as shown below and check the results.

```javascript
const operators = await caver.kas.anchor.getOperatorList()
console.log(operators)
```

The query options used in the anchor api can be used as follows.

```javascript
const queryOptions = new caver.kas.anchor.queryOptions({ size, fromTimestamp, toTimestamp, ... })
console.log(queryOptions)
```

### Use KIP7, KIP17 and Contract with KAS account

You can use caver's [Contract](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.contract), [KIP7](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip7) and [KIP17](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip17) as it is by using the account stored in KAS.

To use the account stored in KAS, pass `useKASWallet` to `true` in the constructor of CaverExtKAS like below.

```javascript
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey, true)
```

For more information on initialization, please refer to [here](#set-auth).

If you initialized useKASWallet to `true`, you can now use it the same way you used caver. Here, we introduce a simple example using Contract, KIP7, and KIP17 respectively. Please refer to [Contract](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.contract), [KIP7](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip7) and [KIP17](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip17) of [Klaytn Docs](https://docs.klaytn.com/bapp/sdk/caver-js) for detailed usage.

The example below introduces how to use `caver.contract`.

```javascript
// Deploy contract
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey, true)

const abi = [{"constant":true,"inputs":[],"name":"count","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}, ...]

const contract = new caver.contract(abi)

const deployed = await contract.deploy({
	data:  '0x60806...',
}).send({
	from: '0x{from address}', // An account corresponding to the address must exist in KAS.
	gas: '0x4bfd200',
	value: '0x0',
})
```

```javascript
// Execute contract
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey, true)

const abi = [{"constant":true,"inputs":[],"name":"count","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}, ...]

const contract = new caver.contract(abi, '0x{contract address}')

const receipt = await contract.methods.set('k', 'v').send({ from: '0x{from address}', gas:'0x4bfd200' }) // An account corresponding to the address must exist in KAS.
```

The example below introduces how to use `caver.kct.kip7`.

```javascript
// Deploy KIP-7
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey, true)

const kip7 = await caver.kct.kip7.deploy({
    name: 'Jasmine',
    symbol: 'JAS',
    decimals: 18,
    initialSupply: '100000000000000000000',
}, '0x{from address}') // An account corresponding to the address must exist in KAS.
```

```javascript
// Execute KIP-7 contract
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey, true)

const kip7 = new caver.kct.kip7('0x{contract address}')
const receipt = await kip7.transfer('0x{to address}', 1, { from: '0x{from address}' })
```

The example below introduces how to use `caver.kct.kip17`.

```javascript
// Deploy KIP-17
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey, true)

const kip7 = await caver.kct.kip17.deploy({
    name: 'Jasmine',
    symbol: 'JAS',
}, '0x{from address}') // An account corresponding to the address must exist in KAS.
```

```javascript
// Execute KIP-17 contract
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey, true)

const kip17 = new caver.kct.kip17('0x{contract address}')
const receipt = await kip17.transferFrom('0x{from address}', '0x{to address}', tokenId, { from: '0x{from address}' })
```


## Other Docs

[KAS Docs](https://docs.klaytnapi.com)
[caver-java-ext-kas API Reference](https://www.javadoc.io/doc/xyz.groundx.caver/caver-java-ext-kas/latest/index.html)