/*
 * Copyright 2021 The caver-js-ext-kas Authors
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
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.kip7API
const walletEnv = require('../testEnv').auths.walletAPI
const { createAlias, createFeePayerOptions, timeout } = require('../testUtils')

let contractAddress
let alias
let owner
let spender
let deployer
let feePayer
const to = '0x7366f54429185bbcb6053b2fb5947358a9752103'

const mintedAmount = '0x2540be400' // 10000000000

describe('KIP7 API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)
        caver.initWalletAPI(walletEnv.chainId, walletEnv.accessKeyId, walletEnv.secretAccessKey, walletEnv.url)
    })

    it('CAVERJS-EXT-KAS-INT-259: caver.kas.kip7.deploy should deploy KIP-7 token contract', async () => {
        alias = createAlias('alice')

        const ret = await caver.kas.kip7.deploy('Alice', 'ALI', 18, '10000000000000000000', alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-310: caver.kas.kip7.deploy should deploy KIP-7 token contract with fee payer options', async () => {
        alias = createAlias('alice')

        feePayer = await caver.kas.wallet.getFeePayer(walletEnv.feePayerAddress)
        const feePayerOptions = createFeePayerOptions(false, feePayer)
        const ret = await caver.kas.kip7.deploy('Alice', 'ALI', 18, '10000000000000000000', alias, feePayerOptions)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.options.enableGlobalFeepayer).to.be.false
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
        expect(ret.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-311: caver.kas.kip7.updateContractOptions should update KIP-7 token contract options with fee payer options', async () => {
        await timeout(10000)

        const feePayerOptions = createFeePayerOptions(true, feePayer)
        const ret = await caver.kas.kip7.updateContractOptions(alias, feePayerOptions)

        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeePayer).to.be.true
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
        expect(ret.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-260: caver.kas.kip7.getContractList should return KIP-7 token contract list', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip7.getContractList({ size: 1, status: caver.kas.kip7.queryOptions.status.DEPLOYED })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined

        ret = await caver.kas.kip7.getContractList({ size: 1, cursor: ret.cursor })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-261: caver.kas.kip7.getContract should return KIP-7 token contract', async () => {
        let ret = await caver.kas.kip7.getContract(alias)

        expect(ret.address).not.to.be.undefined
        expect(ret.name).to.equal('Alice')
        expect(ret.symbol).to.equal('ALI')
        expect(ret.decimals).to.equal(18)
        expect(ret.totalSupply).to.equal(caver.utils.toHex('10000000000000000000'))

        contractAddress = ret.address

        ret = await caver.kas.kip7.getContract(contractAddress)

        expect(ret.address).to.equal(contractAddress)
        expect(ret.name).to.equal('Alice')
        expect(ret.symbol).to.equal('ALI')
        expect(ret.decimals).to.equal(18)
        expect(ret.totalSupply).to.equal(caver.utils.toHex('10000000000000000000'))
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-262: caver.kas.kip7.mint should mint tokens', async () => {
        const accounts = await caver.wallet.generate(2)
        owner = accounts[0]
        spender = accounts[1]

        const ret = await caver.kas.kip7.mint(alias, owner, mintedAmount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-312: caver.kas.kip7.mint should mint tokens with minter', async () => {
        const accounts = await caver.wallet.generate(2)
        owner = accounts[0]
        spender = accounts[1]

        deployer = (await caver.kas.kip7.getDeployer()).address
        const ret = await caver.kas.kip7.mint(alias, owner, mintedAmount, deployer)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-263: caver.kas.kip7.approve should approve token operation', async () => {
        const ret = await caver.kas.kip7.approve(alias, owner, spender, mintedAmount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-264: caver.kas.kip7.allowance should return allowance', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip7.allowance(alias, owner, spender)

        expect(ret.balance).to.equal(mintedAmount)
        expect(ret.decimals).to.equal(18)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-265: caver.kas.kip7.balance should return balance', async () => {
        const ret = await caver.kas.kip7.balance(alias, owner)

        expect(ret.balance).to.equal(mintedAmount)
        expect(ret.decimals).to.equal(18)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-266: caver.kas.kip7.transfer should transfer the KIP-7 token', async () => {
        const amount = '0x1'
        const ret = await caver.kas.kip7.transfer(alias, owner, spender, amount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        await timeout(10000)
        const bal = await caver.kas.kip7.balance(alias, spender)
        expect(bal.balance).to.equal(amount)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-267: caver.kas.kip7.transferFrom should transfer the KIP-7 token by approved spender', async () => {
        const amount = '0x2'
        const ret = await caver.kas.kip7.transferFrom(alias, spender, owner, to, amount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        await timeout(10000)
        const bal = await caver.kas.kip7.balance(alias, to)
        expect(bal.balance).to.equal(amount)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-268: caver.kas.kip7.burn should burn the KIP-7 token', async () => {
        const burnAmount = '0x1'
        const ogBalance = await caver.kas.kip7.balance(alias, owner)
        const ret = await caver.kas.kip7.burn(alias, owner, burnAmount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        await timeout(10000)
        const newBalance = await caver.kas.kip7.balance(alias, owner)
        expect(caver.utils.hexToNumber(ogBalance.balance) - caver.utils.hexToNumber(newBalance.balance)).to.equal(
            caver.utils.hexToNumber(burnAmount)
        )
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-269: caver.kas.kip7.burnFrom should burn the KIP-7 token by approved spender', async () => {
        const burnAmount = '0x2'
        const ogBalance = await caver.kas.kip7.balance(alias, owner)
        const ret = await caver.kas.kip7.burnFrom(alias, spender, owner, burnAmount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        await timeout(10000)
        const newBalance = await caver.kas.kip7.balance(alias, owner)
        expect(caver.utils.hexToNumber(ogBalance.balance) - caver.utils.hexToNumber(newBalance.balance)).to.equal(
            caver.utils.hexToNumber(burnAmount)
        )
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-270: caver.kas.kip7.pause should pause the KIP-7 contract', async () => {
        const ret = await caver.kas.kip7.pause(alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-271: caver.kas.kip7.unpause should unpause the KIP-7 contract', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip7.unpause(alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-313: caver.kas.kip7.pause should pause with pauser param', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip7.pause(alias, deployer)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-314: caver.kas.kip7.unpause should unpause with pauser param', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip7.unpause(alias, deployer)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-272: caver.kas.kip7.getDeployer should return default deployer', async () => {
        const ret = await caver.kas.kip7.getDeployer()

        expect(ret.address).not.to.be.undefined
        expect(ret.krn).not.to.be.undefined
    }).timeout(100000)
})
