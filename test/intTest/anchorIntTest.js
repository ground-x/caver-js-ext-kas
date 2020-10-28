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
let anchoredData
let fromTimestamp
const customFieldString = 'caver-js-ext-kas test'
const { url, chainId, accessKeyId, secretAccessKey, operator } = require('../testEnv').auths.anchorAPI
const { timeout } = require('../testUtils')

describe('Anchor API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)
        fromTimestamp = Date.now()
    })

    it('CAVERJS-EXT-KAS-INT-001: caver.kas.anchor.sendAnchoringData should send post request to anchor data', async () => {
        const anchoringData = {
            id: Math.floor(Math.random() * 10000000000).toString(),
            custom_field: customFieldString,
        }

        const ret = await caver.kas.anchor.sendAnchoringData(operator, anchoringData)

        expect(ret.status).to.equal('succeed')
    })

    it('CAVERJS-EXT-KAS-INT-002: caver.kas.anchor.getAnchoringTransactionList should query anchoring txs', async () => {
        const anchoringData = {
            id: Math.floor(Math.random() * 10000000000).toString(),
            custom_field: customFieldString,
        }

        await caver.kas.anchor.sendAnchoringData(operator, anchoringData)

        await timeout(3000)

        const queryOptions = caver.kas.anchor.queryOptions.constructFromObject({
            fromTimestamp,
            toTimestamp: Date.now(),
        })
        const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryOptions)

        expect(ret.cursor).not.to.undefined
        expect(ret.items.length > 1).to.be.true
        for (const i of ret.items) {
            expect(i.createdAt).not.to.be.undefined
            expect(i.payloadId).to.not.to.be.undefined
            expect(i.transactionHash).not.to.be.undefined
            anchoredData = i
        }
    }).timeout(500000)

    it('CAVERJS-EXT-KAS-INT-003: caver.kas.anchor.getAnchoringTransactionByTxHash should query anchoring tx by transaction hash', async () => {
        const ret = await caver.kas.anchor.getAnchoringTransactionByTxHash(operator, anchoredData.transactionHash)
        expect(ret.payload.custom_field).to.equal(customFieldString)
        expect(ret.payload.id).to.equal(anchoredData.payloadId)
        expect(ret.transactionHash).to.equal(anchoredData.transactionHash)
    })

    it('CAVERJS-EXT-KAS-INT-004: caver.kas.anchor.getAnchoringTransactionByPayloadId should query anchoring tx by payload id', async () => {
        const ret = await caver.kas.anchor.getAnchoringTransactionByPayloadId(operator, anchoredData.payloadId)

        expect(ret.payload.custom_field).to.equal(customFieldString)
        expect(ret.payload.id).to.equal(anchoredData.payloadId)
        expect(ret.transactionHash).to.equal(anchoredData.transactionHash)
    })

    it('CAVERJS-EXT-KAS-INT-005: caver.kas.anchor.getOperatorList should query operators', async () => {
        const queryOptions = caver.kas.anchor.queryOptions.constructFromObject({
            size: 1,
            fromTimestamp: 1596207600,
            toTimestamp: Date.now(),
        })
        const ret = await caver.kas.anchor.getOperatorList(queryOptions)

        expect(ret.cursor).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(caver.utils.isAddress(ret.items[0].operator)).to.be.true
        expect(ret.items[0].setting.useGlobalFeePayer).not.to.be.undefined
        expect(ret.items[0].setting.useOperator).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-006: caver.kas.anchor.getOperator should query operator', async () => {
        const ret = await caver.kas.anchor.getOperator(operator)

        expect(caver.utils.isAddress(ret.operator)).to.be.true
        expect(ret.setting.useGlobalFeePayer).not.to.be.undefined
        expect(ret.setting.useOperator).not.to.be.undefined
    })
})
