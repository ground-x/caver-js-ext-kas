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
const { url, chainId, accessKeyId, secretAccessKey, presets } = require('../testEnv').auths.tokenHistoryAPI
const nodeAPIEnv = require('../testEnv').auths.nodeAPI
const { senderPrivateKey } = require('../testEnv')
const { timeout } = require('../testUtils')

const receiver = '0x60498fEFBF1705A3Db8d7Bb5c80D5238956343e5'

let keyringContainer

const testVariables = {
    dev: {
        ftContractAddress: '0xa904b57f567e07348186a3687cafc3b9d05d8608',
        nftContractAddress: '0x8386ea0a21dcf47d489bf1505a84942babadb3b0',
        nftTokenId: '0x0',
        mtContractAddress: '0xDbE9c814B10882bBEE42cbc75CE16A1620F5F042',
        mtTokenId: '0x0',
        transactionHash: '0xd7ca606d531ee9afc5aed7b43d9476be3776ca06e03e0db8f21c121436962fbb',
        range: '1611804103,1611904103',
    },
    qa: {},
    prod: {
        ftContractAddress: '0x4792f1e64d0f656e61516805b7d2cd99f9359043',
        nftContractAddress: '0x18d9add7bf4097cc57dd6962ece441e391146682',
        nftTokenId: '0x0',
        mtContractAddress: '0x6679A0006575989065832e17FE4F1e4eD4923390',
        mtTokenId: '0x0',
        transactionHash: '0x8b86a549dd73895fd72ea5b3430bc043f6d410d74a67004c673c0fc1b9a56534',
        range: '1611803332,1611903332',
    },
}

const { ftContractAddress, nftContractAddress, mtContractAddress, nftTokenId, mtTokenId, transactionHash, range } = url.includes('dev')
    ? testVariables.dev
    : url.includes('qa')
    ? testVariables.qa
    : testVariables.prod

// // A function to configure the environment to test the TokenHistory API.
// // Currently, the test works not by directly deploying and using it, but by performing a test that searches by using a specific value. (in testVariables)
// // Therefore, this function will be used later when testing a scenario that directly deploys and retrieves contracts.
// async function createTestTokenContracts(sender) {
//     await timeout(3000)
//     const sendKLAY = new caver.transaction.valueTransfer({
//         from: sender.address,
//         to: receiver,
//         value: 1,
//         gas: 25000,
//     })

//     await keyringContainer.sign(sender.address, sendKLAY)

//     await caver.rpc.klay.sendRawTransaction(sendKLAY)

//     const kip7 = await caver.kct.kip7.deploy(
//         { name: 'Jasmine', symbol: 'JAS', decimals: 18, initialSupply: '100000000000000000' },
//         sender.address,
//         keyringContainer
//     )
//     ftContractAddress = kip7.options.address.toLowerCase()

//     await kip7.transfer(receiver, 1, { from: sender.address })

//     const kip17 = await caver.kct.kip17.deploy({ name: 'Jasmine', symbol: 'JAS' }, sender.address, keyringContainer)
//     nftContractAddress = kip17.options.address.toLowerCase()

//     await kip17.mintWithTokenURI(sender.address, nftTokenId, 'test URI 1', { from: sender.address })
//     await kip17.transferFrom(sender.address, receiver, nftTokenId, { from: sender.address })

//     // Wait until applying the transactions to KAS
//     await timeout(5000)

//     const contract = new caver.contract(kip37ABI)
//     contract.setWallet(keyringContainer)
//     const kip37 = await contract
//         .deploy({
//             data: kip37ByteCode,
//             arguments: ['uri string'],
//         })
//         .send({ from: sender.address, gas: 8000000 })
//     mtContractAddress = kip37.options.address

//     await kip37.methods.create(mtTokenId, '1000', 'test uri string').send({ from: sender.address, gas: 500000 })
//     await timeout(5000)
// }

