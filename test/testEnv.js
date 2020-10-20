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
        url: 'https://node-api.klaytnapi.com',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
    },
    tokenHistoryAPI: {
        url: 'https://th-api.klaytnapi.com',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
    },
    walletAPI: {
        url: 'https://wallet-api.klaytnapi.com',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
        feePayerAddress: '',
    },
    anchorAPI: {
        url: 'https://anchor-api.klaytnapi.com',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
        operator: '',
    },
}

if (process.env.CI && process.argv[process.argv.length - 1] === '--dev') {
    auths.nodeAPI.url = process.env.NODEAPI_DEV
    auths.tokenHistoryAPI.url = process.env.THAPI_DEV
    auths.walletAPI.url = process.env.WALLETAPI_DEV
    auths.anchorAPI.url = process.env.ANCHORAPI_DEV
}

module.exports = { senderPrivateKey, payerPrivateKey, auths }
