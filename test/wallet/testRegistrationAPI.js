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

    context('caver.kas.wallet.registerAccounts', () => {
        const resultOfApi = { status: 'ok' }

        const keyId =
            'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:key-pool:default:0xb08678c129afd4a5961e7f039f63720bedb6ff4ef94683cd7389c4a4b61fa4ca'
        const rlp = '0x02a10327a5b5bb7cc744ce17e8a95672d206218c4aa4f49a637455d13608ef96d1b7b1'

        function setCallFakeForCallApi(callApiStub, accounts) {
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
                    expect(path).to.equal(`/v2/registration/account`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    for (let i = 0; i < accounts.length; i++) {
                        const account = accounts[i]
                        expect(postBody[i].keyId).to.equal(account.keyId)
                        expect(postBody[i].address).to.equal(account.address)
                        expect(postBody[i].rlp).to.equal(account.rlp)
                    }
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-220: should register account to KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const registerAccountsSpy = sandbox.spy(caver.kas.wallet.registrationApi, 'registerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.registrationApi.apiClient, 'callApi')

            const accounts = [
                {
                    keyId,
                    address: caver.keyringContainer.keyring.generate().address,
                },
                {
                    keyId,
                    address: caver.keyringContainer.keyring.generate().address,
                    rlp,
                },
            ]
            setCallFakeForCallApi(callApiStub, accounts)

            const ret = await caver.kas.wallet.registerAccounts(accounts)

            expect(registerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-221: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const registerAccountsSpy = sandbox.spy(caver.kas.wallet.registrationApi, 'registerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.registrationApi.apiClient, 'callApi')

            const accounts = [
                {
                    keyId,
                    address: caver.keyringContainer.keyring.generate().address,
                },
                {
                    keyId,
                    address: caver.keyringContainer.keyring.generate().address,
                    rlp,
                },
            ]
            setCallFakeForCallApi(callApiStub, accounts)

            let isCalled = false

            const ret = await caver.kas.wallet.registerAccounts(accounts, () => {
                isCalled = true
            })

            expect(registerAccountsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-222: should throw error when account does not have required fields', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const expectedError = 'Invalid account information. The keyId and address should be defined.'

            let accounts = [{ keyId }]

            expect(() => caver.kas.wallet.registerAccounts(accounts)).to.throw(expectedError)

            accounts = [{ address: caver.keyringContainer.keyring.generate().address }]

            expect(() => caver.kas.wallet.registerAccounts(accounts)).to.throw(expectedError)

            accounts = [{ rlp }]

            expect(() => caver.kas.wallet.registerAccounts(accounts)).to.throw(expectedError)
        })
    })
})
