/*
 * Copyright 2021 The caver-js-ext-kas Authors
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
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.walletAPI

const sandbox = sinon.createSandbox()

describe('Wallet API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.kas.wallet.createFeePayer', () => {
        const resultOfApi = {
            address: '0xa5bed98999B70A7f625590D0f1c100d1266053eB',
            chainId: 1001,
            createdAt: 1620702008,
            keyId:
                'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:feepayer-pool:default:0x68b01967a72db6135c6b36165b6c18457d1f95634fb436848b3113d9dbd85ab1',
            krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:feepayer-pool:default',
            publicKey:
                '0x0442cefd85c7e13e8e353a84dc1eb3f67f14b686fdf8058805015c4024d6a79bb82f66e30864ecf7857f059f44509cc86c0df26b4ecc6e72b40d44b2341f4e7665',
            updatedAt: 1620702008,
        }

        function setCallFakeForCallApi(callApiStub, withoutAccountUpdate) {
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
                    expect(path).to.equal(`/v2/feepayer`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    if (withoutAccountUpdate !== undefined) expect(postBody.withoutAccountUpdate).to.equal(withoutAccountUpdate)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-223: should create fee payer from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const createFeePayerSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'creatFeePayerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.createFeePayer()

            expect(createFeePayerSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.chainId).not.to.be.undefined
            expect(ret.createdAt).not.to.be.undefined
            expect(ret.keyId).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
            expect(ret.publicKey).not.to.be.undefined
            expect(ret.updatedAt).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-241: should create fee payer from KAS with withoutAccountUpdate parameter', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const createFeePayerSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'creatFeePayerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')

            const withoutAccountUpdate = true
            setCallFakeForCallApi(callApiStub, withoutAccountUpdate)
            const ret = await caver.kas.wallet.createFeePayer(withoutAccountUpdate)

            expect(createFeePayerSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.chainId).not.to.be.undefined
            expect(ret.createdAt).not.to.be.undefined
            expect(ret.keyId).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
            expect(ret.publicKey).not.to.be.undefined
            expect(ret.updatedAt).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-224: should call callback function with created fee payer from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const createFeePayerSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'creatFeePayerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false
            const ret = await caver.kas.wallet.createFeePayer(() => {
                isCalled = true
            })

            expect(createFeePayerSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.chainId).not.to.be.undefined
            expect(ret.createdAt).not.to.be.undefined
            expect(ret.keyId).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
            expect(ret.publicKey).not.to.be.undefined
            expect(ret.updatedAt).not.to.be.undefined
            expect(isCalled).to.be.true
        })
    })

    context('caver.kas.wallet.getFeePayer', () => {
        const resultOfApi = {
            address: '0xCf750eb042Af9eb4CA673abeaB43493806b3f569',
            chainId: 1001,
            createdAt: 1620710155,
            keyId:
                'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:feepayer-pool:default:0x0b5933f941a0200207279a1f27b9783ea462006ddabbdf7dbda618306e1cf518',
            krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:feepayer-pool:default',
            publicKey:
                '0x0418138a94cef828f19f41213904b6901d17bc20e45674d3bee7804f6b5067ec9b9f09f18957ef4f9c312be138b1a45c6b1e8029b7ef43701b7964df79bb80c448',
            updatedAt: 1620710155,
        }

        const feePayerAddress = '0xCf750eb042Af9eb4CA673abeaB43493806b3f569'

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
                    expect(path).to.equal(`/v2/feepayer/{address}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams.address).to.equal(feePayerAddress)
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

        it('CAVERJS-EXT-KAS-WALLET-225: should get fee payer from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveFeePayerAccountSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getFeePayer(feePayerAddress)

            expect(retrieveFeePayerAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.chainId).not.to.be.undefined
            expect(ret.createdAt).not.to.be.undefined
            expect(ret.keyId).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
            expect(ret.publicKey).not.to.be.undefined
            expect(ret.updatedAt).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-226: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveFeePayerAccountSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.getFeePayer(feePayerAddress, () => {
                isCalled = true
            })

            expect(retrieveFeePayerAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.chainId).not.to.be.undefined
            expect(ret.createdAt).not.to.be.undefined
            expect(ret.keyId).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
            expect(ret.publicKey).not.to.be.undefined
            expect(ret.updatedAt).not.to.be.undefined
        })
    })

    context('caver.kas.wallet.getFeePayerList', () => {
        const resultOfApi = {
            cursor:
                'eyJBZGRyZXNzIjoia3JuOjEwMDE6d2FsbGV0OjhlNzZkMDAzLWQ2ZGQtNDI3OC04ZDA1LTUxNzJkOGYwMTBjYTpmZWVwYXllci1wb29sOmRlZmF1bHQ6MHgxRTU1Y2M0YUMyNzg4ZjQxZmE5NTMwMmYzNzBlMmE4M0NiZDc2MDYyIiwiVHlwZSI6IkFDQyIsImNyZWF0ZWRfYXQiOjE2MjA3MTA1MTYsInJwbiI6ImtybjoxMDAxOndhbGxldDo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6ZmVlcGF5ZXItcG9vbDpkZWZhdWx0In0=',
            items: [
                {
                    address: '0x1E55cc4aC2788f41fa95302f370e2a83Cbd76062',
                    chainId: 1001,
                    createdAt: 1620710516,
                    keyId:
                        'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:feepayer-pool:default:0x170d9271016aabde3bef8c600dfda66e6ad9fdee2b610058b35b3d8b9653a0ca',
                    krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:feepayer-pool:default',
                    publicKey:
                        '0x040bfb9a96b4dc792c1ab3043da75a3d75dc32b76ff0180c009ce54cfcb75d9cdf0473a2494fb29064cdb10dca94faef04711f51f4cf6894b71bf120f59827005b',
                    updatedAt: 1620710516,
                },
            ],
        }

        function setCallFakeForCallApi(callApiStub, queryOptions = {}) {
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
                    expect(path).to.equal(`/v2/feepayer`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(4)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams['from-timestamp']).to.equal(queryOptions.fromTimestamp)
                    expect(queryParams['to-timestamp']).to.equal(queryOptions.toTimestamp)

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

        it('CAVERJS-EXT-KAS-WALLET-227: should return fee payers without query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getFeePayerList()

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-228: should return fee payers with query parameters (size)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { size: 1 }
            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getFeePayerList(queryParams)

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-229: should return fee payers with query parameters (from-timestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'from-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getFeePayerList(queryParams)

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-230: should return fee payers with query parameters (fromTimestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { fromTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getFeePayerList(queryParams)

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-231: should return fee payers with query parameters (to-timestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'to-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getFeePayerList(queryParams)

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-232: should return fee payers with query parameters (toTimestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { toTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getFeePayerList(queryParams)

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-233: should return fee payers with query parameters (cursor)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getFeePayerList(queryParams)

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-234: should return fee payers with query parameters (size, fromTimestamp, toTimestamp, cursor)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getFeePayerList(queryParams)

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-235: should call callback function with fee payers', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.getFeePayerList(() => {
                isCalled = true
            })

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-236: should call callback function with fee payers with query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveFeePayerAccountsSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'retrieveFeePayerAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.wallet.getFeePayerList(queryParams, () => {
                isCalled = true
            })

            expect(retrieveFeePayerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
            expect(ret.items).not.to.be.undefined
        })
    })

    context('caver.kas.wallet.deleteFeePayer', () => {
        const resultOfApi = { status: 'deleted' }

        const feePayerAddress = '0xCf750eb042Af9eb4CA673abeaB43493806b3f569'

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
                    expect(path).to.equal(`/v2/feepayer/{address}`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(pathParams.address).to.equal(feePayerAddress)
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

        it('CAVERJS-EXT-KAS-WALLET-237: should get fee payer from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const deleteFeePayerAccountSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'deleteFeePayerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.deleteFeePayer(feePayerAddress)

            expect(deleteFeePayerAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('deleted')
        })

        it('CAVERJS-EXT-KAS-WALLET-238: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const deleteFeePayerAccountSpy = sandbox.spy(caver.kas.wallet.feePayerApi, 'deleteFeePayerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.feePayerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.deleteFeePayer(feePayerAddress, () => {
                isCalled = true
            })

            expect(deleteFeePayerAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('deleted')
        })
    })
})
