/*
 * Copyright 2020 The caver-js-ext-kas Metadata
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
const fs = require('fs')
const fpath = require('path')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const CaverExtKAS = require('../../index.js')

let caver
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.resourceAPI

const sandbox = sinon.createSandbox()

describe('Resource API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.initResourceAPI', () => {
        it('CAVERJS-EXT-KAS-RESOURCE-001: should return error if resourceAPI is not initialized', async () => {
            const expectedError = `Resource API is not initialized. Use 'caver.initResourceAPI' function to initialize Resource API.`
            expect(() => caver.kas.resource.getResourceList()).to.throw(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-RESOURCE-002: should set valid auth and chain id', () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            expect(caver.kas.resource.accessOptions).not.to.be.undefined
            expect(caver.kas.resource.accessKeyId).to.equal(accessKeyId)
            expect(caver.kas.resource.secretAccessKey).to.equal(secretAccessKey)
            expect(caver.kas.resource.auth).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(caver.kas.resource.chainId).to.equal(chainId)
            expect(caver.kas.resource.apiInstances).not.to.be.undefined
            expect(caver.kas.resource.resourceListApi).not.to.be.undefined
        })
    })

    context('caver.kas.resource.getResourceList', () => {
        const resultOfApi = {
            cursor: '',
            items: [
                {
                    accountId: '676de94a-9ca9-45e2-a67b-ed72178cdbcc',
                    chainId: 1001,
                    createdAt: 1623650884,
                    default: false,
                    krn: 'krn:1001:wallet:676de94a-9ca9-45e2-a67b-ed72178cdbcc:account-pool:this-is-test',
                    resourceId: 'this-is-test',
                    resourceType: 'account-pool',
                    serviceId: 'wallet',
                },
            ],
        }
        const accountId = '1dw1d3991-c8f1-4fs1-ba28-16f1e3w528'

        function setCallFakeForCallApi(callApiStub, queryOptions = {}) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v1/resource/account/{account-id}`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['account-id']).not.to.be.undefined

                    expect(Object.keys(queryParams).length).to.equal(6)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams['from-timestamp']).to.equal(queryOptions.fromTimestamp)
                    expect(queryParams['to-timestamp']).to.equal(queryOptions.toTimestamp)
                    expect(queryParams['resource-type']).to.equal(queryOptions.resourceType)
                    expect(queryParams['service-id']).to.equal(queryOptions.serviceId)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined
                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-RESOURCE-003: should return resources without query parameters', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.resource.getResourceList(accountId)

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-004: should return resources with query parameters (size)', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { size: 1 }
            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.resource.getResourceList(accountId, queryParams)

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-005: should return resources with query parameters (from-timestamp)', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'from-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.resource.queryOptions.constructFromObject(queryParams)
            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.resource.getResourceList(accountId, queryParams)

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-006: should return resources with query parameters (fromTimestamp)', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { fromTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.resource.queryOptions.constructFromObject(queryParams)
            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.resource.getResourceList(accountId, queryParams)

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-007: should return resources with query parameters (to-timestamp)', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'to-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.resource.queryOptions.constructFromObject(queryParams)
            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.resource.getResourceList(accountId, queryParams)

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-008: should return resources with query parameters (toTimestamp)', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { toTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.resource.queryOptions.constructFromObject(queryParams)
            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.resource.getResourceList(accountId, queryParams)

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-009: should return resources with query parameters (cursor)', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)
            const ret = await caver.kas.resource.getResourceList(accountId, queryParams)

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-010: should return resources with query parameters (size, fromTimestamp, toTimestamp, cursor)', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.resource.queryOptions.constructFromObject(queryParams)
            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.resource.getResourceList(accountId, queryParams)

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-011: should call callback function with resources', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.resource.getResourceList(accountId, () => {
                isCalled = true
            })

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-012: should call callback function with resources with query parameters', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.resource.queryOptions.constructFromObject(queryParams)
            const getResourcesSpy = sandbox.spy(caver.kas.resource.resourceListApi, 'getResources')
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.resource.getResourceList(accountId, queryParams, () => {
                isCalled = true
            })

            expect(getResourcesSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true

            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-RESOURCE-013: should resolve the promise when error is returned from KAS server', async () => {
            caver.initResourceAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                fromTimestamp: Date.now(),
            }
            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.resource.resourceListApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.resource.getResourceList(accountId, queryParams)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })
})
