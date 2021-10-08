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

    context('caver.kas.wallet.createKeys', () => {
        const resultOfApi = {
            items: [
                {
                    blob:
                        '0x06000000c0010000c00100002b640517403ad30006d7224843fc947c3861eee76fd757f4e4ea39d59445a144b2add28c2fb6efc15e48d8aa76b5788292d8e906e1e847e8ff5464d7c4f22f55c5c8e610730d5359aa8ce2a498bec2767123f15e65247caabe025c01e8bec9bb70b1322d0579acc769bc6c2a21a328a9570603302901d8559d6b56db1c9634459932ce0e04b5801ead5df2f3695116eb7404ee8132e7d4bb93652551f4069a3b3519853923450d63c40a65c69ddb34d465444e1d97537892b3725b82aadb3ca34af5564e20895b3362137e2f9db69e06939a3d6126b6123af05440fb78c9ced5bb9df1c4ca536067b6f212716f03bc2126c24b0e0be88f9e0596c9b34764a24e05687181c828c37dea02ff2cf12e35ff612019f14461c59f73e0022ce14da7bfd5e273895336093d66bfcf9703a80532f0aeb926323733c51a28fdc19fa911c801e6f378e3f50c8bdc253e50adc88e04277aeabc038fed1b5e68de658f64eb6e074a014f843df80538b592c9332ef6d47d3eb890c2c07510c2ccb963bad435addc6f2f0e0bafedbded9b8034f57a387df64e64fc69ebc9b2d47993f75160ec33d91bdd9506c4a22354ace3c9a80eaa5470e273840fb43530086d30f4d489428c3ff2f9d8cc15e306085c4bd2f207d5e1824324c7697a53ce99e97d44b4435683ccc09de54594ea44de000080',
                    keyId:
                        'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default:0xb08678c129afd4a5961e7f039f63720bedb6ff4ef94683cd7389c4a4b61fa4ca',
                    krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default',
                    publicKey:
                        '0x045e8d6cb51d937dc62edc53f7b08e0ba29005111ea823b9e4268fc74541cf615a829379cad916dcb85494f28e3fb97eb5a6c379c1dd49aa209918a0671e34c423',
                },
                {
                    blob:
                        '0x06000000c0010000c00100002b640517403ad30006d7224843fc947c3861eee76fd757f4e4ea39d59445a144b2add28c2fb6efc15e48d8aa76b5788292d8e906e1e847e8ff5464d7c4f22f55c5c8e610730d5359aa8ce2a498bec2767123f15e65247caabe025c01e8bec9bb70b1322d0579acc769bc6c2a21a328a9570603302901d8559d6b56db1c9634459932ce0e04b5801ead5df2f3695116eb7404ee8132e7d4bb93652551f4069a3b3519853923450d63c40a65c69ddb34d465444e1d97537892b3725b82aadb3ca34af5564e20895b3362137e2f9db69e06939a3d6126b6123af05440fb78c9ced5bb9df1c4ca536067b6f212716f03bc2126c24b0e0be88f9e0596c9b34764a24e05687181c828c37dea02ff2cf12e35ff612019f14461c59f73e0022ce14da7bfd5e273895336093d66bfcf9703a80532f0aeb926323733c51a28fdc19fa911c801e6f378e3f50c8bdc253e50adc88e04277aeabc038fed1b5e68de658f64eb6e074a014f843df80538b592c9332ef6d47d3eb890c2c07510c2ccb963bad435addc6f2f0e0bafedbded9b8034f57a387df64e64fc69ebc9b2d47993f75160ec33d91bdd9506c4a22354ace3c9a80eaa5470e273840fb43530086d30f4d489428c3ff2f9d8cc15e306085c4bd2f207d5e1824324c7697a53ce99e97d44b4435683ccc09de54594ea44de000080',
                    keyId:
                        'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default:0xb08678c129afd4a5961e7f039f63720bedb6ff4ef94683cd7389c4a4b61fa4ca',
                    krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default',
                    publicKey:
                        '0x045e8d6cb51d937dc62edc53f7b08e0ba29005111ea823b9e4268fc74541cf615a829379cad916dcb85494f28e3fb97eb5a6c379c1dd49aa209918a0671e34c423',
                },
            ],
        }

        const numberOfKeysToCreate = 2

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
                    expect(path).to.equal(`/v2/key`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.size).to.eq(numberOfKeysToCreate)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-212: should create keys from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const createKeysSpy = sandbox.spy(caver.kas.wallet.keyApi, 'keyCreation')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.createKeys(numberOfKeysToCreate)

            expect(createKeysSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items.length).to.equal(numberOfKeysToCreate)
        })

        it('CAVERJS-EXT-KAS-WALLET-213: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const createKeysSpy = sandbox.spy(caver.kas.wallet.keyApi, 'keyCreation')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.createKeys(numberOfKeysToCreate, () => {
                isCalled = true
            })

            expect(createKeysSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items.length).to.equal(numberOfKeysToCreate)
        })
    })

    context('caver.kas.wallet.getKey', () => {
        const resultOfApi = {
            blob:
                '0x06000000c0010000c00100002b640517403ad30006d7224843fc947c3861eee76fd757f4e4ea39d59445a144b2add28c2fb6efc15e48d8aa76b5788292d8e906e1e847e8ff5464d7c4f22f55c5c8e610730d5359aa8ce2a498bec2767123f15e65247caabe025c01e8bec9bb70b1322d0579acc769bc6c2a21a328a9570603302901d8559d6b56db1c9634459932ce0e04b5801ead5df2f3695116eb7404ee8132e7d4bb93652551f4069a3b3519853923450d63c40a65c69ddb34d465444e1d97537892b3725b82aadb3ca34af5564e20895b3362137e2f9db69e06939a3d6126b6123af05440fb78c9ced5bb9df1c4ca536067b6f212716f03bc2126c24b0e0be88f9e0596c9b34764a24e05687181c828c37dea02ff2cf12e35ff612019f14461c59f73e0022ce14da7bfd5e273895336093d66bfcf9703a80532f0aeb926323733c51a28fdc19fa911c801e6f378e3f50c8bdc253e50adc88e04277aeabc038fed1b5e68de658f64eb6e074a014f843df80538b592c9332ef6d47d3eb890c2c07510c2ccb963bad435addc6f2f0e0bafedbded9b8034f57a387df64e64fc69ebc9b2d47993f75160ec33d91bdd9506c4a22354ace3c9a80eaa5470e273840fb43530086d30f4d489428c3ff2f9d8cc15e306085c4bd2f207d5e1824324c7697a53ce99e97d44b4435683ccc09de54594ea44de000080',
            keyId:
                'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default:0xb08678c129afd4a5961e7f039f63720bedb6ff4ef94683cd7389c4a4b61fa4ca',
            krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default',
            publicKey:
                '0x045e8d6cb51d937dc62edc53f7b08e0ba29005111ea823b9e4268fc74541cf615a829379cad916dcb85494f28e3fb97eb5a6c379c1dd49aa209918a0671e34c423',
        }

        const keyId =
            'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default:0xb08678c129afd4a5961e7f039f63720bedb6ff4ef94683cd7389c4a4b61fa4ca'

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
                    expect(path).to.equal(`/v2/key/{key-id}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['key-id']).to.equal(keyId)
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

        it('CAVERJS-EXT-KAS-WALLET-212: should get key from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getKeySpy = sandbox.spy(caver.kas.wallet.keyApi, 'getKey')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getKey(keyId)

            expect(getKeySpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.keyId).to.equal(keyId)
        })

        it('CAVERJS-EXT-KAS-WALLET-213: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getKeySpy = sandbox.spy(caver.kas.wallet.keyApi, 'getKey')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.getKey(keyId, () => {
                isCalled = true
            })

            expect(getKeySpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.keyId).to.equal(keyId)
        })
    })

    context('caver.kas.wallet.signMessage', () => {
        const resultOfApi = {
            signedData:
                '0xddb585c7eed8a09e4a7ee0d749556a05668c7c40d3ff3c79a6803c61d774b78b58779a5955343bd194964f6e0e3e18bd0d5de61e32327706a3a36d40fab4298d01',
        }

        const keyId =
            'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default:0xb08678c129afd4a5961e7f039f63720bedb6ff4ef94683cd7389c4a4b61fa4ca'
        const dataToSign = '0x88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589'

        function setCallFakeForCallApi(callApiStub, krn) {
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
                    expect(path).to.equal(`/v2/key/{key-id}/sign`)
                    expect(mtd).to.equal(`POST`)
                    expect(pathParams['key-id']).to.equal(keyId)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    if (krn !== undefined) {
                        expect(headerParams['x-krn']).to.equal(krn)
                    }
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.data).to.eq(dataToSign)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-216: should sign message with key in KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const keySignDataSpy = sandbox.spy(caver.kas.wallet.keyApi, 'keySignData')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.signMessage(keyId, dataToSign)

            expect(keySignDataSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.signedData).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-218: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const keySignDataSpy = sandbox.spy(caver.kas.wallet.keyApi, 'keySignData')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.signMessage(keyId, dataToSign, () => {
                isCalled = true
            })

            expect(keySignDataSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.signedData).not.to.be.undefined
        })
    })

    context('caver.kas.wallet.deleteKey', () => {
        const resultOfApi = { status: 'deleted' }

        const keyId =
            'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default:0xb08678c129afd4a5961e7f039f63720bedb6ff4ef94683cd7389c4a4b61fa4ca'

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
                    expect(path).to.equal(`/v2/key/{key-id}`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(pathParams['key-id']).to.equal(keyId)
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

        it('CAVERJS-EXT-KAS-WALLET-239: should delete key from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const keyDeletionSpy = sandbox.spy(caver.kas.wallet.keyApi, 'keyDeletion')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.deleteKey(keyId)

            expect(keyDeletionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('deleted')
        })

        it('CAVERJS-EXT-KAS-WALLET-240: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const keyDeletionSpy = sandbox.spy(caver.kas.wallet.keyApi, 'keyDeletion')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.deleteKey(keyId, () => {
                isCalled = true
            })

            expect(keyDeletionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('deleted')
        })
    })

    context('caver.kas.wallet.getKeyListByKRN', () => {
        const resultOfApi = {
            items: [
                {
                    keyId:
                        'krn:1001:wallet:676de94a-9ca9-45e2-a67b-ed72178cdbcc:key-pool:default:0xce662e6eab8bf2b135664042150cf56e198e43a01d815a30227cd3f498c632c2',
                    krn: 'krn:1001:wallet:676de94a-9ca9-45e2-a67b-ed72178cdbcc:key-pool:default',
                    publicKey:
                        '0x04c394fdc6b7e29d733c6004316a283d9d83771ccbfa4e3983a8c5b71aad7933d943aa2760f46b750d76af5692d4d43f3a48ea4c6c6d829cdb40edd274cb18d85a',
                },
            ],
            cursor: '',
        }

        const krn = 'krn:1001:wallet:676de94a-9ca9-45e2-a67b-ed72178cdbcc:key-pool:default'

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
                    expect(path).to.equal(`/v2/key`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(3)
                    expect(queryParams.krn).to.equal(krn)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
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

        it('CAVERJS-EXT-KAS-WALLET-242: should return key list from KAS without query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveKeysSpy = sandbox.spy(caver.kas.wallet.keyApi, 'retrieveKeys')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getKeyListByKRN(krn)

            expect(retrieveKeysSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-243: should return key list from KAS with query parameters (size)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveKeysSpy = sandbox.spy(caver.kas.wallet.keyApi, 'retrieveKeys')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')

            const queryParams = { size: 1 }
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getKeyListByKRN(krn, queryParams)

            expect(retrieveKeysSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-244: should return key list from KAS with query parameters (cursor)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveKeysSpy = sandbox.spy(caver.kas.wallet.keyApi, 'retrieveKeys')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')

            const queryParams = {
                curosr:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ',
            }
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getKeyListByKRN(krn, queryParams)

            expect(retrieveKeysSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-245: should return key list from KAS with query parameters (all)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveKeysSpy = sandbox.spy(caver.kas.wallet.keyApi, 'retrieveKeys')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')

            const queryParams = {
                size: 1,
                curosr:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ',
            }
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getKeyListByKRN(krn, queryParams)

            expect(retrieveKeysSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-246: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveKeysSpy = sandbox.spy(caver.kas.wallet.keyApi, 'retrieveKeys')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.wallet.getKeyListByKRN(krn, () => {
                isCalled = true
            })

            expect(retrieveKeysSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-247: should call callback function with api result and query parameters', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const retrieveKeysSpy = sandbox.spy(caver.kas.wallet.keyApi, 'retrieveKeys')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const queryParams = {
                size: 1,
                curosr:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ',
            }
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.wallet.getKeyListByKRN(krn, queryParams, () => {
                isCalled = true
            })

            expect(retrieveKeysSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).not.to.be.undefined
        })
    })
})
