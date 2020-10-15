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

const productionEndpoints = {
    node: 'https://node-api.klaytnapi.com/v1/klaytn',
    wallet: 'https://wallet-api.klaytnapi.com',
    anchor: 'https://anchor-api.klaytnapi.com',
    tokenHistory: 'https://th-api.klaytnapi.com',
}

/**
 * An extension class of caver implemented to use KAS API service easily.
 * @class
 */
class CaverExtKAS extends Caver {
    /**
     * Creates an instance of caver extension KAS.
     * @constructor
     * @param {string} [path] - The endpoint url to connect with. This path will be used with Node API.
     */
    constructor(path) {
        super(path)
        this.kas = new KAS()
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
            { name: 'x-krn', value: `krn:${chainId}:node` },
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
}

module.exports = CaverExtKAS
