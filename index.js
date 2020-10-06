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

    initNodeAPI(path, chainId, accessKeyId, secretAccessKey) {
        this.setProvider(path)

        this._requestManager.provider.headers = this._requestManager.provider.headers || []
        const auth = [
            { name: 'Authorization', value: `Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}` },
            { name: 'x-krn', value: `krn:${chainId}:node` },
        ]
        this._requestManager.provider.headers = this._requestManager.provider.headers.concat(auth)
    }

    initTokenHistoryAPI(path, chainId, accessKeyId, secretAccessKey) {
        this.kas.initTokenHistoryAPI(path, chainId, accessKeyId, secretAccessKey)
    }

    initWalletAPI(path, chainId, accessKeyId, secretAccessKey) {
        this.kas.initWalletAPI(path, chainId, accessKeyId, secretAccessKey)
    }

    initAnchorAPI(path, chainId, accessKeyId, secretAccessKey) {
        this.kas.initAnchorAPI(path, chainId, accessKeyId, secretAccessKey)
    }
}

module.exports = CaverExtKAS
