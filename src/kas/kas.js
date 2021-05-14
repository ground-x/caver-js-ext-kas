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

const TokenHistory = require('./tokenHistory/tokenHistory')
const Anchor = require('./anchor/anchor')
const Wallet = require('./wallet/wallet')
const KIP17 = require('./kip17/kip17')
const KIP7 = require('./kip7/kip7')
const { createClient } = require('../utils/helper')

const AnchorQueryOptions = require('./anchor/anchorQueryOptions')
const TokenHistoryQueryOptions = require('./tokenHistory/tokenHistoryQueryOptions')
const WalletQueryOptions = require('./wallet/walletQueryOptions')
const KIP17QueryOptions = require('./kip17/kip17QueryOptions')
const KIP7QueryOptions = require('./kip7/kip7QueryOptions')

/**
 * The class that manages KAS API services.
 * @class
 */
class KAS {
    /**
     * Creates an instance of KAS.
     *
     * @example
     * caver.kas // `caver.kas` is the KAS instance.
     *
     * @constructor
     */
    constructor() {
        this.tokenHistory = new TokenHistory()
        this.wallet = new Wallet()
        this.anchor = new Anchor()
        this.kip17 = new KIP17()
        this.kip7 = new KIP7()

        this.tokenHistory.queryOptions = TokenHistoryQueryOptions
        this.anchor.queryOptions = AnchorQueryOptions
        this.wallet.queryOptions = WalletQueryOptions
        this.kip17.queryOptions = KIP17QueryOptions
        this.kip7.queryOptions = KIP7QueryOptions
    }

    /**
     * @type {TokenHistory}
     */
    get tokenHistory() {
        return this._tokenHistory
    }

    set tokenHistory(tokenHistory) {
        this._tokenHistory = tokenHistory
    }

    /**
     * @type {Wallet}
     */
    get wallet() {
        return this._wallet
    }

    set wallet(wallet) {
        this._wallet = wallet
    }

    /**
     * @type {Anchor}
     */
    get anchor() {
        return this._anchor
    }

    set anchor(anchor) {
        this._anchor = anchor
    }

    /**
     * @type {KIP17}
     */
    get kip17() {
        return this._kip17
    }

    set kip17(kip17) {
        this._kip17 = kip17
    }

    /**
     * @type {KIP7}
     */
    get kip7() {
        return this._kip7
    }

    set kip7(kip7) {
        this._kip7 = kip7
    }

    /**
     * Sets chain id and authentication key for Token History API. <br>
     * Since `caver.initTokenHistoryAPI` calls this function internally, it is recommended to use `caver.initTokenHistoryAPI`.
     *
     * @example
     * caver.kas.initTokenHistoryAPI(1001, 'accessKeyId', 'secretAccessKey', 'https://th-api.klaytnapi.com')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @return {void}
     */
    initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url) {
        const { client, accessOptions } = createClient(url, chainId, accessKeyId, secretAccessKey)
        this.tokenHistory.accessOptions = accessOptions
        this.tokenHistory.client = client
    }

    /**
     * Sets chain id and authentication key for Wallet API. <br>
     * Since `caver.initWalletAPI` calls this function internally, it is recommended to use `caver.initWalletAPI`.
     *
     * @example
     * caver.kas.initWalletAPI(1001, 'accessKeyId', 'secretAccessKey', 'https://wallet-api.klaytnapi.com')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @return {void}
     */
    initWalletAPI(chainId, accessKeyId, secretAccessKey, url) {
        const { client, accessOptions } = createClient(url, chainId, accessKeyId, secretAccessKey)
        this.wallet.accessOptions = accessOptions
        this.wallet.client = client
    }

    /**
     * Sets chain id and authentication key for Anchor API. <br>
     * Since `caver.initAnchorAPI` calls this function internally, it is recommended to use `caver.initAnchorAPI`.
     *
     * @example
     * caver.kas.initAnchorAPI(1001, 'accessKeyId', 'secretAccessKey', 'https://anchor-api.klaytnapi.com')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @return {void}
     */
    initAnchorAPI(chainId, accessKeyId, secretAccessKey, url) {
        const { client, accessOptions } = createClient(url, chainId, accessKeyId, secretAccessKey)
        this.anchor.accessOptions = accessOptions
        this.anchor.client = client
    }

    /**
     * Sets chain id and authentication key for KIP17 API. <br>
     * Since `caver.initKIP17API` calls this function internally, it is recommended to use `caver.initKIP17API`.
     *
     * @example
     * caver.kas.initKIP17API(1001, 'accessKeyId', 'secretAccessKey', 'https://kip17-api.klaytnapi.com')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @return {void}
     */
    initKIP17API(chainId, accessKeyId, secretAccessKey, url) {
        const { client, accessOptions } = createClient(url, chainId, accessKeyId, secretAccessKey)
        this.kip17.accessOptions = accessOptions
        this.kip17.client = client
    }

    /**
     * Sets chain id and authentication key for KIP7 API. <br>
     * Since `caver.initKIP7API` calls this function internally, it is recommended to use `caver.initKIP7API`.
     *
     * @example
     * caver.kas.initKIP7API(1001, 'accessKeyId', 'secretAccessKey', 'https://kip7-api.klaytnapi.com')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @return {void}
     */
    initKIP7API(chainId, accessKeyId, secretAccessKey, url) {
        const { client, accessOptions } = createClient(url, chainId, accessKeyId, secretAccessKey)
        this.kip7.accessOptions = accessOptions
        this.kip7.client = client
    }
}

module.exports = KAS
