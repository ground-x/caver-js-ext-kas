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

const _ = require('lodash')

const { expect } = require('../extendedChai')
const CaverExtKAS = require('../../index.js')

let caver
const { url, accessKeyId, secretAccessKey } = require('../testEnv').auths.nodeAPI
const { senderPrivateKey } = require('../testEnv')

let testAddress
let receipt

const chainId = 1001

async function sendTestKLAY(sender) {
    const vt = new caver.transaction.valueTransfer({
        from: testAddress,
        to: testAddress,
        value: 1,
        gas: 25000,
    })

    await caver.wallet.sign(sender.address, vt)

    receipt = await caver.rpc.klay.sendRawTransaction(vt)
}

async function getRawTransaction(keyring) {
    const vt = new caver.transaction.valueTransfer({
        from: keyring.address,
        to: testAddress,
        value: 1,
        gas: 25000,
    })
    const signed = await vt.sign(keyring)
    return signed.getRLPEncoding()
}

describe('Node API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    context('caver.initNodeAPI', () => {
        it('should return error if nodeAPI is not initialized', async () => {
            const expectedError = 'Provider not set or invalid'
            await expect(caver.rpc.klay.getBlockNumber()).to.be.rejectedWith(expectedError)
        }).timeout(50000)

        it('should set valid headers to provider with x-chain-id and auth', () => {
            caver.initNodeAPI(chainId, accessKeyId, secretAccessKey, url)

            const headers = caver._requestManager.provider.headers
            expect(headers[0].name).to.equal('Authorization')
            expect(headers[0].value).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(headers[1].name).to.equal('x-krn')
            expect(headers[1].value).to.equal(`krn:${chainId}:node`)
        })
    })
})

