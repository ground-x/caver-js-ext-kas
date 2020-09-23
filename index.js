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

const CaverBasic = require('caver-js')
const KAS = require('./src/kas/kas')

class Caver extends CaverBasic {
    constructor(path) {
        super(path)
        this.kas = new KAS()
    }

    enableNodeAPI(chainId, accessKeyId, secretAccessKey) {
        this._requestManager.provider.headers = this._requestManager.provider.headers || []
        const auth = [
            { name: 'Authorization', value: `Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}` },
            { name: 'x-krn', value: `krn:${chainId}:node` },
        ]
        this._requestManager.provider.headers = this._requestManager.provider.headers.concat(auth)
    }

    enableTokenHistoryAPI(path, chainId, accessKeyId, secretAccessKey) {
        this.kas.enableTokenHistoryAPI(path, chainId, accessKeyId, secretAccessKey)
    }

    enableWalletAPI(path, chainId, accessKeyId, secretAccessKey) {
        this.kas.enableWalletAPI(path, chainId, accessKeyId, secretAccessKey)
    }

    enableAnchorAPI(path, chainId, accessKeyId, secretAccessKey) {
        this.kas.enableAnchorAPI(path, chainId, accessKeyId, secretAccessKey)
    }
}

module.exports = Caver
