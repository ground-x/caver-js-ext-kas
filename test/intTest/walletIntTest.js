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
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const CaverExtKAS = require('../../index.js')

let caver
let accountToTest
let multiSigAccount
const multiSigAddresses = []
const multiSigPublicKeys = []

const { senderPrivateKey, auths } = require('../testEnv')
const { timeout } = require('../testUtils')

const { url, chainId, accessKeyId, secretAccessKey, feePayerAddress } = auths.walletAPI

let senderKeyring
let contractAddress
let sigToAppend

let fromTimestamp

const byteCode =
    '0x608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029'
const input =
    '0xe942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000'

let pendingTx
let transactionHashToGet

async function sendTestKLAY(to, klay = 1) {
    const vt = new caver.transaction.valueTransfer({
        from: senderKeyring.address,
        to,
        value: caver.utils.toPeb(klay, 'KLAY'),
        gas: 25000,
    })

    await caver.wallet.sign(senderKeyring.address, vt)

    const receipt = await caver.rpc.klay.sendRawTransaction(vt)
    return receipt
}

function generateAccountKeySet() {
    const accountKeys = []
    accountKeys.push({ keyType: 1 }) // accountKeyLegacy

    accountKeys.push({ keyType: 2, key: multiSigPublicKeys[0] }) // accountKeyPublic

    accountKeys.push({ keyType: 3 }) // accountKeyFail

    accountKeys.push({
        keyType: 4,
        key: {
            threshold: 2,
            weightedKeys: [
                {
                    weight: 1,
                    publicKey: multiSigPublicKeys[0],
                },
                {
                    weight: 1,
                    publicKey: multiSigPublicKeys[1],
                },
            ],
        },
    }) // accountKeyWeightedMultiSig

    accountKeys.push({
        keyType: 5,
        key: [
            {
                keyType: 3,
                key: {},
            },
            {
                keyType: 4,
                key: {
                    threshold: 2,
                    weightedKeys: [
                        {
                            weight: 1,
                            publicKey: multiSigPublicKeys[0],
                        },
                        {
                            weight: 1,
                            publicKey: multiSigPublicKeys[1],
                        },
                    ],
                },
            },
            {
                keyType: 2,
                key: multiSigPublicKeys[2],
            },
        ],
    }) // accountKeyRoleBased

    return accountKeys
}