describe('TokenHistory API service', () => {
    let sender

    before(() => {
        caver = new CaverExtKAS()
        keyringContainer = new caver.keyringContainer()
        caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)
        caver.initNodeAPI(nodeAPIEnv.chainId, nodeAPIEnv.accessKeyId, nodeAPIEnv.secretAccessKey, nodeAPIEnv.url)

        sender = keyringContainer.add(keyringContainer.keyring.createFromPrivateKey(senderPrivateKey))
    })

    it('CAVERJS-EXT-KAS-INT-007: caver.kas.tokenHistory.getTransferHistory should query transfer history', async () => {
        await timeout(1000)
        const queryOptions = {
            kind: [caver.kas.tokenHistory.queryOptions.kind.NFT],
            size: 1,
            range,
        }

        const ret = await caver.kas.tokenHistory.getTransferHistory(presets, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
        expect(ret.items[0].contract).not.to.be.undefined
        expect(ret.items[0].contract.constructor.name).to.equal('NftContract')
    }).timeout(10000)

    it('CAVERJS-EXT-KAS-INT-008: caver.kas.tokenHistory.getTransferHistoryByTxHash should query transaction', async () => {
        const ret = await caver.kas.tokenHistory.getTransferHistoryByTxHash(transactionHash)

        let nftTransferItem
        for (const i of ret.items) {
            if (i.transferType === 'nft') nftTransferItem = i
        }

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length > 0).to.be.true
        expect(nftTransferItem).not.to.be.undefined
        expect(nftTransferItem.transaction.transactionHash).to.equal(transactionHash)
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-009: caver.kas.tokenHistory.getTransferHistoryByAccount should query transaction by account', async () => {
        const queryOptions = {
            kind: [caver.kas.tokenHistory.queryOptions.kind.NFT],
            size: 1,
            range,
            caFilter: nftContractAddress,
        }

        const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(sender.address, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length > 0).to.be.true
        expect(ret.items[0].from === sender.address || ret.items[0].to === sender.address).to.be.true
        expect(ret.items[0].contract.address).to.equal(queryOptions.caFilter)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-010: caver.kas.tokenHistory.getFTContractList should query FT contract list', async () => {
        const queryOptions = {
            status: caver.kas.tokenHistory.queryOptions.status.COMPLETED,
            size: 1,
            type: caver.kas.tokenHistory.queryOptions.type.KIP7,
        }

        const ret = await caver.kas.tokenHistory.getFTContractList(queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].type).to.equal('KIP-7')
        expect(ret.items[0].status).to.equal('completed')
        expect(ret.cursor).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-011: caver.kas.tokenHistory.getFTContract should query FT contract', async () => {
        const ret = await caver.kas.tokenHistory.getFTContract(ftContractAddress)

        expect(ret.address).to.equal(ftContractAddress)
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-012: caver.kas.tokenHistory.getNFTContractList should query NFT contract list', async () => {
        const queryOptions = {
            status: caver.kas.tokenHistory.queryOptions.status.COMPLETED,
            size: 1,
            type: caver.kas.tokenHistory.queryOptions.type.KIP17,
        }

        const ret = await caver.kas.tokenHistory.getNFTContractList(queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].type).to.equal('KIP-17')
        expect(ret.items[0].status).to.equal('completed')
        expect(ret.cursor).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-013: caver.kas.tokenHistory.getNFTContract should query NFT contract', async () => {
        const contractAddress = nftContractAddress

        const ret = await caver.kas.tokenHistory.getNFTContract(contractAddress)

        expect(ret.address).to.equal(contractAddress)
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-014: caver.kas.tokenHistory.getNFTList should query NFT list issued in specific NFT contract', async () => {
        const contractAddress = nftContractAddress
        const queryOptions = {
            size: 1,
        }

        const ret = await caver.kas.tokenHistory.getNFTList(contractAddress, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-015: caver.kas.tokenHistory.getNFTListByOwner should query NFT list issued in specific NFT contract by owner', async () => {
        const queryOptions = {
            size: 1,
        }

        const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftContractAddress, receiver, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-016: caver.kas.tokenHistory.getNFT should query NFT issued in specific NFT contract by owner', async () => {
        const ret = await caver.kas.tokenHistory.getNFT(nftContractAddress, nftTokenId)
        expect(ret.tokenId).to.equal(nftTokenId)
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-017: caver.kas.tokenHistory.getNFTOwnershipHistory should query NFT ownership history', async () => {
        const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(nftContractAddress, nftTokenId)

        expect(ret.items).not.to.be.undefined
        expect(ret.items[0].from).not.to.be.undefined
        expect(ret.items[0].to).not.to.be.undefined
        expect(ret.items[0].timestamp).not.to.be.undefined
        expect(ret.cursor).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-235: caver.kas.tokenHistory.getMTContractList should return MT contract list', async () => {
        const queryOptions = {
            status: caver.kas.tokenHistory.queryOptions.status.COMPLETED,
            size: 1,
            type: caver.kas.tokenHistory.queryOptions.type.KIP37,
        }

        const ret = await caver.kas.tokenHistory.getMTContractList(queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].type).to.equal('KIP-37')
        expect(ret.items[0].status).to.equal('completed')
        expect(ret.cursor).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-236: caver.kas.tokenHistory.getMTContract should return MT contract', async () => {
        const ret = await caver.kas.tokenHistory.getMTContract(mtContractAddress)

        expect(ret.address.toLowerCase()).to.equal(mtContractAddress.toLowerCase())
        expect(ret.status).to.equal(caver.kas.tokenHistory.queryOptions.status.COMPLETED)
        expect(ret.type).to.equal(caver.kas.tokenHistory.queryOptions.type.KIP37)
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-237: caver.kas.tokenHistory.getMTListByOwner should return MT token list by owner', async () => {
        const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContractAddress, sender.address)

        expect(ret.totalBalance).not.to.be.undefined
        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].balance).to.equal(ret.items[0].totalSupply)
        expect(ret.items[0].owner).to.equal(sender.address)
        expect(ret.items[0].transferFrom).to.equal('0x0000000000000000000000000000000000000000')
        expect(ret.items[0].transferTo).to.equal(sender.address)
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-238: caver.kas.tokenHistory.getMT should return MT', async () => {
        const ret = await caver.kas.tokenHistory.getMT(mtContractAddress, sender.address, mtTokenId)

        expect(ret.tokenId).to.equal(mtTokenId)
        expect(ret.owner.toLowerCase()).to.equal(sender.address.toLowerCase())
        expect(ret.tokenAddress.toLowerCase()).to.equal(mtContractAddress.toLowerCase())
        expect(ret.totalSupply).not.to.be.undefined
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.transferFrom).to.equal('0x0000000000000000000000000000000000000000')
        expect(ret.transferTo.toLowerCase()).to.equal(sender.address.toLowerCase())
        expect(ret.updatedAt).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-239: caver.kas.tokenHistory.getMTOwnerListByTokenId should return MT token owner list', async () => {
        const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContractAddress, mtTokenId)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].tokenId).to.equal(mtTokenId)
        expect(ret.items[0].balance).to.equal(ret.items[0].totalSupply)
        expect(ret.items[0].owner.toLowerCase()).to.equal(sender.address.toLowerCase())
        expect(ret.items[0].transferFrom).to.equal('0x0000000000000000000000000000000000000000')
        expect(ret.items[0].transferTo.toLowerCase()).to.equal(sender.address.toLowerCase())
    }).timeout(1000000)
})
