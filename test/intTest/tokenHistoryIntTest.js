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

let ftContractAddress
let nftContractAddress

const nftTokenId = '0x0'

const receiver = '0x60498fEFBF1705A3Db8d7Bb5c80D5238956343e5'

let nftTransfer

async function createTestTokenContracts(sender) {
    await timeout(3000)
    const sendKLAY = new caver.transaction.valueTransfer({
        from: sender.address,
        to: receiver,
        value: 1,
        gas: 25000,
    })

    await caver.wallet.sign(sender.address, sendKLAY)

    await caver.rpc.klay.sendRawTransaction(sendKLAY)

    const kip7 = await caver.kct.kip7.deploy(
        { name: 'Jasmine', symbol: 'JAS', decimals: 18, initialSupply: '100000000000000000' },
        sender.address
    )
    ftContractAddress = kip7.options.address.toLowerCase()

    await kip7.transfer(receiver, 1, { from: sender.address })

    const kip17 = await caver.kct.kip17.deploy({ name: 'Jasmine', symbol: 'JAS' }, sender.address)
    nftContractAddress = kip17.options.address.toLowerCase()

    await kip17.mintWithTokenURI(sender.address, nftTokenId, 'test URI 1', { from: sender.address })
    await kip17.transferFrom(sender.address, receiver, nftTokenId, { from: sender.address })
}

describe('TokenHistory API service', () => {
    let sender

    before(function(done) {
        this.timeout(100000)

        caver = new CaverExtKAS()
        caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)
        caver.initNodeAPI(nodeAPIEnv.chainId, nodeAPIEnv.accessKeyId, nodeAPIEnv.secretAccessKey, nodeAPIEnv.url)

        sender = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(senderPrivateKey))

        createTestTokenContracts(sender).then(() => done())
    })

    it('CAVERJS-EXT-KAS-INT-007: caver.kas.tokenHistory.getTransferHistory should query transfer history', async () => {
        await timeout(1000)
        const queryOptions = {
            kind: [caver.kas.tokenHistory.queryOptions.kind.NFT],
            size: 1,
            range: `${parseInt(Date.now() / 1000) - 100000},${parseInt(Date.now() / 1000)}`,
        }

        const ret = await caver.kas.tokenHistory.getTransferHistory(presets, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
        expect(ret.items[0].contract).not.to.be.undefined
        expect(ret.items[0].contract.constructor.name).to.equal('NftContract')

        nftTransfer = ret.items[0]
    }).timeout(10000)

    it('CAVERJS-EXT-KAS-INT-008: caver.kas.tokenHistory.getTransferHistoryByTxHash should query transaction', async () => {
        const transactionHash = nftTransfer.transaction.transactionHash

        const ret = await caver.kas.tokenHistory.getTransferHistoryByTxHash(transactionHash)

        let nftTransferItem
        for (const i of ret.items) {
            if (i.transferType === 'nft') nftTransferItem = i
        }

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length > 0).to.be.true
        expect(nftTransferItem).not.to.be.undefined
        expect(nftTransferItem.transaction.transactionHash).to.equal(transactionHash)
    })

    it('CAVERJS-EXT-KAS-INT-009: caver.kas.tokenHistory.getTransferHistoryByAccount should query transaction by account', async () => {
        const queryOptions = {
            kind: [caver.kas.tokenHistory.queryOptions.kind.NFT],
            size: 1,
            range: `${parseInt(Date.now() / 1000) - 100000},${parseInt(Date.now() / 1000)}`,
            caFilter: nftContractAddress,
        }

        const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(sender.address, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length > 0).to.be.true
        expect(ret.items[0].from === sender.address || ret.items[0].to === sender.address).to.be.true
        expect(ret.items[0].contract.address).to.equal(queryOptions.caFilter)
        expect(ret.cursor).not.to.be.undefined
    })

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
    })

    it('CAVERJS-EXT-KAS-INT-011: caver.kas.tokenHistory.getFTContract should query FT contract', async () => {
        const ret = await caver.kas.tokenHistory.getFTContract(ftContractAddress)

        expect(ret.address).to.equal(ftContractAddress)
    })

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
    })

    it('CAVERJS-EXT-KAS-INT-013: caver.kas.tokenHistory.getNFTContract should query NFT contract', async () => {
        const contractAddress = nftContractAddress

        const ret = await caver.kas.tokenHistory.getNFTContract(contractAddress)

        expect(ret.address).to.equal(contractAddress)
    })

    it('CAVERJS-EXT-KAS-INT-014: caver.kas.tokenHistory.getNFTList should query NFT list issued in specific NFT contract', async () => {
        const contractAddress = nftContractAddress
        const queryOptions = {
            size: 1,
        }

        const ret = await caver.kas.tokenHistory.getNFTList(contractAddress, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-015: caver.kas.tokenHistory.getNFTListByOwner should query NFT list issued in specific NFT contract by owner', async () => {
        const queryOptions = {
            size: 1,
        }

        const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftContractAddress, receiver, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-016: caver.kas.tokenHistory.getNFT should query NFT issued in specific NFT contract by owner', async () => {
        const ret = await caver.kas.tokenHistory.getNFT(nftContractAddress, nftTokenId)
        expect(ret.tokenId).to.equal(nftTokenId)
    })

    it('CAVERJS-EXT-KAS-INT-017: caver.kas.tokenHistory.getNFTOwnershipHistory should query NFT ownership history', async () => {
        const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(nftContractAddress, nftTokenId)

        expect(ret.items).not.to.be.undefined
        expect(ret.items[0].from).not.to.be.undefined
        expect(ret.items[0].to).not.to.be.undefined
        expect(ret.items[0].timestamp).not.to.be.undefined
        expect(ret.cursor).not.to.be.undefined
    })
})
