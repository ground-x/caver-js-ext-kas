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
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.tokenHistoryAPI

const sandbox = sinon.createSandbox()

describe('TokenHistory API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.initTokenHistoryAPI', () => {
        it('CAVERJS-EXT-KAS-TH-001: should return error if tokenHistoryAPI is not initialized', async () => {
            const expectedError = `TokenHistory API is not initialized. Use 'caver.initTokenHistoryAPI' function to initialize TokenHistory API.`
            expect(() => caver.kas.tokenHistory.getFTContractList()).to.throw(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-TH-002: should set valid auth and chain id', () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            expect(caver.kas.tokenHistory.accessOptions).not.to.be.undefined
            expect(caver.kas.tokenHistory.accessKeyId).to.equal(accessKeyId)
            expect(caver.kas.tokenHistory.secretAccessKey).to.equal(secretAccessKey)
            expect(caver.kas.tokenHistory.auth).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(caver.kas.tokenHistory.chainId).to.equal(chainId)
            expect(caver.kas.tokenHistory.apiInstances).not.to.be.undefined
            expect(caver.kas.tokenHistory.tokenApi).not.to.be.undefined
            expect(caver.kas.tokenHistory.tokenContractApi).not.to.be.undefined
            expect(caver.kas.tokenHistory.tokenHistoryApi).not.to.be.undefined
            expect(caver.kas.tokenHistory.tokenOwnershipApi).not.to.be.undefined
        })
    })

    context('caver.kas.tokenHistory.getTransferHistory', () => {
        const getTransferHistoryResult = {
            items: [
                {
                    feePayer: '',
                    feeRatio: 0,
                    fee: '0x48ba158a44a00',
                    from: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    to: '0xbbe63781168c9e67e7a8b112425aa84c479f39aa',
                    transactionHash: '0x063b947b7bc70356ace9644a30188541e345b28e532810d1b80c132882c742ad',
                    transactionIndex: 0,
                    transferType: 'klay',
                    typeInt: 48,
                    value: '0x0',
                },
            ],
            cursor:
                'qrX1b6xwlmk9PJea2XLzoN30gKQAYGxbvro0Qk97dx5WAvJBpaKw6lPR1VLbVEzQV2P6XtYuNjgzVXe1DL4MGEbmO823NqYZWlk4rqdpVwm51B86ZD7EOM2WeDNBPQKE',
        }

        function setCallFakeForCallApi(callApiStub, presets, queryOptions = {}) {
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
                    expect(path).to.equal(`/v2/transfer`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(6)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    if (queryOptions.kind) expect(queryParams.kind).to.equal(queryOptions.kind)
                    expect(queryParams.presets).to.equal(presets.toString())
                    expect(queryParams.range).to.equal(queryOptions.range)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getTransferHistoryResult, { body: getTransferHistoryResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-003: should throw error when preset is invalid', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const expectedError = `Invalid type of presets: presets should be number or number array type.`

            expect(() => caver.kas.tokenHistory.getTransferHistory('invalid preset')).to.throw(expectedError)
            expect(() => caver.kas.tokenHistory.getTransferHistory({})).to.throw(expectedError)
            expect(() => caver.kas.tokenHistory.getTransferHistory(['invalid'])).to.throw(expectedError)
            expect(() => caver.kas.tokenHistory.getTransferHistory(['1'])).to.throw(expectedError)
            expect(() => caver.kas.tokenHistory.getTransferHistory([[]])).to.throw(expectedError)
            expect(() => caver.kas.tokenHistory.getTransferHistory(null)).to.throw(expectedError)
            expect(() => caver.kas.tokenHistory.getTransferHistory(undefined)).to.throw(expectedError)
        })

        it('CAVERJS-EXT-KAS-TH-004: should return token trasnfer history with one preset without query parameters', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = 1
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, [preset])

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-005: should return token trasnfer history with presets without query parameters', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset)

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-006: should return token trasnfer history with query parameters (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = { size: 1 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, queryParams)

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-007: should return token trasnfer history with query parameters (single kind)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = { kind: caver.kas.tokenHistory.queryOptions.kind.KLAY }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')

            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryParams)
            setCallFakeForCallApi(callApiStub, preset, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-008: should return token trasnfer history with query parameters (multiple kind)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = { kind: [caver.kas.tokenHistory.queryOptions.kind.KLAY, caver.kas.tokenHistory.queryOptions.kind.FT] }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')

            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryParams)
            setCallFakeForCallApi(callApiStub, preset, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-009: should return token trasnfer history with query parameters (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                cursor:
                    'qrX1b6xwlmk9PJea2XLzoN30gKQAYGxbvro0Qk97dx5WAvJBpaKw6lPR1VLbVEzQV2P6XtYuNjgzVXe1DL4MGEbmO823NqYZWlk4rqdpVwm51B86ZD7EOM2WeDNBPQKE',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, queryParams)

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-079: should return token trasnfer history with query parameters (range: from block number)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '0x12d1126',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, { range: '0x12d1126' })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-080: should return token trasnfer history with query parameters (range: from to block number without blank)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '0x12d1126,0x12e6520',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, { range: '0x12d1126,0x12e6520' })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-081: should return token trasnfer history with query parameters (range: from to block number with blank)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '0x12d1126, 0x12e6520',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, { range: '0x12d1126,0x12e6520' })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-082: should return token trasnfer history with query parameters (range: from timestamp with milisecond string)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '1596207600000',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, { range: '1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-083: should return token trasnfer history with query parameters (range: from timestamp with second string)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '1596207600',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, { range: '1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-084: should return token trasnfer history with query parameters (range: from to timestamp with milisecond string)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '1593529200000,1596207600000',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, { range: '1593529200,1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-085: should return token trasnfer history with query parameters (range: from timestamp with second string)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '1593529200,1596207600',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, { range: '1593529200,1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-086: should return token trasnfer history with query parameters (range: from to timestamp with milisecond string with blank)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '1593529200000, 1596207600000',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, { range: '1593529200,1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-087: should return token trasnfer history with query parameters (range: from timestamp with second string with blank)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '1593529200, 1596207600',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, { range: '1593529200,1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-097: should throw error when format of from and to are different', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                range: '1593529200,0x12e6520',
            }

            const expectedError = `'from' and 'to' can only be in the same format.`
            expect(() => caver.kas.tokenHistory.getTransferHistory(preset, queryParams)).to.throw(expectedError)

            queryParams.range = '0x12e6520,1593529200'
            expect(() => caver.kas.tokenHistory.getTransferHistory(preset, queryParams)).to.throw(expectedError)
        })

        it('CAVERJS-EXT-KAS-TH-010: should return token trasnfer history with query parameters (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = {
                size: 1,
                kind: [caver.kas.tokenHistory.queryOptions.kind.KLAY, caver.kas.tokenHistory.queryOptions.kind.FT],
                cursor:
                    'qrX1b6xwlmk9PJea2XLzoN30gKQAYGxbvro0Qk97dx5WAvJBpaKw6lPR1VLbVEzQV2P6XtYuNjgzVXe1DL4MGEbmO823NqYZWlk4rqdpVwm51B86ZD7EOM2WeDNBPQKE',
                range: '1593529200, 1596207600',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryParams)
            setCallFakeForCallApi(callApiStub, preset, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-011: should call callback function with token trasnfer history', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-012: should call callback function with token trasnfer history with query parameters', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const queryParams = { kind: caver.kas.tokenHistory.queryOptions.kind.KLAY }
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryParams)
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfers')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, preset, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset, queryParams, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.deep.equal(getTransferHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-013: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const preset = [1, 2, 3]
            const errorResult = {
                _code: 1040400,
                _message: '[ResourceNotFound]preset not found',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getTransferHistory(preset)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getTransferHistoryByTxHash', () => {
        const getTransferHistoryByTxHashResult = {
            items: [
                {
                    feePayer: '',
                    feeRatio: 0,
                    fee: '0x1dd7c1681d000',
                    from: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    to: '0x59e8229baef510c08640eba1d79b91b9cb1794cd',
                    transactionHash: '0xf64e4984def461ff95d69424380ae92e9632d3f99b34c6c7b44231b194450b7f',
                    transactionIndex: 0,
                    transferType: 'klay',
                    typeInt: 8,
                    value: '0x1',
                },
            ],
        }

        const txHash = '0xf64e4984def461ff95d69424380ae92e9632d3f99b34c6c7b44231b194450b7f'

        function setCallFakeForCallApi(callApiStub) {
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
                    expect(path).to.equal(`/v2/transfer/tx/{transaction-hash}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['transaction-hash']).to.equal(txHash)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getTransferHistoryByTxHashResult, { body: getTransferHistoryByTxHashResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-014: should return token trasnfer record with specific transaction hash', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByTxHash')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getTransferHistoryByTxHash(txHash)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-TH-015: should call callback function with token trasnfer record with specific transaction hash', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByTxHash')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getTransferHistoryByTxHash(txHash, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-TH-016: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1040400,
                _message: '[ResourceNotFound]preset not found',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByTxHash(txHash)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getTransferHistoryByAccount', () => {
        const getTransferHistoryByAccountResult = {
            items: [
                {
                    from: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    to: '0x88ab3cdbf31f856de69be569564b751a97ddf5d8',
                    transferType: 'nft',
                    contract: {
                        address: '0xbbe63781168c9e67e7a8b112425aa84c479f39aa',
                        decimals: undefined,
                        name: 'Alice',
                        symbol: 'ALI',
                        status: undefined,
                    },
                    transaction: {
                        feePayer: '',
                        feeRatio: 0,
                        fee: '0x790e1f5a13a00',
                        from: '0x55d747fce7a46bb069064845ffd05078d2222a15',
                        timestamp: 1599110780,
                        transactionHash: '0x5f38d4bbb9a54550a9d070901ebdc714acdec67db34c658e5eb1ad6647b0f4d2',
                        typeInt: 48,
                        value: '0x0',
                    },
                    tokenId: '0x7b',
                },
            ],
            cursor:
                '3QaLwPWAwDXaq9JkbQre851zpxE9wEOzGDJ8Llmp1W532XYq6nDV69VeokVGzYEfAuMLmM51YJPg7YRbgdQNZk7BvKxrMa4Voe0APM24VZgYN7GLdol0Bv6KO3mbo1rJ',
        }

        const address = '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1'
        const ca = '0xa94e8410d4b986759239ed9416070d728a590570'

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
                    expect(path).to.equal(`/v2/transfer/account/{address}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams.address).to.equal(address)
                    expect(Object.keys(queryParams).length).to.equal(8)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    if (queryOptions.kind) expect(queryParams.kind).to.equal(queryOptions.kind)
                    expect(queryParams['ca-filter']).to.equal(queryOptions.caFilter)
                    expect(queryParams.range).to.equal(queryOptions.range)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getTransferHistoryByAccountResult, { body: getTransferHistoryByAccountResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-017: should return token trasnfer record with specific eoa address', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-018: should return token trasnfer record with specific eoa address with query options (single kind)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { kind: caver.kas.tokenHistory.queryOptions.kind.KLAY }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-019: should return token trasnfer record with specific eoa address with query options (multiple kind)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { kind: [caver.kas.tokenHistory.queryOptions.kind.KLAY, 'ft'] }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-020: should return token trasnfer record with specific eoa address with query options (caFilter)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { caFilter: ca }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-021: should return token trasnfer record with specific eoa address with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-022: should return token trasnfer record with specific eoa address with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    '3QaLwPWAwDXaq9JkbQre851zpxE9wEOzGDJ8Llmp1W532XYq6nDV69VeokVGzYEfAuMLmM51YJPg7YRbgdQNZk7BvKxrMa4Voe0APM24VZgYN7GLdol0Bv6KO3mbo1rJ',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-088: should return token trasnfer record with specific eoa address with query options (range: from block number)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                range: '0x12d1126',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, { range: '0x12d1126' })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-089: should return token trasnfer record with specific eoa address with query options (range: from to block number without blank)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                range: '0x12d1126,0x12e6520',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, { range: '0x12d1126,0x12e6520' })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-090: should return token trasnfer record with specific eoa address with query options (range: from to block number with blank)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                range: '0x12d1126, 0x12e6520',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, { range: '0x12d1126,0x12e6520' })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-091: should return token trasnfer record with specific eoa address with query options (range: from timestamp with milisecond string)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                range: '1596207600000',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, { range: '1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-092: should return token trasnfer record with specific eoa address with query options (range: from timestamp with second string)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                range: '1596207600',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, { range: '1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-093: should return token trasnfer record with specific eoa address with query options (range: from to timestamp with milisecond string)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                range: '1593529200000,1596207600000',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, { range: '1593529200,1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-094: should return token trasnfer record with specific eoa address with query options (range: from timestamp with second string)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                range: '1593529200,1596207600',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, { range: '1593529200,1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-095: should return token trasnfer record with specific eoa address with query options (range: from to timestamp with milisecond string with blank)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                range: '1593529200000, 1596207600000',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, { range: '1593529200,1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-096: should return token trasnfer record with specific eoa address with query options (range: from to timestamp with second string with blank)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                range: '1593529200, 1596207600',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, { range: '1593529200,1596207600' })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-098: should throw error when format of from and to are different', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryParams = {
                range: '1593529200,0x12e6520',
            }

            const expectedError = `'from' and 'to' can only be in the same format.`
            expect(() => caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryParams)).to.throw(expectedError)

            queryParams.range = '0x12e6520,1593529200'
            expect(() => caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryParams)).to.throw(expectedError)
        })

        it('CAVERJS-EXT-KAS-TH-023: should return token trasnfer record with specific eoa address with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                kind: caver.kas.tokenHistory.queryOptions.kind.KLAY,
                size: 1,
                caFilter: ca,
                cursor:
                    '3QaLwPWAwDXaq9JkbQre851zpxE9wEOzGDJ8Llmp1W532XYq6nDV69VeokVGzYEfAuMLmM51YJPg7YRbgdQNZk7BvKxrMa4Voe0APM24VZgYN7GLdol0Bv6KO3mbo1rJ',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-024: should call callback function with transaction record', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-025: should call callback function with transaction record with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                kind: caver.kas.tokenHistory.queryOptions.kind.KLAY,
                size: 1,
                caFilter: ca,
                cursor:
                    '3QaLwPWAwDXaq9JkbQre851zpxE9wEOzGDJ8Llmp1W532XYq6nDV69VeokVGzYEfAuMLmM51YJPg7YRbgdQNZk7BvKxrMa4Voe0APM24VZgYN7GLdol0Bv6KO3mbo1rJ',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenHistoryApi, 'getTransfersByEoa')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address, queryOptions, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTransferHistoryByAccountResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-026: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getTransferHistoryByAccount(address)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getFTContractList', () => {
        const getFTContractListResult = {
            items: [
                {
                    address: '0x639bb15d5c012820bef8dd038254271e8597b3cf',
                    decimals: 2,
                    name: 'SpringToken',
                    symbol: 'MAR',
                    status: 'completed',
                    totalSupply: '0xe8d4a51000',
                    createdAt: 0,
                    updatedAt: 0,
                    deletedAt: 0,
                    link: { website: 'www.kas.com', icon: 'www.kas-icon.com' },
                    type: 'kip',
                },
                {
                    address: '0x54b3fde37c5604007f0e50913e990a039d19b6af',
                    decimals: 18,
                    name: 'SummerToken',
                    symbol: 'JUN',
                    status: 'completed',
                    totalSupply: '0x52b7d2dcc80cd2e4000000',
                    createdAt: 0,
                    updatedAt: 0,
                    deletedAt: 0,
                    link: { website: 'www.kas.com', icon: 'www.kas-icon.com' },
                    type: 'kip',
                },
            ],
            cursor:
                '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
        }

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
                    expect(path).to.equal(`/v2/contract/ft`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(4)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams.status).to.equal(queryOptions.status)
                    expect(queryParams.type).to.equal(queryOptions.type)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getFTContractListResult, { body: getFTContractListResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-027: should return ft contract list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListofFtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getFTContractList()

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-028: should return ft contract list with query options (status)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { status: caver.kas.tokenHistory.queryOptions.status.COMPLETE }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListofFtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-029: should return ft contract list with query options (type)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { type: caver.kas.tokenHistory.queryOptions.type.KIP7 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListofFtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-030: should return ft contract list with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListofFtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-031: should return ft contract list with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListofFtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-032: should return ft contract list with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                status: caver.kas.tokenHistory.queryOptions.status.PROCESSING,
                size: 1,
                type: caver.kas.tokenHistory.queryOptions.type.KIP7,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListofFtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-033: should call callback function with ft contract list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListofFtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getFTContractList(() => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-034: should call callback function with ft contract list with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                status: caver.kas.tokenHistory.queryOptions.status.PROCESSING,
                size: 1,
                type: caver.kas.tokenHistory.queryOptions.type.KIP7,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListofFtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getFTContractList(queryOptions, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-035: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getFTContractList()

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getFTContract', () => {
        const getFTContractResult = {
            address: '0x639bb15d5c012820bef8dd038254271e8597b3cf',
            decimals: 2,
            name: 'SpringToken',
            symbol: 'MAR',
            status: 'completed',
            totalSupply: '0xe8d4a51000',
            createdAt: 0,
            updatedAt: 0,
            deletedAt: 0,
            link: { website: 'www.kas.com', icon: 'www.kas-icon.com' },
            type: 'kip',
        }

        const ftContract = '0x639bb15d5c012820bef8dd038254271e8597b3cf'

        function setCallFakeForCallApi(callApiStub) {
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
                    expect(path).to.equal(`/v2/contract/ft/{ft-address}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['ft-address']).to.equal(ftContract)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getFTContractResult, { body: getFTContractResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-036: should return fungible token contract with ft contract address', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getFtContractDetail')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getFTContract(ftContract)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(ftContract)
        })

        it('CAVERJS-EXT-KAS-TH-037: should call callback function with ft contract', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getFtContractDetail')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getFTContract(ftContract, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(ftContract)
        })

        it('CAVERJS-EXT-KAS-TH-038: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1040400,
                _message: '[ResourceNotFound]not found ft',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getFTContract(ftContract)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getNFTContractList', () => {
        const getNFTContractListResult = {
            items: [
                {
                    address: '0xbbe63781168c9e67e7a8b112425aa84c479f39aa',
                    name: 'Alice',
                    symbol: 'ALI',
                    totalSupply: '0x36',
                    createdAt: 1599101533,
                    updatedAt: 1599101533,
                    deletedAt: 0,
                    type: 'kip',
                    status: 'completed',
                },
                {
                    address: '0xb50ebdb5026a1df752c69d8a6ce7140c99a426db',
                    name: 'Alice',
                    symbol: 'ALI',
                    totalSupply: '0x0',
                    createdAt: 1599101530,
                    updatedAt: 1599101530,
                    deletedAt: 0,
                    type: 'kip',
                    status: 'completed',
                },
            ],
            cursor:
                'KpQDa1l6kMAwm4x05epAzdmW0xO5XqP2MNEDgb73VGK8P63M5aQ4BkepJYWAlwno4vydNzv17X0m2ZxEDbOrq9gLoBlZeL8Y9GJv6aV4wKor1QkGqXLJWVgZ7zYv9N2B',
        }

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
                    expect(path).to.equal(`/v2/contract/nft`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(4)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams.status).to.equal(queryOptions.status)
                    expect(queryParams.type).to.equal(queryOptions.type)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getNFTContractListResult, { body: getNFTContractListResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-039: should return nft contract list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfNftContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getNFTContractList()

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-040: should return nft contract list with query options (status)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { status: caver.kas.tokenHistory.queryOptions.status.COMPLETE }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfNftContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-041: should return nft contract list with query options (type)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { type: caver.kas.tokenHistory.queryOptions.type.KIP17 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfNftContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-042: should return nft contract list with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfNftContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-043: should return nft contract list with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'KpQDa1l6kMAwm4x05epAzdmW0xO5XqP2MNEDgb73VGK8P63M5aQ4BkepJYWAlwno4vydNzv17X0m2ZxEDbOrq9gLoBlZeL8Y9GJv6aV4wKor1QkGqXLJWVgZ7zYv9N2B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfNftContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-044: should return nft contract list with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                status: caver.kas.tokenHistory.queryOptions.status.PROCESSING,
                size: 1,
                type: caver.kas.tokenHistory.queryOptions.type.KIP17,
                cursor:
                    'KpQDa1l6kMAwm4x05epAzdmW0xO5XqP2MNEDgb73VGK8P63M5aQ4BkepJYWAlwno4vydNzv17X0m2ZxEDbOrq9gLoBlZeL8Y9GJv6aV4wKor1QkGqXLJWVgZ7zYv9N2B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfNftContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getNFTContractList(queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-045: should call callback function with nft contract list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfNftContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFTContractList(() => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-046: should call callback function with nft contract list with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                status: caver.kas.tokenHistory.queryOptions.status.PROCESSING,
                size: 1,
                type: caver.kas.tokenHistory.queryOptions.type.KIP17,
                cursor:
                    'KpQDa1l6kMAwm4x05epAzdmW0xO5XqP2MNEDgb73VGK8P63M5aQ4BkepJYWAlwno4vydNzv17X0m2ZxEDbOrq9gLoBlZeL8Y9GJv6aV4wKor1QkGqXLJWVgZ7zYv9N2B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfNftContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFTContractList(queryOptions, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-047: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getNFTContractList()

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getNFTContract', () => {
        const getNFTContractResult = {
            address: '0xbbe63781168c9e67e7a8b112425aa84c479f39aa',
            name: 'Alice',
            symbol: 'ALI',
            totalSupply: '0x36',
            createdAt: 1599101533,
            updatedAt: 1599101533,
            deletedAt: 0,
            type: 'kip',
            status: 'completed',
        }

        const nftContract = '0xbbe63781168c9e67e7a8b112425aa84c479f39aa'

        function setCallFakeForCallApi(callApiStub) {
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
                    expect(path).to.equal(`/v2/contract/nft/{nft-address}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['nft-address']).to.equal(nftContract)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getNFTContractResult, { body: getNFTContractResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-048: should return non fungible token contract with ft contract address', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getNftContractDetail')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getNFTContract(nftContract)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(nftContract)
        })

        it('CAVERJS-EXT-KAS-TH-049: should call callback function with ft contract', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getNftContractDetail')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFTContract(nftContract, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(nftContract)
        })

        it('CAVERJS-EXT-KAS-TH-050: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1040400,
                _message: '[ResourceNotFound]not found nft',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getNFTContract(nftContract)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getNFTList', () => {
        const getNFTListResult = {
            items: [
                {
                    owner: '0x88ab3cdbf31f856de69be569564b751a97ddf5d8',
                    previousOwner: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    tokenId: '0x7b',
                    tokenUri: 'https://game.example/item-id-8u5h2m.json',
                    transactionHash: '0x5f38d4bbb9a54550a9d070901ebdc714acdec67db34c658e5eb1ad6647b0f4d2',
                    createdAt: 1599110774,
                    updatedAt: 1599110780,
                },
                {
                    owner: '0x6dca68ce6044b08558b09a39d5ce06a355c2aeac',
                    previousOwner: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    tokenId: '0x3ec',
                    tokenUri: 'https://game.example/item-id-8u5h2m.json',
                    transactionHash: '0x6930ba7dd3b0216dfa3b92a2e086cae92f4f8ab18867e1538bc61b2a320b6bcc',
                    createdAt: 1599110604,
                    updatedAt: 1599110609,
                },
            ],
            cursor:
                'eNoAzq5E6Lwa7WYZMpbpELGg8dMPaWo0KNV2kqY74A0QVJXNodeqKp3BYG92aDy23RWP7bExZ8v1O5zl6MrmwLgkwQmOJex3rlZzB9A4DX16v5PlK10D29kVJX3bgmQ4',
        }

        const nftAddress = '0xbbe63781168c9e67e7a8b112425aa84c479f39aa'

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
                    expect(path).to.equal(`/v2/contract/nft/{nft-address}/token`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['nft-address']).to.equal(nftAddress)
                    expect(Object.keys(queryParams).length).to.equal(2)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getNFTListResult, { body: getNFTListResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-051: should return nft list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getNFTList(nftAddress)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-052: should return nft list with query options (status)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { status: caver.kas.tokenHistory.queryOptions.status.COMPLETE }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTList(nftAddress, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-053: should return nft list with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTList(nftAddress, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-054: should return nft list with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTList(nftAddress, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-055: should return nft list with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getNFTList(nftAddress, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-056: should call callback function with nft list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFTList(nftAddress, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-057: should call callback function with nft list with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFTList(nftAddress, queryOptions, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-058: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getNFTList(nftAddress)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getNFTListByOwner', () => {
        const getNFTListByOwnerResult = {
            items: [
                {
                    owner: '0xa1c56175bbafaeaac2da534bed2c50079c63344a',
                    previousOwner: '0x0000000000000000000000000000000000000000',
                    tokenId: '0x3b',
                    tokenUri: '',
                    transactionHash: '0x9cf3580f0e7d127ea5b3330fabd950af2cc03edd36d7242999c64fda36d202c9',
                    createdAt: 1599102037,
                    updatedAt: 1599102037,
                },
            ],
            cursor:
                'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
        }

        const nftAddress = '0xbbe63781168c9e67e7a8b112425aa84c479f39aa'
        const owner = '0xa1c56175bbafaeaac2da534bed2c50079c63344a'

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
                    expect(path).to.equal(`/v2/contract/nft/{nft-address}/owner/{owner-address}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['nft-address']).to.equal(nftAddress)
                    expect(pathParams['owner-address']).to.equal(owner)
                    expect(Object.keys(queryParams).length).to.equal(2)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getNFTListByOwnerResult, { body: getNFTListByOwnerResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-059: should return nft list by owner', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftAddress, owner)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-060: should return nft list by owner with query options (status)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { status: caver.kas.tokenHistory.queryOptions.status.COMPLETE }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftAddress, owner, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-061: should return nft list by owner with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftAddress, owner, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-062: should return nft list by owner with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftAddress, owner, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-063: should return nft list by owner with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftAddress, owner, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-064: should call callback function with nft list by owner', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftAddress, owner, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-065: should call callback function with nft list by owner with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftsByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftAddress, owner, queryOptions, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-066: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getNFTListByOwner(nftAddress, owner)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getNFT', () => {
        const getNFTResult = {
            owner: '0x88ab3cdbf31f856de69be569564b751a97ddf5d8',
            previousOwner: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            tokenId: '0x7b',
            tokenUri: 'https://game.example/item-id-8u5h2m.json',
            transactionHash: '0x5f38d4bbb9a54550a9d070901ebdc714acdec67db34c658e5eb1ad6647b0f4d2',
            createdAt: 1599110774,
            updatedAt: 1599110780,
        }

        const nftContract = '0xbbe63781168c9e67e7a8b112425aa84c479f39aa'
        const tokenId = '0x7b'

        function setCallFakeForCallApi(callApiStub) {
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
                    expect(path).to.equal(`/v2/contract/nft/{nft-address}/token/{token-id}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['nft-address']).to.equal(nftContract)
                    expect(pathParams['token-id']).to.equal(tokenId)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getNFTResult, { body: getNFTResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-067: should return nft token', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftById')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getNFT(nftContract, tokenId)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.tokenId).to.equal(tokenId)
        })

        it('CAVERJS-EXT-KAS-TH-068: should return nft token with number type of tokenId', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftById')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getNFT(nftContract, caver.utils.hexToNumber(tokenId))

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.tokenId).to.equal(tokenId)
        })

        it('CAVERJS-EXT-KAS-TH-069: should call callback function with nft token', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getNftById')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFT(nftContract, tokenId, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.tokenId).to.equal(tokenId)
        })

        it('CAVERJS-EXT-KAS-TH-070: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1040400,
                _message: '[ResourceNotFound]not found nft token',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getNFT(nftContract, tokenId)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getNFTOwnershipHistory', () => {
        const getNFTOwnershipHistoryResult = {
            items: [
                {
                    from: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    to: '0x88ab3cdbf31f856de69be569564b751a97ddf5d8',
                    timestamp: 1599110780,
                },
            ],
            cursor:
                'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
        }

        const nftAddress = '0xbBe63781168c9e67e7A8B112425Aa84C479F39aa'
        const tokenId = '0x7b'

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
                    expect(path).to.equal(`/v2/contract/nft/{nft-address}/token/{token-id}/history`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['nft-address']).to.equal(nftAddress)
                    expect(pathParams['token-id']).to.equal(tokenId)
                    expect(Object.keys(queryParams).length).to.equal(2)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getNFTOwnershipHistoryResult, { body: getNFTOwnershipHistoryResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-071: should return ownership history of nft token', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfNftOwnershipChanges')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(nftAddress, tokenId)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTOwnershipHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-073: should return ownership history of nft token with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfNftOwnershipChanges')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(nftAddress, tokenId, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTOwnershipHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-074: should return ownership history of nft token with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfNftOwnershipChanges')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(nftAddress, tokenId, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTOwnershipHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-075: should return ownership history of nft token with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfNftOwnershipChanges')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(nftAddress, tokenId, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTOwnershipHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-076: should call callback function with ownership history of nft token', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfNftOwnershipChanges')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(nftAddress, tokenId, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTOwnershipHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-077: should call callback function with ownership history of nft token with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfNftOwnershipChanges')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(nftAddress, tokenId, queryOptions, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getNFTOwnershipHistoryResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-078: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getNFTOwnershipHistory(nftAddress, tokenId)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getMTContractList', () => {
        const getMTContractListResult = {
            items: [
                {
                    address: '0x219f6f9a47ced24c0451dd80ff97d6feca4533c0',
                    status: 'completed',
                    createdAt: 1610070498,
                    updatedAt: 1610070502,
                    deletedAt: 0,
                    type: 'KIP-37',
                },
            ],
            cursor:
                '4qX3vKYDlW7JdgOP8kqrWEg75NYwoO1KdBV86Q249lmvGXxeZQkMqoKPgLw81ORJqbyprV3B2JWD4AEbYd7a65N0zXzDLk3bAlvZJmepaG0M9PxrmV9NB2pQAwaLoG0E',
        }

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
                    expect(path).to.equal(`/v2/contract/mt`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(4)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams.status).to.equal(queryOptions.status)
                    expect(queryParams.type).to.equal(queryOptions.type)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getMTContractListResult, { body: getMTContractListResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-099: should return mt contract list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfMtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getMTContractList()

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-100: should return mt contract list with query options (status)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { status: caver.kas.tokenHistory.queryOptions.status.COMPLETE }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfMtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTContractList(queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-101: should return mt contract list with query options (type)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { type: caver.kas.tokenHistory.queryOptions.type.KIP37 }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfMtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTContractList(queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-102: should return mt contract list with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfMtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTContractList(queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-103: should return mt contract list with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfMtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTContractList(queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-104: should return mt contract list with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                status: caver.kas.tokenHistory.queryOptions.status.PROCESSING,
                size: 1,
                type: caver.kas.tokenHistory.queryOptions.type.KIP37,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfMtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getMTContractList(queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-105: should call callback function with mt contract list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfMtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMTContractList(() => {
                isCalled = true
            })

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-106: should call callback function with mt contract list with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                status: caver.kas.tokenHistory.queryOptions.status.PROCESSING,
                size: 1,
                type: caver.kas.tokenHistory.queryOptions.type.KIP37,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getListOfMtContracts')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMTContractList(queryOptions, () => {
                isCalled = true
            })

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTContractListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-107: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getMTContractList()

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getMTContract', () => {
        const getMTContractResult = {
            address: '0x219f6f9a47ced24c0451dd80ff97d6feca4533c0',
            status: 'completed',
            createdAt: 1610070498,
            updatedAt: 1610070502,
            deletedAt: 0,
            type: 'KIP-37',
        }

        const mtContract = '0x219f6f9a47ced24c0451dd80ff97d6feca4533c0'

        function setCallFakeForCallApi(callApiStub) {
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
                    expect(path).to.equal(`/v2/contract/mt/{mt-address}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['mt-address']).to.equal(mtContract)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getMTContractResult, { body: getMTContractResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-108: should return multi token contract with mt contract address', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getMtContractDetail')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getMTContract(mtContract)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(mtContract)
        })

        it('CAVERJS-EXT-KAS-TH-109: should call callback function with mt contract', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getMtContractDetail')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMTContract(mtContract, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(mtContract)
        })

        it('CAVERJS-EXT-KAS-TH-110: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1040400,
                _message: '[ResourceNotFound]not found mt',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getMTContract(mtContract)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })
    context('caver.kas.tokenHistory.getMTList', () => {
        const getMTListResult = {
            items: [
                {
                    owner: '0x88ab3cdbf31f856de69be569564b751a97ddf5d8',
                    previousOwner: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    tokenId: '0x7b',
                    tokenUri: 'https://game.example/item-id-8u5h2m.json',
                    transactionHash: '0x5f38d4bbb9a54550a9d070901ebdc714acdec67db34c658e5eb1ad6647b0f4d2',
                    createdAt: 1599110774,
                    updatedAt: 1599110780,
                },
                {
                    owner: '0x6dca68ce6044b08558b09a39d5ce06a355c2aeac',
                    previousOwner: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    tokenId: '0x3ec',
                    tokenUri: 'https://game.example/item-id-8u5h2m.json',
                    transactionHash: '0x6930ba7dd3b0216dfa3b92a2e086cae92f4f8ab18867e1538bc61b2a320b6bcc',
                    createdAt: 1599110604,
                    updatedAt: 1599110609,
                },
            ],
            cursor:
                'eNoAzq5E6Lwa7WYZMpbpELGg8dMPaWo0KNV2kqY74A0QVJXNodeqKp3BYG92aDy23RWP7bExZ8v1O5zl6MrmwLgkwQmOJex3rlZzB9A4DX16v5PlK10D29kVJX3bgmQ4',
        }

        const mtAddress = '0xbbe63781168c9e67e7a8b112425aa84c479f39aa'

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
                    expect(path).to.equal(`/v2/contract/mt/{mt-address}/token`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['mt-address']).to.equal(mtAddress)
                    expect(Object.keys(queryParams).length).to.equal(2)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getMTListResult, { body: getMTListResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-157: should return mt list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getMTList(mtAddress)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-158: should return mt list with query options (status)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { status: caver.kas.tokenHistory.queryOptions.status.COMPLETE }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTList(mtAddress, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-159: should return mt list with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTList(mtAddress, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-160: should return mt list with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTList(mtAddress, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-161: should return mt list with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getMTList(mtAddress, queryOptions)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-162: should call callback function with mt list', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMTList(mtAddress, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-163: should call callback function with mt list with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtsByContractAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMTList(mtAddress, queryOptions, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-164: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenHistoryApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getMTList(mtAddress)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })
    context('caver.kas.tokenHistory.getMTListByOwner', () => {
        const getMTListByOwnerResult = {
            items: [
                {
                    tokenId: '0x0',
                    owner: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    tokenAddress: '0x21aba57ff72bb9ca8eb5da90711c5f174b8e194e',
                    totalSupply: '0x3e8',
                    tokenUri: 'uri string',
                    balance: '0x3e8',
                    transactionHash: '0x3269d3cb9e7b7b467c48c19a4319025d926c11349706133251e6d789e7a892ed',
                    transferFrom: '0x0000000000000000000000000000000000000000',
                    transferTo: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    updatedAt: 1610070206,
                },
            ],
            totalBalance: '0x3e8',
            cursor: '',
        }

        const mtContract = '0x2c2382bcca41295495973be1d5a997d21f77b50e'
        const owner = '0xb8bb4b109f18eb6f292757aaec623200f1a41369'

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
                    expect(path).to.equal(`/v2/contract/mt/{mt-address}/owner/{owner-address}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['mt-address']).to.equal(mtContract)
                    expect(pathParams['owner-address']).to.equal(owner)
                    expect(Object.keys(queryParams).length).to.equal(2)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getMTListByOwnerResult, { body: getMTListByOwnerResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-111: should return mt list by owner', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContract, owner)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-112: should return mt list by owner with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContract, owner, queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-113: should return mt list by owner with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContract, owner, queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-114: should return mt list by owner with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContract, owner, queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-115: should call callback function with mt list by owner', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContract, owner, () => {
                isCalled = true
            })

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-116: should call callback function with mt list by owner with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContract, owner, queryOptions, () => {
                isCalled = true
            })

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-117: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContract, owner)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.tokenHistory.getMT', () => {
        const getMTResult = {
            tokenId: '0x0',
            owner: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            tokenAddress: '0x931cc84a1651aeca3d787fb22a80b0d34c243fb1',
            totalSupply: '0x3e8',
            tokenUri: 'uri string',
            balance: '0x3e8',
            transactionHash: '0x1eecfa0ecb63aba6e09303ede7c94ac366b0ac08e1887d08397f10df2101f859',
            transferFrom: '0x0000000000000000000000000000000000000000',
            transferTo: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            updatedAt: 1610071284,
        }

        const mtContract = '0x931cc84a1651aeca3d787fb22a80b0d34c243fb1'
        const owner = '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1'
        const tokenId = '0x0'

        function setCallFakeForCallApi(callApiStub) {
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
                    expect(path).to.equal(`/v2/contract/mt/{mt-address}/owner/{owner-address}/token/{token-id}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['mt-address']).to.equal(mtContract)
                    expect(pathParams['owner-address']).to.equal(owner)
                    expect(pathParams['token-id']).to.equal(tokenId)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getMTResult, { body: getMTResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-118: should return multi token with mt contract and owner address', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndOwnerAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getMT(mtContract, owner, tokenId)

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.tokenAddress).to.equal(mtContract)
            expect(ret.owner).to.equal(owner)
            expect(ret.tokenId).to.equal(tokenId)
        })

        it('CAVERJS-EXT-KAS-TH-119: should call callback function with mt', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndOwnerAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMT(mtContract, owner, tokenId, () => {
                isCalled = true
            })

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.tokenAddress).to.equal(mtContract)
            expect(ret.owner).to.equal(owner)
            expect(ret.tokenId).to.equal(tokenId)
        })

        it('CAVERJS-EXT-KAS-TH-120: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1040400,
                _message: '[ResourceNotFound]not found mt',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getMT(mtContract, owner, tokenId)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })

        it('CAVERJS-EXT-KAS-TH-137: should return multi token with mt contract and owner address via token id in number', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getTransfersSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndOwnerAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getMT(mtContract, owner, caver.utils.hexToNumber(tokenId))

            expect(getTransfersSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.tokenAddress).to.equal(mtContract)
            expect(ret.owner).to.equal(owner)
            expect(ret.tokenId).to.equal(tokenId)
        })
    })

    context('caver.kas.tokenHistory.getMTOwnerListByTokenId', () => {
        const getMTOwnerListByTokenIdResult = {
            items: [
                {
                    tokenId: '0x0',
                    owner: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    tokenAddress: '0x931cc84a1651aeca3d787fb22a80b0d34c243fb1',
                    totalSupply: '0x3e8',
                    tokenUri: 'uri string',
                    balance: '0x3e8',
                    transactionHash: '0x1eecfa0ecb63aba6e09303ede7c94ac366b0ac08e1887d08397f10df2101f859',
                    transferFrom: '0x0000000000000000000000000000000000000000',
                    transferTo: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
                    updatedAt: 1610071284,
                },
            ],
            cursor: '',
        }

        const mtContract = '0x931cc84a1651aeca3d787fb22a80b0d34c243fb1'
        const tokenId = '0x0'

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
                    expect(path).to.equal(`/v2/contract/mt/{mt-address}/token/{token-id}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['mt-address']).to.equal(mtContract)
                    expect(pathParams['token-id']).to.equal(tokenId)
                    expect(Object.keys(queryParams).length).to.equal(2)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getMTOwnerListByTokenIdResult, { body: getMTOwnerListByTokenIdResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-121: should return owner list by token id', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContract, tokenId)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTOwnerListByTokenIdResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-122: should return owner list by token id with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContract, tokenId, queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTOwnerListByTokenIdResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-123: should return owner list by token id with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContract, tokenId, queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTOwnerListByTokenIdResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-124: should return owner list by token id with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContract, tokenId, queryOptions)

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTOwnerListByTokenIdResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-125: should call callback function with owner list by token id', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContract, tokenId, () => {
                isCalled = true
            })

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTOwnerListByTokenIdResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-126: should call callback function with owner list by token id with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContract, tokenId, queryOptions, () => {
                isCalled = true
            })

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTOwnerListByTokenIdResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-127: should resolve the promise when error is returned from KAS server', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = {
                _code: 1041000,
                _message: '[InternalServerError]',
            }
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContract, tokenId)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })

        it('CAVERJS-EXT-KAS-TH-138: should return owner list by token id in number type', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfMtContractsSpy = sandbox.spy(caver.kas.tokenHistory.tokenApi, 'getMtTokensByContractAddressAndTokenId')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContract, caver.utils.hexToNumber(tokenId))

            expect(getListOfMtContractsSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getMTOwnerListByTokenIdResult.cursor)
        })
    })

    context('caver.kas.tokenHistory.getContractListByOwner', () => {
        const getContractListByOwnerResult = {
            items: [
                {
                    kind: 'nft',
                    contractAddress: '0x6c357e27eed12a4ce5e78aa75127c76db69fc391',
                    updatedAt: 1617610961,
                    totalBalance: '0x1',
                    extras: {
                        name: 'Alice',
                        symbol: 'ALI',
                        totalSupply: '0x1',
                    },
                },
                {
                    kind: 'nft',
                    contractAddress: '0x7c579c0227668ef9fa36e72ddf28f66be00cad7e',
                    updatedAt: 1615249780,
                    totalBalance: '0x1',
                    extras: {
                        name: 'TEST_KIP17',
                        symbol: 'KIP17',
                        totalSupply: '0x1',
                    },
                },
            ],
            cursor:
                'eNoAzq5E6Lwa7WYZMpbpELGg8dMPaWo0KNV2kqY74A0QVJXNodeqKp3BYG92aDy23RWP7bExZ8v1O5zl6MrmwLgkwQmOJex3rlZzB9A4DX16v5PlK10D29kVJX3bgmQ4',
        }

        const address = '0xbBe63781168c9e67e7A8B112425Aa84C479F39aa'

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
                    expect(path).to.equal(`/v2/account/{address}/contract`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams.address).to.equal(address)
                    expect(Object.keys(queryParams).length).to.equal(3)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    if (queryOptions.kind) expect(queryParams.kind).to.equal(queryOptions.kind.toString())

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getContractListByOwnerResult, { body: getContractListByOwnerResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-139: should return owned contract', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfContractByOwnerAddressSpy = sandbox.spy(
                caver.kas.tokenHistory.tokenOwnershipApi,
                'getListOfContractByOwnerAddress'
            )
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getContractListByOwner(address)

            expect(getListOfContractByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getContractListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-140: should return owned contract with query options (single kind)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { kind: caver.kas.tokenHistory.queryOptions.kind.FT }
            const getListOfContractByOwnerAddressSpy = sandbox.spy(
                caver.kas.tokenHistory.tokenOwnershipApi,
                'getListOfContractByOwnerAddress'
            )
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getContractListByOwner(address, queryOptions)

            expect(getListOfContractByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getContractListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-141: should return owned contract with query options (multiple kind)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { kind: [caver.kas.tokenHistory.queryOptions.kind.FT, caver.kas.tokenHistory.queryOptions.kind.NFT] }
            const getListOfContractByOwnerAddressSpy = sandbox.spy(
                caver.kas.tokenHistory.tokenOwnershipApi,
                'getListOfContractByOwnerAddress'
            )
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getContractListByOwner(address, queryOptions)

            expect(getListOfContractByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getContractListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-142: should return owned contract with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 2 }
            const getListOfContractByOwnerAddressSpy = sandbox.spy(
                caver.kas.tokenHistory.tokenOwnershipApi,
                'getListOfContractByOwnerAddress'
            )
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getContractListByOwner(address, queryOptions)

            expect(getListOfContractByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getContractListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-143: should return owned contract with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const getListOfContractByOwnerAddressSpy = sandbox.spy(
                caver.kas.tokenHistory.tokenOwnershipApi,
                'getListOfContractByOwnerAddress'
            )
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getContractListByOwner(address, queryOptions)

            expect(getListOfContractByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getContractListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-144: should return owned contract with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 2,
                kind: caver.kas.tokenHistory.queryOptions.kind.FT,
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const getListOfContractByOwnerAddressSpy = sandbox.spy(
                caver.kas.tokenHistory.tokenOwnershipApi,
                'getListOfContractByOwnerAddress'
            )
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getContractListByOwner(address, queryOptions)

            expect(getListOfContractByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getContractListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-145: should call callback function with owned contract', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfContractByOwnerAddressSpy = sandbox.spy(
                caver.kas.tokenHistory.tokenOwnershipApi,
                'getListOfContractByOwnerAddress'
            )
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getContractListByOwner(address, () => {
                isCalled = true
            })

            expect(getListOfContractByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getContractListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-146: should call callback function with owned contract with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 2,
                kind: caver.kas.tokenHistory.queryOptions.kind.FT,
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const getListOfContractByOwnerAddressSpy = sandbox.spy(
                caver.kas.tokenHistory.tokenOwnershipApi,
                'getListOfContractByOwnerAddress'
            )
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getContractListByOwner(address, queryOptions, () => {
                isCalled = true
            })

            expect(getListOfContractByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getContractListByOwnerResult.cursor)
        })
    })

    context('caver.kas.tokenHistory.getTokenListByOwner', () => {
        const getTokenListByOwnerResult = {
            items: [
                {
                    kind: 'mt',
                    contractAddress: '0x84fe6cfd45553d796fbedcf1c71a7b85fdd791d0',
                    updatedAt: 1615249785,
                    balance: '0x1',
                    lastTransfer: {
                        transactionHash: '0x68da787704737685d20ccea08446c873b387c6abd311c145006fba4e0ed1f412',
                        transferFrom: '0x0000000000000000000000000000000000000000',
                        transferTo: '0x89a8e75d92ce84076d33f68e4909c4156847dc69',
                    },
                    extras: { tokenId: '0x2', tokenUri: 'uri', totalSupply: '0x1' },
                },
                {
                    kind: 'mt',
                    contractAddress: '0x84fe6cfd45553d796fbedcf1c71a7b85fdd791d0',
                    updatedAt: 1615249783,
                    balance: '0x1',
                    lastTransfer: {
                        transactionHash: '0x0641a713b5893322a5cc37ceebe76c472926c65482d13d9b9cb0e5ab7185d612',
                        transferFrom: '0x0000000000000000000000000000000000000000',
                        transferTo: '0x89a8e75d92ce84076d33f68e4909c4156847dc69',
                    },
                    extras: { tokenId: '0x0', tokenUri: 'uri', totalSupply: '0x1' },
                },
            ],
            cursor:
                'eNoAzq5E6Lwa7WYZMpbpELGg8dMPaWo0KNV2kqY74A0QVJXNodeqKp3BYG92aDy23RWP7bExZ8v1O5zl6MrmwLgkwQmOJex3rlZzB9A4DX16v5PlK10D29kVJX3bgmQ4',
        }

        const address = '0xbBe63781168c9e67e7A8B112425Aa84C479F39aa'

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
                    expect(path).to.equal(`/v2/account/{address}/token`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams.address).to.equal(address)
                    expect(Object.keys(queryParams).length).to.equal(4)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    if (queryOptions.kind) expect(queryParams.kind).to.equal(queryOptions.kind.toString())
                    if (queryOptions.caFilters) expect(queryParams['ca-filters']).to.equal(queryOptions.caFilters.toString())

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getTokenListByOwnerResult, { body: getTokenListByOwnerResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-147: should return owned token', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-148: should return owned token with query options (single kind)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { kind: caver.kas.tokenHistory.queryOptions.kind.FT }
            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address, queryOptions)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-149: should return owned token with query options (multiple kind)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { kind: [caver.kas.tokenHistory.queryOptions.kind.FT, caver.kas.tokenHistory.queryOptions.kind.MT] }
            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address, queryOptions)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-150: should return owned token with query options (size)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 2 }
            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address, queryOptions)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-151: should return owned token with query options (cursor)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address, queryOptions)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-152: should return owned token with query options (single caFilters)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                caFilters: '0x84fe6cfd45553d796fbedcf1c71a7b85fdd791d0',
            }
            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address, queryOptions)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-153: should return owned token with query options (multiple caFilters)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                caFilters: ['0x84fe6cfd45553d796fbedcf1c71a7b85fdd791d0', '0x9ae6e0807359869b1f5b3c73130c146017d562ce'],
            }
            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address, queryOptions)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-154: should return owned token with query options (all)', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 2,
                kind: caver.kas.tokenHistory.queryOptions.kind.FT,
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address, queryOptions)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-155: should call callback function with owned contract', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address, () => {
                isCalled = true
            })

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })

        it('CAVERJS-EXT-KAS-TH-156: should call callback function with owned contract with query options', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 2,
                kind: caver.kas.tokenHistory.queryOptions.kind.FT,
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R1VLbVOv1p0go1joeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenOwnershipApi, 'getListOfTokenByOwnerAddress')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.tokenHistory.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.tokenHistory.getTokenListByOwner(address, queryOptions, () => {
                isCalled = true
            })

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(getTokenListByOwnerResult.cursor)
        })
    })

    context('caver.kas.tokenHistory.getNFTHolder', () => {
        const getNFTHolderResult = {
            address: '0xbBe63781168c9e67e7A8B112425Aa84C479F39aa',
            totalHolder: 48,
        }

        const nftAddress = '0xbBe63781168c9e67e7A8B112425Aa84C479F39aa'

        function setCallFakeForCallApi(callApiStub) {
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
                    expect(path).to.equal(`/v2/contract/nft/{nft-address}/holder`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['nft-address']).to.equal(nftAddress)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getNFTHolderResult, { body: getNFTHolderResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-165: should return number of NFT owners', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getNftContractHolder')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getNFTHolder(nftAddress)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(getNFTHolderResult.address)
            expect(ret.totalHolder).to.equal(getNFTHolderResult.totalHolder)
        })

        it('CAVERJS-EXT-KAS-TH-166: should return number of NFT owners with callback function', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getNftContractHolder')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false
            const ret = await caver.kas.tokenHistory.getNFTHolder(nftAddress, () => {
                isCalled = true
            })

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(getNFTHolderResult.address)
            expect(ret.totalHolder).to.equal(getNFTHolderResult.totalHolder)
        })
    })

    context('caver.kas.tokenHistory.getMTHolder', () => {
        const getMTHolderResult = {
            address: '0xbBe63781168c9e67e7A8B112425Aa84C479F39aa',
            totalHolder: 48,
        }

        const mtAddress = '0xbBe63781168c9e67e7A8B112425Aa84C479F39aa'

        function setCallFakeForCallApi(callApiStub) {
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
                    expect(path).to.equal(`/v2/contract/mt/{mt-address}/holder`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['mt-address']).to.equal(mtAddress)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, getMTHolderResult, { body: getMTHolderResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-TH-167: should return number of MT owners', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getMtContractHolder')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.tokenHistory.getMTHolder(mtAddress)

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(getMTHolderResult.address)
            expect(ret.totalHolder).to.equal(getMTHolderResult.totalHolder)
        })

        it('CAVERJS-EXT-KAS-TH-168: should return number of MT owners with callback function', async () => {
            caver.initTokenHistoryAPI(chainId, accessKeyId, secretAccessKey, url)

            const getListOfTokenByOwnerAddressSpy = sandbox.spy(caver.kas.tokenHistory.tokenContractApi, 'getMtContractHolder')
            const callApiStub = sandbox.stub(caver.kas.tokenHistory.tokenContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false
            const ret = await caver.kas.tokenHistory.getMTHolder(mtAddress, () => {
                isCalled = true
            })

            expect(getListOfTokenByOwnerAddressSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(getMTHolderResult.address)
            expect(ret.totalHolder).to.equal(getMTHolderResult.totalHolder)
        })
    })
})
