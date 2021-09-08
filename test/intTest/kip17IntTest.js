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
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.kip17API
const walletEnv = require('../testEnv').auths.walletAPI
const { timeout } = require('../testUtils')

let contractAddress
let alias
let tokenId
let owner
let sender
let to
let tokenToBurn

describe('KIP17 API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)
        caver.initWalletAPI(walletEnv.chainId, walletEnv.accessKeyId, walletEnv.secretAccessKey, walletEnv.url)
    })

    it('CAVERJS-EXT-KAS-INT-247: caver.kas.kip17.deploy should deploy KIP-17 token contract', async () => {
        // Make random string for alias to avoid duplicated alias
        alias = `jasmine-${Math.random()
            .toString(36)
            .substr(2, 11)}`

        const ret = await caver.kas.kip17.deploy('Jasmine', 'JAS', alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-248: caver.kas.kip17.getContractList should return KIP-17 token contract list', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip17.getContractList({ size: 1 })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined

        ret = await caver.kas.kip17.getContractList({ size: 1, cursor: ret.cursor })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-249: caver.kas.kip17.getContract should return KIP-17 token contract', async () => {
        let ret = await caver.kas.kip17.getContract(alias)

        expect(ret.alias).to.equal(alias)
        expect(ret.address).not.to.be.undefined
        expect(ret.name).to.equal('Jasmine')
        expect(ret.symbol).to.equal('JAS')

        contractAddress = ret.address

        ret = await caver.kas.kip17.getContract(contractAddress)

        expect(ret.alias).to.equal(alias)
        expect(ret.address).to.equal(contractAddress)
        expect(ret.name).to.equal('Jasmine')
        expect(ret.symbol).to.equal('JAS')
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-250: caver.kas.kip17.mint should mint KIP-17 token', async () => {
        const accounts = await caver.wallet.generate(3)
        const toAddress = accounts[0]
        const id = 1

        let ret = await caver.kas.kip17.mint(alias, toAddress, id, 'uri')

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        owner = toAddress
        tokenId = id
        sender = accounts[1]
        to = accounts[2]

        ret = await caver.kas.kip17.mint(contractAddress, toAddress, id + 1, 'uri')

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        tokenToBurn = id + 2
        await caver.kas.kip17.mint(contractAddress, toAddress, tokenToBurn, 'uri')
        await caver.kas.kip17.mint(contractAddress, toAddress, tokenToBurn + 1, 'uri')
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-251: caver.kas.kip17.getTokenList should return token list in specific KIP-17 token', async () => {
        await timeout(10000)

        const ret = await caver.kas.kip17.getTokenList(alias, { size: 1 })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined

        const ret2 = await caver.kas.kip17.getTokenList(contractAddress, { size: 1, cursor: ret.cursor })

        expect(ret2.items).not.to.be.undefined
        expect(ret2.items.length).to.equal(1)
        expect(ret2.cursor).not.to.equal(ret.cursor)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-252: caver.kas.kip17.approve should approve token operation of specific token', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip17.approve(alias, owner, sender, tokenId)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        ret = await caver.kas.kip17.approve(contractAddress, owner, sender, caver.utils.toHex(tokenId + 1))

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-253: caver.kas.kip17.transfer should transfer token when sender and owner are same', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip17.transfer(alias, owner, owner, to, tokenId)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        await timeout(10000)

        ret = await caver.kas.kip17.transfer(contractAddress, to, to, owner, caver.utils.toHex(tokenId))

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-254: caver.kas.kip17.transfer should transfer token when sender and owner are different', async () => {
        await timeout(10000)

        // Approve sender to send owner's specificf token.
        await caver.kas.kip17.approve(alias, owner, sender, tokenId)
        await timeout(5000)

        let ret = await caver.kas.kip17.transfer(alias, sender, owner, to, tokenId)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        await timeout(10000)

        ret = await caver.kas.kip17.transfer(contractAddress, to, to, owner, caver.utils.toHex(tokenId))

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-255: caver.kas.kip17.burn should burn token', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip17.burn(alias, owner, tokenToBurn)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        ret = await caver.kas.kip17.burn(contractAddress, owner, caver.utils.toHex(tokenToBurn + 1))

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-256: caver.kas.kip17.approveAll should approve all tokens operation of specific token', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip17.approveAll(alias, owner, sender, true)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        ret = await caver.kas.kip17.approveAll(contractAddress, owner, sender, false)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-257: caver.kas.kip17.getTokenListByOwner should return token list by owner', async () => {
        const ret = await caver.kas.kip17.getTokenListByOwner(alias, owner, { size: 1 })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].owner.toLowerCase()).to.equal(owner.toLowerCase())
        expect(ret.cursor).not.to.be.undefined

        const ret2 = await caver.kas.kip17.getTokenListByOwner(contractAddress, owner, { size: 1, cursor: ret.cursor })

        expect(ret2.items).not.to.be.undefined
        expect(ret2.items.length).to.equal(1)
        expect(ret2.items[0].owner.toLowerCase()).to.equal(owner.toLowerCase())
        expect(ret2.cursor).not.to.equal(ret.cursor)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-258: caver.kas.kip17.getTransferHistory should return transfer history of token', async () => {
        const ret = await caver.kas.kip17.getTransferHistory(alias, tokenId, { size: 1 })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].from.toLowerCase()).to.equal(to.toLowerCase())
        expect(ret.items[0].to.toLowerCase()).to.equal(owner.toLowerCase())
        expect(ret.cursor).not.to.be.undefined

        const ret2 = await caver.kas.kip17.getTransferHistory(contractAddress, tokenId, { size: 1, cursor: ret.cursor })

        expect(ret2.items).not.to.be.undefined
        expect(ret2.items.length).to.equal(1)
        expect(ret2.items[0].from.toLowerCase()).to.equal(owner.toLowerCase())
        expect(ret2.items[0].to.toLowerCase()).to.equal(to.toLowerCase())
        expect(ret2.cursor).not.to.be.undefined
        expect(ret2.cursor).not.to.equal(ret.cursor)
    }).timeout(100000)
})
