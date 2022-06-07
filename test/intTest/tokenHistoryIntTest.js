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
        tokenOwnerAddress: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
    },
    qa: {
        ftContractAddress: '0x854363D6E06E24809d867515e2bA7A82E0EF3aB2',
        nftContractAddress: '0x6B152ee52fA2CF29D60389C5a0DC1a4932868CC3',
        nftTokenId: '0x0',
        mtContractAddress: '0x9AE6E0807359869b1f5b3c73130C146017d562ce',
        mtTokenId: '0x0',
        transactionHash: '0xf257aab67d3b562217d2ebd87391091cbb4f710ac680201be29dc06af98c7965',
        range: '1613004103,1613616169',
        tokenOwnerAddress: '0x89a8e75d92ce84076d33f68e4909c4156847dc69',
    },
    prod: {
        ftContractAddress: '0x4792f1e64d0f656e61516805b7d2cd99f9359043',
        nftContractAddress: '0x18d9add7bf4097cc57dd6962ece441e391146682',
        nftTokenId: '0x0',
        mtContractAddress: '0x6679A0006575989065832e17FE4F1e4eD4923390',
        mtTokenId: '0x0',
        transactionHash: '0x8b86a549dd73895fd72ea5b3430bc043f6d410d74a67004c673c0fc1b9a56534',
        range: '1611803332,1611903332',
        tokenOwnerAddress: '0x89a8e75d92ce84076d33f68e4909c4156847dc69',
    },
}

const {
    ftContractAddress,
    nftContractAddress,
    mtContractAddress,
    nftTokenId,
    mtTokenId,
    transactionHash,
    range,
    tokenOwnerAddress,
} = url.includes('dev') ? testVariables.dev : url.includes('qa') ? testVariables.qa : testVariables.prod

describe('TokenHistory API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        keyringContainer = new caver.keyringContainer()
        caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)
        caver.initNodeAPI(nodeAPIEnv.chainId, nodeAPIEnv.accessKeyId, nodeAPIEnv.secretAccessKey, nodeAPIEnv.url)
    })

    it('CAVERJS-EXT-KAS-INT-007: caver.kas.tokenHistory.getTransferHistory should query transfer history', async () => {
        await timeout(1000)
        const queryOptions = {
            kind: [caver.kas.tokenHistory.queryOptions.kind.NFT],
            size: 1,
            range,
            excludeZeroKlay: true,
        }

        const ret = await caver.kas.tokenHistory.getTransferHistory(presets, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).not.to.be.undefined
        expect(ret.cursor).not.to.be.undefined
        expect(ret.items[0].contract).not.to.be.undefined
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
        let queryOptions = {
            kind: [caver.kas.tokenHistory.queryOptions.kind.NFT],
            size: 1,
            range,
            caFilter: nftContractAddress,
            fromOnly: true,
            excludeZeroKlay: true,
        }

        let ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(tokenOwnerAddress, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length > 0).to.be.true
        expect(ret.items[0].from === tokenOwnerAddress).to.be.true
        expect(ret.items[0].contract.address.toLowerCase()).to.equal(queryOptions.caFilter.toLowerCase())
        expect(ret.cursor).not.to.be.undefined

        queryOptions = {
            kind: [caver.kas.tokenHistory.queryOptions.kind.NFT],
            size: 1,
            toOnly: true,
        }

        ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(tokenOwnerAddress, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length > 0).to.be.true
        expect(ret.items[0].to === tokenOwnerAddress).to.be.true
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

        expect(ret.address.toLowerCase()).to.equal(ftContractAddress.toLowerCase())
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

        expect(ret.address.toLowerCase()).to.equal(contractAddress.toLowerCase())
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
        const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContractAddress, tokenOwnerAddress)

        expect(ret.totalBalance).not.to.be.undefined
        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].balance).to.equal(ret.items[0].totalSupply)
        expect(ret.items[0].owner).to.equal(tokenOwnerAddress)
        expect(ret.items[0].transferFrom).to.equal('0x0000000000000000000000000000000000000000')
        expect(ret.items[0].transferTo).to.equal(tokenOwnerAddress)
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-238: caver.kas.tokenHistory.getMT should return MT', async () => {
        const ret = await caver.kas.tokenHistory.getMT(mtContractAddress, tokenOwnerAddress, mtTokenId)

        expect(ret.tokenId).to.equal(mtTokenId)
        expect(ret.owner.toLowerCase()).to.equal(tokenOwnerAddress.toLowerCase())
        expect(ret.tokenAddress.toLowerCase()).to.equal(mtContractAddress.toLowerCase())
        expect(ret.totalSupply).not.to.be.undefined
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.transferFrom).to.equal('0x0000000000000000000000000000000000000000')
        expect(ret.transferTo.toLowerCase()).to.equal(tokenOwnerAddress.toLowerCase())
        expect(ret.updatedAt).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-239: caver.kas.tokenHistory.getMTOwnerListByTokenId should return MT token owner list', async () => {
        const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContractAddress, mtTokenId)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].tokenId).to.equal(mtTokenId)
        expect(ret.items[0].balance).to.equal(ret.items[0].totalSupply)
        expect(ret.items[0].owner.toLowerCase()).to.equal(tokenOwnerAddress.toLowerCase())
        expect(ret.items[0].transferFrom).to.equal('0x0000000000000000000000000000000000000000')
        expect(ret.items[0].transferTo.toLowerCase()).to.equal(tokenOwnerAddress.toLowerCase())
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-278: caver.kas.tokenHistory.getContractListByOwner should return contract list', async () => {
        const ret = await caver.kas.tokenHistory.getContractListByOwner(tokenOwnerAddress, {
            kind: [caver.kas.tokenHistory.queryOptions.kind.FT, caver.kas.tokenHistory.queryOptions.kind.NFT],
            size: 2,
        })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(2)
        expect(ret.items[0].kind === 'ft' || ret.items[0].kind === 'nft').to.be.true
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-279: caver.kas.tokenHistory.getTokenListByOwner should return token list', async () => {
        const ret = await caver.kas.tokenHistory.getTokenListByOwner(tokenOwnerAddress, {
            kind: caver.kas.tokenHistory.queryOptions.kind.MT,
            size: 1,
        })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].kind).to.equal('mt')
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-339: caver.kas.tokenHistory.getMTList should query MT list issued in specific MT contract', async () => {
        const contractAddress = mtContractAddress
        const queryOptions = {
            size: 1,
        }

        const ret = await caver.kas.tokenHistory.getMTList(contractAddress, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-340: caver.kas.tokenHistory.getMTHolder should return number of owners', async () => {
        const contractAddress = mtContractAddress

        const ret = await caver.kas.tokenHistory.getMTHolder(contractAddress)

        expect(ret.address).to.equal(contractAddress)
        expect(ret.totalHolder).not.to.be.undefined
    }).timeout(1000000)

    it('CAVERJS-EXT-KAS-INT-341: caver.kas.tokenHistory.getNFTHolder should return number of owners', async () => {
        const contractAddress = nftContractAddress

        const ret = await caver.kas.tokenHistory.getNFTHolder(contractAddress)

        expect(ret.address).to.equal(contractAddress)
        expect(ret.totalHolder).not.to.be.undefined
    }).timeout(1000000)
})
