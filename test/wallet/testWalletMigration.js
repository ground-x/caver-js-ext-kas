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
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const CaverExtKAS = require('../../index.js')

let caver
let kasKey
let kasRegistration

const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.walletAPI
const nodeAPI = require('../testEnv').auths.nodeAPI

const sandbox = sinon.createSandbox()

describe('Wallet API - Migration', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
        caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)
        caver.initNodeAPI(nodeAPI.chainId, nodeAPI.accessKeyId, nodeAPI.secretAccessKey, nodeAPI.url)

        kasKey = {
            items: [
                {
                    blob: '0x43bfd97caaeacc818cd6b62abccf21de569649f31f644142eb1fcfd5beb69e61',
                    keyId: 'krn:1001:wallet:test:account-pool:default:0xd80ff4019cfd96f0812adece82dd956c5e781b79ca707cb5e957c97f27593221',
                    krn: 'krn:1001:wallet:test:account-pool:default',
                    publicKey:
                        '0x04a081eaf8603b9be528b86da338ba8051bfc073876dbdf00f5161b393b5735f85a76634ea38c43fbbc5d7a630b76ca2a1d81d446debc937b24a77eb3b352a1b6d',
                },
            ],
        }
        kasRegistration = {
            status: 'ok',
        }
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.kas.wallet.migrateAccounts', () => {
        const nonce = 0

        // Configure fakes for key creation and account registration.
        const setMigrateStubs = (kcResult, raResult) => {
            sandbox.spy(caver.kas.wallet.keyApi, 'keyCreation')
            sandbox.spy(caver.kas.wallet.registrationApi, 'registerAccount')
            const callApiStub = sandbox.stub(caver.kas.wallet.keyApi.apiClient, 'callApi')

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
                    if (path === '/v2/key') {
                        callback(null, kcResult, { body: kcResult })
                    } else {
                        callback(null, raResult, { body: raResult })
                    }
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-203: should return status with a single key account', async () => {
            const keyring = caver.keyringContainer.keyring.generate()
            const address = keyring._address
            const key = keyring._key._privateKey

            setMigrateStubs(kasKey, kasRegistration)
            const ret = await caver.kas.wallet.migrateAccounts([{ address, key, nonce }])

            expect(ret).not.to.be.undefined
            expect(ret.status).not.to.be.undefined
            expect(ret.status).to.be.equal('ok')
        })

        it('CAVERJS-EXT-KAS-WALLET-204: should return status for a role based key account', async () => {
            const keyring = caver.keyringContainer.keyring.generate()
            const address = keyring._address
            const key = caver.wallet.keyring.generateRoleBasedKeys([2, 1, 3])

            setMigrateStubs(kasKey, kasRegistration)

            const ret = await caver.kas.wallet.migrateAccounts([{ address, key, nonce }])

            expect(ret).not.to.be.undefined
            expect(ret.status).not.to.be.undefined
            expect(ret.status).to.be.equal('ok')
        })

        it('CAVERJS-EXT-KAS-WALLET-205: should return status with a multisig key account', async () => {
            const keyring = caver.keyringContainer.keyring.generate()
            const address = keyring._address
            const key = caver.wallet.keyring.generateMultipleKeys(3)

            setMigrateStubs(kasKey, kasRegistration)

            const ret = await caver.kas.wallet.migrateAccounts([{ address, key, nonce }])

            expect(ret).not.to.be.undefined
            expect(ret.status).not.to.be.undefined
            expect(ret.status).to.be.equal('ok')
        })

        it('CAVERJS-EXT-KAS-WALLET-206: should return invalid key error', async () => {
            const keyring = caver.keyringContainer.keyring.generate()
            const address = keyring._address
            const key = caver.wallet.keyring.generateMultipleKeys(3)
            setMigrateStubs(kasKey, {
                code: 1061010,
                message:
                    "data don't exist; krn:1001:wallet:68ec0e4b-0f61-4e6f-ae35-be865ab23187:account-pool:default:0x9b2f4d85d7f7abb14db229b5a81f1bdca0aa24c8ff0c4c100b3f25098b7a6152",
                requestId: 'POST-/v2/registration/account-1607566714428099800',
            })

            const ret = await caver.kas.wallet.migrateAccounts([{ address, key, nonce }])

            expect(ret).not.to.be.undefined
            expect(ret.code).not.to.be.undefined
            expect(ret.code).to.be.equal(1061010)
        })
        it('CAVERJS-EXT-KAS-WALLET-207: should return partially failed', async () => {
            const keyring = caver.keyringContainer.keyring.generate()
            const address = keyring._address
            const key = keyring._key._privateKey

            const keyring2 = caver.keyringContainer.keyring.generate()
            const address2 = keyring2._address
            const key2 = keyring2._key._privateKey

            kasKey = {
                items: [
                    {
                        blob: '0x43bfd97caaeacc818cd6b62abccf21de569649f31f644142eb1fcfd5beb69e61',
                        keyId:
                            'krn:1001:wallet:test:account-pool:default:0xd80ff4019cfd96f0812adece82dd956c5e781b79ca707cb5e957c97f27593221',
                        krn: 'krn:1001:wallet:test:account-pool:default',
                        publicKey:
                            '0x04a081eaf8603b9be528b86da338ba8051bfc073876dbdf00f5161b393b5735f85a76634ea38c43fbbc5d7a630b76ca2a1d81d446debc937b24a77eb3b352a1b6d',
                    },
                    {
                        blob: '0x43bfd97caaeacc818cd6b62abccf21de569649f31f644142eb1fcfd5beb69e61',
                        keyId:
                            'krn:1001:wallet:test:account-pool:default:0xd80ff4019cfd96f0812adece82dd956c5e781b79ca707cb5e957c97f27593221',
                        krn: 'krn:1001:wallet:test:account-pool:default',
                        publicKey:
                            '0x04a081eaf8603b9be528b86da338ba8051bfc073876dbdf00f5161b393b5735f85a76634ea38c43fbbc5d7a630b76ca2a1d81d446debc937b24a77eb3b352a1b6d',
                    },
                ],
            }
            setMigrateStubs(kasKey, {
                failures: {
                    '0xa53333EFFd4F2c4889a23B8b0761b277b007Da4A':
                        'failed to send a raw transaction to klaytn node; -32000::invalid transaction v, r, s values of the sender',
                },
                status: 'partially failed',
            })

            const ret = await caver.kas.wallet.migrateAccounts([{ address, key, nonce }, { address: address2, key: key2, nonce }])

            expect(ret).not.to.be.undefined
            expect(ret.status).not.to.be.undefined
            expect(ret.status).to.be.equal('partially failed')
            expect(ret.failures).not.to.be.undefined
            expect(ret.failures['0xa53333EFFd4F2c4889a23B8b0761b277b007Da4A']).to.be.equal(
                'failed to send a raw transaction to klaytn node; -32000::invalid transaction v, r, s values of the sender'
            )
        })
    })
})
