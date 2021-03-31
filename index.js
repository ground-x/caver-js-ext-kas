/*
 * Copyright 2020 The caver-js-ext-kas Authors
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Caver = require('caver-js')
const KAS = require('./src/kas/kas')
const KASWallet = require('./src/wallet/kasWallet')

const productionEndpoints = {
    node: 'https://node-api.klaytnapi.com/v1/klaytn',
    wallet: 'https://wallet-api.klaytnapi.com',
    anchor: 'https://anchor-api.klaytnapi.com',
    tokenHistory: 'https://th-api.klaytnapi.com',
    kip17: 'https://kip17-api.klaytnapi.com',
}

/**
 * An extension class of caver implemented to use KAS API service easily.
 * @class
 */
class CaverExtKAS extends Caver {
    /**
     * Creates an instance of caver extension KAS. <br>
     * This constructor sets the configurations used by each KAS API services with parameters. <br>
     * When initializing the KAS API in the constructor, initialize the authentication key used in the Node API, Wallet API, Token History API, and Anchor API at once with KAS Production URL as default. <br>
     * If you want to initialize each service or use an endpoint URL other than the production URL set as default,<br>
     * you need to initialize it for each service using [initNodeAPI]{@link CaverExtKAS#initNodeAPI}, [initTokenHistoryAPI]{@link CaverExtKAS#initTokenHistoryAPI}, [initWalletAPI]{@link CaverExtKAS#initWalletAPI}, and [initAnchorAPI]{@link CaverExtKAS#initAnchorAPI}. <br>
     * @constructor
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     */
    constructor(chainId, accessKeyId, secretAccessKey) {
        super()

        this.kas = new KAS()
        // Allocate class and functions to use for account migration
        // TODO: naming
        this.kas.wallet.accountsMigration = {
            keyringContainer: this.wallet.constructor,
            decrypt: this.wallet.keyring.decrypt,
            feeDelegatedAccountUpdate: this.transaction.feeDelegatedAccountUpdate,
            createWithAccountKeyPublic: this.account.createWithAccountKeyPublic,
        }
        this.kas.wallet.keyring = this.wallet.keyring

        // `caver.wallet` in CaverExtKAS is a KASWallet that internally connects the KAS Wallet API
        const kasWallet = new KASWallet(this.kas.wallet)
        kasWallet.keyring = this.wallet.keyring

        const _this = this
        class KeyringContainer extends this.wallet.constructor {
            constructor(keyrings) {
                super(keyrings)
                this.keyring = _this.wallet.keyring
            }
        }

        this.keyringContainer = KeyringContainer
        this.keyringContainer.keyring = this.wallet.keyring
        this.wallet = kasWallet

        if (chainId !== undefined && accessKeyId && secretAccessKey) this.initKASAPI(chainId, accessKeyId, secretAccessKey)
    }

    /**
     * @type {KASWallet}
     * The wallet member variable of CaverExtKAS is a [KASWallet]{@link KASWallet} that operates by using the [KAS Wallet API]{@link Wallet}. <br>
     * If you want to use the [in-memory wallet]{@link https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet} provided by caver-js as it is, you can create an instance of [KeyringContainer]{@link https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet#keyringcontainer} with `const keyringContainer = new caver.keyringContainer()`.
     */
    get wallet() {
        return this._wallet
    }

    set wallet(wallet) {
        this._wallet = wallet
    }

    /**
     * @type {KAS}
     */
    get kas() {
        return this._kas
    }

    set kas(kas) {
        this._kas = kas
    }

    /**
     * Sets chain id and authentication key.
     * This function sets the configurations used by each KAS API services.
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @return {void}
     */
    initKASAPI(chainId, accessKeyId, secretAccessKey) {
        this.initNodeAPI(chainId, accessKeyId, secretAccessKey)
        this.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey)
        this.initWalletAPI(chainId, accessKeyId, secretAccessKey)
        this.initAnchorAPI(chainId, accessKeyId, secretAccessKey)
        this.initKIP17API(chainId, accessKeyId, secretAccessKey)
    }

    /**
     * Sets chain id and authentication key for Node API.
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} [url] The end point url.
     * @return {void}
     */
    initNodeAPI(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.node) {
        if (url.endsWith('/')) url = url.slice(0, url.length - 1)

        const splitted = url.split('/')
        if (splitted[splitted.length - 1] !== 'klaytn' || splitted[splitted.length - 2] !== 'v1') {
            url = `${splitted.join('/')}/v1/klaytn`
        }

        this.setProvider(url)

        this._requestManager.provider.headers = this._requestManager.provider.headers || []
        const auth = [
            { name: 'Authorization', value: `Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}` },
            { name: 'x-chain-id', value: chainId },
        ]
        this._requestManager.provider.headers = this._requestManager.provider.headers.concat(auth)
    }

    /**
     * Sets chain id and authentication key for Token History API.
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} [url] The end point url.
     * @return {void}
     */
    initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.tokenHistory) {
        if (url.endsWith('/')) url = url.slice(0, url.length - 1)
        this.kas.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)
    }

    /**
     * Sets chain id and authentication key for Wallet API.
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} [url] The end point url.
     * @return {void}
     */
    initWalletAPI(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.wallet) {
        // chainId, accessKeyId, secretAccessKey
        // chainId, accessKeyId, secretAccessKey, url

        if (url.endsWith('/')) url = url.slice(0, url.length - 1)
        this.kas.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)
    }

    /**
     * Sets chain id and authentication key for Anchor API.
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} [url] The end point url.
     * @return {void}
     */
    initAnchorAPI(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.anchor) {
        if (url.endsWith('/')) url = url.slice(0, url.length - 1)
        this.kas.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)
    }

    /**
     * Sets chain id and authentication key for KIP17 API.
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} [url] The end point url.
     * @return {void}
     */
    initKIP17API(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.kip17) {
        if (url.endsWith('/')) url = url.slice(0, url.length - 1)
        this.kas.initKIP17API(chainId, accessKeyId, secretAccessKey, url)
    }
}

module.exports = CaverExtKAS