describe('Node API service', () => {
    let sender

    before(function(done) {
        this.timeout(200000)

        caver = new CaverExtKAS()
        caver.initNodeAPI(chainId, accessKeyId, secretAccessKey, url)

        if (senderPrivateKey !== '0x') {
            sender = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(senderPrivateKey))
            testAddress = sender.address
        }

        sendTestKLAY(sender).then(() => done())
    })

    context('caver.rpc.klay APIs', () => {
        it('should use json rpc call of Klaytn thourgh KAS', async () => {
            let filterId

            const klayAPIs = [
                { name: 'accountCreated', params: [testAddress], returnType: 'boolean' },
                { name: 'getAccount', params: [testAddress], returnType: 'object' },
                { name: 'getAccountKey', params: [testAddress], returnType: 'object' },
                { name: 'getBalance', params: [testAddress], returnType: 'string' },
                { name: 'getCode', params: ['0xdcd62c57182e780e23d2313c4782709da85b9d6c'], returnType: 'string' },
                { name: 'getTransactionCount', params: [testAddress], returnType: 'string' },
                { name: 'isContractAccount', params: [testAddress], returnType: 'boolean' },
                { name: 'getBlockNumber', params: [], returnType: 'string' },
                { name: 'getBlockByNumber', params: [1], returnType: 'object' },
                {
                    name: 'getBlockByHash',
                    params: [receipt.blockHash],
                    returnType: 'object',
                },
                {
                    name: 'getBlockReceipts',
                    params: [receipt.blockHash],
                    returnType: 'array',
                },
                {
                    name: 'getBlockTransactionCountByNumber',
                    params: [1],
                    returnType: 'string',
                },
                {
                    name: 'getBlockTransactionCountByHash',
                    params: [receipt.blockHash],
                    returnType: 'string',
                },
                {
                    name: 'getBlockWithConsensusInfoByNumber',
                    params: [1],
                    returnType: 'object',
                },
                {
                    name: 'getBlockWithConsensusInfoByHash',
                    params: [receipt.blockHash],
                    returnType: 'object',
                },
                { name: 'getCommittee', params: [], returnType: 'array' },
                { name: 'getCommitteeSize', params: [], returnType: 'number' },
                { name: 'getCouncil', params: [], returnType: 'array' },
                { name: 'getCouncilSize', params: [], returnType: 'number' },
                { name: 'getStorageAt', params: ['0x407d73d8a49eeb85d32cf465507dd71d507100c1', 0], returnType: 'string' },
                { name: 'isSyncing', params: [], returnType: 'boolean' },
                {
                    name: 'call',
                    params: [
                        {
                            to: '0xd5009B56af61ca855A1A80C370F3Ab7fa2A59013',
                            input: '0x06fdde03',
                        },
                    ],
                    returnType: 'string',
                },
                {
                    name: 'estimateGas',
                    params: [
                        {
                            to: '0xd5009B56af61ca855A1A80C370F3Ab7fa2A59013',
                            input: '0x06fdde03',
                        },
                    ],
                    returnType: 'string',
                },
                {
                    name: 'estimateComputationCost',
                    params: [
                        {
                            to: '0xd5009B56af61ca855A1A80C370F3Ab7fa2A59013',
                            input: '0x06fdde03',
                        },
                    ],
                    returnType: 'string',
                },
                {
                    name: 'getTransactionByBlockHashAndIndex',
                    params: [receipt.blockHash, 0],
                    returnType: 'object',
                },
                {
                    name: 'getTransactionByBlockNumberAndIndex',
                    params: [receipt.blockNumber, caver.utils.hexToNumber(receipt.transactionIndex)],
                    returnType: 'object',
                },
                {
                    name: 'getTransactionByHash',
                    params: [receipt.transactionHash],
                    returnType: 'object',
                },
                {
                    name: 'getTransactionReceipt',
                    params: [receipt.transactionHash],
                    returnType: 'object',
                },
                // {
                //     name: 'sendRawTransaction',
                //     params: [await getRawTransaction(sender)],
                //     returnType: 'object',
                // },
                { name: 'getChainId', params: [], returnType: 'string' },
                { name: 'getClientVersion', params: [], returnType: 'string' },
                { name: 'getGasPrice', params: [], returnType: 'string' },
                { name: 'getGasPriceAt', params: [1], returnType: 'string' },
                { name: 'getProtocolVersion', params: [], returnType: 'string' },
                { name: 'newBlockFilter', params: [], returnType: 'string' },
                { name: 'getFilterChanges', params: [], returnType: 'array' },
                { name: 'newFilter', params: [{}], returnType: 'string' },
                { name: 'getFilterLogs', params: [], returnType: 'array' },
                {
                    name: 'getLogs',
                    params: [{ fromBlock: 'latest', toBlock: 'latest', address: '0xc254738899cc347b0d94c2861c9a1aa558825f3a' }],
                    returnType: 'array',
                },
                { name: 'newPendingTransactionFilter', params: [], returnType: 'string' },
                { name: 'uninstallFilter', params: [], returnType: 'boolean' },
                { name: 'sha3', params: ['0xea'], returnType: 'string' },
            ]

            const netAPIs = [
                { name: 'getNetworkId', params: [], returnType: 'number' },
                { name: 'isListening', params: [], returnType: 'boolean' },
                { name: 'getPeerCount', params: [], returnType: 'string' },
                { name: 'getPeerCountByType', params: [], returnType: 'object' },
            ]

            for (let i = 0; i < klayAPIs.length; i++) {
                const api = klayAPIs[i]

                if (api.name === 'sendRawTransaction' && !sender) continue

                // console.log(
                //     `test api name: ${api.name} / params: ${
                //         _.isObject(api.params) ? JSON.stringify(api.params) : api.params
                //     } / return type: ${api.returnType}`
                // )
                const ret = await caver.rpc.klay[api.name](...api.params)
                // console.log(ret)

                expect(ret).not.to.be.undefined
                expect(ret).not.to.be.null
                api.returnType === 'array' ? expect(_.isArray(ret)).to.be.true : expect(typeof ret).to.equal(api.returnType)
                if (api.name === 'newBlockFilter' || api.name === 'newFilter' || api.name === 'newPendingTransactionFilter') {
                    filterId = ret
                    klayAPIs[i + 1].params = [filterId]
                }
            }

            for (let i = 0; i < netAPIs.length; i++) {
                const api = netAPIs[i]
                // console.log(
                //     `test api name: ${api.name} / params: ${
                //         _.isObject(api.params) ? JSON.stringify(api.params) : api.params
                //     } / return type: ${api.returnType}`
                // )
                const ret = await caver.rpc.net[api.name](...api.params)

                expect(ret).not.to.be.undefined
                expect(ret).not.to.be.null
                api.returnType === 'array' ? expect(_.isArray(ret)).to.be.true : expect(typeof ret).to.equal(api.returnType)
            }
        }).timeout(1000000)
    })
})
