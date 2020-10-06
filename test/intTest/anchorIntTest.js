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
        caver.initAnchorAPI(url, chainId, accessKeyId, secretAccessKey)
    })

    it('CAVERJS-EXT-KAS-INT-001: caver.kas.anchor.sendAnchoringData should send post request to anchor data', async () => {
        const anchoringData = {
            id: Math.floor(Math.random() * 10000000000).toString(),
            custom_field: 'jasmine is doing integration test anchor api through caver-js-ext-kas',
        }

        const ret = await caver.kas.anchor.sendAnchoringData(operator, anchoringData)

        expect(ret.status).to.equal('succeed')
    })

    it('CAVERJS-EXT-KAS-INT-002: caver.kas.anchor.getAnchoringTransactions should query anchoring txs', async () => {
        const queryOptions = caver.kas.anchor.queryOptions.constructFromObject({
            size: 1,
            fromTimestamp: new Date('2020-08-01'),
            toTimestamp: new Date('2020-08-30'),
            cursor:
                'eyJjcmVhdGVkX2F0IjoxNTk4NDE2NTk3LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMTYiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
        })
        const ret = await caver.kas.anchor.getAnchoringTransactions(operator, queryOptions)

        expect(ret.cursor).to.equal(
            'eyJjcmVhdGVkX2F0IjoxNTk4NDE2NTQ5LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMTUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ=='
        )
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].createdAt).to.equal(1598416549)
        expect(ret.items[0].payloadId).to.equal(`90015`)
        expect(ret.items[0].transactionHash).to.equal(`0xbf0ca9b24a51a089ad4a9e41607a50cfbe7fa76f658d64437e885b42af075ec2`)
    })

    it('CAVERJS-EXT-KAS-INT-003: caver.kas.anchor.getAnchoringTransactionByTxHash should query anchoring tx by transaction hash', async () => {
        const ret = await caver.kas.anchor.getAnchoringTransactionByTxHash(
            operator,
            '0xbf0ca9b24a51a089ad4a9e41607a50cfbe7fa76f658d64437e885b42af075ec2'
        )
        expect(ret.payload.block_number).to.equal(10)
        expect(ret.payload.custom_field).to.equal('custom jasmine')
        expect(ret.payload.id).to.equal('90015')
        expect(ret.transactionHash).to.equal(`0xbf0ca9b24a51a089ad4a9e41607a50cfbe7fa76f658d64437e885b42af075ec2`)
    })

    it('CAVERJS-EXT-KAS-INT-004: caver.kas.anchor.getAnchoringTransactionByPayloadId should query anchoring tx by payload id', async () => {
        const ret = await caver.kas.anchor.getAnchoringTransactionByPayloadId(operator, '90015')

        expect(ret.payload.block_number).to.equal(10)
        expect(ret.payload.custom_field).to.equal('custom jasmine')
        expect(ret.payload.id).to.equal('90015')
        expect(ret.transactionHash).to.equal(`0xbf0ca9b24a51a089ad4a9e41607a50cfbe7fa76f658d64437e885b42af075ec2`)
    })

    it('CAVERJS-EXT-KAS-INT-005: caver.kas.anchor.getOperators should query operators', async () => {
        const queryOptions = caver.kas.anchor.queryOptions.constructFromObject({
            size: 1,
            fromTimestamp: 1596207600,
            toTimestamp: Date.now(),
        })
        const ret = await caver.kas.anchor.getOperators(queryOptions)

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
