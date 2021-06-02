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
const _ = require('lodash')
const KAS = require('./src/kas/kas')
const KASWallet = require('./src/wallet/kasWallet')

const productionEndpoints = {
    node: 'https://node-api.klaytnapi.com/v1/klaytn',
    wallet: 'https://wallet-api.klaytnapi.com',
    anchor: 'https://anchor-api.klaytnapi.com',
    tokenHistory: 'https://th-api.klaytnapi.com',
    kip17: 'https://kip17-api.klaytnapi.com',
    kip7: 'https://kip7-api.klaytnapi.com',
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
     *
     * @example
     * const CaverExtKAS = require('caver-js-ext-kas')
     * const caver = new CaverExtKAS(1001, 'accessKeyId', 'secretAccessKey')
     *
     * @constructor
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {object} [opt] An object that defines the option value used when initializing to use the KAS API.
     */
    constructor(chainId, accessKeyId, secretAccessKey, opt) {
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

        if (chainId !== undefined && accessKeyId && secretAccessKey) this.initKASAPI(chainId, accessKeyId, secretAccessKey, opt)
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
     * @example
     * caver.initKASAPI(1001, 'accessKeyId', 'secretAccessKey')
     * caver.initKASAPI(1001, 'accessKeyId', 'secretAccessKey', { useNodeAPIWithHttp: true }) // use HttpProvider with Node API
     * caver.initKASAPI(1001, 'accessKeyId', 'secretAccessKey', { useNodeAPIWithHttp: false }) // use WebsocketProvider with Node API
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {object} [opt] An object that defines the option value used when initializing to use the KAS API.
     * @return {void}
     */
    initKASAPI(chainId, accessKeyId, secretAccessKey, opt = { useNodeAPIWithHttp: true }) {
        this.initNodeAPI(chainId, accessKeyId, secretAccessKey, opt.useNodeAPIWithHttp)
        this.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey)
        this.initWalletAPI(chainId, accessKeyId, secretAccessKey)
        this.initAnchorAPI(chainId, accessKeyId, secretAccessKey)
        this.initKIP17API(chainId, accessKeyId, secretAccessKey)
        this.initKIP7API(chainId, accessKeyId, secretAccessKey)
    }

    /**
     * Sets chain id and authentication key for Node API.
     *
     * @example
     * caver.initNodeAPI(1001, 'accessKeyId', 'secretAccessKey', true) // HttpProvider
     * caver.initNodeAPI(1001, 'accessKeyId', 'secretAccessKey', true, 'Node API url to use') // HttpProvider
     *
     * caver.initNodeAPI(1001, 'accessKeyId', 'secretAccessKey', false) // WebsocketProvider
     * caver.initNodeAPI(1001, 'accessKeyId', 'secretAccessKey', false, 'Node API url to use') // WebsocketProvider
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {boolean} [useHttp] If `true`, `HttpProvider` is used. If `false`, `WebsocketProvider` is used. (defaults to `true`)
     * @param {string} [url] The end point url.
     * @return {void}
     */
    initNodeAPI(chainId, accessKeyId, secretAccessKey, useHttp, url) {
        // chainId, accessKeyId, secretAccessKey
        // chainId, accessKeyId, secretAccessKey, useHttp
        // chainId, accessKeyId, secretAccessKey, url
        // chainId, accessKeyId, secretAccessKey, useHttp, url
        if (_.isString(useHttp)) {
            url = useHttp
            useHttp = undefined
        }
        useHttp = useHttp === undefined ? true : useHttp
        url = url === undefined ? productionEndpoints.node : url

        if (useHttp) {
            return this.initNodeAPIWithHttp(chainId, accessKeyId, secretAccessKey, url)
        }

        return this.initNodeAPIWithWebSocket(chainId, accessKeyId, secretAccessKey, url)
    }

    /**
     * Sets chain id and authentication key for Node API.
     * This function will set caver's provider with HttpProvider.
     *
     * @example
     * caver.initNodeAPIWithHttp(1001, 'accessKeyId', 'secretAccessKey', 'Node API url to use')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @return {void}
     */
    initNodeAPIWithHttp(chainId, accessKeyId, secretAccessKey, url) {
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
     * Sets chain id and authentication key for Node API with web socket.
     * This function will set caver's provider with WebsocketProvider.
     * To use the websocket provider, you must use an accessKey and seretAccessKey that do not contain special characters.
     *
     * @example
     * caver.initNodeAPIWithWebSocket(1001, 'accessKeyId', 'secretAccessKey', 'Node API url to use')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @return {void}
     */
    initNodeAPIWithWebSocket(chainId, accessKeyId, secretAccessKey, url) {
        const regex = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/
        if (regex.test(accessKeyId) || regex.test(secretAccessKey))
            throw new Error(
                `Invalid auth: To use the websocket provider, you must use an accessKey and seretAccessKey that do not contain special characters. Please obtain a new AccessKey through the KAS Console.`
            )

        const endpoint = `wss://${accessKeyId}:${secretAccessKey}@${url
            .slice(url.indexOf('//') + 2)
            .replace('/v1/klaytn', '')}/v1/ws/open?chain-id=${chainId}`

        const ws = new this.providers.WebsocketProvider(endpoint)
        this.setProvider(ws)
    }

    /**
     * Sets chain id and authentication key for Token History API.
     *
     * @example
     * caver.initTokenHistoryAPI(1001, 'accessKeyId', 'secretAccessKey')
     * caver.initTokenHistoryAPI(1001, 'accessKeyId', 'secretAccessKey', 'Token History API url to use')
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
     * @example
     * caver.initWalletAPI(1001, 'accessKeyId', 'secretAccessKey')
     * caver.initWalletAPI(1001, 'accessKeyId', 'secretAccessKey', 'Wallet API url to use')
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
     * @example
     * caver.initAnchorAPI(1001, 'accessKeyId', 'secretAccessKey')
     * caver.initAnchorAPI(1001, 'accessKeyId', 'secretAccessKey', 'Anchor API url to use')
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
     * @example
     * caver.initKIP17API(1001, 'accessKeyId', 'secretAccessKey')
     * caver.initKIP17API(1001, 'accessKeyId', 'secretAccessKey', 'KIP-17 API url to use')
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

    /**
     * Sets chain id and authentication key for KIP7 API.
     *
     * @example
     * caver.initKIP7API(1001, 'accessKeyId', 'secretAccessKey')
     * caver.initKIP7API(1001, 'accessKeyId', 'secretAccessKey', 'KIP-7 API url to use')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} [url] The end point url.
     * @return {void}
     */
    initKIP7API(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.kip7) {
        if (url.endsWith('/')) url = url.slice(0, url.length - 1)
        this.kas.initKIP7API(chainId, accessKeyId, secretAccessKey, url)
    }
}

module.exports = CaverExtKAS
