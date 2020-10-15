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
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const CaverExtKAS = require('../../index.js')

let caver
const { url, chainId, accessKeyId, secretAccessKey, operator } = require('../testEnv').auths.anchorAPI

const sandbox = sinon.createSandbox()

describe('Anchor API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.initAnchorAPI', () => {
        it('CAVERJS-EXT-KAS-ANCHOR-001: should return error if anchorAPI is not initialized', async () => {
            const expectedError = `Anchor API is not initialized. Use 'caver.initAnchorAPI' function to initialize Anchor API.`
            expect(() => caver.kas.anchor.getOperatorList()).to.throw(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-ANCHOR-002: should set valid auth and chain id', () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            expect(caver.kas.anchor.accessOptions).not.to.be.undefined
            expect(caver.kas.anchor.accessKeyId).to.equal(accessKeyId)
            expect(caver.kas.anchor.secretAccessKey).to.equal(secretAccessKey)
            expect(caver.kas.anchor.auth).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(caver.kas.anchor.chainId).to.equal(chainId)
            expect(caver.kas.anchor.apiInstances).not.to.be.undefined
            expect(caver.kas.anchor.anchorApi).not.to.be.undefined
            expect(caver.kas.anchor.operatorApi).not.to.be.undefined
        })
    })

    context('caver.kas.anchor.sendAnchoringData', () => {
        const anchoringResult = { status: 'succeed' }

        function setCallFakeForCallApi(callApiStub, operatorId, anchoringData) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    collectionQueryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v1/anchor`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody.operator).to.equal(operatorId)
                    expect(postBody.payload.id).to.equal(anchoringData.id)
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, anchoringResult, { body: anchoringResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-ANCHOR-003: should send post request to anchor data', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchoringData = { id: 'some id string' }

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'anchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, anchoringData)

            const ret = await caver.kas.anchor.sendAnchoringData(operator, anchoringData)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-004: should call callback function with anchored result', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchoringData = { id: 'some id string' }
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'anchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, anchoringData)

            let isCalled = false

            const ret = await caver.kas.anchor.sendAnchoringData(operator, anchoringData, () => {
                isCalled = true
            })

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-005: should resolve the promise when error is returned from KAS server', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchoringData = { id: 'some id string' }
            const anchoringErrorResult = { code: 1072100, message: 'same payload ID or payload was already anchored' }
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, anchoringErrorResult, {})
            })

            const ret = await caver.kas.anchor.sendAnchoringData(operator, anchoringData)

            expect(ret.code).to.equal(anchoringErrorResult.code)
            expect(ret.message).to.equal(anchoringErrorResult.message)
        })

        it('CAVERJS-EXT-KAS-ANCHOR-006: should throw error with invalid id', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            let expectedError = `The payload id should be defined.`
            expect(() => caver.kas.anchor.sendAnchoringData(operator, {})).to.throw(expectedError)

            expectedError = `The payload id must be string type.`
            expect(() => caver.kas.anchor.sendAnchoringData(operator, { id: 1 })).to.throw(expectedError)
        })
    })

    context('caver.kas.anchor.getAnchoringTransactionList', () => {
        const anchoredTxsResult = {
            cursor:
                'eyJjcmVhdGVkX2F0IjoxNTk4NDE2NTQ5LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMTUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            items: [
                {
                    createdAt: 1598416549,
                    payloadId: '90015',
                    transactionHash: '0xbf0ca9b24a51a089ad4a9e41607a50cfbe7fa76f658d64437e885b42af075ec2',
                },
            ],
        }

        function setCallFakeForCallApi(callApiStub, operatorId, queryOptions = {}) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    collectionQueryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v1/operator/{operator-id}/tx`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['operator-id']).to.equal(operatorId)
                    expect(Object.keys(queryParams).length).to.equal(4)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams['from-timestamp']).to.equal(queryOptions.fromTimestamp)
                    expect(queryParams['to-timestamp']).to.equal(queryOptions.toTimestamp)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, anchoredTxsResult, { body: anchoredTxsResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-ANCHOR-007: should return anchored transactions without query parameters', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator)

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-008: should return anchored transactions with query parameters (size)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { size: 1 }
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, queryParams)

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-009: should return anchored transactions with query parameters (from-timestamp)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'from-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, expectedQueryParams)

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-010: should return anchored transactions with query parameters (fromTimestamp)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { fromTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, expectedQueryParams)

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-011: should return anchored transactions with query parameters (to-timestamp)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'to-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, expectedQueryParams)

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-012: should return anchored transactions with query parameters (toTimestamp)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { toTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, expectedQueryParams)

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-013: should return anchored transactions with query parameters (cursor)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, queryParams)

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-014: should return anchored transactions with query parameters (size, fromTimestamp, toTimestamp, cursor)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, expectedQueryParams)

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-015: should call callback function with anchored transactions', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator)

            let isCalled = false

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, () => {
                isCalled = true
            })

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-016: should call callback function with anchored transactions with query parameters', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'retrieveAnchorBlock')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryParams, () => {
                isCalled = true
            })

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-017: should resolve the promise when error is returned from KAS server', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                fromTimestamp: Date.now(),
            }
            const anchoringErrorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, anchoringErrorResult, {})
            })

            const ret = await caver.kas.anchor.getAnchoringTransactionList(operator, queryParams)

            expect(ret.code).to.equal(anchoringErrorResult.code)
            expect(ret.message).to.equal(anchoringErrorResult.message)
        })
    })

    context('caver.kas.anchor.getAnchoringTransactionByTxHash', () => {
        const getAnchoringTxByTxHashResult = {
            payload: { block_number: 10, custom_field: 'custom jasmine', id: '90015' },
            transactionHash: '0xbf0ca9b24a51a089ad4a9e41607a50cfbe7fa76f658d64437e885b42af075ec2',
        }
        const txHashToQuery = '0xfb1963440a9de68f768c208756d8e3d11638bce28578696b8685192fe6728903'

        function setCallFakeForCallApi(callApiStub, operatorId) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    collectionQueryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v1/operator/{operator-id}/tx/{transaction-hash}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['operator-id']).to.equal(operatorId)
                    expect(pathParams['transaction-hash']).to.equal(txHashToQuery)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined
                    callback(null, getAnchoringTxByTxHashResult, { body: getAnchoringTxByTxHashResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-ANCHOR-018: should return anchored transaction', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'getAnchorBlockByTx')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator)

            const ret = await caver.kas.anchor.getAnchoringTransactionByTxHash(operator, txHashToQuery)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-019: should call callback function with anchored transaction', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'getAnchorBlockByTx')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator)

            let isCalled = false
            const ret = await caver.kas.anchor.getAnchoringTransactionByTxHash(operator, txHashToQuery, () => {
                isCalled = true
            })

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-020: should resolve the promise when error is returned from KAS server', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchoringErrorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, anchoringErrorResult, {})
            })

            const ret = await caver.kas.anchor.getAnchoringTransactionByTxHash(operator, txHashToQuery)

            expect(ret.code).to.equal(anchoringErrorResult.code)
            expect(ret.message).to.equal(anchoringErrorResult.message)
        })
    })

    context('caver.kas.anchor.getAnchoringTransactionByPayloadId', () => {
        const getAnchoringTxByPayloadIdResult = {
            payload: { block_number: 10, custom_field: 'custom jasmine', id: '90015' },
            transactionHash: '0xbf0ca9b24a51a089ad4a9e41607a50cfbe7fa76f658d64437e885b42af075ec2',
        }
        const payloadId = '90006'

        function setCallFakeForCallApi(callApiStub, operatorId) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    collectionQueryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v1/operator/{operator-id}/payload/{payload-id}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['operator-id']).to.equal(operatorId)
                    expect(pathParams['payload-id']).to.equal(payloadId)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined
                    callback(null, getAnchoringTxByPayloadIdResult, { body: getAnchoringTxByPayloadIdResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-ANCHOR-021: should return anchored transaction', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'getAnchorBlockByPayloadID')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator)

            const ret = await caver.kas.anchor.getAnchoringTransactionByPayloadId(operator, payloadId)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-022: should call callback function with anchored transaction', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.anchorApi, 'getAnchorBlockByPayloadID')
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator)

            let isCalled = false
            const ret = await caver.kas.anchor.getAnchoringTransactionByPayloadId(operator, payloadId, () => {
                isCalled = true
            })

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-023: should resolve the promise when error is returned from KAS server', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchoringErrorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.anchor.anchorApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, anchoringErrorResult, {})
            })

            const ret = await caver.kas.anchor.getAnchoringTransactionByPayloadId(operator, payloadId)

            expect(ret.code).to.equal(anchoringErrorResult.code)
            expect(ret.message).to.equal(anchoringErrorResult.message)
        })
    })

    context('caver.kas.anchor.getOperatorList', () => {
        const operatorsResult = {
            cursor:
                'eyJjcmVhdGVkX2F0IjoxNTk4NTk2MjcwLCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweDM3MUUwNDk3OTEzMkMyMzMzMGVFNzc3NjAxQzk4MTQ1M2Y3ZjU0MmUiLCJycG4iOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdCIsInR5cGUiOiJPUFIifQ==',
            items: [
                {
                    createdAt: 1598596270,
                    operator: '0x371E04979132C23330eE777601C981453f7f542e',
                    setting: { useGlobalFeepayer: true, useOperator: false },
                },
            ],
        }

        function setCallFakeForCallApi(callApiStub, queryOptions = {}) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    collectionQueryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v1/operator`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(4)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams['from-timestamp']).to.equal(queryOptions.fromTimestamp)
                    expect(queryParams['to-timestamp']).to.equal(queryOptions.toTimestamp)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, operatorsResult, { body: operatorsResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-ANCHOR-024: should return operators without query parameters', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.anchor.getOperatorList()

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-025: should return operators with query parameters (size)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { size: 1 }
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.anchor.getOperatorList(queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-026: should return operators with query parameters (from-timestamp)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'from-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.anchor.getOperatorList(queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-027: should return operators with query parameters (fromTimestamp)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { fromTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.anchor.getOperatorList(queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-028: should return operators with query parameters (to-timestamp)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { 'to-timestamp': Date.now() }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.anchor.getOperatorList(queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-029: should return operators with query parameters (toTimestamp)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = { toTimestamp: Date.now() }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.anchor.getOperatorList(queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-030: should return operators with query parameters (cursor)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryParams)

            const ret = await caver.kas.anchor.getOperatorList(queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-031: should return operators with query parameters (size, fromTimestamp, toTimestamp, cursor)', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.anchor.getOperatorList(queryParams)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-032: should call callback function with operators', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.anchor.getOperatorList(() => {
                isCalled = true
            })

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-033: should call callback function with operators with query parameters', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                size: 1,
                fromTimestamp: new Date('2020-08-01 00:00:00'),
                toTimestamp: Date.now(),
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNTk3OTA2Mjc0LCJkb2NfaWQiOiJrcm46MTAwMTphbmNob3I6OGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhOm9wZXJhdG9yLXBvb2w6ZGVmYXVsdDoweGM4QWEwNzNFMkE5MjRGYzQ2OTMzOUZmMGNCMkVjNEE3ODM4ODg4RDA6OTAwMDUiLCJxdWVyeV9pZCI6ImtybjoxMDAxOmFuY2hvcjo4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2E6b3BlcmF0b3ItcG9vbDpkZWZhdWx0OkFOQ0hfVFg6MHhjOEFhMDczRTJBOTI0RmM0NjkzMzlGZjBjQjJFYzRBNzgzODg4OEQwIiwidHlwZSI6IkFOQ0hfVFgifQ==',
            }
            const expectedQueryParams = caver.kas.anchor.queryOptions.constructFromObject(queryParams)
            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'retrieveOperators')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.anchor.getOperatorList(queryParams, () => {
                isCalled = true
            })

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-034: should resolve the promise when error is returned from KAS server', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                fromTimestamp: Date.now(),
            }
            const anchoringErrorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, anchoringErrorResult, {})
            })

            const ret = await caver.kas.anchor.getOperatorList(queryParams)

            expect(ret.code).to.equal(anchoringErrorResult.code)
            expect(ret.message).to.equal(anchoringErrorResult.message)
        })
    })

    context('caver.kas.anchor.getOperator', () => {
        const operatorsResult = {
            createdAt: 0,
            operator: '0xc8Aa073E2A924Fc469339Ff0cB2Ec4A7838888D0',
            setting: { useGlobalFeePayer: true, useOperator: false },
        }

        function setCallFakeForCallApi(callApiStub, operatorId) {
            callApiStub.callsFake(
                (
                    path,
                    mtd,
                    pathParams,
                    queryParams,
                    collectionQueryParams,
                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal('/v1/operator/{operator-id}')
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['operator-id']).to.equal(operatorId)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, operatorsResult, { body: operatorsResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-ANCHOR-035: should return operators without query parameters', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'getOperator')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator)

            const ret = await caver.kas.anchor.getOperator(operator)

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-036: should call callback function with operators', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchorTxSpy = sandbox.spy(caver.kas.anchor.operatorApi, 'getOperator')
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, operator)

            let isCalled = false

            const ret = await caver.kas.anchor.getOperator(operator, () => {
                isCalled = true
            })

            expect(anchorTxSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-ANCHOR-037: should resolve the promise when error is returned from KAS server', async () => {
            caver.initAnchorAPI(chainId, accessKeyId, secretAccessKey, url)

            const anchoringErrorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.anchor.operatorApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, anchoringErrorResult, {})
            })

            const ret = await caver.kas.anchor.getOperator(operator)

            expect(ret.code).to.equal(anchoringErrorResult.code)
            expect(ret.message).to.equal(anchoringErrorResult.message)
        })
    })
})
