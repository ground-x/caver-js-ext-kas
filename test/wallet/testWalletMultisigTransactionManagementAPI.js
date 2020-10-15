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
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.walletAPI

const sandbox = sinon.createSandbox()

describe('Wallet API - Basic transaction API', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.kas.wallet.getMultiSigTransactionList', () => {
        const resultOfApi = {
            cursor: '',
            items: [
                {
                    chainId: 1001,
                    createdAt: 1600651309,
                    status: 2,
                    threshold: 3,
                    transactionId: '0xa7cc12cc44cf1ffcfd78de2b32fd1293f239b29613cc236887c2a3c5901c0ee0',
                    updatedAt: 1600651309,
                    address: '0xA9628ca9Df1Be3a7c8B93EACB5C2715DD0A5F7B7',
                    multiSigKeys: [
                        {
                            address: '0x9324333ad8D174a63B53d4735b63535232F90C34',
                            weight: 1,
                        },
                        {
                            address: '0xF110Aa65E8e3E50d4B8E6753F84A5011A7480276',
                            weight: 1,
                        },
                        {
                            address: '0xA36b7Fa8073e05F9bA5330f9425d5231C0f3e62f',
                            weight: 1,
                        },
                    ],
                    txData: {
                        from: '0xa9628ca9df1be3a7c8b93eacb5c2715dd0a5f7b7',
                        gas: 25000,
                        gasPrice: '0x5d21dba00',
                        to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                        typeInt: 8,
                        value: '0x1',
                    },
                    type: 'TX',
                },
            ],
        }

        const address = '0x0E33D7ED19497Ffb48e59305e495Eb577dbDDF08'

        function setCallFakeForCallApi(callApiStub, queryOptions = {}) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    collectionQueryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v2/multisig/account/{address}/tx`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams.address).to.equal(address)
                    expect(Object.keys(queryParams).length).to.equal(4)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams['from-timestamp']).to.equal(queryOptions.fromTimestamp)
                    expect(queryParams['to-timestamp']).to.equal(queryOptions.toTimestamp)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-146: should return multisig account transactions without query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address)

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-147: should return multisig account transactions with query parameters (size)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { size: 1 }
            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, queryParams)

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-148: should return multisig account transactions with query parameters (from-timestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'from-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, queryParams)

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-149: should return multisig account transactions with query parameters (fromTimestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { fromTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, queryParams)

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-150: should return multisig account transactions with query parameters (to-timestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'to-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, queryParams)

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-151: should return multisig account transactions with query parameters (toTimestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { toTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, queryParams)

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-152: should return multisig account transactions with query parameters (cursor)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, queryParams)

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-153: should return multisig account transactions with query parameters (size, fromTimestamp, toTimestamp, cursor)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, queryParams)

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-154: should call callback function with multisig account transactions', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, () => {
                isCalled = true
            })

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-155: should call callback function with multisig account transactions with query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveMultisigTransactionsSpy = sandbox.spy(
                caver.kas.wallet.multisigTransactionManagementApi,
                'retrieveMultisigTransactions'
            )
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, queryParams, () => {
                isCalled = true
            })

            expect(retrieveMultisigTransactionsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-156: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                fromTimestamp: Date.now(),
            }
            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.getMultiSigTransactionList(address, queryParams)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.signMultiSigTransction', () => {
        const resultOfApi = {
            signedWeight: 1,
            status: 'Signed',
            threshold: 3,
            transactionId: '0x9d47cff9b32facd0c95df3c210df237c4d63fc36946e7b48def50774aeb9cc0e',
            weight: 1,
            reminders: ['0xb96458616FcDA8E1177bada2e4643a9194b1bD04', '0x73FE9D696F4375e30f754c2017D413938E5f697d'],
        }

        const address = '0xd0821cada8b04a60a67989748e9bdababef3de77'
        const transactionId = '0x9d47cff9b32facd0c95df3c210df237c4d63fc36946e7b48def50774aeb9cc0e'

        function setCallFakeForCallApi(callApiStub) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    collectionQueryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v2/multisig/account/{address}/tx/{transaction-id}/sign`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams.address).to.equal(address)
                    expect(pathParams['transaction-id']).to.equal(transactionId)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-157: should request sign multisig transactionto KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.multisigTransactionManagementApi, 'signPendingTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.signMultiSigTransction(address, transactionId)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-158: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.multisigTransactionManagementApi, 'signPendingTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.signMultiSigTransction(address, transactionId, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-159: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.signMultiSigTransction(address, transactionId)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.appendSignatures', () => {
        const resultOfApi = {
            signedWeight: 2,
            status: 'Signed',
            threshold: 3,
            transactionId: '0xd2578b70d6f8cf8a3dccd8b94a8655766db3a5cef9a96cb5ba5262bc1cd55b8f',
            weight: 1,
            reminders: ['0xF827A43f4b0909D8F92ba044A3f5678cd30156bb'],
        }

        const transactionId = '0xd2578b70d6f8cf8a3dccd8b94a8655766db3a5cef9a96cb5ba5262bc1cd55b8f'
        const sigsToAppend = {
            signatures: [
                {
                    R: '0xcf9c2fd2fda1e4f25ce143876fc8279a34c64d859a026bd0ef2935f1fb040caa',
                    S: '0xce0ef4e877bc61a2d32f5c87f4e2885e096921dce3e72983f77650825444b22',
                    V: '0x7f6',
                },
            ],
        }

        function setCallFakeForCallApi(callApiStub) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    collectionQueryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v2/multisig/tx/{transaction-id}/sign`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['transaction-id']).to.equal(transactionId)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.signatures).not.to.be.undefined
                    expect(postBody.signatures.length).to.equal(sigsToAppend.signatures.length)
                    expect(postBody.signatures[0].V).to.equal(sigsToAppend.signatures[0].V)
                    expect(postBody.signatures[0].R).to.equal(sigsToAppend.signatures[0].R)
                    expect(postBody.signatures[0].S).to.equal(sigsToAppend.signatures[0].S)
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-160: should request append signatures multisig transactionto KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.multisigTransactionManagementApi, 'signPendingTransactionBySig')
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.appendSignatures(transactionId, sigsToAppend)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-161: should request append signatures multisig transactionto KAS with SignPendingTransactionBySigRequest', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.multisigTransactionManagementApi, 'signPendingTransactionBySig')
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.appendSignatures(transactionId, sigsToAppend)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-162: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.multisigTransactionManagementApi, 'signPendingTransactionBySig')
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.appendSignatures(transactionId, sigsToAppend, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-163: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.multisigTransactionManagementApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.appendSignatures(transactionId, sigsToAppend)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })
})
