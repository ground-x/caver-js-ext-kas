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

class CaverExtKAS extends Caver {
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

    initKASAPI(chainId, accessKeyId, secretAccessKey) {
        this.initNodeAPI(chainId, accessKeyId, secretAccessKey)
        this.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey)
        this.initWalletAPI(chainId, accessKeyId, secretAccessKey)
        this.initAnchorAPI(chainId, accessKeyId, secretAccessKey)
    }

    initNodeAPI(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.node) {
        this.setProvider(url)

        this._requestManager.provider.headers = this._requestManager.provider.headers || []
        const auth = [
            { name: 'Authorization', value: `Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}` },
            { name: 'x-krn', value: `krn:${chainId}:node` },
        ]
        this._requestManager.provider.headers = this._requestManager.provider.headers.concat(auth)
    }

    initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.tokenHistory) {
        this.kas.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)
    }

    initWalletAPI(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.wallet) {
        this.kas.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)
    }

    initAnchorAPI(chainId, accessKeyId, secretAccessKey, url = productionEndpoints.anchor) {
        this.kas.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)
    }
}

module.exports = CaverExtKAS
