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
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.kip37API
const walletEnv = require('../testEnv').auths.walletAPI
const nodeEnv = require('../testEnv').auths.nodeAPI
const { senderPrivateKey } = require('../testEnv')
const { createAlias, createFeePayerOptions, timeout } = require('../testUtils')

let contractAddress
let alias
let deployer
let feePayer
let owner
let ownedAlias
const to = '0x7366f54429185bbcb6053b2fb5947358a9752103'
const uri = 'https://caver.example/id/{id}.json'

const tokens = []

describe('KIP37 API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)
        caver.initWalletAPI(walletEnv.chainId, walletEnv.accessKeyId, walletEnv.secretAccessKey, walletEnv.url)
    })

    it('CAVERJS-EXT-KAS-INT-280: caver.kas.kip37.deploy should deploy KIP-37 token contract', async () => {
        alias = createAlias('alice')

        const ret = await caver.kas.kip37.deploy(uri, alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeepayer).to.be.true
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).not.to.be.undefined
        expect(ret.options.userFeePayer.address).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-281: caver.kas.kip37.deploy should deploy with options', async () => {
        alias = createAlias('alice')

        feePayer = await caver.kas.wallet.getFeePayer(walletEnv.feePayerAddress)
        const feePayerOptions = createFeePayerOptions(false, feePayer)
        const ret = await caver.kas.kip37.deploy(uri, alias, feePayerOptions)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeepayer).to.be.false
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
        expect(ret.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
    }).timeout(100000)

    async function deployKIP37Contract() {
        caver.initNodeAPI(nodeEnv.chainId, nodeEnv.accessKeyId, nodeEnv.secretAccessKey, nodeEnv.url)
        const keyringContainer = new caver.keyringContainer()

        let sender
        if (senderPrivateKey !== '0x') {
            sender = keyringContainer.add(keyringContainer.keyring.createFromPrivateKey(senderPrivateKey))
        } else {
            throw new Error(`'senderPrivateKey' should be defined as an environment variables.`)
        }

        const deployed = await caver.kct.kip37.deploy(
            {
                uri,
            },
            sender.address,
            keyringContainer
        )
        return deployed.options.address
    }

    it('CAVERJS-EXT-KAS-INT-282: caver.kas.kip37.importContract should import a KIP-37 contract', async () => {
        const contractAlias = createAlias('alice')

        const contractToImport = await deployKIP37Contract()

        const ret = await caver.kas.kip37.importContract(contractToImport, uri, contractAlias)

        expect(ret.status).to.equal('imported')
        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeePayer).to.be.true
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).not.to.be.undefined
        expect(ret.options.userFeePayer.address).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-283: caver.kas.kip37.importContract should import a KIP-37 contract with fee payer options', async () => {
        const contractAlias = createAlias('alice')

        const contractToImport = await deployKIP37Contract()

        const feePayerOptions = createFeePayerOptions(false, feePayer)
        const ret = await caver.kas.kip37.importContract(contractToImport, uri, contractAlias, feePayerOptions)

        expect(ret.status).to.equal('imported')
        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeePayer).to.be.false
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
        expect(ret.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-284: caver.kas.kip37.updateContractOptions should edit the information of a contract', async () => {
        await timeout(10000)

        const feePayerOptions = createFeePayerOptions(true, feePayer)
        const ret = await caver.kas.kip37.updateContractOptions(alias, feePayerOptions)

        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeePayer).to.be.true
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
        expect(ret.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-285: caver.kas.kip37.getContract should return KIP-37 token contract', async () => {
        let ret = await caver.kas.kip37.getContract(alias)

        expect(ret.address).not.to.be.undefined
        expect(ret.alias).not.to.be.undefined
        expect(ret.status).not.to.be.undefined
        expect(ret.uri).to.equal(uri)

        contractAddress = ret.address

        ret = await caver.kas.kip37.getContract(contractAddress)

        expect(ret.address).not.to.be.undefined
        expect(ret.alias).not.to.be.undefined
        expect(ret.status).not.to.be.undefined
        expect(ret.uri).to.equal(uri)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-286: caver.kas.kip37.getContractList should return KIP-37 token contract list', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip37.getContractList({ size: 1, status: caver.kas.kip37.queryOptions.status.DEPLOYED })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined

        ret = await caver.kas.kip37.getContractList({ size: 1, cursor: ret.cursor })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-287: caver.kas.kip37.pause should pause the KIP-37 contract', async () => {
        const ret = await caver.kas.kip37.pause(alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-288: caver.kas.kip37.unpause should unpause the KIP-37 contract', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.unpause(alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-289: caver.kas.kip37.pause should pause the KIP-37 contract with pauser', async () => {
        await timeout(10000)
        deployer = (await caver.kas.kip37.getDeployer()).address
        const ret = await caver.kas.kip37.pause(alias, deployer)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-290: caver.kas.kip37.unpause should unpause the KIP-37 contract with pauser', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.unpause(alias, deployer)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-291: caver.kas.kip37.create should create the KIP-37 token', async () => {
        await timeout(10000)

        const id = 1
        const initialSupply = '100000000000000000000000'
        const ret = await caver.kas.kip37.create(alias, id, initialSupply, uri)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        tokens.push({ id, creator: deployer, totalSupply: caver.utils.toHex(initialSupply) })
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-292: caver.kas.kip37.create should create the KIP-37 token with sender', async () => {
        await timeout(10000)

        const list = await caver.kas.wallet.getAccountList({ size: 1 })
        try {
            await caver.kas.wallet.enableAccount(list.items[0].address)
        } catch (e) {}

        const initialSupply = '100000000000000000000000'
        const ret = await caver.kas.kip37.create(alias, tokens[0].id + 1, initialSupply, uri)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        tokens.push({ id: tokens[0].id + 1, creator: list.items[0].address, totalSupply: caver.utils.toHex(initialSupply) })
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-293: caver.kas.kip37.getTokenList should return KIP-37 token list', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip37.getTokenList(alias, { size: 1 })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined

        await timeout(10000)
        ret = await caver.kas.kip37.getTokenList(contractAddress, { size: 1, cursor: ret.cursor })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-294: caver.kas.kip37.getTokenListByOwner should return KIP-37 token list by owner', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip37.getTokenListByOwner(alias, tokens[0].creator, { size: 1 })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined

        await timeout(10000)
        ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, tokens[0].creator, { size: 1, cursor: ret.cursor })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-295: caver.kas.kip37.pauseToken should pause the KIP-37 token', async () => {
        const ret = await caver.kas.kip37.pauseToken(alias, tokens[0].id)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-296: caver.kas.kip37.unpauseToken should unpause the KIP-37 token', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.unpauseToken(alias, tokens[0].id)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-297: caver.kas.kip37.pause should pause the KIP-37 token with pauser', async () => {
        await timeout(10000)
        deployer = (await caver.kas.kip37.getDeployer()).address
        const ret = await caver.kas.kip37.pauseToken(alias, tokens[0].id, tokens[0].creator)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-298: caver.kas.kip37.unpauseToken should unpause the KIP-37 token with pauser', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.unpauseToken(alias, tokens[0].id, tokens[0].creator)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-299: caver.kas.kip37.burn should burn the KIP-37 tokens', async () => {
        await timeout(10000)
        const burningAmount = 10
        const ret = await caver.kas.kip37.burn(alias, tokens[0].id, burningAmount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-300: caver.kas.kip37.burn should burn the KIP-37 tokens', async () => {
        await timeout(10000)
        const burningAmount = 10
        const ret = await caver.kas.kip37.burn(alias, [tokens[0].id, tokens[1].id], [burningAmount, burningAmount])

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-301: caver.kas.kip37.burn should burn the KIP-37 tokens with burner', async () => {
        await timeout(10000)
        const burningAmount = 10
        const ret = await caver.kas.kip37.burn(alias, [tokens[0].id, tokens[1].id], [burningAmount, burningAmount], tokens[0].creator)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-302: caver.kas.kip37.mint should mint the KIP-37 token', async () => {
        await timeout(10000)
        const mintingAmount = 10
        const ret = await caver.kas.kip37.mint(alias, tokens[1].creator, tokens[1].id, mintingAmount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-303: caver.kas.kip37.mint should mint the KIP-37 tokens', async () => {
        await timeout(10000)
        const mintingAmount = 10
        const ret = await caver.kas.kip37.mint(alias, tokens[1].creator, [tokens[0].id, tokens[1].id], [mintingAmount, mintingAmount])

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-304: caver.kas.kip37.mint should mint the KIP-37 tokens with minter', async () => {
        await timeout(10000)
        const mintingAmount = 10
        const ret = await caver.kas.kip37.mint(
            alias,
            tokens[1].creator,
            [tokens[0].id, tokens[1].id],
            [mintingAmount, mintingAmount],
            tokens[0].creator
        )

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-305: caver.kas.kip37.setApprovalForAll should approve token operation of the KIP-37 tokens owned by from', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.setApprovalForAll(alias, tokens[1].creator, tokens[0].creator, true)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-306: caver.kas.kip37.transfer should transfer the KIP-37 token', async () => {
        await timeout(10000)
        const transferAmount = 1
        const ret = await caver.kas.kip37.transfer(alias, tokens[1].creator, tokens[1].creator, to, tokens[0].id, transferAmount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-307: caver.kas.kip37.transfer should transfer the KIP-37 tokens', async () => {
        await timeout(10000)
        const transferAmount = 1
        const ret = await caver.kas.kip37.transfer(
            alias,
            tokens[1].creator,
            tokens[1].creator,
            to,
            [tokens[0].id, tokens[1].id],
            [transferAmount, transferAmount]
        )

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-308: caver.kas.kip37.transfer should transfer the KIP-37 tokens by spender', async () => {
        await timeout(10000)
        const transferAmount = 1
        const ret = await caver.kas.kip37.transfer(
            alias,
            tokens[0].creator,
            tokens[1].creator,
            to,
            [tokens[0].id, tokens[1].id],
            [transferAmount, transferAmount]
        )

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-309: caver.kas.kip37.getDeployer should return default deployer', async () => {
        const ret = await caver.kas.kip37.getDeployer()

        expect(ret.address).not.to.be.undefined
        expect(ret.krn).not.to.be.undefined
    }).timeout(100000)
})
tokens.length = 0

describe('KIP37 V2 API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)
        caver.initWalletAPI(walletEnv.chainId, walletEnv.accessKeyId, walletEnv.secretAccessKey, walletEnv.url)
    })

    it('CAVERJS-EXT-KAS-INT-280: caver.kas.kip37.deploy should deploy KIP-37 token contract', async () => {
        alias = createAlias('alice')
        ownedAlias = alias
        const ret = await caver.kas.kip37.deploy(uri, alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeepayer).to.be.true
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).not.to.be.undefined
        expect(ret.options.userFeePayer.address).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-281: caver.kas.kip37.deploy should deploy with options', async () => {
        alias = createAlias('alice')

        feePayer = await caver.kas.wallet.getFeePayer(walletEnv.feePayerAddress)
        const feePayerOptions = createFeePayerOptions(false, feePayer)
        const ret = await caver.kas.kip37.deploy(uri, alias, feePayerOptions)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeepayer).to.be.false
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
        expect(ret.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
    }).timeout(100000)

    async function deployKIP37Contract() {
        caver.initNodeAPI(nodeEnv.chainId, nodeEnv.accessKeyId, nodeEnv.secretAccessKey, nodeEnv.url)
        const keyringContainer = new caver.keyringContainer()

        let sender
        if (senderPrivateKey !== '0x') {
            sender = keyringContainer.add(keyringContainer.keyring.createFromPrivateKey(senderPrivateKey))
        } else {
            throw new Error(`'senderPrivateKey' should be defined as an environment variables.`)
        }

        const deployed = await caver.kct.kip37.deploy(
            {
                uri,
            },
            sender.address,
            keyringContainer
        )
        return deployed.options.address
    }

    it('CAVERJS-EXT-KAS-INT-282: caver.kas.kip37.importContract should import a KIP-37 contract', async () => {
        const contractAlias = createAlias('alice')

        const contractToImport = await deployKIP37Contract()

        const ret = await caver.kas.kip37.importContract(contractToImport, uri, contractAlias)

        expect(ret.status).to.equal('imported')
        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeePayer).to.be.true
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).not.to.be.undefined
        expect(ret.options.userFeePayer.address).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-283: caver.kas.kip37.importContract should import a KIP-37 contract with fee payer options', async () => {
        const contractAlias = createAlias('alice')

        const contractToImport = await deployKIP37Contract()

        const feePayerOptions = createFeePayerOptions(false, feePayer)
        const ret = await caver.kas.kip37.importContract(contractToImport, uri, contractAlias, feePayerOptions)

        expect(ret.status).to.equal('imported')
        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeePayer).to.be.false
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
        expect(ret.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-284: caver.kas.kip37.updateContractOptions should edit the information of a contract', async () => {
        await timeout(10000)

        const feePayerOptions = createFeePayerOptions(true, feePayer)
        const ret = await caver.kas.kip37.updateContractOptions(alias, feePayerOptions)

        expect(ret.options).not.to.be.undefined
        expect(ret.options.enableGlobalFeePayer).to.be.true
        expect(ret.options.userFeePayer).not.to.be.undefined
        expect(ret.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
        expect(ret.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-285: caver.kas.kip37.getContract should return KIP-37 token contract', async () => {
        let ret = await caver.kas.kip37.getContract(alias)

        expect(ret.address).not.to.be.undefined
        expect(ret.alias).not.to.be.undefined
        expect(ret.status).not.to.be.undefined
        expect(ret.uri).to.equal(uri)

        contractAddress = ret.address

        ret = await caver.kas.kip37.getContract(contractAddress)

        expect(ret.address).not.to.be.undefined
        expect(ret.alias).not.to.be.undefined
        expect(ret.status).not.to.be.undefined
        expect(ret.uri).to.equal(uri)
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-286: caver.kas.kip37.getContractList should return KIP-37 token contract list', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip37.getContractList({ size: 1, status: caver.kas.kip37.queryOptions.status.DEPLOYED })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined

        ret = await caver.kas.kip37.getContractList({ size: 1, cursor: ret.cursor })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-287: caver.kas.kip37.pause should pause the KIP-37 contract', async () => {
        const ret = await caver.kas.kip37.pause(alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-288: caver.kas.kip37.unpause should unpause the KIP-37 contract', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.unpause(alias)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-289: caver.kas.kip37.pause should pause the KIP-37 contract with pauser', async () => {
        await timeout(10000)
        deployer = (await caver.kas.kip37.getDeployer()).address
        const ret = await caver.kas.kip37.pause(alias, deployer)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-290: caver.kas.kip37.unpause should unpause the KIP-37 contract with pauser', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.unpause(alias, deployer)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-291: caver.kas.kip37.create should create the KIP-37 token', async () => {
        await timeout(10000)

        const id = 1
        const initialSupply = '100000000000000000000000'
        const ret = await caver.kas.kip37.create(alias, id, initialSupply, uri)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        tokens.push({ id, creator: deployer, totalSupply: caver.utils.toHex(initialSupply) })
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-292: caver.kas.kip37.create should create the KIP-37 token with sender', async () => {
        await timeout(10000)

        const list = await caver.kas.wallet.getAccountList({ size: 1 })
        try {
            await caver.kas.wallet.enableAccount(list.items[0].address)
        } catch (e) {}

        const initialSupply = '100000000000000000000000'
        const ret = await caver.kas.kip37.create(alias, tokens[0].id + 1, initialSupply, uri)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined

        tokens.push({ id: tokens[0].id + 1, creator: list.items[0].address, totalSupply: caver.utils.toHex(initialSupply) })
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-293: caver.kas.kip37.getTokenList should return KIP-37 token list', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip37.getTokenList(alias, { size: 1 })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined

        await timeout(10000)
        ret = await caver.kas.kip37.getTokenList(contractAddress, { size: 1, cursor: ret.cursor })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-294: caver.kas.kip37.getTokenListByOwner should return KIP-37 token list by owner', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip37.getTokenListByOwner(alias, tokens[0].creator, { size: 1 })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined

        await timeout(10000)
        ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, tokens[0].creator, { size: 1, cursor: ret.cursor })

        expect(ret.items).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.cursor).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-295: caver.kas.kip37.pauseToken should pause the KIP-37 token', async () => {
        const ret = await caver.kas.kip37.pauseToken(alias, tokens[0].id)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-296: caver.kas.kip37.unpauseToken should unpause the KIP-37 token', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.unpauseToken(alias, tokens[0].id)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-297: caver.kas.kip37.pause should pause the KIP-37 token with pauser', async () => {
        await timeout(10000)
        deployer = (await caver.kas.kip37.getDeployer()).address
        const ret = await caver.kas.kip37.pauseToken(alias, tokens[0].id, tokens[0].creator)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-298: caver.kas.kip37.unpauseToken should unpause the KIP-37 token with pauser', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.unpauseToken(alias, tokens[0].id, tokens[0].creator)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-299: caver.kas.kip37.burn should burn the KIP-37 tokens', async () => {
        await timeout(10000)
        const burningAmount = 10
        const ret = await caver.kas.kip37.burn(alias, tokens[0].id, burningAmount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-300: caver.kas.kip37.burn should burn the KIP-37 tokens', async () => {
        await timeout(10000)
        const burningAmount = 10
        const ret = await caver.kas.kip37.burn(alias, [tokens[0].id, tokens[1].id], [burningAmount, burningAmount])

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-301: caver.kas.kip37.burn should burn the KIP-37 tokens with burner', async () => {
        await timeout(10000)
        const burningAmount = 10
        const ret = await caver.kas.kip37.burn(alias, [tokens[0].id, tokens[1].id], [burningAmount, burningAmount], tokens[0].creator)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-302: caver.kas.kip37.mint should mint the KIP-37 token', async () => {
        await timeout(10000)
        const mintingAmount = 10
        const ret = await caver.kas.kip37.mint(alias, tokens[1].creator, tokens[1].id, mintingAmount)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-303: caver.kas.kip37.mint should mint the KIP-37 tokens', async () => {
        await timeout(10000)
        const mintingAmount = 10
        const ret = await caver.kas.kip37.mint(alias, tokens[1].creator, [tokens[0].id, tokens[1].id], [mintingAmount, mintingAmount])

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-304: caver.kas.kip37.mint should mint the KIP-37 tokens with minter', async () => {
        await timeout(10000)
        const mintingAmount = 10
        const ret = await caver.kas.kip37.mint(
            alias,
            tokens[1].creator,
            [tokens[0].id, tokens[1].id],
            [mintingAmount, mintingAmount],
            tokens[0].creator
        )

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-305: caver.kas.kip37.setApprovalForAll should approve token operation of the KIP-37 tokens owned by from', async () => {
        await timeout(10000)
        const ret = await caver.kas.kip37.setApprovalForAll(alias, tokens[1].creator, tokens[0].creator, true)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-306: caver.kas.kip37.transfer should transfer the KIP-37 token', async () => {
        await timeout(10000)
        const transferAmount = 1
        const ret = await caver.kas.kip37.transfer(alias, tokens[1].creator, tokens[1].creator, to, tokens[0].id, transferAmount)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-307: caver.kas.kip37.transfer should transfer the KIP-37 tokens', async () => {
        await timeout(10000)
        const transferAmount = 1
        const ret = await caver.kas.kip37.transfer(
            alias,
            tokens[1].creator,
            tokens[1].creator,
            to,
            [tokens[0].id, tokens[1].id],
            [transferAmount, transferAmount]
        )

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-308: caver.kas.kip37.transfer should transfer the KIP-37 tokens by spender', async () => {
        await timeout(10000)
        const transferAmount = 1
        const ret = await caver.kas.kip37.transfer(
            alias,
            tokens[0].creator,
            tokens[1].creator,
            to,
            [tokens[0].id, tokens[1].id],
            [transferAmount, transferAmount]
        )

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-309: caver.kas.kip37.getDeployer should return default deployer', async () => {
        const ret = await caver.kas.kip37.getDeployer()

        expect(ret.address).not.to.be.undefined
        expect(ret.krn).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-259: caver.kas.kip37.getContractOwner should return KIP-37 constract owner', async () => {
        await timeout(10000)

        const ret = await caver.kas.kip37.getContractOwner(alias)
        expect(ret.owner).not.to.be.undefined
        const ret2 = await caver.kas.kip37.getContractOwner(contractAddress)
        expect(ret2.owner).not.to.be.undefined
        expect(ret2.owner).to.equal(ret.owner)

        owner = ret.owner
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-260: caver.kas.kip37.transferOwnership should transfer KIP-37 contract', async () => {
        await timeout(10000)

        const ret = await caver.kas.kip37.transferOwnership(alias, to, owner)

        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)

    it('CAVERJS-EXT-KAS-INT-261: caver.kas.kip37.renounceOwnership should renounce owned contract', async () => {
        await timeout(10000)

        let ret = await caver.kas.kip37.getContractOwner(ownedAlias)
        expect(ret.owner).not.to.be.undefined

        owner = ret.owner
        ret = await caver.kas.kip37.renounceOwnership(ownedAlias, owner)
        expect(ret.status).to.equal('Submitted')
        expect(ret.transactionHash).not.to.be.undefined
    }).timeout(100000)
})
