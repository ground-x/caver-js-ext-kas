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

describe('TokenHistory API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)
    })

    it('CAVERJS-EXT-KAS-INT-007: caver.kas.tokenHistory.getTransferHistory should query transfer history', async () => {
        const queryOptions = {
            kind: [caver.kas.tokenHistory.queryOptions.kind.KLAY],
            size: 1,
            range: '1593529200,1603776414',
        }
        const preset = presets

        const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-008: caver.kas.tokenHistory.getTransferHistoryByTxHash should query transaction', async () => {
        const transactionHash = '0xd5e3e204a41f4ffab83cd8b4f5816e4020b618d507c5ae431fadd0fc9fe5333e'

        const ret = await caver.kas.tokenHistory.getTransferHistoryByTxHash(transactionHash)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].transactionHash).to.equal(transactionHash)
    })

    it('CAVERJS-EXT-KAS-INT-009: caver.kas.tokenHistory.getTransferHistoryByAccount should query transaction by account', async () => {
        const account = '0x60498fefbf1705a3db8d7bb5c80d5238956343e5'
        const queryOptions = {
            kind: [caver.kas.tokenHistory.queryOptions.kind.NFT],
            size: 1,
            range: '1593529200,1603777118',
            caFilter: '0x677837af7bf37f70a56a2c3853d5d1fa53d3bd92',
        }

        const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(account, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].from).to.equal(account)
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
        const contractAddress = '0xf0e5186029a70062e7e1fccb0f4ad53a4b7d6294'

        const ret = await caver.kas.tokenHistory.getFTContract(contractAddress)

        expect(ret.address).to.equal(contractAddress)
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
        const contractAddress = '0x677837af7bf37f70a56a2c3853d5d1fa53d3bd92'

        const ret = await caver.kas.tokenHistory.getNFTContract(contractAddress)

        expect(ret.address).to.equal(contractAddress)
    })

    it('CAVERJS-EXT-KAS-INT-014: caver.kas.tokenHistory.getNFTList should query NFT list issued in specific NFT contract', async () => {
        const contractAddress = '0x677837af7bf37f70a56a2c3853d5d1fa53d3bd92'
        const queryOptions = {
            size: 1,
        }

        const ret = await caver.kas.tokenHistory.getNFTList(contractAddress, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-015: caver.kas.tokenHistory.getNFTListByOwner should query NFT list issued in specific NFT contract by owner', async () => {
        const contractAddress = '0x677837af7bf37f70a56a2c3853d5d1fa53d3bd92'
        const owner = '0x60498fefbf1705a3db8d7bb5c80d5238956343e5'
        const queryOptions = {
            size: 1,
        }

        const ret = await caver.kas.tokenHistory.getNFTListByOwner(contractAddress, owner, queryOptions)

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-016: caver.kas.tokenHistory.getNFT should query NFT issued in specific NFT contract by owner', async () => {
        const contractAddress = '0x677837af7bf37f70a56a2c3853d5d1fa53d3bd92'
        const tokenId = '0x2'

        const ret = await caver.kas.tokenHistory.getNFT(contractAddress, tokenId)

        expect(ret.tokenId).to.equal(tokenId)
    })

    it('CAVERJS-EXT-KAS-INT-017: caver.kas.tokenHistory.getNFTOwnershipHistory should query NFT ownership history', async () => {
        const contractAddress = '0x677837af7bf37f70a56a2c3853d5d1fa53d3bd92'
        const tokenId = '0x3'

        const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(contractAddress, tokenId)

        expect(ret.items).not.to.be.undefined
        expect(ret.items[0].from).not.to.be.undefined
        expect(ret.items[0].to).not.to.be.undefined
        expect(ret.items[0].timestamp).not.to.be.undefined
        expect(ret.cursor).not.to.be.undefined
    })
})
