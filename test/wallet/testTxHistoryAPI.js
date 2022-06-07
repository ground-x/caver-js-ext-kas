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

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const CaverExtKAS = require('../../index.js')

let caver
const { url, accessKeyId, secretAccessKey } = require('../testEnv').auths.walletAPI
const chainIds = require('../../src/utils/helper').chainIds

const chainId = chainIds.CHAIN_ID_CYPRESS

const sandbox = sinon.createSandbox()

describe('Wallet API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.kas.wallet.getFDTransactionList', () => {
        const resultOfApi = {
            items: [
                {
                    chainId: 8217,
                    chargedByKlay: '0.003877775',
                    chargedByKrw: '4.3',
                    chargedByPeb: '3877775000000000',
                    chargedByUsd: '0.00374',
                    feePayer: '0x85b98485444c89880cd9c48807cef727c296f2da',
                    from: '0x9154cc66c18fd04632d6daf98af8de0a99801c6d',
                    gasPrice: '0xae9f7bcc00',
                    gasUsed: '0x25de7',
                    krw: 1109.6,
                    status: '0x1',
                    timestamp: 1627012095,
                    transactionHash: '0xa3fb324004b0e498f518a5dbd8dd02e93f31bdd14ab0005187a7ef5aa32e6643',
                    typeInt: 41,
                    usd: 0.96567,
                },
                {
                    chainId: 8217,
                    chargedByKlay: '0.003877775',
                    chargedByKrw: '4.3',
                    chargedByPeb: '3877775000000000',
                    chargedByUsd: '0.00374',
                    feePayer: '0x85b98485444c89880cd9c48807cef727c296f2da',
                    from: '0x9154cc66c18fd04632d6daf98af8de0a99801c6d',
                    gasPrice: '0xae9f7bcc00',
                    gasUsed: '0x25de7',
                    krw: 1109.6,
                    status: '0x1',
                    timestamp: 1627012095,
                    transactionHash: '0x7d0017409e2f6de152c7faea557432a295ba487c8305ecf1272beeba94d998e7',
                    typeInt: 41,
                    usd: 0.96567,
                },
            ],
            cursor: '',
        }

        const from = '0x9154cc66c18fd04632d6daf98af8de0a99801c6d'

        function setCallFakeForCallApi(callApiStub, fromAddress) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,

                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v2/history/fd/tx`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(1)
                    expect(queryParams.from).to.equal(fromAddress)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-248: should return FD transaction list from KAS without query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getV2HistoryFdTxSpy = sandbox.spy(caver.kas.wallet.txHistoryApi, 'getV2HistoryFdTx')
            const callApiStub = sandbox.stub(caver.kas.wallet.txHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getFDTransactionList()

            expect(getV2HistoryFdTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-249: should return FD transaction list from KAS with query parameters (from)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getV2HistoryFdTxSpy = sandbox.spy(caver.kas.wallet.txHistoryApi, 'getV2HistoryFdTx')
            const callApiStub = sandbox.stub(caver.kas.wallet.txHistoryApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, from)
            const ret = await caver.kas.wallet.getFDTransactionList(from)

            expect(getV2HistoryFdTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-250: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getV2HistoryFdTxSpy = sandbox.spy(caver.kas.wallet.txHistoryApi, 'getV2HistoryFdTx')
            const callApiStub = sandbox.stub(caver.kas.wallet.txHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.getFDTransactionList(() => {
                isCalled = true
            })

            expect(getV2HistoryFdTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-251: should call callback function with api result and query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getV2HistoryFdTxSpy = sandbox.spy(caver.kas.wallet.txHistoryApi, 'getV2HistoryFdTx')
            const callApiStub = sandbox.stub(caver.kas.wallet.txHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            setCallFakeForCallApi(callApiStub, from)
            const ret = await caver.kas.wallet.getFDTransactionList(from, () => {
                isCalled = true
            })

            expect(getV2HistoryFdTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-254: should throw an error when chain id is not cypress network', async () => {
            caver.initWalletAPI(chainIds.CHAIN_ID_BAOBAB, accessKeyId, secretAccessKey, url)

            expect(() => caver.kas.wallet.getFDTransactionList(from)).to.throw(
                `This API is only supported on the Cypress network. Please change network to use this.`
            )
        })
    })

    context('caver.kas.wallet.getFDTransaction', () => {
        const resultOfApi = {
            chainId: 8217,
            chargedByKlay: '0.003877775',
            chargedByKrw: '4.3',
            chargedByPeb: '3877775000000000',
            chargedByUsd: '0.00374',
            feePayer: '0x85b98485444c89880cd9c48807cef727c296f2da',
            from: '0x9154cc66c18fd04632d6daf98af8de0a99801c6d',
            gasPrice: '0xae9f7bcc00',
            gasUsed: '0x25de7',
            krw: 1109.6,
            status: '0x1',
            timestamp: 1627012095,
            transactionHash: '0xa3fb324004b0e498f518a5dbd8dd02e93f31bdd14ab0005187a7ef5aa32e6643',
            typeInt: 41,
            usd: 0.96567,
        }

        const txHash = '0xa3fb324004b0e498f518a5dbd8dd02e93f31bdd14ab0005187a7ef5aa32e6643'

        function setCallFakeForCallApi(callApiStub) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,

                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v2/history/fd/tx/{transaction-hash}`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['transaction-hash']).to.equal(txHash)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-252: should return FD transaction from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getV2HistoryFdTxTransactionHashSpy = sandbox.spy(caver.kas.wallet.txHistoryApi, 'getV2HistoryFdTxTransactionHash')
            const callApiStub = sandbox.stub(caver.kas.wallet.txHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getFDTransaction(txHash)

            expect(getV2HistoryFdTxTransactionHashSpy.calledWith(txHash)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.chainId).not.to.be.undefined
            expect(ret.chargedByKlay).not.to.be.undefined
            expect(ret.chargedByKrw).not.to.be.undefined
            expect(ret.chargedByPeb).not.to.be.undefined
            expect(ret.chargedByUsd).not.to.be.undefined
            expect(ret.feePayer).not.to.be.undefined
            expect(ret.from).not.to.be.undefined
            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.gasUsed).not.to.be.undefined
            expect(ret.krw).not.to.be.undefined
            expect(ret.status).not.to.be.undefined
            expect(ret.timestamp).not.to.be.undefined
            expect(ret.transactionHash).not.to.be.undefined
            expect(ret.typeInt).not.to.be.undefined
            expect(ret.usd).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-253: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getV2HistoryFdTxTransactionHashSpy = sandbox.spy(caver.kas.wallet.txHistoryApi, 'getV2HistoryFdTxTransactionHash')
            const callApiStub = sandbox.stub(caver.kas.wallet.txHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.getFDTransaction(txHash, () => {
                isCalled = true
            })

            expect(getV2HistoryFdTxTransactionHashSpy.calledWith(txHash)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.chainId).not.to.be.undefined
            expect(ret.chargedByKlay).not.to.be.undefined
            expect(ret.chargedByKrw).not.to.be.undefined
            expect(ret.chargedByPeb).not.to.be.undefined
            expect(ret.chargedByUsd).not.to.be.undefined
            expect(ret.feePayer).not.to.be.undefined
            expect(ret.from).not.to.be.undefined
            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.gasUsed).not.to.be.undefined
            expect(ret.krw).not.to.be.undefined
            expect(ret.status).not.to.be.undefined
            expect(ret.timestamp).not.to.be.undefined
            expect(ret.transactionHash).not.to.be.undefined
            expect(ret.typeInt).not.to.be.undefined
            expect(ret.usd).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-255: should throw an error when chain id is not cypress network', async () => {
            caver.initWalletAPI(chainIds.CHAIN_ID_BAOBAB, accessKeyId, secretAccessKey, url)

            expect(() => caver.kas.wallet.getFDTransaction(txHash)).to.throw(
                `This API is only supported on the Cypress network. Please change network to use this.`
            )
        })
    })
})
