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
const { url, chainId, accessKeyId, secretAccessKey, operator } = require('../testEnv').auths.anchorAPI

describe('Anchor API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)
    })

    it('CAVERJS-EXT-KAS-INT-001: caver.kas.anchor.sendAnchoringData should send post request to anchor data', async () => {
        const anchoringData = {
            id: Math.floor(Math.random() * 10000000000).toString(),
            custom_field: 'jasmine is doing integration test anchor api through caver-js-ext-kas',
        }

        const ret = await caver.kas.anchor.sendAnchoringData(operator, anchoringData)

        expect(ret.status).to.equal('succeed')
    })

    it('CAVERJS-EXT-KAS-INT-002: caver.kas.anchor.getAnchoringTransactionList should query anchoring txs', async () => {
        const queryOptions = caver.kas.anchor.queryOptions.constructFromObject({
            size: 1,
            fromTimestamp: new Date('2020-08-01'),
            toTimestamp: new Date('2020-10-28'),
            cursor:
                'eyJjcmVhdGVkX2F0IjoxNjAzNzc4MjY3LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6MTczZGI2OWMtZjFiOC00ZGQ1LTlhYzItZWQ4YTBiYWRhYjI5Om9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweEJhM2NDNzViMWQxNzA3YTFFNTE3MmI0NjcxYzE1RDBBOEE4QUVCNTM6NzI5ODU5NDQ3NiIsInF1ZXJ5X2lkIjoia3JuOjEwMDE6YW5jaG9yOjE3M2RiNjljLWYxYjgtNGRkNS05YWMyLWVkOGEwYmFkYWIyOTpvcGVyYXRvci1wb29sOmRlZmF1bHQ6QU5DSF9UWDoweEJhM2NDNzViMWQxNzA3YTFFNTE3MmI0NjcxYzE1RDBBOEE4QUVCNTMiLCJ0eXBlIjoiQU5DSF9UWCJ9',
        })
        const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryOptions)

        expect(ret.cursor).to.equal(
            'eyJjcmVhdGVkX2F0IjoxNjAzNzc4MjU2LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6MTczZGI2OWMtZjFiOC00ZGQ1LTlhYzItZWQ4YTBiYWRhYjI5Om9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweEJhM2NDNzViMWQxNzA3YTFFNTE3MmI0NjcxYzE1RDBBOEE4QUVCNTM6MjM4NDY0MjkwNSIsInF1ZXJ5X2lkIjoia3JuOjEwMDE6YW5jaG9yOjE3M2RiNjljLWYxYjgtNGRkNS05YWMyLWVkOGEwYmFkYWIyOTpvcGVyYXRvci1wb29sOmRlZmF1bHQ6QU5DSF9UWDoweEJhM2NDNzViMWQxNzA3YTFFNTE3MmI0NjcxYzE1RDBBOEE4QUVCNTMiLCJ0eXBlIjoiQU5DSF9UWCJ9'
        )
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].createdAt).to.equal(1603778256)
        expect(ret.items[0].payloadId).to.equal(`2384642905`)
        expect(ret.items[0].transactionHash).to.equal(`0x5a7b997ded45cfa9a2ae2877fbba56c77e2ca324261302f9732c806d74bc2b3a`)
    })

    it('CAVERJS-EXT-KAS-INT-003: caver.kas.anchor.getAnchoringTransactionByTxHash should query anchoring tx by transaction hash', async () => {
        const ret = await caver.kas.anchor.getAnchoringTransactionByTxHash(
            operator,
            '0x097ee8bd7b7c75479d7ff4dea6bd41c0a27818e778954a9dc8b3bfae11a8a0b0'
        )
        expect(ret.payload.custom_field).to.equal('jasmine is doing integration test anchor api through caver-js-ext-kas')
        expect(ret.payload.id).to.equal('7017347815')
        expect(ret.transactionHash).to.equal(`0x097ee8bd7b7c75479d7ff4dea6bd41c0a27818e778954a9dc8b3bfae11a8a0b0`)
    })

    it('CAVERJS-EXT-KAS-INT-004: caver.kas.anchor.getAnchoringTransactionByPayloadId should query anchoring tx by payload id', async () => {
        const ret = await caver.kas.anchor.getAnchoringTransactionByPayloadId(operator, '7017347815')

        expect(ret.payload.custom_field).to.equal('jasmine is doing integration test anchor api through caver-js-ext-kas')
        expect(ret.payload.id).to.equal('7017347815')
        expect(ret.transactionHash).to.equal(`0x097ee8bd7b7c75479d7ff4dea6bd41c0a27818e778954a9dc8b3bfae11a8a0b0`)
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
