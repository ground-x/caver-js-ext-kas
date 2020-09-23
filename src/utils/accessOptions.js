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

class AccessOptions {
    constructor(accessKeyId, secretAccessKey, chainId) {
        this.accessKeyId = accessKeyId
        this.secretAccessKey = secretAccessKey
        this.chainId = chainId
    }

    get accessKeyId() {
        return this._accessKeyId
    }

    set accessKeyId(accessKeyId) {
        this._accessKeyId = accessKeyId
    }

    get secretAccessKey() {
        return this._secretAccessKey
    }

    set secretAccessKey(secretAccessKey) {
        this._secretAccessKey = secretAccessKey
    }

    get chainId() {
        return this._chainId
    }

    set chainId(chainId) {
        this._chainId = chainId
    }

    get auth() {
        return `Basic ${Buffer.from(`${this.accessKeyId}:${this.secretAccessKey}`).toString('base64')}`
    }
}

module.exports = AccessOptions
