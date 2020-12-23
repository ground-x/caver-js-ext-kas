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
const KASWallet = require('../../src/wallet/kasWallet')

let caver
const auths = require('../testEnv').auths

const sandbox = sinon.createSandbox()

describe('caver.wallet with KASWallet', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
        caver.initNodeAPI(auths.nodeAPI.chainId, auths.nodeAPI.accessKeyId, auths.nodeAPI.secretAccessKey, auths.nodeAPI.url)
        caver.initWalletAPI(auths.walletAPI.chainId, auths.walletAPI.accessKeyId, auths.walletAPI.secretAccessKey, auths.walletAPI.url)
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('CaverExtKAS use a KASWallet as caver.wallet', () => {
        it('CAVERJS-EXT-KAS-WALLET-169: caver.wallet should be an instance of KASWallet', () => {
            expect(caver.wallet instanceof KASWallet).to.be.true
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-170: caver.keyringContainer should be available', () => {
            expect(caver.keyringContainer).not.to.be.undefined
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-171: caver.wallet.keyring should be available', () => {
            expect(caver.wallet.keyring).not.to.be.undefined
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-202: keyring can be accessed through keyringContainer', () => {
            const keyringContainer = new caver.keyringContainer()
            expect(keyringContainer.keyring).not.to.be.undefined
        }).timeout(50000)
    })

    context('caver.wallet.generate', () => {
        it('CAVERJS-EXT-KAS-WALLET-172: caver.wallet.generate generates account in wallet api', async () => {
            const resultOfCreateAccount = {
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

            const createAccountStub = sandbox.stub(caver.wallet.walletAPI, 'createAccount')
            createAccountStub.resolves(resultOfCreateAccount)

            const numOfAccounts = 3
            const addresses = await caver.wallet.generate(numOfAccounts)

            expect(createAccountStub.callCount).to.equal(numOfAccounts)
            expect(addresses.length).to.equal(numOfAccounts)
        }).timeout(50000)
    })

    context('caver.wallet.getAccount', () => {
        it('CAVERJS-EXT-KAS-WALLET-173: caver.wallet.getAccount query account from KAS Wallet API Service', async () => {
            const resultOfGetAccount = {
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

            const getAccountStub = sandbox.stub(caver.wallet.walletAPI, 'getAccount')
            getAccountStub.resolves(resultOfGetAccount)

            const address = '0xb2Fd3a28efC3226638B7f92D9b48C370588c49F2'
            const account = await caver.wallet.getAccount(address)

            expect(getAccountStub.called).to.be.true
            expect(account.address).to.equal(address)
        }).timeout(50000)
    })

    context('caver.wallet.isExisted', () => {
        it('CAVERJS-EXT-KAS-WALLET-174:  return true when account is existed in KAS Wallet API Service', async () => {
            const resultOfGetAccount = {
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

            const getAccountStub = sandbox.stub(caver.wallet.walletAPI, 'getAccount')
            getAccountStub.resolves(resultOfGetAccount)

            const address = '0xb2Fd3a28efC3226638B7f92D9b48C370588c49F2'
            const existence = await caver.wallet.isExisted(address)

            expect(getAccountStub.called).to.be.true
            expect(existence).to.be.true
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-175: caver.wallet.isExisted return false when account is not existed in KAS Wallet API Service', async () => {
            const error = { code: 1061010, message: "data don't exist" }

            const getAccountStub = sandbox.stub(caver.wallet.walletAPI, 'getAccount')
            getAccountStub.rejects(error)

            const address = '0xb2Fd3a28efC3226638B7f92D9b48C370588c49F2'
            const existence = await caver.wallet.isExisted(address)

            expect(existence).to.be.false
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-176: caver.wallet.isExisted throw error instance if something wrong with KAS Wallet API Service error object', async () => {
            const error = { code: 1061011, message: 'test error' }

            const getAccountStub = sandbox.stub(caver.wallet.walletAPI, 'getAccount')
            getAccountStub.rejects(error)

            const address = '0xb2Fd3a28efC3226638B7f92D9b48C370588c49F2'
            await expect(caver.wallet.isExisted(address)).to.be.rejectedWith('test error')
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-177: caver.wallet.isExisted throw error instance if something wrong', async () => {
            const error = new Error(`Error test`)

            const getAccountStub = sandbox.stub(caver.wallet.walletAPI, 'getAccount')
            getAccountStub.rejects(error)

            const address = '0xb2Fd3a28efC3226638B7f92D9b48C370588c49F2'
            await expect(caver.wallet.isExisted(address)).to.be.rejectedWith('Error test')
        }).timeout(50000)
    })

    context('caver.wallet.remove', () => {
        it('CAVERJS-EXT-KAS-WALLET-178: caver.wallet.remove call deleteAccount with KAS Wallet API', async () => {
            const resultOfDeleteAccount = { status: 'deleted' }

            const deleteAccountStub = sandbox.stub(caver.wallet.walletAPI, 'deleteAccount')
            deleteAccountStub.resolves(resultOfDeleteAccount)

            const address = '0xb2Fd3a28efC3226638B7f92D9b48C370588c49F2'
            const removed = await caver.wallet.remove(address)

            expect(deleteAccountStub.called).to.be.true
            expect(removed).to.be.true
        }).timeout(50000)
    })

    context('caver.wallet.disableAccount', () => {
        it('CAVERJS-EXT-KAS-WALLET-192: caver.wallet.disableAccount return accounts from KAS Wallet API Service', async () => {
            const resultOfDisableAccount = {
                address: '0x03ef0d8F4F019b42CfA5321Da10F0704B7aa9847',
                krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
                updatedAt: 1600324841,
            }

            const disableAccountStub = sandbox.stub(caver.wallet.walletAPI, 'disableAccount')
            disableAccountStub.resolves(resultOfDisableAccount)

            const disabled = await caver.wallet.disableAccount()

            expect(disableAccountStub.called).to.be.true
            expect(disabled.address).not.to.be.undefined
        }).timeout(50000)
    })

    context('caver.wallet.enableAccount', () => {
        it('CAVERJS-EXT-KAS-WALLET-193: caver.wallet.enableAccount return accounts from KAS Wallet API Service', async () => {
            const resultOfDisableAccount = {
                address: '0x03ef0d8F4F019b42CfA5321Da10F0704B7aa9847',
                krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
                updatedAt: 1600324841,
            }

            const enableAccountStub = sandbox.stub(caver.wallet.walletAPI, 'enableAccount')
            enableAccountStub.resolves(resultOfDisableAccount)

            const enabled = await caver.wallet.enableAccount()

            expect(enableAccountStub.called).to.be.true
            expect(enabled.address).not.to.be.undefined
        }).timeout(50000)
    })

    context('caver.wallet.sign', () => {
        const resultOfSigning = {
            from: '0x418dad870aaaad954f245b3d0c4c13ff6a6dc201',
            gas: 25000,
            gasPrice: '0x5d21dba00',
            nonce: 1,
            rlp:
                '0x08f87e018505d21dba008261a89476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194418dad870aaaad954f245b3d0c4c13ff6a6dc201f847f8458207f6a0137491673d0014cca219705291f3ee7350295ef549069e639b5e9d0d8014ffd2a03289ed52548303f7f2f5fbb85e88ba7f373026178d30105f9738c71ae07b4a5a',
            typeInt: 8,
            signatures: [
                {
                    R: '0x137491673d0014cca219705291f3ee7350295ef549069e639b5e9d0d8014ffd2',
                    S: '0x3289ed52548303f7f2f5fbb85e88ba7f373026178d30105f9738c71ae07b4a5a',
                    V: '0x7f6',
                },
            ],
            status: 'Submitted',
            transactionHash: '0xc16b3c03af303224d85326894eaf59c46c11f64cd5bb991ee6e03cfbb328acb8',
            value: '0x1',
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
        }

        const address = '0x418dad870aaaad954f245b3d0c4c13ff6a6dc201'

        let tx
        let fdtx

        beforeEach(() => {
            tx = new caver.transaction.valueTransfer({
                from: address,
                to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                value: 1,
                gas: 25000,
                nonce: 1,
                gasPrice: '0x5d21dba00',
                chainId: 1001,
            })

            fdtx = new caver.transaction.feeDelegatedValueTransfer({
                from: address,
                to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                value: 1,
                gas: 25000,
                nonce: 1,
                gasPrice: '0x5d21dba00',
                chainId: 1001,
            })
        })

        it('CAVERJS-EXT-KAS-WALLET-179: caver.wallet.sign adds signatures to transaction', async () => {
            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 1, key: {} })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const basicRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestRawTransaction')
            basicRawRequestStub.resolves(resultOfSigning)
            const fdRawRequestSpy = sandbox.spy(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')

            const signed = await caver.wallet.sign(address, tx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(basicRawRequestStub.callCount).to.equal(1)
            expect(fdRawRequestSpy.called).not.to.be.true
            expect(appendSignaturesSpy.called).not.to.be.true
            expect(signed.signatures.length).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-180: caver.wallet.sign appends signatures to transaction', async () => {
            tx.signatures = [
                {
                    R: '0x237491673d0014cca219705291f3ee7350295ef549069e639b5e9d0d8014ffd5',
                    S: '0x4289ed52548303f7f2f5fbb85e88ba7f373026178d30105f9738c71ae07b4a5b',
                    V: '0x4f8',
                },
            ]

            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 1, key: {} })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const basicRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestRawTransaction')
            basicRawRequestStub.resolves(resultOfSigning)
            const fdRawRequestSpy = sandbox.spy(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')

            const signed = await caver.wallet.sign(address, tx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(basicRawRequestStub.callCount).to.equal(1)
            expect(fdRawRequestSpy.called).not.to.be.true
            expect(appendSignaturesSpy.callCount).to.equal(1)
            expect(signed.signatures.length).to.equal(2)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-181: caver.wallet.sign adds signatures to feeDelegatedTransaction', async () => {
            const getAccountKeyStub = sandbox.stub(fdtx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 1, key: {} })

            const fillTransactionSpy = sandbox.spy(fdtx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(fdtx, 'getRLPEncoding')
            const basicRawRequestSpy = sandbox.spy(caver.wallet.walletAPI, 'requestRawTransaction')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            fdRawRequestStub.resolves(resultOfSigning)
            const appendSignaturesSpy = sandbox.spy(fdtx, 'appendSignatures')

            const signed = await caver.wallet.sign(address, fdtx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(basicRawRequestSpy.called).not.to.be.true
            expect(appendSignaturesSpy.called).not.to.be.true
            expect(signed.signatures.length).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-182: caver.wallet.sign appends signatures to feeDelegatedTransaction', async () => {
            fdtx.signatures = [
                {
                    R: '0x237491673d0014cca219705291f3ee7350295ef549069e639b5e9d0d8014ffd5',
                    S: '0x4289ed52548303f7f2f5fbb85e88ba7f373026178d30105f9738c71ae07b4a5b',
                    V: '0x4f8',
                },
            ]

            const getAccountKeyStub = sandbox.stub(fdtx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 1, key: {} })

            const fillTransactionSpy = sandbox.spy(fdtx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(fdtx, 'getRLPEncoding')
            const basicRawRequestSpy = sandbox.spy(caver.wallet.walletAPI, 'requestRawTransaction')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            fdRawRequestStub.resolves(resultOfSigning)
            const appendSignaturesSpy = sandbox.spy(fdtx, 'appendSignatures')

            const signed = await caver.wallet.sign(address, fdtx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(basicRawRequestSpy.called).not.to.be.true
            expect(appendSignaturesSpy.callCount).to.equal(1)
            expect(signed.signatures.length).to.equal(2)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-183: caver.wallet.sign remove duplicated signatures to transaction', async () => {
            tx.signatures = resultOfSigning.signatures

            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 1, key: {} })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const basicRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestRawTransaction')
            basicRawRequestStub.resolves(resultOfSigning)
            const fdRawRequestSpy = sandbox.spy(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')

            const signed = await caver.wallet.sign(address, tx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(basicRawRequestStub.callCount).to.equal(1)
            expect(fdRawRequestSpy.called).not.to.be.true
            expect(appendSignaturesSpy.callCount).to.equal(1)
            expect(signed.signatures.length).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-184: caver.wallet.sign throw error when account key is accountKeyWeightedMutliSig', async () => {
            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 4, key: {} })

            const expectedError = `Not supported: Using multiple keys in an account is currently not supported.`
            await expect(caver.wallet.sign(address, tx)).to.be.rejectedWith(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-185: caver.wallet.sign signs with signle roleTransactionKey when account key is AccountKeyRoleBased', async () => {
            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 5, key: [{ keyType: 2 }, { keyType: 4 }, {}] })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const basicRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestRawTransaction')
            basicRawRequestStub.resolves(resultOfSigning)
            const fdRawRequestSpy = sandbox.spy(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            const appendSignaturesSpy = sandbox.spy(tx, 'appendSignatures')

            const signed = await caver.wallet.sign(address, tx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(basicRawRequestStub.callCount).to.equal(1)
            expect(fdRawRequestSpy.called).not.to.be.true
            expect(appendSignaturesSpy.called).not.to.be.true
            expect(signed.signatures.length).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-186: caver.wallet.sign signs with signle roleAccountUpdateKey when account key is AccountKeyRoleBased', async () => {
            const upateTx = new caver.transaction.accountUpdate({
                from: address,
                account: caver.account.createWithAccountKeyLegacy(address),
                gas: 50000,
                nonce: 1,
                gasPrice: '0x5d21dba00',
                chainId: 1001,
            })
            const getAccountKeyStub = sandbox.stub(upateTx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 5, key: [{ keyType: 4 }, { keyType: 2 }, {}] })

            const fillTransactionSpy = sandbox.spy(upateTx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(upateTx, 'getRLPEncoding')
            const basicRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestRawTransaction')
            basicRawRequestStub.resolves(resultOfSigning)
            const fdRawRequestSpy = sandbox.spy(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            const appendSignaturesSpy = sandbox.spy(upateTx, 'appendSignatures')

            const signed = await caver.wallet.sign(address, upateTx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(basicRawRequestStub.callCount).to.equal(1)
            expect(fdRawRequestSpy.called).not.to.be.true
            expect(appendSignaturesSpy.called).not.to.be.true
            expect(signed.signatures.length).to.equal(1)
        }).timeout(50000)
    })

    context('caver.wallet.signAsFeePayer', () => {
        const resultOfSigning = {
            rlp:
                '0x09f8dc038505d21dba0082c3509476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194758473e68179c446437b74ca8a74b58706792806f847f8458207f6a0ef617aa7de05d4e807bbc5b9c67ecf05ef067ca6a01aeff6cc81b1f4548216c5a023510f58c1dd82c583cd47302aac1d077c97926ba9bcaa9ca4ad0bc809cf08909444ee3906a7a2007762e9d706df6e4ef63fa1eda8f847f8458207f6a0637426d1221cf48837634c86fb31c96dc2c5f2f847cbdd8cff959308f2331cf0a02299f5f184fa1b9ba545ba6fa90474695b6e4860255f8c3837ec31495f0e0f39',
            feePayer: '0x44ee3906a7a2007762e9d706df6e4ef63fa1eda8',
            from: '0x758473e68179c446437b74ca8a74b58706792806',
            gas: 50000,
            gasPrice: '0x5d21dba00',
            nonce: 3,
            status: 'Submitted',
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            typeInt: 9,
            value: '0x1',
            signatures: [
                {
                    R: '0xef617aa7de05d4e807bbc5b9c67ecf05ef067ca6a01aeff6cc81b1f4548216c5',
                    S: '0x23510f58c1dd82c583cd47302aac1d077c97926ba9bcaa9ca4ad0bc809cf0890',
                    V: '0x7f6',
                },
            ],
            transactionHash: '0x2a7c62262e4ff747afe429992f4f4dd48dc085ccc93c4993c8dd798593fa2d57',
        }

        const feePayerAddress = '0x44ee3906a7a2007762e9d706df6e4ef63fa1eda8'

        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransfer({
                from: '0x758473e68179c446437b74ca8a74b58706792806',
                to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                value: 1,
                gas: '0xc350',
                nonce: '0x3',
                gasPrice: '0x5d21dba00',
                chainId: 1001,
                signatures: [
                    {
                        v: '0x07f6',
                        r: '0xef617aa7de05d4e807bbc5b9c67ecf05ef067ca6a01aeff6cc81b1f4548216c5',
                        s: '0x23510f58c1dd82c583cd47302aac1d077c97926ba9bcaa9ca4ad0bc809cf0890',
                    },
                ],
            })
        })

        it('CAVERJS-EXT-KAS-WALLET-187: caver.wallet.signAsFeePayer adds feePayerSignatures to transaction', async () => {
            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 1, key: {} })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByUser')
            fdRawRequestStub.resolves(resultOfSigning)
            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')

            const signed = await caver.wallet.signAsFeePayer(feePayerAddress, tx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(appendFeePayerSignaturesSpy.callCount).to.equal(1)
            expect(signed.feePayerSignatures.length).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-188: caver.wallet.signAsFeePayer appends feePayerSignatures to transaction', async () => {
            tx.feePayerSignatures = [
                {
                    R: '0x237491673d0014cca219705291f3ee7350295ef549069e639b5e9d0d8014ffd5',
                    S: '0x4289ed52548303f7f2f5fbb85e88ba7f373026178d30105f9738c71ae07b4a5b',
                    V: '0x4f8',
                },
            ]

            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 1, key: {} })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByUser')
            fdRawRequestStub.resolves(resultOfSigning)
            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')

            const signed = await caver.wallet.signAsFeePayer(feePayerAddress, tx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(appendFeePayerSignaturesSpy.callCount).to.equal(1)
            expect(signed.feePayerSignatures.length).to.equal(2)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-189: caver.wallet.signAsFeePayer remove duplicated feePayerSignatures to transaction', async () => {
            tx.feePayerSignatures = caver.transaction.decode(resultOfSigning.rlp).feePayerSignatures

            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 1, key: {} })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByUser')
            fdRawRequestStub.resolves(resultOfSigning)
            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')

            const signed = await caver.wallet.signAsFeePayer(feePayerAddress, tx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(appendFeePayerSignaturesSpy.callCount).to.equal(1)
            expect(signed.feePayerSignatures.length).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-190: caver.wallet.signAsFeePayer throw error when account key is accountKeyWeightedMutliSig', async () => {
            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 4, key: {} })

            const expectedError = `Not supported: Using multiple keys in an account is currently not supported.`
            await expect(caver.wallet.signAsFeePayer(feePayerAddress, tx)).to.be.rejectedWith(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-191: caver.wallet.signAsFeePayer signs with signle roleFeePayerKey when account key is AccountKeyRoleBased', async () => {
            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 5, key: [{ keyType: 4 }, { keyType: 4 }, { keyType: 2 }] })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByUser')
            fdRawRequestStub.resolves(resultOfSigning)
            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')

            const signed = await caver.wallet.signAsFeePayer(feePayerAddress, tx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(appendFeePayerSignaturesSpy.callCount).to.equal(1)
            expect(signed.feePayerSignatures.length).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-194: caver.wallet.signAsFeePayer calls signAsGlobalFeePayer when address is not defined', async () => {
            const signAsGlobalFeePayerSpy = sandbox.stub(caver.wallet, 'signAsGlobalFeePayer')

            await caver.wallet.signAsFeePayer(undefined, tx)
            await caver.wallet.signAsFeePayer(null, tx)
            await caver.wallet.signAsFeePayer('0x', tx)

            expect(signAsGlobalFeePayerSpy.callCount).to.equal(3)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-201: caver.wallet.signAsFeePayer set feeRatio to requestObject', async () => {
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio({
                from: '0xac3bd4b108f56ffcec6339fda14f649be01819c8',
                to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                value: 1,
                gas: '0xc350',
                nonce: '0x3',
                gasPrice: '0x5d21dba00',
                chainId: 1001,
                signatures: [
                    {
                        v: '0x07f5',
                        r: '0x7b253fdb79561ba2d24ee39a0ba0a6edf0a2df60ebeae6713015288a0c0cfb20',
                        s: '0x150c054bb93919b4fb3bed927b5dfb7162a54c29a6da52c9ad60ce6e2b62ef25',
                    },
                ],
                feeRatio: 50,
            })

            const getAccountKeyStub = sandbox.stub(tx.constructor._klaytnCall, 'getAccountKey')
            getAccountKeyStub.resolves({ keyType: 1, key: {} })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByUser')
            fdRawRequestStub.callsFake(param => {
                expect(param.feeRatio).to.equal(caver.utils.hexToNumber(tx.feeRatio))
                expect(param.feePayer).to.equal(tx.feePayer)
                return Object.assign(resultOfSigning, {
                    rlp:
                        '0x0af8dd038505d21dba0082c3509476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194ac3bd4b108f56ffcec6339fda14f649be01819c832f847f8458207f5a07b253fdb79561ba2d24ee39a0ba0a6edf0a2df60ebeae6713015288a0c0cfb20a0150c054bb93919b4fb3bed927b5dfb7162a54c29a6da52c9ad60ce6e2b62ef25941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f6a03be553ff9d261860fbb0c4b2c2d6ad7dd8093a35ff4ee7ba7cccd9f88841e289a0559530699189bccbf9684af9e66e7609aa6a09253f98f1bfe626856f089a9414',
                })
            })
            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')

            const signed = await caver.wallet.signAsFeePayer(feePayerAddress, tx)

            expect(getAccountKeyStub.callCount).to.equal(1)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(signed.feePayer.toLowerCase()).to.equal(feePayerAddress.toLowerCase())
            expect(appendFeePayerSignaturesSpy.callCount).to.equal(1)
            expect(signed.feePayerSignatures.length).to.equal(1)
        }).timeout(50000)
    })

    context('caver.wallet.signAsGlobalFeePayer', () => {
        const resultOfSigning = {
            rlp:
                '0x09f8dc808505d21dba0082c3509476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194ac3bd4b108f56ffcec6339fda14f649be01819c8f847f8458207f5a07b253fdb79561ba2d24ee39a0ba0a6edf0a2df60ebeae6713015288a0c0cfb20a0150c054bb93919b4fb3bed927b5dfb7162a54c29a6da52c9ad60ce6e2b62ef25941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f6a03be553ff9d261860fbb0c4b2c2d6ad7dd8093a35ff4ee7ba7cccd9f88841e289a0559530699189bccbf9684af9e66e7609aa6a09253f98f1bfe626856f089a9414',
            feePayer: '0x1b71a63903e35371e2fc41c6012effb99b9a2c0f',
            from: '0xac3bd4b108f56ffcec6339fda14f649be01819c8',
            gas: 50000,
            gasPrice: '0x5d21dba00',
            nonce: 0,
            status: 'Submitted',
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            typeInt: 9,
            value: '0x1',
            signatures: [
                {
                    R: '0x7b253fdb79561ba2d24ee39a0ba0a6edf0a2df60ebeae6713015288a0c0cfb20',
                    S: '0x150c054bb93919b4fb3bed927b5dfb7162a54c29a6da52c9ad60ce6e2b62ef25',
                    V: '0x7f5',
                },
            ],
            transactionHash: '0xf09b03035d5af3f25ce1d3fc3bf94fe18a6dcf8fc06e776af1d8e6f17d78e445',
        }

        const feePayerAddress = '0x1b71a63903e35371e2fc41c6012effb99b9a2c0f'

        let tx

        beforeEach(() => {
            tx = new caver.transaction.feeDelegatedValueTransfer({
                from: '0xac3bd4b108f56ffcec6339fda14f649be01819c8',
                to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                value: 1,
                gas: '0xc350',
                nonce: '0x3',
                gasPrice: '0x5d21dba00',
                chainId: 1001,
                signatures: [
                    {
                        v: '0x07f5',
                        r: '0x7b253fdb79561ba2d24ee39a0ba0a6edf0a2df60ebeae6713015288a0c0cfb20',
                        s: '0x150c054bb93919b4fb3bed927b5dfb7162a54c29a6da52c9ad60ce6e2b62ef25',
                    },
                ],
            })
        })

        it('CAVERJS-EXT-KAS-WALLET-195: caver.wallet.signAsGlobalFeePayer adds feePayerSignatures to transaction', async () => {
            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            fdRawRequestStub.resolves(resultOfSigning)
            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')

            const signed = await caver.wallet.signAsGlobalFeePayer(tx)

            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(signed.feePayer.toLowerCase()).to.equal(feePayerAddress.toLowerCase())
            expect(appendFeePayerSignaturesSpy.callCount).to.equal(1)
            expect(signed.feePayerSignatures.length).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-196: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to transaction', async () => {
            tx.feePayerSignatures = [
                {
                    R: '0x3be553ff9d261860fbb0c4b2c2d6ad7dd8093a35ff4ee7ba7cccd9f88841e289',
                    S: '0x559530699189bccbf9684af9e66e7609aa6a09253f98f1bfe626856f089a9414',
                    V: '0x07f5',
                },
            ]

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            fdRawRequestStub.resolves(resultOfSigning)
            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')

            const signed = await caver.wallet.signAsGlobalFeePayer(tx)

            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(signed.feePayer.toLowerCase()).to.equal(feePayerAddress.toLowerCase())
            expect(appendFeePayerSignaturesSpy.callCount).to.equal(1)
            expect(signed.feePayerSignatures.length).to.equal(2)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-197: caver.wallet.signAsGlobalFeePayer remove duplicated feePayerSignatures to transaction', async () => {
            tx.feePayerSignatures = caver.transaction.decode(resultOfSigning.rlp).feePayerSignatures

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            fdRawRequestStub.resolves(resultOfSigning)
            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')

            const signed = await caver.wallet.signAsGlobalFeePayer(tx)

            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(signed.feePayer.toLowerCase()).to.equal(feePayerAddress.toLowerCase())
            expect(appendFeePayerSignaturesSpy.callCount).to.equal(1)
            expect(signed.feePayerSignatures.length).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-198: caver.wallet.signAsGlobalFeePayer throw error when fee payer address is different', async () => {
            // Define different fee payer address in transaction
            tx.feePayer = caver.keyringContainer.keyring.generate().address

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            fdRawRequestStub.resolves(resultOfSigning)

            const expectedError = `Invalid fee payer: The address of the fee payer defined in the transaction does not match the address of the global fee payer. To sign with a global fee payer, you must define the global fee payer's address in the feePayer field, or the feePayer field must not be defined.`
            await expect(caver.wallet.signAsGlobalFeePayer(tx)).to.be.rejectedWith(expectedError)
            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-199: caver.wallet.signAsGlobalFeePayer throw error when parameter is invalid', async () => {
            const expectedError = `Invalid parameter type: signAsGlobalFeePayer(tx) takes transaction as a only parameter.`
            await expect(caver.wallet.signAsGlobalFeePayer(feePayerAddress, tx)).to.be.rejectedWith(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-WALLET-200: caver.wallet.signAsGlobalFeePayer set feeRatio to requestObject', async () => {
            tx = new caver.transaction.feeDelegatedValueTransferWithRatio({
                from: '0xac3bd4b108f56ffcec6339fda14f649be01819c8',
                to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                value: 1,
                gas: '0xc350',
                nonce: '0x3',
                gasPrice: '0x5d21dba00',
                chainId: 1001,
                signatures: [
                    {
                        v: '0x07f5',
                        r: '0x7b253fdb79561ba2d24ee39a0ba0a6edf0a2df60ebeae6713015288a0c0cfb20',
                        s: '0x150c054bb93919b4fb3bed927b5dfb7162a54c29a6da52c9ad60ce6e2b62ef25',
                    },
                ],
                feeRatio: 50,
            })

            const fillTransactionSpy = sandbox.spy(tx, 'fillTransaction')
            const getRLPEncodingSpy = sandbox.spy(tx, 'getRLPEncoding')
            const fdRawRequestStub = sandbox.stub(caver.wallet.walletAPI, 'requestFDRawTransactionPaidByGlobalFeePayer')
            fdRawRequestStub.callsFake(param => {
                expect(param.feeRatio).to.equal(caver.utils.hexToNumber(tx.feeRatio))
                return Object.assign(resultOfSigning, {
                    rlp:
                        '0x0af8dd038505d21dba0082c3509476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194ac3bd4b108f56ffcec6339fda14f649be01819c832f847f8458207f5a07b253fdb79561ba2d24ee39a0ba0a6edf0a2df60ebeae6713015288a0c0cfb20a0150c054bb93919b4fb3bed927b5dfb7162a54c29a6da52c9ad60ce6e2b62ef25941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f6a03be553ff9d261860fbb0c4b2c2d6ad7dd8093a35ff4ee7ba7cccd9f88841e289a0559530699189bccbf9684af9e66e7609aa6a09253f98f1bfe626856f089a9414',
                })
            })
            const appendFeePayerSignaturesSpy = sandbox.spy(tx, 'appendFeePayerSignatures')

            const signed = await caver.wallet.signAsGlobalFeePayer(tx)

            expect(fillTransactionSpy.callCount).to.equal(1)
            expect(getRLPEncodingSpy.callCount).to.equal(1)
            expect(fdRawRequestStub.callCount).to.equal(1)
            expect(signed.feePayer.toLowerCase()).to.equal(feePayerAddress.toLowerCase())
            expect(appendFeePayerSignaturesSpy.callCount).to.equal(1)
            expect(signed.feePayerSignatures.length).to.equal(1)
        }).timeout(50000)
    })
})
