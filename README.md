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

This library contains tests. Modify the contents of "test/testEnv.json" appropriately before performing the test.

You can perform unit test with the command below.

```bash
$ npm run test
```

In addition, the integration test, which is actually connected to KAS, can be executed through the command below.

```bash
$ npm run intTest
```

## Getting Started

### Set Auth

You can use KAS' Node API, Token History API, Wallet API, and Anchor API through this library. To use KAS, you need your "access key id", "secret access key" and chain id of the Klaytn blochain network.

Set your authorization using the `caver.initKASAPI` function as shown below. This function sets the authentication key used by the node api, token history api, wallet api and anchor api at once.

```javascript
const caver = new CaverExtKAS()
caver.initKASAPI(chainId, accessKeyId, secretAccessKey)
```

The following describes how to set auth key for each node, tokenHistory, wallet, and anchor api.

Each initialization function is provided so that you can pass an optional endpoint url as the last parameter. If the endpoint url is not passed as the last parameter, the KAS production url is set by default.

```javascript
caver.initNodeAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initWalletAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey [, url])
```

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

## Other Docs

[KAS Docs](https://docs.klaytnapi.com)

test test
