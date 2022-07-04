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
	  * [Use Metadata API](#use-metadata-api)
	  * [Use Resource API](#use-resource-api)
	  * [Use KIP17 API](#use-kip17-api)
	  * [Use KIP7 API](#use-kip7-api)
	  * [Use KIP37 API](#use-kip37-api)
	  * [Use KIP7, KIP17, KIP37 and Contract with a Klaytn account in KAS Wallet API](#use-kip7-kip17-kip37-and-contract-with-a-klaytn-account-in-kas-wallet-api)

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
SENDER_PRV_KEY_JS=''
ACCESS_KEY=''
SECRET_ACCESS_KEY=''
ACCOUNT_ID=''
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

You can use KAS' Node API, Token History API, Wallet API, Anchor API, KIP17 API, KIP7 API and KIP37 API through this library. To use KAS, you need your "access key id", "secret access key" and chain id of the Klaytn blochain network.

Set your authorization using the `constructor` or the `caver.initKASAPI` function as shown below. Below code sets the authentication key used by the node api, token history api, wallet api, anchor api, kip17 api, kip7 api and kip37 api at once.

```javascript
// Set an authorization through constructor
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey)
```

```javascript
// Set an authorization through 'caver.initKASAPI' function
const caver = new CaverExtKAS()
caver.initKASAPI(chainId, accessKeyId, secretAccessKey)
```

The following describes how to set auth key for each node, tokenHistory, wallet, anchor, kip17, kip7 and kip37 api.

Each initialization function is provided so that you can pass an optional endpoint url as the last parameter. If the endpoint url is not passed as the last parameter, the KAS production url is set by default.

```javascript
caver.initNodeAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initWalletAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initKIP17API(chainId, accessKeyId, secretAccessKey [, url] [, version])
caver.initKIP7API(chainId, accessKeyId, secretAccessKey [, url])
caver.initKIP37API(chainId, accessKeyId, secretAccessKey [, url] [, version])
caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey [, url])
caver.initResourceAPI(chainId, accessKeyId, secretAccessKey [, url])
```

`caver.wallet` in [CaverExtKAS](https://refs.klaytnapi.com/en/sdk/js/latest/CaverExtKAS.html) is a [KASWallet](https://refs.klaytnapi.com/en/sdk/js/latest/KASWallet.html) that internally connects the [KAS Wallet API](https://refs.klaytnapi.com/en/sdk/js/latest/Wallet.html) since [caver-js-ext-kas v1.0.2](https://www.npmjs.com/package/caver-js-ext-kas/v/1.0.2).

If you want to use the [in-memory wallet](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet) provided by the [caver-js](https://www.npmjs.com/package/caver-js) as it is, create and use an instance of [KeyringContainer](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet) as shown below.

```javascript
const caver = new CaverExtKAS()

// Create a KeyringContainer instance
const keyringContainer = new caver.keyringContainer()

// Create a keyring from private key
const keyring = keyringContainer.keyring.createFromPrivateKey('0x{private key}')

// Add a keyring to the keyringContainer
keyringContainer.add(keyring)

// Sign with the keyring added to keyringContainer
await keyringContainer.sign(keyring.address, transaction)
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

### Use Metadata API

You can now use KAS's Metadata API through caver-js-ext-kas. You can send a Metadata API request to the KAS as shown below and check the results.

```javascript
const metadata = await caver.kas.metadata.uploadMetadata({ name, description, image})
console.log(metadata)
```

### Use Resource API

You can now use KAS's Resource API through caver-js-ext-kas. You can send a Resource API request to the KAS as shown below and check the results.

```javascript
const resourceList = await caver.kas.wallet.getResourceList(accountId)
console.log(resourceList)
```

The query options used in the anchor api can be used as follows.

```javascript
const queryOptions = new caver.kas.resource.queryOptions({ size, fromTimestamp, toTimestamp, ... })
console.log(queryOptions)
```

### Use KIP17 API

You can now use KAS's KIP17 API through caver-js-ext-kas. You can send a KIP17 API request to the KAS as shown below and check the results.

```javascript
const contracts = await caver.kas.kip17.getContractList()
console.log(contracts)
```

The query options used in the kip17 api can be used as follows.

```javascript
const queryOptions = new caver.kas.kip17.queryOptions({ size, cursor })
console.log(queryOptions)
```

### Use KIP7 API

You can now use KAS's KIP7 API through caver-js-ext-kas. You can send a KIP7 API request to the KAS as shown below and check the results.

```javascript
const contracts = await caver.kas.kip7.getContractList()
console.log(contracts)
```

The query options used in the kip7 api can be used as follows.

```javascript
const queryOptions = new caver.kas.kip7.queryOptions({ size, cursor })
console.log(queryOptions)
```

### Use KIP37 API

You can now use KAS's KIP37 API through caver-js-ext-kas. You can send a KIP37 API request to the KAS as shown below and check the results.

```javascript
const contracts = await caver.kas.kip37.getContractList()
console.log(contracts)
```

The query options used in the kip37 api can be used as follows.

```javascript
const queryOptions = new caver.kas.kip37.queryOptions({ size, cursor })
console.log(queryOptions)
```

### Use KIP7, KIP17, KIP37 and Contract with a Klaytn account in KAS Wallet API

You can use caver's [Contract](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.contract), [KIP7](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip7) and [KIP37](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip37) as it is by using the account stored in KAS.

Since CaverExtKAS wallet is a [KASWallet](https://refs.klaytnapi.com/en/sdk/js/latest/KASWallet.html) that connects with and operates with KAS Wallet API, [Contract](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.contract), [KIP7](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip7), [KIP17](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip17) and [KIP37](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip37) can be used the same as the existing caver-js.

Here, we introduce a simple example using Contract, KIP7, KIP17 and KIP37 respectively. Please refer to [Contract](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.contract), [KIP7](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip7), [KIP17](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip17) and [KIP37](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip37) of [Klaytn Docs](https://docs.klaytn.com/bapp/sdk/caver-js) for detailed usage.

The example below introduces how to use `caver.contract`.

```javascript
// Deploy contract
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey)

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
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey)

const abi = [{"constant":true,"inputs":[],"name":"count","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}, ...]

const contract = new caver.contract(abi, '0x{contract address}')

const receipt = await contract.methods.set('k', 'v').send({ from: '0x{from address}', gas:'0x4bfd200' }) // An account corresponding to the address must exist in KAS.
```

The example below introduces how to use `caver.kct.kip7`.

```javascript
// Deploy KIP-7
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey)

const kip7 = await caver.kct.kip7.deploy({
    name: 'Jasmine',
    symbol: 'JAS',
    decimals: 18,
    initialSupply: '100000000000000000000',
}, '0x{from address}') // An account corresponding to the address must exist in KAS.
```

```javascript
// Execute KIP-7 contract
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey)

const kip7 = new caver.kct.kip7('0x{contract address}')
const receipt = await kip7.transfer('0x{to address}', 1, { from: '0x{from address}' })
```

The example below introduces how to use `caver.kct.kip17`.

```javascript
// Deploy KIP-17
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey)

const kip17 = await caver.kct.kip17.deploy({
    name: 'Jasmine',
    symbol: 'JAS',
}, '0x{from address}') // An account corresponding to the address must exist in KAS.
```

```javascript
// Execute KIP-17 contract
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey)

const kip17 = new caver.kct.kip17('0x{contract address}')
const receipt = await kip17.transferFrom('0x{from address}', '0x{to address}', tokenId, { from: '0x{from address}' })
```

The example below introduces how to use `caver.kct.kip37`.

```javascript
// Deploy KIP-37
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey)

const kip37 = await caver.kct.kip37.deploy({
    uri: 'uri string',
}, '0x{from address}') // An account corresponding to the address must exist in KAS.
```

```javascript
// Execute KIP-37 contract
const caver = new CaverExtKAS(chainId, accessKeyId, secretAccessKey)

const kip37 = new caver.kct.kip37('0x{contract address}')
const receipt = await kip37.safeTransferFrom('0x{from address}', '0x{to address}', tokenId, amount, { from: '0x{from address}' })
```


## Other Docs

[KAS Docs](https://docs.klaytnapi.com)
[caver-java-ext-kas API Reference](https://www.javadoc.io/doc/xyz.groundx.caver/caver-java-ext-kas/latest/index.html)