describe('Wallet API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initNodeAPI(auths.nodeAPI.chainId, auths.nodeAPI.accessKeyId, auths.nodeAPI.secretAccessKey, auths.nodeAPI.url)
        caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

        senderKeyring = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(senderPrivateKey))
    })

    it('CAVERJS-EXT-KAS-INT-018: caver.kas.wallet.createAccount should create account in KAS wallet API service', async () => {
        fromTimestamp = Date.now()
        const ret = await caver.kas.wallet.createAccount()
        accountToTest = ret

        expect(ret.address).not.to.be.undefined
        expect(ret.chainId).to.equal(chainId)
        expect(ret.createdAt).to.equal(ret.updatedAt)
        expect(ret.keyId).not.to.be.undefined
        expect(ret.krn).not.to.be.undefined
        expect(ret.keyId.includes(ret.krn)).to.be.true
        expect(ret.publicKey).not.to.be.undefined

        await sendTestKLAY(accountToTest.address)

        // Send KLAY to fee payer
        await sendTestKLAY(feePayerAddress)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-019: caver.kas.wallet.getAccountList should retrieve account list', async () => {
        const queryOptions = {
            size: 1,
            fromTimestamp,
            toTimestamp: Date.now(),
        }

        const ret = await caver.kas.wallet.getAccountList(queryOptions)

        expect(ret.cursor).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-020: caver.kas.wallet.getAccount should return account in KAS wallet api service', async () => {
        const ret = await caver.kas.wallet.getAccount(accountToTest.address)

        expect(ret).to.deep.equal(accountToTest)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-021: caver.kas.wallet.getAccountListByPublicKey should return account in KAS wallet api service by public key', async () => {
        const ret = await caver.kas.wallet.getAccountListByPublicKey(accountToTest.publicKey)

        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].address).to.equal(accountToTest.address)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-022: caver.kas.wallet.deleteAccount should delete account in KAS wallet api service', async () => {
        const created = await caver.kas.wallet.createAccount()
        const ret = await caver.kas.wallet.deleteAccount(created.address)

        expect(ret.status).to.equal('deleted')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-023: caver.kas.wallet.disableAccount should change account status to disabled', async () => {
        const ret = await caver.kas.wallet.disableAccount(accountToTest.address)

        expect(ret.address).to.equal(accountToTest.address)
        expect(ret.krn).to.equal(accountToTest.krn)
        expect(ret.updatedAt >= accountToTest.updatedAt).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-024: caver.kas.wallet.enableAccount should change account status to enabled', async () => {
        const ret = await caver.kas.wallet.enableAccount(accountToTest.address)

        expect(ret.address).to.equal(accountToTest.address)
        expect(ret.krn).to.equal(accountToTest.krn)
        expect(ret.updatedAt >= accountToTest.updatedAt).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-025: caver.kas.wallet.updateToMultiSigAccount should update account key of account', async () => {
        multiSigAccount = await caver.kas.wallet.createAccount()
        await sendTestKLAY(multiSigAccount.address)

        const accountForPub1 = await caver.kas.wallet.createAccount()
        const accountForPub2 = await caver.kas.wallet.createAccount()
        const accountForPub3 = await caver.kas.wallet.createAccount()
        multiSigAddresses.push(accountForPub1.address)
        multiSigAddresses.push(accountForPub2.address)
        multiSigAddresses.push(accountForPub3.address)
        multiSigPublicKeys.push(accountForPub1.publicKey)
        multiSigPublicKeys.push(accountForPub2.publicKey)
        multiSigPublicKeys.push(accountForPub3.publicKey)

        const weightedMultisig = {
            threshold: 3,
            weightedKeys: [
                {
                    weight: 1,
                    publicKey: accountForPub1.publicKey,
                },
                {
                    weight: 1,
                    publicKey: accountForPub2.publicKey,
                },
                {
                    weight: 1,
                    publicKey: accountForPub3.publicKey,
                },
            ],
        }
        const ret = await caver.kas.wallet.updateToMultiSigAccount(multiSigAccount.address, weightedMultisig)

        expect(ret.address).to.equal(multiSigAccount.address)
        expect(ret.krn).to.equal(multiSigAccount.krn)
        expect(ret.threshold).to.equal(weightedMultisig.threshold)
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.updatedAt).not.to.be.undefined
        expect(ret.multiSigKeys.length).to.equal(weightedMultisig.weightedKeys.length)
        for (let i = 0; i < ret.multiSigKeys.length; i++) {
            expect(ret.multiSigKeys[i]).to.deep.equal(weightedMultisig.weightedKeys[i])
        }

        let status = ret.status
        await timeout(5000)

        while (status === 'Submitted') {
            await timeout(1000)
            const tx = await caver.kas.wallet.getTransaction(ret.transactionHash)
            status = tx.status
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-026: caver.kas.wallet.signTransaction should request sign transaction', async () => {
        // Wait to process transaction
        await timeout(1000)

        const tx = {
            from: multiSigAccount.address,
            to: senderKeyring.address,
            value: 1,
            gas: 25000,
            submit: true,
        }

        // {
        // 	from: '0xd0821cada8b04a60a67989748e9bdababef3de77',
        // 	gas: 25000,
        // 	gasPrice: '0x5d21dba00',
        // 	nonce: 1,
        // 	rlp: undefined,
        // 	typeInt: 8,
        // 	status: 'Pending',
        // 	value: '0x1',
        // 	to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
        // 	transactionId: '0xa1dd87c94712f918e32e5310197f03b49025a4f4d74872e5bf85958cc4ca814c'
        // }
        pendingTx = await caver.kas.wallet.requestValueTransfer(tx)

        const ret = await caver.kas.wallet.signTransaction(multiSigAddresses[2], pendingTx.transactionId)
        expect(ret.V).not.to.be.undefined
        expect(ret.R).not.to.be.undefined
        expect(ret.S).not.to.be.undefined
        sigToAppend = ret
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-027: caver.kas.wallet.requestLegacyTransaction should request value transfer transaction (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 25000,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestLegacyTransaction(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(0)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        transactionHashToGet = ret.transactionHash

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeLegacyTransaction')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-028: caver.kas.wallet.requestLegacyTransaction should return signed value transfer transaction (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 25000,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestLegacyTransaction(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(0)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeLegacyTransaction')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-029: caver.kas.wallet.requestValueTransfer should request value transfer transaction (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 25000,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestValueTransfer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(8)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeValueTransfer')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-030: caver.kas.wallet.requestValueTransfer should return signed value transfer transaction (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 25000,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestValueTransfer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(8)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeValueTransfer')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-031: caver.kas.wallet.requestValueTransfer should request value transfer memo transaction (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        await sendTestKLAY(accountToTest.address)

        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 25000,
            memo: 'memo',
            submit: true,
        }

        const ret = await caver.kas.wallet.requestValueTransfer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(16)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeValueTransferMemo')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-032: caver.kas.wallet.requestValueTransfer should return signed value transfer memo transaction (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 25000,
            memo: 'memo',
            submit: false,
        }

        const ret = await caver.kas.wallet.requestValueTransfer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(16)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeValueTransferMemo')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-033: caver.kas.wallet.requestSmartContractDeploy should request smart contract deploy transaction (submit true)', done => {
        const tx = {
            from: accountToTest.address,
            value: 0,
            input: byteCode,
            gas: 1000000,
            submit: true,
        }

        // Wait to process transaction
        timeout(1000).then(() => {
            caver.kas.wallet.requestSmartContractDeploy(tx).then(ret => {
                Object.keys(tx).map(k => {
                    if (k === 'submit') {
                    } else if (typeof tx[k] === 'string') {
                        expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                    } else {
                        expect(tx[k]).to.equal(ret[k])
                    }
                })
                expect(ret.gasPrice).not.to.be.undefined
                expect(ret.nonce).not.to.be.undefined
                expect(ret.rlp).not.to.be.undefined
                expect(ret.typeInt).to.equal(40)
                expect(ret.signatures.length).to.equal(1)
                expect(ret.status).to.equal('Submitted')
                expect(ret.transactionHash).not.to.be.undefined

                const decoded = caver.transaction.decode(ret.rlp)
                expect(decoded.type).to.equal('TxTypeSmartContractDeploy')

                setTimeout(() => {
                    caver.kas.wallet.getTransaction(ret.transactionHash).then(transaction => {
                        contractAddress = transaction.contractAddress
                        done()
                    })
                }, 3000)
            })
        })
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-034: caver.kas.wallet.requestSmartContractDeploy should return signed smart contract deploy transaction (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            input,
            value: 0,
            gas: 1000000,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestSmartContractDeploy(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(40)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeSmartContractDeploy')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-035: caver.kas.wallet.requestSmartContractExecution should request smart contract execution transaction (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            value: 0,
            input,
            gas: 500000,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestSmartContractExecution(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(48)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeSmartContractExecution')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-036: caver.kas.wallet.requestSmartContractExecution should return signed smart contract execution transaction (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            input,
            value: 0,
            gas: 500000,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestSmartContractExecution(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(48)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeSmartContractExecution')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-037: caver.kas.wallet.requestCancel should request cancel transaction (submit true)', async () => {
        // Wait until transaction processing
        await timeout(3000)

        const tx = {
            from: accountToTest.address,
            gas: 25000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            submit: true,
        }

        const ret = await caver.kas.wallet.requestCancel(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(56)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeCancel')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-038: caver.kas.wallet.requestCancel should return signed cancel transaction (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 25000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            submit: false,
        }

        const ret = await caver.kas.wallet.requestCancel(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(56)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeCancel')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-039: caver.kas.wallet.requestChainDataAnchoring should request chain data anchoring transaction (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            submit: true,
        }

        const ret = await caver.kas.wallet.requestChainDataAnchoring(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(72)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeChainDataAnchoring')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-040: caver.kas.wallet.requestChainDataAnchoring should return signed chain data anchoring transaction (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            submit: false,
        }

        const ret = await caver.kas.wallet.requestChainDataAnchoring(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(72)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeChainDataAnchoring')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-041: caver.kas.wallet.requestRawTransaction should request transaction via RLP-encoded string (submit true)', async () => {
        const { rlp } = await caver.kas.wallet.requestValueTransfer({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 25000,
            submit: false,
        })

        const tx = {
            rlp,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestRawTransaction(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(8)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeValueTransfer')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-042: caver.kas.wallet.requestRawTransaction should return transaction via RLP-encoded string (submit false)', async () => {
        const { rlp } = await caver.kas.wallet.requestValueTransfer({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 25000,
            submit: false,
        })

        const tx = {
            rlp,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestRawTransaction(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(8)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeValueTransfer')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-043: caver.kas.wallet.requestAccountUpdate should request account update transaction (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        for (let i = 0; i < accountKeys.length; i++) {
            const accountToUpdate = await caver.kas.wallet.createAccount()
            await sendTestKLAY(accountToUpdate.address, 2)

            // Wait to process transaction
            await timeout(1000)

            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                submit: true,
            }

            const ret = await caver.kas.wallet.requestAccountUpdate(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(32)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.equal('Submitted')
            expect(ret.transactionHash).not.to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeAccountUpdate')
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-044: caver.kas.wallet.requestAccountUpdate should request account update transaction (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        const accountToUpdate = await caver.kas.wallet.createAccount()

        for (let i = 0; i < accountKeys.length; i++) {
            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                submit: false,
            }

            const ret = await caver.kas.wallet.requestAccountUpdate(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(32)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.be.undefined
            expect(ret.transactionHash).to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeAccountUpdate')
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-045: caver.kas.wallet.getTransaction should get transaction', async () => {
        const ret = await caver.kas.wallet.getTransaction(transactionHashToGet)

        expect(ret.hash).to.equal(transactionHashToGet)
    }).timeout(500000)

    // FD paid by KAS

    it('CAVERJS-EXT-KAS-INT-046: caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer should request fee delegated value transfer transaction paid by KAS global fee payer (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(9)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-047: caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer should return signed fee delegated value transfer transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(9)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-048: caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer should request fee delegated value transfer transaction paid by KAS global fee payer (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            feeRatio: 99,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(10)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-049: caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer should return signed fee delegated value transfer transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            feeRatio: 99,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(10)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-050: caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer should request fee delegated value transfer memo transaction paid by KAS global fee payer (submit true)', async () => {
        await sendTestKLAY(accountToTest.address)

        // Wait to process transaction
        await timeout(1000)

        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            memo: 'memo',
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(17)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferMemo')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-051: caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer should return signed fee delegated value transfer memo transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            memo: 'memo',
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(17)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferMemo')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-052: caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer should request fee delegated value transfer memo with ratio transaction paid by KAS global fee payer (submit true)', async () => {
        await sendTestKLAY(accountToTest.address)

        // Wait to process transaction
        await timeout(1000)

        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            memo: 'memo',
            feeRatio: 99,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(18)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferMemoWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-053: caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer should return signed fee delegated value transfer memo with ratio transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            memo: 'memo',
            feeRatio: 99,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(18)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferMemoWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-054: caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer should request fee delegated smart contract deploy transaction paid by KAS global fee payer (submit true)', done => {
        const tx = {
            from: accountToTest.address,
            value: 0,
            input: byteCode,
            gas: 3000000,
            submit: true,
        }

        // Wait to process transaction
        timeout(1000).then(() => {
            caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(tx).then(ret => {
                Object.keys(tx).map(k => {
                    if (k === 'submit') {
                    } else if (typeof tx[k] === 'string') {
                        expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                    } else {
                        expect(tx[k]).to.equal(ret[k])
                    }
                })
                expect(ret.gasPrice).not.to.be.undefined
                expect(ret.nonce).not.to.be.undefined
                expect(ret.rlp).not.to.be.undefined
                expect(ret.typeInt).to.equal(41)
                expect(ret.signatures.length).to.equal(1)
                expect(ret.status).to.equal('Submitted')
                expect(ret.transactionHash).not.to.be.undefined
                expect(ret.feePayer).not.to.be.undefined

                const decoded = caver.transaction.decode(ret.rlp)
                expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractDeploy')
                expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false

                setTimeout(() => {
                    caver.kas.wallet.getTransaction(ret.transactionHash).then(transaction => {
                        contractAddress = transaction.contractAddress
                        done()
                    })
                }, 3000)
            })
        })
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-055: caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer should return signed fee delegated smart contract deploy transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            input,
            value: 0,
            gas: 3000000,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(41)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractDeploy')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-056: caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer should request fee delegated smart contract deploy with ratio transaction paid by KAS global fee payer (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            value: 0,
            input: byteCode,
            gas: 3000000,
            submit: true,
            feeRatio: 99,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(42)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractDeployWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-057: caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer should return signed fee delegated smart contract deploy with ratio transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            input,
            value: 0,
            gas: 3000000,
            submit: false,
            feeRatio: 99,
        }

        const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(42)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractDeployWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-058: caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer should request fee delegated smart contract execution transaction paid by KAS global fee payer (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            value: 0,
            input,
            gas: 500000,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(49)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractExecution')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-059: caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer should return signed fee delegated smart contract execution transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            input,
            value: 0,
            gas: 500000,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(49)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractExecution')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-060: caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer should request fee delegated smart contract execution with ratio transaction paid by KAS global fee payer (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            value: 0,
            input,
            gas: 500000,
            feeRatio: 99,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(50)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractExecutionWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-061: caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer should return signed fee delegated smart contract execution with ratio transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            input,
            value: 0,
            gas: 500000,
            feeRatio: 99,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(50)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractExecutionWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-062: caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer should request fee delegated cancel transaction paid by KAS global fee payer (submit true)', async () => {
        // Wait until transaction processing
        await timeout(3000)

        const tx = {
            from: accountToTest.address,
            gas: 45000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(57)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedCancel')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-063: caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer should return signed fee delegated cancel transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 45000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(57)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedCancel')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-064: caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer should request fee delegated cancel with ratio transaction paid by KAS global fee payer (submit true)', async () => {
        // Wait until transaction processing
        await timeout(3000)

        const tx = {
            from: accountToTest.address,
            gas: 45000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            feeRatio: 99,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(58)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedCancelWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-065: caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer should return signed fee delegated cancel with ratio transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 45000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            feeRatio: 99,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(58)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedCancelWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-066: caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer should request fee delegated chain data anchoring transaction paid by KAS global fee payer (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(73)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedChainDataAnchoring')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-067: caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer should return signed fee delegated chain data anchoring transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(73)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedChainDataAnchoring')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-068: caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer should request fee delegated chain data anchoring with ratio transaction paid by KAS global fee payer (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            feeRatio: 99,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(74)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedChainDataAnchoringWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-069: caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer should return signed fee delegated chain data anchoring with ratio transaction paid by KAS global fee payer (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            feeRatio: 99,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(74)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedChainDataAnchoringWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-070: caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer should request fee delegated transaction via RLP-encoded string paid by KAS global fee payer (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const { rlp } = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            submit: false,
        })

        const tx = {
            rlp,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                if (k === 'rlp') {
                    expect(ret[k].includes(tx[k]))
                } else {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                }
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(9)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-071: caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer should return fee payer signed fee delegated transaction via RLP-encoded string paid by KAS global fee payer (submit false)', async () => {
        const { rlp } = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            submit: false,
        })

        const tx = {
            rlp,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                if (k === 'rlp') {
                    expect(ret[k].includes(tx[k]))
                } else {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                }
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(9)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-072: caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer should request fee delegated with ratio transaction via RLP-encoded string paid by KAS global fee payer (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const { rlp } = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 70000,
            feeRatio: 99,
            submit: false,
        })

        const tx = {
            rlp,
            submit: true,
            feeRatio: 99,
        }

        const ret = await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                if (k === 'rlp') {
                    expect(ret[k].includes(tx[k]))
                } else {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                }
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(10)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-073: caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer should return fee payer signed fee delegated with ratio transaction via RLP-encoded string paid by KAS global fee payer (submit false)', async () => {
        const { rlp } = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 70000,
            feeRatio: 99,
            submit: false,
        })

        const tx = {
            rlp,
            submit: false,
            feeRatio: 99,
        }

        const ret = await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                if (k === 'rlp') {
                    expect(ret[k].includes(tx[k]))
                } else {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                }
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(10)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-074: caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer should request fee delegated account update transaction paid by KAS global fee payer (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        for (let i = 0; i < accountKeys.length; i++) {
            const accountToUpdate = await caver.kas.wallet.createAccount()
            await sendTestKLAY(accountToUpdate.address, 2)

            // Wait to process transaction
            await timeout(1000)

            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                submit: true,
            }

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(33)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.equal('Submitted')
            expect(ret.transactionHash).not.to.be.undefined
            expect(ret.feePayer).not.to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeFeeDelegatedAccountUpdate')
            expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-075: caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer should request fee delegated account update transaction paid by KAS global fee payer (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        const accountToUpdate = await caver.kas.wallet.createAccount()

        for (let i = 0; i < accountKeys.length; i++) {
            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                submit: false,
            }

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(33)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.be.undefined
            expect(ret.transactionHash).to.be.undefined
            expect(ret.feePayer).not.to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeFeeDelegatedAccountUpdate')
            expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-076: caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer should request fee delegated account update with ratio transaction paid by KAS global fee payer (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        for (let i = 0; i < accountKeys.length; i++) {
            const accountToUpdate = await caver.kas.wallet.createAccount()
            await sendTestKLAY(accountToUpdate.address, 2)

            // Wait to process transaction
            await timeout(1000)

            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                feeRatio: 99,
                submit: true,
            }

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit' || k === 'feeRatio') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(34)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.equal('Submitted')
            expect(ret.transactionHash).not.to.be.undefined
            expect(ret.feePayer).not.to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeFeeDelegatedAccountUpdateWithRatio')
            expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-077: caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer should request fee delegated account update with ratio transaction paid by KAS global fee payer (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        const accountToUpdate = await caver.kas.wallet.createAccount()

        for (let i = 0; i < accountKeys.length; i++) {
            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                feeRatio: 99,
                submit: false,
            }

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit' || k === 'feeRatio') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(34)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.be.undefined
            expect(ret.transactionHash).to.be.undefined
            expect(ret.feePayer).not.to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeFeeDelegatedAccountUpdateWithRatio')
            expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
        }
    }).timeout(500000)

    // FD Paid by User

    it('CAVERJS-EXT-KAS-INT-078: caver.kas.wallet.requestFDValueTransferPaidByUser should request fee delegated value transfer transaction paid by user (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            feePayer: feePayerAddress,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(9)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-079: caver.kas.wallet.requestFDValueTransferPaidByUser should return signed fee delegated value transfer transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(9)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-080: caver.kas.wallet.requestFDValueTransferPaidByUser should request fee delegated value transfer transaction paid by user (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(10)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-081: caver.kas.wallet.requestFDValueTransferPaidByUser should return signed fee delegated value transfer transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(10)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-082: caver.kas.wallet.requestFDValueTransferPaidByUser should request fee delegated value transfer memo transaction paid by user (submit true)', async () => {
        await sendTestKLAY(accountToTest.address)

        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            memo: 'memo',
            feePayer: feePayerAddress,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(17)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferMemo')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-083: caver.kas.wallet.requestFDValueTransferPaidByUser should return signed fee delegated value transfer memo transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            memo: 'memo',
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(17)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferMemo')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-084: caver.kas.wallet.requestFDValueTransferPaidByUser should request fee delegated value transfer memo with ratio transaction paid by user (submit true)', async () => {
        await sendTestKLAY(accountToTest.address)

        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            memo: 'memo',
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(18)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferMemoWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-085: caver.kas.wallet.requestFDValueTransferPaidByUser should return signed fee delegated value transfer memo with ratio transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            memo: 'memo',
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'memo') {
                expect(ret.input.toLowerCase()).to.equal('0x6d656d6f')
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(18)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferMemoWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-086: caver.kas.wallet.requestFDSmartContractDeployPaidByUser should request fee delegated smart contract deploy transaction paid by user (submit true)', done => {
        const tx = {
            from: accountToTest.address,
            value: 0,
            input: byteCode,
            gas: 3000000,
            feePayer: feePayerAddress,
            submit: true,
        }

        // Wait to process transaction
        timeout(1000).then(() => {
            caver.kas.wallet.requestFDSmartContractDeployPaidByUser(tx).then(ret => {
                Object.keys(tx).map(k => {
                    if (k === 'submit') {
                    } else if (typeof tx[k] === 'string') {
                        expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                    } else {
                        expect(tx[k]).to.equal(ret[k])
                    }
                })
                expect(ret.gasPrice).not.to.be.undefined
                expect(ret.nonce).not.to.be.undefined
                expect(ret.rlp).not.to.be.undefined
                expect(ret.typeInt).to.equal(41)
                expect(ret.signatures.length).to.equal(1)
                expect(ret.status).to.equal('Submitted')
                expect(ret.transactionHash).not.to.be.undefined
                expect(ret.feePayer).not.to.be.undefined

                const decoded = caver.transaction.decode(ret.rlp)
                expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractDeploy')
                expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false

                setTimeout(() => {
                    caver.kas.wallet.getTransaction(ret.transactionHash).then(transaction => {
                        contractAddress = transaction.contractAddress
                        done()
                    })
                }, 3000)
            })
        })
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-087: caver.kas.wallet.requestFDSmartContractDeployPaidByUser should return signed fee delegated smart contract deploy transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            input,
            value: 0,
            gas: 3000000,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(41)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractDeploy')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-088: caver.kas.wallet.requestFDSmartContractDeployPaidByUser should request fee delegated smart contract deploy with ratio transaction paid by user (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            value: 0,
            input: byteCode,
            gas: 3000000,
            submit: true,
            feePayer: feePayerAddress,
            feeRatio: 99,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(42)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractDeployWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-089: caver.kas.wallet.requestFDSmartContractDeployPaidByUser should return signed fee delegated smart contract deploy with ratio transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            input,
            value: 0,
            gas: 3000000,
            submit: false,
            feePayer: feePayerAddress,
            feeRatio: 99,
        }

        const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(42)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractDeployWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-090: caver.kas.wallet.requestFDSmartContractExecutionPaidByUser should request fee delegated smart contract execution transaction paid by user (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            value: 0,
            input,
            gas: 500000,
            feePayer: feePayerAddress,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(49)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractExecution')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-091: caver.kas.wallet.requestFDSmartContractExecutionPaidByUser should return signed fee delegated smart contract execution transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            input,
            value: 0,
            gas: 500000,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(49)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractExecution')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-092: caver.kas.wallet.requestFDSmartContractExecutionPaidByUser should request fee delegated smart contract execution with ratio transaction paid by user (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            value: 0,
            input,
            gas: 500000,
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(50)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractExecutionWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-093: caver.kas.wallet.requestFDSmartContractExecutionPaidByUser should return signed fee delegated smart contract execution with ratio transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            to: contractAddress,
            input,
            value: 0,
            gas: 500000,
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(50)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedSmartContractExecutionWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-094: caver.kas.wallet.requestFDCancelPaidByUser should request fee delegated cancel transaction paid by user (submit true)', async () => {
        // Wait until transaction processing
        await timeout(3000)

        const tx = {
            from: accountToTest.address,
            gas: 45000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            feePayer: feePayerAddress,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDCancelPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(57)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedCancel')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-095: caver.kas.wallet.requestFDCancelPaidByUser should return signed fee delegated cancel transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 45000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDCancelPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(57)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedCancel')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-096: caver.kas.wallet.requestFDCancelPaidByUser should request fee delegated cancel with ratio transaction paid by user (submit true)', async () => {
        // Wait until transaction processing
        await timeout(3000)

        const tx = {
            from: accountToTest.address,
            gas: 45000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDCancelPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(58)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedCancelWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-097: caver.kas.wallet.requestFDCancelPaidByUser should return signed fee delegated cancel with ratio transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 45000,
            nonce: await caver.rpc.klay.getTransactionCount(accountToTest.address),
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDCancelPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(58)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedCancelWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-098: caver.kas.wallet.requestFDChainDataAnchoringPaidByUser should request fee delegated chain data anchoring transaction paid by user (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            feePayer: feePayerAddress,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(73)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedChainDataAnchoring')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-099: caver.kas.wallet.requestFDChainDataAnchoringPaidByUser should return signed fee delegated chain data anchoring transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(73)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedChainDataAnchoring')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-100: caver.kas.wallet.requestFDChainDataAnchoringPaidByUser should request fee delegated chain data anchoring with ratio transaction paid by user (submit true)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: true,
        }

        // Wait to process transaction
        await timeout(1000)

        const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(74)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedChainDataAnchoringWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-101: caver.kas.wallet.requestFDChainDataAnchoringPaidByUser should return signed fee delegated chain data anchoring with ratio transaction paid by user (submit false)', async () => {
        const tx = {
            from: accountToTest.address,
            gas: 100000,
            input: '0x0123',
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (k === 'nonce') {
                expect(caver.utils.hexToNumber(tx[k])).to.equal(ret[k])
            } else if (typeof tx[k] === 'string') {
                expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(74)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedChainDataAnchoringWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-102: caver.kas.wallet.requestFDRawTransactionPaidByUser should request fee delegated transaction via RLP-encoded string paid by user (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const result = await caver.kas.wallet.requestFDValueTransferPaidByUser({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            feePayer: feePayerAddress,
            submit: false,
        })
        const rlp = result.rlp

        const tx = {
            rlp,
            feePayer: feePayerAddress,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDRawTransactionPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                if (k === 'rlp') {
                    expect(ret[k].includes(tx[k]))
                } else {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                }
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(9)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-103: caver.kas.wallet.requestFDRawTransactionPaidByUser should return fee payer signed fee delegated transaction via RLP-encoded string paid by user (submit false)', async () => {
        const { rlp } = await caver.kas.wallet.requestFDValueTransferPaidByUser({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 50000,
            feePayer: feePayerAddress,
            submit: false,
        })

        const tx = {
            rlp,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDRawTransactionPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit') {
            } else if (typeof tx[k] === 'string') {
                if (k === 'rlp') {
                    expect(ret[k].includes(tx[k]))
                } else {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                }
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(9)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-104: caver.kas.wallet.requestFDRawTransactionPaidByUser should request fee delegated with ratio transaction via RLP-encoded string paid by user (submit true)', async () => {
        // Wait to process transaction
        await timeout(1000)

        const { rlp } = await caver.kas.wallet.requestFDValueTransferPaidByUser({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 70000,
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: false,
        })

        const tx = {
            rlp,
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: true,
        }

        const ret = await caver.kas.wallet.requestFDRawTransactionPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                if (k === 'rlp') {
                    expect(ret[k].includes(tx[k]))
                } else {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                }
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })

        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(10)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-105: caver.kas.wallet.requestFDRawTransactionPaidByUser should return fee payer signed fee delegated with ratio transaction via RLP-encoded string paid by user (submit false)', async () => {
        const { rlp } = await caver.kas.wallet.requestFDValueTransferPaidByUser({
            from: accountToTest.address,
            to: senderKeyring.address,
            value: 1,
            gas: 70000,
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: false,
        })

        const tx = {
            rlp,
            feeRatio: 99,
            feePayer: feePayerAddress,
            submit: false,
        }

        const ret = await caver.kas.wallet.requestFDRawTransactionPaidByUser(tx)

        Object.keys(tx).map(k => {
            if (k === 'submit' || k === 'feeRatio') {
            } else if (typeof tx[k] === 'string') {
                if (k === 'rlp') {
                    expect(ret[k].includes(tx[k]))
                } else {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                }
            } else {
                expect(tx[k]).to.equal(ret[k])
            }
        })
        expect(ret.gasPrice).not.to.be.undefined
        expect(ret.nonce).not.to.be.undefined
        expect(ret.rlp).not.to.be.undefined
        expect(ret.typeInt).to.equal(10)
        expect(ret.signatures.length).to.equal(1)
        expect(ret.status).to.be.undefined
        expect(ret.transactionHash).to.be.undefined
        expect(ret.feePayer).not.to.be.undefined

        const decoded = caver.transaction.decode(ret.rlp)
        expect(decoded.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-106: caver.kas.wallet.requestFDAccountUpdatePaidByUser should request fee delegated account update transaction paid by user (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        for (let i = 0; i < accountKeys.length; i++) {
            const accountToUpdate = await caver.kas.wallet.createAccount()
            await sendTestKLAY(accountToUpdate.address, 2)

            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                feePayer: feePayerAddress,
                submit: true,
            }

            // Wait to process transaction
            await timeout(1000)

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByUser(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(33)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.equal('Submitted')
            expect(ret.transactionHash).not.to.be.undefined
            expect(ret.feePayer).not.to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeFeeDelegatedAccountUpdate')
            expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-107: caver.kas.wallet.requestFDAccountUpdatePaidByUser should request fee delegated account update transaction paid by user (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        const accountToUpdate = await caver.kas.wallet.createAccount()

        for (let i = 0; i < accountKeys.length; i++) {
            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                feePayer: feePayerAddress,
                submit: false,
            }

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByUser(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(33)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.be.undefined
            expect(ret.transactionHash).to.be.undefined
            expect(ret.feePayer).not.to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeFeeDelegatedAccountUpdate')
            expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-108: caver.kas.wallet.requestFDAccountUpdatePaidByUser should request fee delegated account update with ratio transaction paid by user (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        for (let i = 0; i < accountKeys.length; i++) {
            const accountToUpdate = await caver.kas.wallet.createAccount()
            await sendTestKLAY(accountToUpdate.address, 2)

            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                feeRatio: 99,
                feePayer: feePayerAddress,
                submit: true,
            }

            // Wait to process transaction
            await timeout(1000)

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByUser(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit' || k === 'feeRatio') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(34)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.equal('Submitted')
            expect(ret.transactionHash).not.to.be.undefined
            expect(ret.feePayer).not.to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeFeeDelegatedAccountUpdateWithRatio')
            expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-109: caver.kas.wallet.requestFDAccountUpdatePaidByUser should request fee delegated account update with ratio transaction paid by user (submit true)', async () => {
        const accountKeys = generateAccountKeySet()

        const accountToUpdate = await caver.kas.wallet.createAccount()

        for (let i = 0; i < accountKeys.length; i++) {
            const tx = {
                from: accountToUpdate.address,
                accountKey: accountKeys[i],
                gas: 1000000,
                feeRatio: 99,
                feePayer: feePayerAddress,
                submit: false,
            }

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByUser(tx)

            Object.keys(tx).map(k => {
                if (k === 'submit' || k === 'feeRatio') {
                } else if (k === 'accountKey') {
                    switch (accountKeys[i].keyType) {
                        case 1:
                            expect(ret[k]).to.equal('0x01c0')
                            break
                        case 2:
                            expect(ret[k].slice(0, 4)).to.equal('0x02')
                            break
                        case 3:
                            expect(ret[k]).to.equal('0x03c0')
                            break
                        case 4:
                            expect(ret[k].slice(0, 4)).to.equal('0x04')
                            break
                        case 5:
                            expect(ret[k].slice(0, 4)).to.equal('0x05')
                            break
                    }
                } else if (typeof tx[k] === 'string') {
                    expect(tx[k].toLowerCase()).to.equal(ret[k].toLowerCase())
                } else {
                    expect(tx[k]).to.equal(ret[k])
                }
            })

            expect(ret.gasPrice).not.to.be.undefined
            expect(ret.nonce).not.to.be.undefined
            expect(ret.rlp).not.to.be.undefined
            expect(ret.typeInt).to.equal(34)
            expect(ret.signatures.length).to.equal(1)
            expect(ret.status).to.be.undefined
            expect(ret.transactionHash).to.be.undefined
            expect(ret.feePayer).not.to.be.undefined

            const decoded = caver.transaction.decode(ret.rlp)
            expect(decoded.type).to.equal('TxTypeFeeDelegatedAccountUpdateWithRatio')
            expect(caver.utils.isEmptySig(decoded.feePayerSignatures)).to.be.false
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-110: caver.kas.wallet.getMultiSigTransactionList should return multisig transaction list', async () => {
        const ret = await caver.kas.wallet.getMultiSigTransactionList(multiSigAccount.address)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].transactionId).to.equal(pendingTx.transactionId)
        expect(ret.items[0].multiSigKeys.length).to.equal(multiSigAddresses.length)
        expect(ret.items[0].txData.from.toLowerCase()).to.equal(multiSigAccount.address.toLowerCase())
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-111: caver.kas.wallet.signMultiSigTransction should sign to multisig transaction', async () => {
        const ret = await caver.kas.wallet.signMultiSigTransction(multiSigAddresses[0], pendingTx.transactionId)

        expect(ret.signedWeight).to.equal(1)
        expect(ret.status).to.equal('Signed')
        expect(ret.transactionId).to.equal(pendingTx.transactionId)
        expect(ret.weight).to.equal(1)
        expect(ret.reminders.length).to.equal(2)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-112: caver.kas.wallet.appendSignatures should append signatures to transaction', async () => {
        const ret = await caver.kas.wallet.appendSignatures(pendingTx.transactionId, sigToAppend)

        expect(ret.signedWeight).to.equal(2)
        expect(ret.status).to.equal('Signed')
        expect(ret.transactionId).to.equal(pendingTx.transactionId)
        expect(ret.weight).to.equal(1)
        expect(ret.reminders.length).to.equal(1)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-113: caver.kas.wallet.getAccountCount should return the number of accounts in KAS', async () => {
        const ret = await caver.kas.wallet.getAccountCount()

        expect(ret.count > 0).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-114: caver.kas.wallet.getAccountCountByKRN should return the number of accounts in KAS by KRN', async () => {
        const ret = await caver.kas.wallet.getAccountCountByKRN(accountToTest.krn)

        expect(ret.count > 0).to.be.true
        expect(ret.krn).to.equal(accountToTest.krn)
    }).timeout(500000)
})
