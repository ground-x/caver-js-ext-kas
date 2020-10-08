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

describe('Wallet Statistics API', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.kas.wallet.getAccountCount', () => {
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
                    expect(path).to.equal(`/v2/stat/count`)
                    expect(mtd).to.equal(`GET`)
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

        it('CAVERJS-EXT-KAS-WALLET-163: should return count of accounts in KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getCreateAccountSpy = sandbox.spy(caver.kas.wallet.statisticsApi, 'getAccountCountByAccountID')
            const callApiStub = sandbox.stub(caver.kas.wallet.statisticsApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getAccountCount()

            expect(getCreateAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-164: should call callback function with count of accounts in KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getCreateAccountSpy = sandbox.spy(caver.kas.wallet.statisticsApi, 'getAccountCountByAccountID')
            const callApiStub = sandbox.stub(caver.kas.wallet.statisticsApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false
            const ret = await caver.kas.wallet.getAccountCount(() => {
                isCalled = true
            })

            expect(getCreateAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-165: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.statisticsApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.getAccountCount()

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.getAccountCountByKRN', () => {
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

        const krn = 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default'

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
                    expect(path).to.equal(`/v2/stat/count/krn`)
                    expect(mtd).to.equal(`GET`)
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

        it('CAVERJS-EXT-KAS-WALLET-166: should return count of accounts in KAS by KRN', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getCreateAccountSpy = sandbox.spy(caver.kas.wallet.statisticsApi, 'getAccountCountByKRN')
            const callApiStub = sandbox.stub(caver.kas.wallet.statisticsApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getAccountCountByKRN(krn)

            expect(getCreateAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-167: should call callback function with count of accounts in KAS by KRN', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const getCreateAccountSpy = sandbox.spy(caver.kas.wallet.statisticsApi, 'getAccountCountByKRN')
            const callApiStub = sandbox.stub(caver.kas.wallet.statisticsApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false
            const ret = await caver.kas.wallet.getAccountCountByKRN(krn, () => {
                isCalled = true
            })

            expect(getCreateAccountSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-168: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.statisticsApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.getAccountCountByKRN(krn)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })
})
