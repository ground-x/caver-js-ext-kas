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
let from

const { senderPrivateKey, auths } = require('../testEnv')
const { assert } = require('../extendedChai')

const { url, chainId, accessKeyId, secretAccessKey, feePayerAddress: feePayer } = auths.walletAPI

let contractAddress
let kip7Address
let kip17Address

const byteCode =
    '0x608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029'
const abi = [
    {
        constant: true,
        inputs: [{ name: 'key', type: 'string' }],
        name: 'get',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'key', type: 'string' }, { name: 'value', type: 'string' }],
        name: 'set',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
]
const input =
    '0xe942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000'

async function sendTestKLAY(to, klay = 10) {
    const keyring = caver.keyringContainer.keyring.createFromPrivateKey(senderPrivateKey)
    const vt = new caver.transaction.valueTransfer({
        from: keyring.address,
        to,
        value: caver.utils.toPeb(klay, 'KLAY'),
        gas: 750000,
    })

    await vt.sign(keyring)

    const receipt = await caver.rpc.klay.sendRawTransaction(vt)
    return receipt
}

describe('KAS Wallet', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initNodeAPI(auths.nodeAPI.chainId, auths.nodeAPI.accessKeyId, auths.nodeAPI.secretAccessKey, auths.nodeAPI.url)
        caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)
    })

    it('CAVERJS-EXT-KAS-INT-115: caver.wallet.generate generates an account in KAS Wallet API Service without parameter', async () => {
        const { count } = await caver.kas.wallet.getAccountCount()

        const ret = await caver.wallet.generate()
        from = ret[0].toLowerCase()

        expect(caver.utils.isAddress(from)).to.be.true

        const { count: afterCount } = await caver.kas.wallet.getAccountCount()
        expect(afterCount - count).to.equal(1)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-116: caver.wallet.generate generates accounts in KAS Wallet API Service with number of accounts parameter', async () => {
        const { count } = await caver.kas.wallet.getAccountCount()

        const ret = await caver.wallet.generate(2)

        for (const addr of ret) {
            expect(caver.utils.isAddress(addr)).to.be.true
        }

        const { count: afterCount } = await caver.kas.wallet.getAccountCount()
        expect(afterCount - count).to.equal(ret.length)

        // Remove accounts generated for testing
        for (const addr of ret) {
            await caver.wallet.remove(addr)
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-117: caver.wallet.getAccount returns account from KAS Wallet API Service', async () => {
        const ret = await caver.wallet.getAccount(from)

        expect(caver.utils.isAddress(ret.address)).to.be.true
        expect(ret.chainId).to.equal(chainId)
        expect(ret.createdAt).not.to.be.undefined
        expect(ret.keyId).not.to.be.undefined
        expect(ret.krn).not.to.be.undefined
        expect(ret.publicKey).not.to.be.undefined
        expect(ret.updatedAt).not.to.be.undefined
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-118: caver.wallet.getAccount rejects if account is not existed in KAS Wallet API Service', async () => {
        await expect(caver.wallet.getAccount(caver.keyringContainer.keyring.generate().address)).to.be.rejectedWith(`data don't exist`)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-119: caver.wallet.isExisted returns true if account is existed in KAS Wallet API Service', async () => {
        const isExist = await caver.wallet.isExisted(from)
        expect(isExist).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-120: caver.wallet.isExisted returns false if account is not existed in KAS Wallet API Service', async () => {
        const isExist = await caver.wallet.isExisted(caver.keyringContainer.keyring.generate().address)
        expect(isExist).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-121: caver.wallet.remove returns false if account is not existed in KAS Wallet API Service', async () => {
        const ret = await caver.wallet.generate()

        const removed = await caver.wallet.remove(ret[0])
        expect(removed).to.be.true

        // Double check
        const isExist = await caver.wallet.isExisted(ret[0])
        expect(isExist).to.be.false
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-122: caver.wallet.remove rejects if use tried to remove an account which is not existed in KAS Wallet API Service', async () => {
        await expect(caver.wallet.remove(caver.keyringContainer.keyring.generate().address)).to.be.rejectedWith(`data don't exist`)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-123: caver.wallet.disableAccount deactivates an account in KAS Wallet API Service', async () => {
        const ret = await caver.wallet.disableAccount(from)

        expect(caver.utils.isAddress(ret.address)).to.be.true
        expect(ret.krn).not.to.be.undefined
        expect(ret.updatedAt).not.to.be.undefined

        const tx = new caver.transaction.valueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
        })

        try {
            await caver.wallet.sign(from, tx)
            assert(false)
        } catch (e) {
            expect(e._code).to.equal(1065100)
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-124: caver.wallet.disableAccount rejects if use tried to deactivate an account which is not existed in KAS Wallet API Service', async () => {
        await expect(caver.wallet.disableAccount(caver.keyringContainer.keyring.generate().address)).to.be.rejectedWith(
            `account has been already deleted or disabled`
        )
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-125: caver.wallet.enableAccount activates an account in KAS Wallet API Service', async () => {
        const ret = await caver.wallet.enableAccount(from)

        expect(caver.utils.isAddress(ret.address)).to.be.true
        expect(ret.krn).not.to.be.undefined
        expect(ret.updatedAt).not.to.be.undefined

        const tx = new caver.transaction.valueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
        })

        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-126: caver.wallet.enableAccount rejects if use tried to activate an account which is not existed in KAS Wallet API Service', async () => {
        await expect(caver.wallet.enableAccount(caver.keyringContainer.keyring.generate().address)).to.be.rejectedWith(
            `account has been already deleted or enabled`
        )
    }).timeout(500000)

    // sign
    it('CAVERJS-EXT-KAS-INT-127: caver.wallet.sign signs the legacy transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.legacyTransaction({
            from,
            to: from,
            value: 1,
            gas: 750000,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-128: caver.wallet.sign rejets when the legacy transaction has signatures', async () => {
        const tx = new caver.transaction.legacyTransaction({
            from,
            to: from,
            value: 1,
            gas: 750000,
            signatures: [
                '0x07f5',
                '0xb99eefa471f4ff2a6be78c9f66d512a286084c73c07bfd81e8c4c056b31e003b',
                '0x1b1e3b2b0e74fe1ce44e94c7485cc5e24f852cb0daf52c85a128a77bdd579310',
            ],
        })

        await expect(caver.wallet.sign(from, tx)).to.be.rejectedWith('Legacy transactions cannot contain multiple signatures.')
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-129: caver.wallet.sign signs the value transfer transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.valueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-130: caver.wallet.sign appends signatures to the value transfer transaction', async () => {
        const tx = new caver.transaction.valueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-131: caver.wallet.sign signs the value transfer memo transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.valueTransferMemo({
            from,
            to: from,
            value: 1,
            gas: 750000,
            input: caver.utils.toHex('memo'),
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-132: caver.wallet.sign appends signatures to the value transfer memo transaction', async () => {
        const tx = new caver.transaction.valueTransferMemo({
            from,
            to: from,
            value: 1,
            gas: 750000,
            input: caver.utils.toHex('memo'),
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-133: caver.wallet.sign signs the smart contract deploy transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.smartContractDeploy({
            from,
            value: 0,
            gas: 100000,
            input: byteCode,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-134: caver.wallet.sign appends signatures to the smart contract deploy transaction', async () => {
        const tx = new caver.transaction.smartContractDeploy({
            from,
            value: 0,
            gas: 100000,
            input: byteCode,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-135: caver.wallet.sign signs the smart contract deploy transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.smartContractExecution({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            input,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-136: caver.wallet.sign appends signatures to the smart contract deploy transaction', async () => {
        const tx = new caver.transaction.smartContractExecution({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            input,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-137: caver.wallet.sign signs the account update transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.accountUpdate({
            from,
            gas: 50000,
            account: caver.account.createWithAccountKeyLegacy(from),
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-138: caver.wallet.sign appends signatures to the account update transaction', async () => {
        const tx = new caver.transaction.accountUpdate({
            from,
            gas: 50000,
            account: caver.account.createWithAccountKeyLegacy(from),
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-139: caver.wallet.sign signs the cancel transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.cancel({
            from,
            gas: 50000,
            nonce: 0,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-140: caver.wallet.sign appends signatures to the cancel transaction', async () => {
        const tx = new caver.transaction.cancel({
            from,
            gas: 50000,
            nonce: 0,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-141: caver.wallet.sign signs the chain data anchoring transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.chainDataAnchoring({
            from,
            gas: 50000,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-142: caver.wallet.sign appends signatures to the chain data anchoring transaction', async () => {
        const tx = new caver.transaction.chainDataAnchoring({
            from,
            gas: 50000,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-143: caver.wallet.sign signs the fee delegated value transfer transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-144: caver.wallet.sign appends signatures to the fee delegated value transfer transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-145: caver.wallet.sign signs the fee delegated value transfer memo transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemo({
            from,
            to: from,
            value: 1,
            gas: 750000,
            input: caver.utils.toHex('memo'),
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-146: caver.wallet.sign appends signatures to the fee delegated value transfer memo transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemo({
            from,
            to: from,
            value: 1,
            gas: 750000,
            input: caver.utils.toHex('memo'),
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-147: caver.wallet.sign signs the fee delegated smart contract deploy transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeploy({
            from,
            value: 0,
            gas: 100000,
            input: byteCode,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-148: caver.wallet.sign appends signatures to the fee delegated smart contract deploy transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeploy({
            from,
            value: 0,
            gas: 100000,
            input: byteCode,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-149: caver.wallet.sign signs the fee delegated smart contract deploy transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecution({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            input,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-150: caver.wallet.sign appends signatures to the fee delegated smart contract deploy transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecution({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            input,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-151: caver.wallet.sign signs the fee delegated account update transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdate({
            from,
            gas: 50000,
            account: caver.account.createWithAccountKeyLegacy(from),
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-152; caver.wallet.sign appends signatures to the fee delegated account update transaction', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdate({
            from,
            gas: 50000,
            account: caver.account.createWithAccountKeyLegacy(from),
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-153: caver.wallet.sign signs the fee delegated cancel transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedCancel({
            from,
            gas: 50000,
            nonce: 0,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-154: caver.wallet.sign appends signatures to the fee delegated cancel transaction', async () => {
        const tx = new caver.transaction.feeDelegatedCancel({
            from,
            gas: 50000,
            nonce: 0,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-155: caver.wallet.sign signs the fee delegated chain data anchoring transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoring({
            from,
            gas: 50000,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-156: caver.wallet.sign appends signatures to the fee delegated chain data anchoring transaction', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoring({
            from,
            gas: 50000,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-157: caver.wallet.sign signs the fee delegated value transfer with ratio transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-158: caver.wallet.sign appends signatures to the fee delegated value transfer with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-159: caver.wallet.sign signs the fee delegated value transfer memo with ratio transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemoWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
            input: caver.utils.toHex('memo'),
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-160: caver.wallet.sign appends signatures to the fee delegated value transfer memo with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemoWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
            input: caver.utils.toHex('memo'),
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-161: caver.wallet.sign signs the fee delegated smart contract deploy with ratio transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeployWithRatio({
            from,
            value: 0,
            gas: 100000,
            feeRatio: 50,
            input: byteCode,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-162: caver.wallet.sign appends signatures to the fee delegated smart contract deploy with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeployWithRatio({
            from,
            value: 0,
            gas: 100000,
            feeRatio: 50,
            input: byteCode,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-163: caver.wallet.sign signs the fee delegated smart contract deploy with ratio transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            feeRatio: 50,
            input,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-164: caver.wallet.sign appends signatures to the fee delegated smart contract deploy with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            feeRatio: 50,
            input,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-165: caver.wallet.sign signs the fee delegated account update with ratio transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdateWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            account: caver.account.createWithAccountKeyLegacy(from),
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-166: caver.wallet.sign appends signatures to the fee delegated account update with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdateWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            account: caver.account.createWithAccountKeyLegacy(from),
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-167: caver.wallet.sign signs the fee delegated cancel with ratio transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedCancelWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            nonce: 0,
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-168: caver.wallet.sign appends signatures to the fee delegated cancel with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedCancelWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            nonce: 0,
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-169: caver.wallet.sign signs the fee delegated chain data anchoring with ratio transaction with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoringWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-170: caver.wallet.sign appends signatures to the fee delegated chain data anchoring with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoringWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
            signatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.sign(from, tx)
        expect(signed.signatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
    }).timeout(500000)

    // signAsFeePayer
    it('CAVERJS-EXT-KAS-INT-171: caver.wallet.signAsFeePayer signs the fee delegated value transfer transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-172: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated value transfer transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-173: caver.wallet.signAsFeePayer signs the fee delegated value transfer memo transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemo({
            from,
            to: from,
            value: 1,
            gas: 750000,
            input: caver.utils.toHex('memo'),
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-174: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated value transfer memo transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemo({
            from,
            to: from,
            value: 1,
            gas: 750000,
            input: caver.utils.toHex('memo'),
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-175: caver.wallet.signAsFeePayer signs the fee delegated smart contract deploy transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeploy({
            from,
            value: 0,
            gas: 100000,
            input: byteCode,
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-176: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated smart contract deploy transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeploy({
            from,
            value: 0,
            gas: 100000,
            input: byteCode,
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-177: caver.wallet.signAsFeePayer signs the fee delegated smart contract deploy transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecution({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            input,
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-178: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated smart contract deploy transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecution({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            input,
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-179: caver.wallet.signAsFeePayer signs the fee delegated account update transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdate({
            from,
            gas: 50000,
            account: caver.account.createWithAccountKeyLegacy(from),
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-180: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated account update transaction', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdate({
            from,
            gas: 50000,
            account: caver.account.createWithAccountKeyLegacy(from),
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-181: caver.wallet.signAsFeePayer signs the fee delegated cancel transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedCancel({
            from,
            gas: 50000,
            nonce: 0,
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-182: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated cancel transaction', async () => {
        const tx = new caver.transaction.feeDelegatedCancel({
            from,
            gas: 50000,
            nonce: 0,
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-183: caver.wallet.signAsFeePayer signs the fee delegated chain data anchoring transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoring({
            from,
            gas: 50000,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-184: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated chain data anchoring transaction', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoring({
            from,
            gas: 50000,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-185: caver.wallet.signAsFeePayer signs the fee delegated value transfer with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-186: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated value transfer with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-187: caver.wallet.signAsFeePayer signs the fee delegated value transfer memo with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemoWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
            input: caver.utils.toHex('memo'),
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-188: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated value transfer memo with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemoWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
            input: caver.utils.toHex('memo'),
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-189: caver.wallet.signAsFeePayer signs the fee delegated smart contract deploy with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeployWithRatio({
            from,
            value: 0,
            gas: 100000,
            feeRatio: 50,
            input: byteCode,
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-190: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated smart contract deploy with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeployWithRatio({
            from,
            value: 0,
            gas: 100000,
            feeRatio: 50,
            input: byteCode,
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-191: caver.wallet.signAsFeePayer signs the fee delegated smart contract deploy with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            feeRatio: 50,
            input,
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-192: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated smart contract deploy with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            feeRatio: 50,
            input,
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-193: caver.wallet.signAsFeePayer signs the fee delegated account update with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdateWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            account: caver.account.createWithAccountKeyLegacy(from),
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-194: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated account update with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdateWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            account: caver.account.createWithAccountKeyLegacy(from),
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-195: caver.wallet.signAsFeePayer signs the fee delegated cancel with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedCancelWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            nonce: 0,
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-196: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated cancel with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedCancelWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            nonce: 0,
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-197: caver.wallet.signAsFeePayer signs the fee delegated chain data anchoring with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoringWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-198: caver.wallet.signAsFeePayer appends feePayerSignatures to the fee delegated chain data anchoring with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoringWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
            feePayer,
            feePayerSignatures: [
                [
                    '0x07f5',
                    '0xb566e90ce7c22abf0d801b4f1d46f3b9a3873f564876d931b89bbe7c329b068c',
                    '0x17819e43588595f30a2bee00cff0d9ccad36b5ad562e369b9e973a290daabc99',
                ],
            ],
        })
        const signed = await caver.wallet.signAsFeePayer(feePayer, tx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    // signAsGlobalFeePayer
    it('CAVERJS-EXT-KAS-INT-199: caver.wallet.signAsGlobalFeePayer signs the fee delegated value transfer transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-200: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated value transfer transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransfer({
            from,
            to: from,
            value: 1,
            gas: 750000,
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-201: caver.wallet.signAsGlobalFeePayer signs the fee delegated value transfer memo transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemo({
            from,
            to: from,
            value: 1,
            gas: 750000,
            input: caver.utils.toHex('memo'),
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-202: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated value transfer memo transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemo({
            from,
            to: from,
            value: 1,
            gas: 750000,
            input: caver.utils.toHex('memo'),
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-203: caver.wallet.signAsGlobalFeePayer signs the fee delegated smart contract deploy transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeploy({
            from,
            value: 0,
            gas: 100000,
            input: byteCode,
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-204: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated smart contract deploy transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeploy({
            from,
            value: 0,
            gas: 100000,
            input: byteCode,
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-205: caver.wallet.signAsGlobalFeePayer signs the fee delegated smart contract deploy transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecution({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            input,
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-206: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated smart contract deploy transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecution({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            input,
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-207: caver.wallet.signAsGlobalFeePayer signs the fee delegated account update transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdate({
            from,
            gas: 50000,
            account: caver.account.createWithAccountKeyLegacy(from),
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-208: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated account update transaction', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdate({
            from,
            gas: 50000,
            account: caver.account.createWithAccountKeyLegacy(from),
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-209: caver.wallet.signAsGlobalFeePayer signs the fee delegated cancel transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedCancel({
            from,
            gas: 50000,
            nonce: 0,
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-210: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated cancel transaction', async () => {
        const tx = new caver.transaction.feeDelegatedCancel({
            from,
            gas: 50000,
            nonce: 0,
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-211: caver.wallet.signAsGlobalFeePayer signs the fee delegated chain data anchoring transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoring({
            from,
            gas: 50000,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-212: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated chain data anchoring transaction', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoring({
            from,
            gas: 50000,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-213: caver.wallet.signAsGlobalFeePayer signs the fee delegated value transfer with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-214: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated value transfer with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-215: caver.wallet.signAsGlobalFeePayer signs the fee delegated value transfer memo with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemoWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
            input: caver.utils.toHex('memo'),
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-216: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated value transfer memo with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedValueTransferMemoWithRatio({
            from,
            to: from,
            value: 1,
            gas: 750000,
            feeRatio: 50,
            input: caver.utils.toHex('memo'),
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-217: caver.wallet.signAsGlobalFeePayer signs the fee delegated smart contract deploy with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeployWithRatio({
            from,
            value: 0,
            gas: 100000,
            feeRatio: 50,
            input: byteCode,
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-218: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated smart contract deploy with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractDeployWithRatio({
            from,
            value: 0,
            gas: 100000,
            feeRatio: 50,
            input: byteCode,
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-219: caver.wallet.signAsGlobalFeePayer signs the fee delegated smart contract deploy with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            feeRatio: 50,
            input,
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-220: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated smart contract deploy with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedSmartContractExecutionWithRatio({
            from,
            to: caver.keyringContainer.keyring.generate().address,
            gas: 50000,
            feeRatio: 50,
            input,
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-221: caver.wallet.signAsGlobalFeePayer signs the fee delegated account update with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdateWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            account: caver.account.createWithAccountKeyLegacy(from),
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-222: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated account update with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedAccountUpdateWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            account: caver.account.createWithAccountKeyLegacy(from),
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-223: caver.wallet.signAsGlobalFeePayer signs the fee delegated cancel with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedCancelWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            nonce: 0,
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-224: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated cancel with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedCancelWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            nonce: 0,
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-225: caver.wallet.signAsGlobalFeePayer signs the fee delegated chain data anchoring with ratio transaction as fee payer with the account in KAS Wallet API Service', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoringWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
        })
        const signed = await caver.wallet.signAsGlobalFeePayer(tx)
        expect(signed.feePayerSignatures.length).to.equal(1)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-226: caver.wallet.signAsGlobalFeePayer appends feePayerSignatures to the fee delegated chain data anchoring with ratio transaction', async () => {
        const tx = new caver.transaction.feeDelegatedChainDataAnchoringWithRatio({
            from,
            gas: 50000,
            feeRatio: 50,
            input:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
        })
        const feePayerSignedTx = await caver.wallet.signAsGlobalFeePayer(tx)
        const signed = await caver.wallet.signAsGlobalFeePayer(feePayerSignedTx)
        expect(signed.feePayerSignatures.length).to.equal(2)
        expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
        expect(caver.utils.isEmptySig(signed.signatures)).to.be.true
        expect(signed.type).to.equal(tx.type)
        expect(caver.utils.isAddress(signed.feePayer)).to.be.true
    }).timeout(500000)

    // caver.contract
    it('CAVERJS-EXT-KAS-INT-227: caver.contract deploys contract with an account in KAS Wallet API Service', async () => {
        // Send Test KLAY
        await sendTestKLAY(from)

        const contract = new caver.contract(abi)
        const deployed = await contract.deploy({ data: byteCode }).send({ from, gas: 1000000 })

        expect(deployed.options.address).not.to.be.undefined
        expect(await caver.rpc.klay.isContractAccount(deployed.options.address)).to.be.true

        contractAddress = deployed.options.address.toLowerCase()
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-228: caver.contract execute contract with an account in KAS Wallet API Service', async () => {
        const contract = new caver.contract(abi, contractAddress)
        const receipt = await contract.methods.set('key', 'value').send({ from, gas: 500000 })

        expect(receipt.from.toLowerCase()).to.equal(from)
        expect(receipt.to.toLowerCase()).to.equal(contractAddress)
    }).timeout(500000)

    // caver.kct.kip7
    it('CAVERJS-EXT-KAS-INT-229: caver.kct.kip7 deploys KIP-7 contract with an account in KAS Wallet API Service', async () => {
        const kip7 = await caver.kct.kip7.deploy(
            {
                name: 'Alice',
                symbol: 'ALI',
                decimals: 18,
                initialSupply: '5000000000000000000000',
            },
            from
        )

        expect(kip7.options.address).not.to.be.undefined
        expect(await caver.rpc.klay.isContractAccount(kip7.options.address)).to.be.true

        kip7Address = kip7.options.address.toLowerCase()
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-230: caver.contract execute KIP-7 contract with an account in KAS Wallet API Service', async () => {
        const kip7 = new caver.kct.kip7(kip7Address)
        const receipt = await kip7.transfer(caver.keyringContainer.keyring.generate().address, 1, { from })

        expect(receipt.from.toLowerCase()).to.equal(from)
        expect(receipt.to.toLowerCase()).to.equal(kip7Address)
    }).timeout(500000)

    // caver.kct.kip17
    it('CAVERJS-EXT-KAS-INT-231: caver.kct.kip17 deploys KIP-17 contract with an account in KAS Wallet API Service', async () => {
        const kip17 = await caver.kct.kip17.deploy(
            {
                name: 'Alice',
                symbol: 'ALI',
            },
            from
        )

        expect(kip17.options.address).not.to.be.undefined
        expect(await caver.rpc.klay.isContractAccount(kip17.options.address)).to.be.true

        kip17Address = kip17.options.address.toLowerCase()
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-232: caver.contract execute KIP-17 contract with an account in KAS Wallet API Service', async () => {
        const kip17 = new caver.kct.kip17(kip17Address)
        const receipt = await kip17.mintWithTokenURI(from, 1, 'https://testTokenURI.json', { from })

        expect(receipt.from.toLowerCase()).to.equal(from)
        expect(receipt.to.toLowerCase()).to.equal(kip17Address)
    }).timeout(500000)
})
