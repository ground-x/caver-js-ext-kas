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

describe('Wallet API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.initWalletAPI', () => {
        it('CAVERJS-EXT-KAS-WALLET-001: should return error if anchorAPI is not initialized', async () => {
            const expectedError = `Wallet API is not initialized. Use 'caver.initWalletAPI' function to initialize Wallet API.`
            expect(() => caver.kas.wallet.createAccount()).to.throw(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-002: should set valid auth and chain id', () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            expect(caver.kas.wallet.accessOptions).not.to.be.undefined
            expect(caver.kas.wallet.accessKeyId).to.equal(accessKeyId)
            expect(caver.kas.wallet.secretAccessKey).to.equal(secretAccessKey)
            expect(caver.kas.wallet.auth).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(caver.kas.wallet.chainId).to.equal(chainId)
            expect(caver.kas.wallet.apiInstances).not.to.be.undefined
            expect(caver.kas.wallet.accountApi).not.to.be.undefined
            expect(caver.kas.wallet.basicTransactionApi).not.to.be.undefined
            expect(caver.kas.wallet.fdTransactionPaidByKASApi).not.to.be.undefined
            expect(caver.kas.wallet.fdTransactionPaidByUserApi).not.to.be.undefined
            expect(caver.kas.wallet.multisigTransactionManagementApi).not.to.be.undefined
            expect(caver.kas.wallet.statisticsApi).not.to.be.undefined
        })
    })

    context('caver.kas.wallet.createAccount', () => {
        const resultOfApi = {
            address: '0xAe85f5A090e0e9Df46ca796d70F324A5076ae595',
            chainId: 1001,
            createdAt: 1600324326,
            keyId:
                'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default:0xd76f9136b987804c2b37c88a07a54ab4708383ab52c1758d940e2e18a79c0a42',
            krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
            publicKey:
                '0x042ebd0f9b684813c9576b02a514c804f493a0192897ac2a911cf20f80b9284aedd745461acb0bc4ec4575468ed7e74f6dfda6eedd2c904d4d00c104bdf3ad0805',
            updatedAt: 1600324326,
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
                    expect(path).to.equal(`/v2/account`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
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

        it('CAVERJS-EXT-KAS-WALLET-003: should create account in KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const createAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'createAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.createAccount()

            expect(createAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-004: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const createAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'createAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.createAccount(() => {
                isCalled = true
            })

            expect(createAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-005: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.createAccount()

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.getAccountList', () => {
        const resultOfApi = {
            cursor: '',
            items: [
                {
                    address: '0x0E33D7ED19497Ffb48e59305e495Eb577dbDDF08',
                    chainId: 1001,
                    createdAt: 1600324481,
                    keyId:
                        'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default:0xb72d55caf35c8cad0aad0816f0b36e4dd479d6b610deaf75f6f317147968c3b7',
                    krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
                    publicKey:
                        '0x047ba3bd0562dd13b7568d323f8eeeb0707574fe186d3dab4615b7ef210538655d94d2adef65b4fe803ea5f6994a398fffb8008fc5ee5c39d881ebbe98be0288c3',
                    updatedAt: 1600324481,
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
                    expect(path).to.equal(`/v2/account`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
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

        it('CAVERJS-EXT-KAS-WALLET-006: should return accounts without query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getAccountList()

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-007: should return accounts with query parameters (size)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { size: 1 }
            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getAccountList(queryParams)

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-008: should return accounts with query parameters (from-timestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'from-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getAccountList(queryParams)

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-009: should return accounts with query parameters (fromTimestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { fromTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getAccountList(queryParams)

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-010: should return accounts with query parameters (to-timestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'to-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getAccountList(queryParams)

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-011: should return accounts with query parameters (toTimestamp)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { toTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getAccountList(queryParams)

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-012: should return accounts with query parameters (cursor)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getAccountList(queryParams)

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-013: should return accounts with query parameters (size, fromTimestamp, toTimestamp, cursor)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.wallet.getAccountList(queryParams)

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-014: should call callback function with accounts', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.getAccountList(() => {
                isCalled = true
            })

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-015: should call callback function with accounts with query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.wallet.queryOptions.constructFromObject(queryParams)
            const retrieveAccountsSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccounts')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.wallet.getAccountList(queryParams, () => {
                isCalled = true
            })

            expect(retrieveAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-016: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                fromTimestamp: Date.now(),
            }
            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.getAccountList(queryParams)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.getAccount', () => {
        const resultOfApi = {
            address: '0xb2Fd3a28efC3226638B7f92D9b48C370588c49F2',
            chainId: 1001,
            createdAt: 1600324591,
            keyId:
                'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default:0x7ab8c46b0bca531450071c9c47df26b05aeb761246d9ce60d5ed66ab1b6d472d',
            krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
            publicKey:
                '0x04c55da8af4150e038cd9d9e406917eece49dbbc9282ac04b8194ef9303e9fa344d17a4f0437dd44f61ec11959a7bcb6370af2f0d0206a36571888e23337eee8a4',
            updatedAt: 1600324591,
        }
        const address = '0xb2Fd3a28efC3226638B7f92D9b48C370588c49F2'

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
                    expect(path).to.equal(`/v2/account/{address}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams.address).to.equal(address)
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

        it('CAVERJS-EXT-KAS-WALLET-017: should return account from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getAccount(address)

            expect(retrieveAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-018: should call callback function with account', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false
            const ret = await caver.kas.wallet.getAccount(address, () => {
                isCalled = true
            })

            expect(retrieveAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-019: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.getAccount(address)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.getAccountListByPublicKey', () => {
        const resultOfApi = {
            items: [
                {
                    address: '0x5dE953B53d408fF2c7a59988930e82FD48DCd7b4',
                    chainId: 1001,
                },
            ],
        }
        const publicKey =
            '0x04c55da8af4150e038cd9d9e406917eece49dbbc9282ac04b8194ef9303e9fa344d17a4f0437dd44f61ec11959a7bcb6370af2f0d0206a36571888e23337eee8a4'

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
                    expect(path).to.equal(`/v2/pubkey/{public-key}/account`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['public-key']).to.equal(publicKey)
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

        it('CAVERJS-EXT-KAS-WALLET-020: should return account', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveAccountsByPubkeySpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccountsByPubkey')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getAccountListByPublicKey(publicKey)

            expect(retrieveAccountsByPubkeySpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-021: should call callback function with account', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveAccountsByPubkeySpy = sandbox.spy(caver.kas.wallet.accountApi, 'retrieveAccountsByPubkey')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false
            const ret = await caver.kas.wallet.getAccountListByPublicKey(publicKey, () => {
                isCalled = true
            })

            expect(retrieveAccountsByPubkeySpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-022: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.getAccountListByPublicKey(publicKey)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.deleteAccount', () => {
        const resultOfApi = { status: 'deleted' }

        const address = '0x72A328cEB689962B66d3af17BD50a6003f42ca01'

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
                    expect(path).to.equal(`/v2/account/{address}`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(pathParams.address).to.equal(address)
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

        it('CAVERJS-EXT-KAS-WALLET-023: should return operators without query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const deleteAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'deleteAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.deleteAccount(address)

            expect(deleteAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-024: should call callback function with operators', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const deleteAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'deleteAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.deleteAccount(address, () => {
                isCalled = true
            })

            expect(deleteAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-025: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.deleteAccount(address)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.disableAccount', () => {
        const resultOfApi = {
            address: '0x03ef0d8F4F019b42CfA5321Da10F0704B7aa9847',
            krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
            updatedAt: 1600324841,
        }

        const address = '0x72A328cEB689962B66d3af17BD50a6003f42ca01'

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
                    expect(path).to.equal(`/v2/account/{address}/disable`)
                    expect(mtd).to.equal(`PUT`)
                    expect(pathParams.address).to.equal(address)
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

        it('CAVERJS-EXT-KAS-WALLET-026: should deactive account', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const deactivateAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'deactivateAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.disableAccount(address)

            expect(deactivateAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-027: should call callback function with result of deactive', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const deactivateAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'deactivateAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.disableAccount(address, () => {
                isCalled = true
            })

            expect(deactivateAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-028: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.disableAccount(address)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.enableAccount', () => {
        const resultOfApi = {
            address: '0x03ef0d8F4F019b42CfA5321Da10F0704B7aa9847',
            krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
            updatedAt: 1600324841,
        }

        const address = '0x72A328cEB689962B66d3af17BD50a6003f42ca01'

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
                    expect(path).to.equal(`/v2/account/{address}/enable`)
                    expect(mtd).to.equal(`PUT`)
                    expect(pathParams.address).to.equal(address)
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

        it('CAVERJS-EXT-KAS-WALLET-029: should active account', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const activateAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'activateAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.enableAccount(address)

            expect(activateAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-030: should call callback function with result of enable', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const activateAccountSpy = sandbox.spy(caver.kas.wallet.accountApi, 'activateAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.enableAccount(address, () => {
                isCalled = true
            })

            expect(activateAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-031: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.enableAccount(address)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.signTransaction', () => {
        const resultOfApi = {
            R: '0x34878cefa49409365891a4ee36004fb02069fc708faa0a601ba05b7a74cd13cf',
            S: '0x40b44e1def6a5f914ea52e036ce77a76101cfc2af310cedd8a66a8b76040b0d7',
            V: '0x7f6',
        }

        const address = '0xd0821cada8b04a60a67989748e9bdababef3de77'
        const tranactionId = '0xa1dd87c94712f918e32e5310197f03b49025a4f4d74872e5bf85958cc4ca814c'

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
                    expect(path).to.equal(`/v2/account/{address}/tx/{transaction-id}/sign`)
                    expect(mtd).to.equal(`POST`)
                    expect(pathParams.address).to.equal(address)
                    expect(pathParams['transaction-id']).to.equal(tranactionId)
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

        it('CAVERJS-EXT-KAS-WALLET-032: should call sign transaction api', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const signTransactionIDResponseSpy = sandbox.spy(caver.kas.wallet.accountApi, 'signTransactionIDResponse')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.signTransaction(address, tranactionId)

            expect(signTransactionIDResponseSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-033: should call callback function with result of signing', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const signTransactionIDResponseSpy = sandbox.spy(caver.kas.wallet.accountApi, 'signTransactionIDResponse')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.signTransaction(address, tranactionId, () => {
                isCalled = true
            })

            expect(signTransactionIDResponseSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-034: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.signTransaction(address, tranactionId)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.updateToMultiSigAccount', () => {
        const resultOfApi = {
            address: '0x56D5711F811392628e891C03514b8432e6bc1884',
            krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
            threshold: 3,
            transactionHash: '0x4d59438907d7a0c8060ea871368abde25278cd70c5407568ad5bb5fe2729efd3',
            updatedAt: 1600325411,
            multiSigKeys: [
                {
                    publicKey:
                        '0x04a873460200b4e9f7d9d42f23da926daedc36f38df33b8b8d5bef91870f35f7ec716a9a7c2c923c720261330cb06df9b4019a3dadc2fd7e4c209443ea3903db72',
                    weight: 1,
                },
                {
                    publicKey:
                        '0x04684cb620970f67bc0ebf81b92393f503dbd53d6d7250e8758621ba6856120decb24936bcc34f5cbd550a1b8e2aa3e80f475aff2fa1f4a73f27fe1b204bc853c4',
                    weight: 1,
                },
                {
                    publicKey:
                        '0x046b94138211ac37df552ad5469abfe695557fea82abe4a1969a62119f29e61551a78ae051d8bcbc4e53effa8a40a4022d9f4dfd85977dab57bf8232a27cef6eec',
                    weight: 1,
                },
            ],
        }

        const address = '0x56D5711F811392628e891C03514b8432e6bc1884'
        const weightedMultiSig = {
            threshold: 3,
            weightedKeys: [
                {
                    publicKey:
                        '0x04a873460200b4e9f7d9d42f23da926daedc36f38df33b8b8d5bef91870f35f7ec716a9a7c2c923c720261330cb06df9b4019a3dadc2fd7e4c209443ea3903db72',
                    weight: 1,
                },
                {
                    publicKey:
                        '0x04684cb620970f67bc0ebf81b92393f503dbd53d6d7250e8758621ba6856120decb24936bcc34f5cbd550a1b8e2aa3e80f475aff2fa1f4a73f27fe1b204bc853c4',
                    weight: 1,
                },
                {
                    publicKey:
                        '0x046b94138211ac37df552ad5469abfe695557fea82abe4a1969a62119f29e61551a78ae051d8bcbc4e53effa8a40a4022d9f4dfd85977dab57bf8232a27cef6eec',
                    weight: 1,
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
                    expect(path).to.equal(`/v2/account/{address}/multisig`)
                    expect(mtd).to.equal(`PUT`)
                    expect(pathParams.address).to.equal(address)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody.threshold).to.equal(weightedMultiSig.threshold)
                    expect(postBody.weightedKeys.length).to.equal(weightedMultiSig.weightedKeys.length)
                    for (let i = 0; i < postBody.weightedKeys.length; i++) {
                        expect(weightedMultiSig.weightedKeys[i].weight).to.equal(postBody.weightedKeys[i].weight)
                        expect(weightedMultiSig.weightedKeys[i].publicKey).to.equal(postBody.weightedKeys[i].publicKey)
                    }
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-035: should send post request to update account to multisig', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.wallet.accountApi, 'multisigAccountUpdate')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.updateToMultiSigAccount(address, weightedMultiSig)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-036: should call callback function with update result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.wallet.accountApi, 'multisigAccountUpdate')
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.updateToMultiSigAccount(address, weightedMultiSig, () => {
                isCalled = true
            })

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-037: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.accountApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.updateToMultiSigAccount(address, weightedMultiSig)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })
})
