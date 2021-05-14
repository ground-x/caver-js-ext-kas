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

const dotenv = require('dotenv')

let senderPrivateKey = '0x'

dotenv.config()

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
        presets: [],
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
    kip17API: {
        url: 'https://kip17-api.klaytnapi.com',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
    },
    kip7API: {
        url: 'https://kip7-api.klaytnapi.com',
        chainId: 1001,
        accessKeyId: '',
        secretAccessKey: '',
    },
}

if (process.argv[process.argv.length - 1] === '--testEnv=dev' || process.env.npm_config_testEnv === 'dev') {
    senderPrivateKey = process.env.SENDER_PRV_KEY_JS_DEV

    auths.nodeAPI.url = process.env.NODE_API_DEV
    auths.nodeAPI.accessKeyId = process.env.ACCESS_KEY_DEV
    auths.nodeAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY_DEV

    auths.tokenHistoryAPI.url = process.env.TH_API_DEV
    auths.tokenHistoryAPI.accessKeyId = process.env.ACCESS_KEY_DEV
    auths.tokenHistoryAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY_DEV
    auths.tokenHistoryAPI.presets.push(Number(process.env.PRESET_DEV))

    auths.walletAPI.url = process.env.WALLET_API_DEV
    auths.walletAPI.accessKeyId = process.env.ACCESS_KEY_DEV
    auths.walletAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY_DEV
    auths.walletAPI.feePayerAddress = process.env.FEE_PAYER_ADDR_DEV

    auths.anchorAPI.url = process.env.ANCHOR_API_DEV
    auths.anchorAPI.accessKeyId = process.env.ACCESS_KEY_DEV
    auths.anchorAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY_DEV
    auths.anchorAPI.operator = process.env.OPERATOR_DEV

    auths.kip17API.url = process.env.KIP17_API_DEV
    auths.kip17API.accessKeyId = process.env.ACCESS_KEY_DEV
    auths.kip17API.secretAccessKey = process.env.SECRET_ACCESS_KEY_DEV

    auths.kip7API.url = process.env.KIP7_API_DEV
    auths.kip7API.accessKeyId = process.env.ACCESS_KEY_DEV
    auths.kip7API.secretAccessKey = process.env.SECRET_ACCESS_KEY_DEV
} else if (process.argv[process.argv.length - 1] === '--testEnv=qa' || process.env.npm_config_testEnv === 'qa') {
    senderPrivateKey = process.env.SENDER_PRV_KEY_JS_QA

    auths.nodeAPI.url = process.env.NODE_API_QA
    auths.nodeAPI.accessKeyId = process.env.ACCESS_KEY_QA
    auths.nodeAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY_QA

    auths.tokenHistoryAPI.url = process.env.TH_API_QA
    auths.tokenHistoryAPI.accessKeyId = process.env.ACCESS_KEY_QA
    auths.tokenHistoryAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY_QA
    auths.tokenHistoryAPI.presets.push(Number(process.env.PRESET_QA))

    auths.walletAPI.url = process.env.WALLET_API_QA
    auths.walletAPI.accessKeyId = process.env.ACCESS_KEY_QA
    auths.walletAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY_QA
    auths.walletAPI.feePayerAddress = process.env.FEE_PAYER_ADDR_QA

    auths.anchorAPI.url = process.env.ANCHOR_API_QA
    auths.anchorAPI.accessKeyId = process.env.ACCESS_KEY_QA
    auths.anchorAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY_QA
    auths.anchorAPI.operator = process.env.OPERATOR_QA

    auths.kip17API.url = process.env.KIP17_API_QA
    auths.kip17API.accessKeyId = process.env.ACCESS_KEY_QA
    auths.kip17API.secretAccessKey = process.env.SECRET_ACCESS_KEY_QA

    auths.kip7API.url = process.env.KIP7_API_QA
    auths.kip7API.accessKeyId = process.env.ACCESS_KEY_QA
    auths.kip7API.secretAccessKey = process.env.SECRET_ACCESS_KEY_QA
} else {
    senderPrivateKey = process.env.SENDER_PRV_KEY_JS

    auths.nodeAPI.accessKeyId = process.env.ACCESS_KEY
    auths.nodeAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY

    auths.tokenHistoryAPI.accessKeyId = process.env.ACCESS_KEY
    auths.tokenHistoryAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY
    auths.tokenHistoryAPI.presets.push(Number(process.env.PRESET))

    auths.walletAPI.accessKeyId = process.env.ACCESS_KEY
    auths.walletAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY
    auths.walletAPI.feePayerAddress = process.env.FEE_PAYER_ADDR

    auths.anchorAPI.accessKeyId = process.env.ACCESS_KEY
    auths.anchorAPI.secretAccessKey = process.env.SECRET_ACCESS_KEY
    auths.anchorAPI.operator = process.env.OPERATOR

    auths.kip17API.accessKeyId = process.env.ACCESS_KEY
    auths.kip17API.secretAccessKey = process.env.SECRET_ACCESS_KEY

    auths.kip7API.accessKeyId = process.env.ACCESS_KEY
    auths.kip7API.secretAccessKey = process.env.SECRET_ACCESS_KEY
}

// console.log(auths)

module.exports = { senderPrivateKey, auths }
