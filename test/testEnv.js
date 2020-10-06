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

const senderPrivateKey = '0x'
const payerPrivateKey = '0x'

const auths = {
    nodeAPI: {
        url: 'https://node-api.dev.klaytn.com/v1/klaytn',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
    },
    tokenHistoryAPI: {
        url: 'https://th-api.dev.klaytn.com',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
    },
    walletAPI: {
        url: 'https://wallet-api.dev.klaytn.com',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
        feePayerAddress: '',
    },
    anchorAPI: {
        url: 'https://anchor-api.dev.klaytn.com',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
        operator: '',
    },
}

module.exports = { senderPrivateKey, payerPrivateKey, auths }
