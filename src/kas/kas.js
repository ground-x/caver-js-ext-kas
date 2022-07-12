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
const KIP17 = require('./kip17/v1/kip17')
const KIP17V2 = require('./kip17/v2/kip17')
const KIP7 = require('./kip7/kip7')
const KIP37 = require('./kip37/v1/kip37')
const KIP37V2 = require('./kip37/v2/kip37')
const Metadata = require('./metadata/metadata')
const Resource = require('./resource/resource')

const { createClient } = require('../utils/helper')

const AnchorQueryOptions = require('./anchor/anchorQueryOptions')
const TokenHistoryQueryOptions = require('./tokenHistory/tokenHistoryQueryOptions')
const WalletQueryOptions = require('./wallet/walletQueryOptions')
const KIP17QueryOptions = require('./kip17/kip17QueryOptions')
const KIP17FeePayerOptions = require('./kip17/kip17FeePayerOptions')
const KIP7QueryOptions = require('./kip7/kip7QueryOptions')
const KIP7FeePayerOptions = require('./kip7/kip7FeePayerOptions')
const KIP37QueryOptions = require('./kip37/kip37QueryOptions')
const KIP37FeePayerOptions = require('./kip37/kip37FeePayerOptions')
const ResourceQueryOptions = require('./resource/resourceQueryOptions')

const PROPOSE_VERSION_MSG = `
_______________We recommend upgrading to v2._______________
* To designate a contract owner when deploying a contract.
* To set and edit collections on OpenSea.
___________________________________________________________
`
const VERSION_WARNING = `Invalid version: 1 or 2 available only. Default version is 1.`
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
        this.kip37 = new KIP37()
        this.metadata = new Metadata()
        this.resource = new Resource()

        this.tokenHistory.queryOptions = TokenHistoryQueryOptions
        this.anchor.queryOptions = AnchorQueryOptions
        this.wallet.queryOptions = WalletQueryOptions
        this.kip17.queryOptions = KIP17QueryOptions
        this.kip17.feePayerOptions = KIP17FeePayerOptions
        this.kip7.queryOptions = KIP7QueryOptions
        this.kip7.feePayerOptions = KIP7FeePayerOptions
        this.kip37.queryOptions = KIP37QueryOptions
        this.kip37.feePayerOptions = KIP37FeePayerOptions
        this.resource.queryOptions = ResourceQueryOptions
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
     * @type {KIP37}
     */
    get kip37() {
        return this._kip37
    }

    set kip37(kip37) {
        this._kip37 = kip37
    }

    /**
     * @type {Metadata}
     */
    get metadata() {
        return this._metadata
    }

    set metadata(metadata) {
        this._metadata = metadata
    }

    /**
     * @type {Resource}
     */
    get resource() {
        return this._resource
    }

    set resource(resource) {
        this._resource = resource
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
     * @param {number} ver The version of kip17.
     * @return {void}
     */
    initKIP17API(chainId, accessKeyId, secretAccessKey, url, ver) {
        if (ver === 2) {
            this.kip17 = new KIP17V2()
            this.kip17.queryOptions = KIP17QueryOptions
            this.kip17.feePayerOptions = KIP17FeePayerOptions
        } else if (ver < 1 || ver > 2) {
            console.log(VERSION_WARNING)
        } else {
            console.log(PROPOSE_VERSION_MSG)
        }

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

    /**
     * Sets chain id and authentication key for KIP37 API. <br>
     * Since `caver.initKIP37API` calls this function internally, it is recommended to use `caver.initKIP37API`.
     *
     * @example
     * caver.kas.initKIP37API(1001, 'accessKeyId', 'secretAccessKey', 'https://kip37-api.klaytnapi.com', 2)
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @param {number} ver The version of kip37.
     * @return {void}
     */
    initKIP37API(chainId, accessKeyId, secretAccessKey, url, ver) {
        const { client, accessOptions } = createClient(url, chainId, accessKeyId, secretAccessKey)
        if (ver === 2) {
            this.kip37 = new KIP37V2()
            this.kip37.queryOptions = KIP37QueryOptions
            this.kip37.feePayerOptions = KIP37FeePayerOptions
        } else if (ver < 1 || ver > 2) {
            console.log(VERSION_WARNING)
        } else {
            console.log(PROPOSE_VERSION_MSG)
        }
        this.kip37.accessOptions = accessOptions
        this.kip37.client = client
    }

    /**
     * Sets chain id and authentication key for Metadata API. <br>
     * Since `caver.initMetadataAPI` calls this function internally, it is recommended to use `caver.initMetadataAPI`.
     *
     * @example
     * caver.kas.initMetadataAPI(1001, 'accessKeyId', 'secretAccessKey', 'https://meatadata-api.klaytnapi.com')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @return {void}
     */
    initMetadataAPI(chainId, accessKeyId, secretAccessKey, url) {

        const { client, accessOptions } = createClient(url, chainId, accessKeyId, secretAccessKey)
        this.metadata.accessOptions = accessOptions
        this.metadata.client = client
    }

    /**
     * Sets chain id and authentication key for Resource API. <br>
     * Since `caver.initResourceAPI` calls this function internally, it is recommended to use `caver.initResourceAPI`.
     *
     * @example
     * caver.kas.initResourceAPI(1001, 'accessKeyId', 'secretAccessKey', 'https://resource-api.klaytnapi.com')
     *
     * @param {number} chainId The chain id.
     * @param {string} accessKeyId The access key id.
     * @param {string} secretAccessKey The secret access key.
     * @param {string} url The end point url.
     * @return {void}
     */
    initResourceAPI(chainId, accessKeyId, secretAccessKey, url) {
        const { client, accessOptions } = createClient(url, chainId, accessKeyId, secretAccessKey)
        this.resource.accessOptions = accessOptions
        this.resource.client = client
    }

}

module.exports = KAS
