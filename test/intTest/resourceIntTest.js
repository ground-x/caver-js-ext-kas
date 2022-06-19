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
let fromTimestamp

const { timeout } = require('../testUtils')
const { url, chainId, accessKeyId, secretAccessKey, accountId } = require('../testEnv').auths.resourceAPI

describe('Resource API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)
    })

    it('CAVERJS-EXT-KAS-INT-346: caver.kas.resource.getResourceList should return resources without query parameters', async () => {
        const ret = await caver.kas.resource.getResourceList(accountId)

        expect(ret).not.to.be.undefined
        expect(ret.items.length).not.to.be.equal(0)
    })

    it('CAVERJS-EXT-KAS-INT-347: caver.kas.resource.getResourceList should return resources with query parameters (size)', async () => {
        const queryOptions = {
            size: 1,
        }
        const ret = await caver.kas.resource.getResourceList(accountId, queryOptions)
        expect(ret.cursor).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
    })

    it('CAVERJS-EXT-KAS-INT-348: caver.kas.resource.getResourceList should return resources with query parameters (to-timestamp)', async () => {
        const queryOptions = { size: 1, 'to-timestamp': Date.now() }
        const ret = await caver.kas.resource.getResourceList(accountId, queryOptions)
        expect(ret.cursor).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
    })

    it('CAVERJS-EXT-KAS-INT-349: caver.kas.resource.getResourceList should return resources with query serviceId parameters', async () => {
        const queryOptions = {
            size: 1,
            serviceId: 'wallet',
        }
        const ret = await caver.kas.resource.getResourceList(accountId, queryOptions)

        expect(ret.cursor).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].serviceId).to.equal(queryOptions.serviceId)
    })

    it('CAVERJS-EXT-KAS-INT-350: caver.kas.resource.getResourceList should return resources with query parameters (from-timestamp)', async () => {
        const queryOptions = {
            size: 1,
            fromTimestamp: 1636439918,
        }

        const ret = await caver.kas.resource.getResourceList(accountId, queryOptions)

        expect(ret.cursor).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(queryOptions.fromTimestamp).to.lessThan(ret.items[0].createdAt)
    })

    it('CAVERJS-EXT-KAS-INT-351: caver.kas.resource.getResourceList should return resources with query resourceType parameters', async () => {
        const queryOptions = {
            size: 1,
            resourceType: 'account-pool',
        }

        const ret = await caver.kas.resource.getResourceList(accountId, queryOptions)

        expect(ret.cursor).not.to.be.undefined
        expect(ret.items.length).to.equal(1)
        expect(ret.items[0].resourceType).to.equal(queryOptions.resourceType)
    })
})
