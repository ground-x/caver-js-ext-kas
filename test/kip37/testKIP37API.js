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
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.kip37API

const sandbox = sinon.createSandbox()

const feePayerOptionsObj = {
    enableGlobalFeePayer: true,
    userFeePayer: { krn: 'krn:1001:wallet:test:account-pool:default', address: '0x18cff7e7054784e666535de1b609c05625d23a1d' },
}

describe('KIP37 API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.initKIP37API', () => {
        it('CAVERJS-EXT-KAS-KIP37-001: should return error if kip37API is not initialized', async () => {
            const expectedError = `KIP37 API is not initialized. Use 'caver.initKIP37API' function to initialize KIP37 API.`
            expect(() => caver.kas.kip37.getContractList()).to.throw(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-KIP37-002: should set valid auth and chain id', () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            expect(caver.kas.kip37.accessOptions).not.to.be.undefined
            expect(caver.kas.kip37.accessKeyId).to.equal(accessKeyId)
            expect(caver.kas.kip37.secretAccessKey).to.equal(secretAccessKey)
            expect(caver.kas.kip37.auth).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(caver.kas.kip37.chainId).to.equal(chainId)
            expect(caver.kas.kip37.apiInstances).not.to.be.undefined
            expect(caver.kas.kip37.kip37ContractApi).not.to.be.undefined
            expect(caver.kas.kip37.deployerApi).not.to.be.undefined
        })
    })

    context('caver.kas.kip37.deploy', () => {
        const uri = 'https://caver.example/id/{id}.json'

        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x4707420eeda479477eae0c73878d9186150c153a9e2cbfe43e9d37750b64a4ec',
            uri,
        }

        const alias = 'alice'

        function setCallFakeForCallApi(callApiStub, feePayerOptions) {
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
                    expect(path).to.equal(`/v1/contract`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.uri).to.equal(uri)
                    expect(postBody.alias).to.equal(alias)
                    if (feePayerOptions) {
                        expect(postBody.options.enableGlobalFeePayer).to.equal(feePayerOptions.enableGlobalFeePayer)
                        expect(postBody.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
                        expect(postBody.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
                    }
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-003: should deploy KIP-37 token contract with alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.deploy(uri, alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-004: should deploy KIP-37 token contract with fee payer options', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip37.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, feePayerOptions)

            const ret = await caver.kas.kip37.deploy(uri, alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-005: should call callback function with deployment response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.deploy(uri, alias, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.importContract', () => {
        const contractAddress = '0x7ecb3d3a9ab42af0cf4a8cf46ad7f93df29851b8'
        const uri = 'https://caver.example/id/{id}.json'
        const alias = 'alice'

        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x4707420eeda479477eae0c73878d9186150c153a9e2cbfe43e9d37750b64a4ec',
            uri,
        }

        function setCallFakeForCallApi(callApiStub, feePayerOptions) {
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
                    expect(path).to.equal(`/v1/contract/import`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.address).to.equal(contractAddress)
                    expect(postBody.uri).to.equal(uri)
                    expect(postBody.alias).to.equal(alias)
                    if (feePayerOptions) {
                        expect(postBody.options.enableGlobalFeePayer).to.equal(feePayerOptions.enableGlobalFeePayer)
                        expect(postBody.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
                        expect(postBody.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
                    }
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-006: should import KIP-37 token contract with address and alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'importContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.importContract(contractAddress, uri, alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-007: should import KIP-37 token contract with address, alias and feePayerOptions', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'importContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip37.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, feePayerOptions)
            const ret = await caver.kas.kip37.importContract(contractAddress, uri, alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-008: should call callback function with deployment response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'importContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.importContract(contractAddress, uri, alias, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.updateContractOptions', () => {
        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const alias = 'alice-contract'

        const apiResult = {
            address: '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280',
            alias: 'alice-contract',
            status: 'deployed',
            uri: 'https://caver.example/id/{id}.json',
            options: {
                enableGlobalFeePayer: true,
                userFeePayer: {
                    krn: '',
                    address: '',
                },
            },
        }

        function setCallFakeForCallApi(callApiStub, addressOrAlias, feePayerOptions) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}`)
                    expect(mtd).to.equal(`PUT`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    if (feePayerOptions) {
                        expect(postBody.options.enableGlobalFeePayer).to.equal(feePayerOptions.enableGlobalFeePayer)
                        expect(postBody.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
                        expect(postBody.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
                    }
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-009: should import KIP-37 token contract with address and alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'putContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip37.updateContractOptions(contractAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.undefined
            expect(ret.status).not.to.undefined
            expect(ret.alias).not.to.undefined
            expect(ret.uri).not.to.undefined
            expect(ret.options).not.to.undefined
        })

        it('CAVERJS-EXT-KAS-KIP37-010: should import KIP-37 token contract with address, alias and feePayerOptions', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'putContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip37.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, alias, feePayerOptions)
            const ret = await caver.kas.kip37.updateContractOptions(alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.undefined
            expect(ret.status).not.to.undefined
            expect(ret.alias).not.to.undefined
            expect(ret.uri).not.to.undefined
            expect(ret.options).not.to.undefined
        })

        it('CAVERJS-EXT-KAS-KIP37-011: should call callback function with deployment response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'putContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip37.updateContractOptions(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).not.to.undefined
            expect(ret.status).not.to.undefined
            expect(ret.alias).not.to.undefined
            expect(ret.uri).not.to.undefined
            expect(ret.options).not.to.undefined
        })
    })

    context('caver.kas.kip37.getContractList', () => {
        const apiResult = {
            cursor:
                'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTAwLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0In0=',
            items: [
                {
                    address: '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280',
                    alias: 'alice-contract',
                    status: 'deployed',
                    uri: 'https://caver.example/id/{id}.json',
                    options: {
                        enableGlobalFeePayer: true,
                        userFeePayer: {
                            krn: '',
                            address: '',
                        },
                    },
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

                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v1/contract`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(3)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams.status).to.equal(queryOptions.status)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-012: should return KIP-37 contract list', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.kip37.getContractList()

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-013: should return KIP-37 contract list with query options (size)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip37.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-014: should return KIP-37 contract list with query options (cursor)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTIyLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0MiJ9',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip37.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-015: should return KIP-37 contract list with query options (status)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                status: caver.kas.kip37.queryOptions.status.DEPLOYED,
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip37.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-016: should return KIP-37 contract list with query options (all)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
                status: caver.kas.kip37.queryOptions.status.DEPLOYED,
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.kip37.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-017: should call callback function with KIP-37 contract list', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.kip37.getContractList(() => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-018: should call callback function with KIP-37 contract list with query options', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip37.getContractList(queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip37.getContract', () => {
        const apiResult = {
            address: '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280',
            alias: 'alice-contract',
            status: 'deployed',
            uri: 'https://caver.example/id/{id}.json',
            options: {
                enableGlobalFeePayer: true,
                userFeePayer: {
                    krn: '',
                    address: '',
                },
            },
        }

        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const alias = 'alice-contract'

        function setCallFakeForCallApi(callApiStub, addressOrAlias) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-019: should return KIP-37 contract with contract address', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.getContract(contractAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
            expect(ret.alias).to.equal(alias)
        })

        it('CAVERJS-EXT-KAS-KIP37-020: should return KIP-37 contract with alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.getContract(alias)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
            expect(ret.alias).to.equal(alias)
        })

        it('CAVERJS-EXT-KAS-KIP37-021: should call callback function with KIP-37 contract', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip37.getContract(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(contractAddress)
            expect(ret.alias).to.equal(alias)
        })
    })

    context('caver.kas.kip37.getTokenListByOwner', () => {
        const apiResult = {
            cursor:
                'z53x014AdOQJGNl6V99k3wAap7M08oLKedg5DVqlLdZqWwPQzo3aM7v8A9J6V2nmqnpgDNOeGkblm1BKEX5x0Yr46bW2ZN4YGmQPJO1xBvrEzXrW2gbvDZ7EKMaYmkew=',
            items: [
                {
                    tokenId: '0x1',
                    totalSupply: '0xaf298d050e4395d69670b12b7f41000000000000',
                    tokenUri: 'https://token-cdn-domain/1.json',
                },
            ],
        }

        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const owner = '0xe5630ba1783f01f03485ccaf74da3a5d2643ddc1'
        const alias = 'alice-contract'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, queryOptions = {}) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/owner/{owner-address}/token`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
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

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-022: should return KIP-37 token list by owner', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, owner)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-023: should return KIP-37 token list by owner with query options (size)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip37.getTokenListByOwner(alias, owner, queryOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-024: should return KIP-37 token list by owner with query options (cursor)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTIyLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0MiJ9',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, queryOptions)

            const ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, owner, queryOptions)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-025: should return KIP-37 token list by owner with query options (all)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            const ret = await caver.kas.kip37.getTokenListByOwner(alias, owner, queryOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-026: should call callback function with KIP-37 token list by owner', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, owner, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-027: should call callback function with KIP-37 token list by owner with query options', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, contractAddress, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, owner, queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip37.setApprovalForAll', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const owner = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
        const to = '0x661e2075de14d267c0f141e917a76871d3b299ad'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, approved) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/approveall`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.from).to.equal(owner)
                    expect(postBody.to).to.equal(to)
                    expect(postBody.approved).to.equal(approved)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-028: should approve for all KIP-37 tokens with alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const approved = true
            setCallFakeForCallApi(callApiStub, alias, approved)

            const ret = await caver.kas.kip37.setApprovalForAll(alias, owner, to, approved)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-029: should approve for all KIP-37 tokens with contract address', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const approved = true
            setCallFakeForCallApi(callApiStub, contractAddress, approved)

            const ret = await caver.kas.kip37.setApprovalForAll(contractAddress, owner, to, approved)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-030: should call callback function with approving response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            const approved = true
            setCallFakeForCallApi(callApiStub, contractAddress, approved)

            const ret = await caver.kas.kip37.setApprovalForAll(contractAddress, owner, to, approved, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.pause', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const pauserAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, pauser) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/pause`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    if (pauser) expect(postBody.sender).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-031: should pause KIP-37 contract without pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.pause(alias)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-032: should pause KIP-37 contract with pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, pauserAddress)

            const ret = await caver.kas.kip37.pause(contractAddress, pauserAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-033: should call callback function with pausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.pause(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.unpause', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const pauserAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, pauser) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/unpause`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    if (pauser) expect(postBody.sender).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-034: should unpause KIP-37 contract without pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.unpause(alias)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-035: should unpause KIP-37 contract with pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, pauserAddress)

            const ret = await caver.kas.kip37.unpause(contractAddress, pauserAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-036: should call callback function with unpausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.unpause(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.pauseToken', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const pauserAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'
        const tokenId = 1

        function setCallFakeForCallApi(callApiStub, addressOrAlias, pauser) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token/pause/{token-id}`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['token-id']).to.equal(caver.utils.toHex(tokenId))
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    if (pauser) expect(postBody.sender).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-037: should pause KIP-37 token without pauser (number token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'pauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.pauseToken(alias, tokenId)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-038: should pause KIP-37 token without pauser (hex string token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'pauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.pauseToken(alias, caver.utils.toHex(tokenId))

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-039: should pause KIP-37 token with pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'pauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, pauserAddress)

            const ret = await caver.kas.kip37.pauseToken(contractAddress, tokenId, pauserAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-040: should call callback function with unpausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'pauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.pauseToken(contractAddress, tokenId, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.unpauseToken', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const pauserAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'
        const tokenId = 1

        function setCallFakeForCallApi(callApiStub, addressOrAlias, pauser) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token/unpause/{token-id}`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['token-id']).to.equal(caver.utils.toHex(tokenId))
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    if (pauser) expect(postBody.sender).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-041: should unpause KIP-37 token without pauser (number token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'unpauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.unpauseToken(alias, tokenId)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-042: should unpause KIP-37 token without pauser (hex string token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'unpauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.unpauseToken(alias, caver.utils.toHex(tokenId))

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-043: should unpause KIP-37 token with pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'unpauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, pauserAddress)

            const ret = await caver.kas.kip37.unpauseToken(contractAddress, tokenId, pauserAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-044: should call callback function with unpausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'unpauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.unpauseToken(contractAddress, tokenId, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.create', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const senderAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'
        const tokenId = 1
        const initialSupply = '10000000000'
        const uri = 'https://token-cdn-domain/1.json'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, sender) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    expect(postBody.id).to.equal(caver.utils.toHex(tokenId))
                    expect(postBody.initialSupply).to.equal(caver.utils.toHex(initialSupply))
                    expect(postBody.uri).to.equal(uri)
                    if (sender) expect(postBody.sender).to.equal(sender)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-045: should create KIP-37 token without sender (number token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, tokenId, initialSupply, uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-046: should create KIP-37 token without sender (hex string token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, caver.utils.toHex(tokenId), initialSupply, uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-047: should create KIP-37 token without sender (number initialSupply)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, tokenId, Number(initialSupply), uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-048: should create KIP-37 token without sender (BigNumber initialSupply)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, tokenId, new caver.utils.BigNumber(initialSupply), uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-049: should create KIP-37 token without sender (hex string initialSupply)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, tokenId, caver.utils.toHex(initialSupply), uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-050: should create KIP-37 token with sender', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, senderAddress)

            const ret = await caver.kas.kip37.create(contractAddress, tokenId, initialSupply, uri, senderAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-051: should call callback function with creating response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.create(contractAddress, tokenId, initialSupply, uri, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.getTokenList', () => {
        const apiResult = {
            cursor:
                'z53x014AdOQJGNl6V99k3wAap7M08oLKedg5DVqlLdZqWwPQzo3aM7v8A9J6V2nmqnpgDNOeGkblm1BKEX5x0Yr46bW2ZN4YGmQPJO1xBvrEzXrW2gbvDZ7EKMaYmkew=',
            items: [
                {
                    tokenId: '0x1',
                    totalSupply: '0xaf298d050e4395d69670b12b7f41000000000000',
                    tokenUri: 'https://token-cdn-domain/1.json',
                },
            ],
        }

        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const alias = 'alice-contract'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, queryOptions = {}) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
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

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-052: should return KIP-37 token list', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.getTokenList(contractAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-053: should return KIP-37 token list with query options (size)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip37.getTokenList(alias, queryOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-054: should return KIP-37 token list with query options (cursor)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTIyLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0MiJ9',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, queryOptions)

            const ret = await caver.kas.kip37.getTokenList(contractAddress, queryOptions)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-055: should return KIP-37 token list with query options (all)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            const ret = await caver.kas.kip37.getTokenList(alias, queryOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-056: should call callback function with KIP-37 token list', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip37.getTokenList(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-057: should call callback function with KIP-37 token list with query options', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, contractAddress, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip37.getTokenList(contractAddress, queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip37.burn', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const fromAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, ids, amounts, from) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    for (let i = 0; i < ids.length; i++) expect(postBody.ids[i]).to.equal(caver.utils.toHex(ids[i]))
                    for (let i = 0; i < amounts.length; i++) expect(postBody.amounts[i]).to.equal(caver.utils.toHex(amounts[i]))
                    if (from) expect(postBody.from).to.equal(from)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-058: should burn a KIP-37 token with not array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = 1
            const amount = 10
            setCallFakeForCallApi(callApiStub, alias, [id], [amount])

            const ret = await caver.kas.kip37.burn(alias, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-059: should burn a KIP-37 token with array parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = [1]
            const amount = [10]
            setCallFakeForCallApi(callApiStub, alias, id, amount)

            const ret = await caver.kas.kip37.burn(alias, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-060: should burn the KIP-37 tokens with array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.burn(contractAddress, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-061: should burn the KIP-37 tokens with hex string and bigNumber parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = ['0x1', '0x2']
            const amounts = ['0xa', new caver.utils.BigNumber(20)]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.burn(contractAddress, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-062: should burn the KIP-37 tokens with from address', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts, fromAddress)

            const ret = await caver.kas.kip37.burn(contractAddress, ids, amounts, fromAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-063: should call callback function with unpausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            const ids = [1, 2]
            const amounts = [10, 20]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.burn(contractAddress, ids, amounts, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.mint', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const to = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const senderAddress = '0x96c0b472d47a118e2e641046889bd2ee97e1d8d2'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, ids, amounts, sender) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token/mint`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.to).to.equal(to)
                    for (let i = 0; i < ids.length; i++) expect(postBody.ids[i]).to.equal(caver.utils.toHex(ids[i]))
                    for (let i = 0; i < amounts.length; i++) expect(postBody.amounts[i]).to.equal(caver.utils.toHex(amounts[i]))
                    if (sender) expect(postBody.sender).to.equal(sender)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-064: should mint a KIP-37 token with not array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = 1
            const amount = 10
            setCallFakeForCallApi(callApiStub, alias, [id], [amount])

            const ret = await caver.kas.kip37.mint(alias, to, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-065: should mint a KIP-37 token with array parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = [1]
            const amount = [10]
            setCallFakeForCallApi(callApiStub, alias, id, amount)

            const ret = await caver.kas.kip37.mint(alias, to, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-066: should mint the KIP-37 tokens with array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.mint(contractAddress, to, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-067: should mint the KIP-37 tokens with hex string and bigNumber parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = ['0x1', '0x2']
            const amounts = ['0xa', new caver.utils.BigNumber(20)]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.mint(contractAddress, to, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-068: should mint the KIP-37 tokens with from address', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts, senderAddress)

            const ret = await caver.kas.kip37.mint(contractAddress, to, ids, amounts, senderAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-069: should call callback function with minting response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.mint(contractAddress, to, ids, amounts, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.transfer', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const to = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const senderAddress = '0x96c0b472d47a118e2e641046889bd2ee97e1d8d2'
        const ownerAddress = '0x93c3c662c84873c33ed2c1eb7cee201c020834ec'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, ids, amounts) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token/transfer`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.sender).to.equal(senderAddress)
                    expect(postBody.owner).to.equal(ownerAddress)
                    expect(postBody.to).to.equal(to)
                    for (let i = 0; i < ids.length; i++) expect(postBody.ids[i]).to.equal(caver.utils.toHex(ids[i]))
                    for (let i = 0; i < amounts.length; i++) expect(postBody.amounts[i]).to.equal(caver.utils.toHex(amounts[i]))
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-070: should transfer a KIP-37 token with not array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = 1
            const amount = 10
            setCallFakeForCallApi(callApiStub, alias, [id], [amount])

            const ret = await caver.kas.kip37.transfer(alias, senderAddress, ownerAddress, to, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-071: should transfer a KIP-37 token with array parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = [1]
            const amount = [10]
            setCallFakeForCallApi(callApiStub, alias, id, amount)

            const ret = await caver.kas.kip37.transfer(alias, senderAddress, ownerAddress, to, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-072: should transfer the KIP-37 tokens with array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.transfer(contractAddress, senderAddress, ownerAddress, to, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-073: should transfer the KIP-37 tokens with hex string and bigNumber parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = ['0x1', '0x2']
            const amounts = ['0xa', new caver.utils.BigNumber(20)]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.transfer(contractAddress, senderAddress, ownerAddress, to, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-074: should call callback function with transfering response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.transfer(contractAddress, senderAddress, ownerAddress, to, ids, amounts, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.getDeployer', () => {
        const apiResult = {
            address: '0x076bbe42247da045673a622f5ddb1ec81d53c131',
            krn: 'krn:1001:kip37:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
        }

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
                    expect(path).to.equal(`/v1/deployer/default`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-075: should return default deployer information', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.deployerApi, 'getDefaultDeployer')
            const callApiStub = sandbox.stub(caver.kas.kip37.deployerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.kip37.getDeployer()

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-KIP37-076: should call callback function with getDeployering response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.deployerApi, 'getDefaultDeployer')
            const callApiStub = sandbox.stub(caver.kas.kip37.deployerApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.getDeployer(() => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
        })
    })
})

describe('KIP37 V2 API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.initKIP37API', () => {
        it('CAVERJS-EXT-KAS-KIP37-077: should return error if kip37API is not initialized', async () => {
            const expectedError = `KIP37 API is not initialized. Use 'caver.initKIP37API' function to initialize KIP37 API.`
            expect(() => caver.kas.kip37.getContractList()).to.throw(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-KIP37-078: should set valid auth and chain id', () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            expect(caver.kas.kip37.accessOptions).not.to.be.undefined
            expect(caver.kas.kip37.accessKeyId).to.equal(accessKeyId)
            expect(caver.kas.kip37.secretAccessKey).to.equal(secretAccessKey)
            expect(caver.kas.kip37.auth).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(caver.kas.kip37.chainId).to.equal(chainId)
            expect(caver.kas.kip37.apiInstances).not.to.be.undefined
            expect(caver.kas.kip37.kip37ContractApi).not.to.be.undefined
            expect(caver.kas.kip37.deployerApi).not.to.be.undefined
        })
    })

    context('caver.kas.kip37.deploy', () => {
        const uri = 'https://caver.example/id/{id}.json'

        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x4707420eeda479477eae0c73878d9186150c153a9e2cbfe43e9d37750b64a4ec',
            uri,
        }

        const alias = 'alice'

        function setCallFakeForCallApi(callApiStub, feePayerOptions) {
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
                    expect(path).to.equal(`/v2/contract`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.uri).to.equal(uri)
                    expect(postBody.alias).to.equal(alias)
                    if (feePayerOptions) {
                        expect(postBody.options.enableGlobalFeePayer).to.equal(feePayerOptions.enableGlobalFeePayer)
                        expect(postBody.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
                        expect(postBody.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
                    }
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-079: should deploy KIP-37 token contract with alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.deploy(uri, alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-080: should deploy KIP-37 token contract with fee payer options', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip37.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, feePayerOptions)

            const ret = await caver.kas.kip37.deploy(uri, alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-081: should call callback function with deployment response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.deploy(uri, alias, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.importContract', () => {
        const contractAddress = '0x7ecb3d3a9ab42af0cf4a8cf46ad7f93df29851b8'
        const uri = 'https://caver.example/id/{id}.json'
        const alias = 'alice'

        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x4707420eeda479477eae0c73878d9186150c153a9e2cbfe43e9d37750b64a4ec',
            uri,
        }

        function setCallFakeForCallApi(callApiStub, feePayerOptions) {
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
                    expect(path).to.equal(`/v2/contract/import`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.address).to.equal(contractAddress)
                    expect(postBody.uri).to.equal(uri)
                    expect(postBody.alias).to.equal(alias)
                    if (feePayerOptions) {
                        expect(postBody.options.enableGlobalFeePayer).to.equal(feePayerOptions.enableGlobalFeePayer)
                        expect(postBody.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
                        expect(postBody.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
                    }
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-082: should import KIP-37 token contract with address and alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'importContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.importContract(contractAddress, uri, alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-083: should import KIP-37 token contract with address, alias and feePayerOptions', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'importContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip37.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, feePayerOptions)
            const ret = await caver.kas.kip37.importContract(contractAddress, uri, alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-084: should call callback function with deployment response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'importContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.importContract(contractAddress, uri, alias, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.updateContractOptions', () => {
        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const alias = 'alice-contract'

        const apiResult = {
            address: '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280',
            alias: 'alice-contract',
            status: 'deployed',
            uri: 'https://caver.example/id/{id}.json',
            options: {
                enableGlobalFeePayer: true,
                userFeePayer: {
                    krn: '',
                    address: '',
                },
            },
        }

        function setCallFakeForCallApi(callApiStub, addressOrAlias, feePayerOptions) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}`)
                    expect(mtd).to.equal(`PUT`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    if (feePayerOptions) {
                        expect(postBody.options.enableGlobalFeePayer).to.equal(feePayerOptions.enableGlobalFeePayer)
                        expect(postBody.options.userFeePayer.address).to.equal(feePayerOptions.userFeePayer.address)
                        expect(postBody.options.userFeePayer.krn).to.equal(feePayerOptions.userFeePayer.krn)
                    }
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-085: should import KIP-37 token contract with address and alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'putContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip37.updateContractOptions(contractAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.undefined
            expect(ret.status).not.to.undefined
            expect(ret.alias).not.to.undefined
            expect(ret.uri).not.to.undefined
            expect(ret.options).not.to.undefined
        })

        it('CAVERJS-EXT-KAS-KIP37-086: should import KIP-37 token contract with address, alias and feePayerOptions', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'putContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip37.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, alias, feePayerOptions)
            const ret = await caver.kas.kip37.updateContractOptions(alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.undefined
            expect(ret.status).not.to.undefined
            expect(ret.alias).not.to.undefined
            expect(ret.uri).not.to.undefined
            expect(ret.options).not.to.undefined
        })

        it('CAVERJS-EXT-KAS-KIP37-087: should call callback function with deployment response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'putContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip37.updateContractOptions(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).not.to.undefined
            expect(ret.status).not.to.undefined
            expect(ret.alias).not.to.undefined
            expect(ret.uri).not.to.undefined
            expect(ret.options).not.to.undefined
        })
    })

    context('caver.kas.kip37.getContractList', () => {
        const apiResult = {
            cursor:
                'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTAwLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0In0=',
            items: [
                {
                    address: '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280',
                    alias: 'alice-contract',
                    status: 'deployed',
                    uri: 'https://caver.example/id/{id}.json',
                    options: {
                        enableGlobalFeePayer: true,
                        userFeePayer: {
                            krn: '',
                            address: '',
                        },
                    },
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

                    headerParams,
                    formParams,
                    postBody,
                    authNames,
                    contentTypes,
                    accepts,
                    returnType,
                    callback
                ) => {
                    expect(path).to.equal(`/v2/contract`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(3)
                    expect(queryParams.size).to.equal(queryOptions.size)
                    expect(queryParams.cursor).to.equal(queryOptions.cursor)
                    expect(queryParams.status).to.equal(queryOptions.status)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-088: should return KIP-37 contract list', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.kip37.getContractList()

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-089: should return KIP-37 contract list with query options (size)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip37.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-090: should return KIP-37 contract list with query options (cursor)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTIyLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0MiJ9',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip37.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-091: should return KIP-37 contract list with query options (status)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                status: caver.kas.kip37.queryOptions.status.DEPLOYED,
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip37.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-092: should return KIP-37 contract list with query options (all)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
                status: caver.kas.kip37.queryOptions.status.DEPLOYED,
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.kip37.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-093: should call callback function with KIP-37 contract list', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.kip37.getContractList(() => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-094: should call callback function with KIP-37 contract list with query options', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip37.getContractList(queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip37.getContract', () => {
        const apiResult = {
            address: '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280',
            alias: 'alice-contract',
            status: 'deployed',
            uri: 'https://caver.example/id/{id}.json',
            options: {
                enableGlobalFeePayer: true,
                userFeePayer: {
                    krn: '',
                    address: '',
                },
            },
        }

        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const alias = 'alice-contract'

        function setCallFakeForCallApi(callApiStub, addressOrAlias) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-095: should return KIP-37 contract with contract address', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.getContract(contractAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
            expect(ret.alias).to.equal(alias)
        })

        it('CAVERJS-EXT-KAS-KIP37-096: should return KIP-37 contract with alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.getContract(alias)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
            expect(ret.alias).to.equal(alias)
        })

        it('CAVERJS-EXT-KAS-KIP37-097: should call callback function with KIP-37 contract', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip37.getContract(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(contractAddress)
            expect(ret.alias).to.equal(alias)
        })
    })

    context('caver.kas.kip37.getTokenListByOwner', () => {
        const apiResult = {
            cursor:
                'z53x014AdOQJGNl6V99k3wAap7M08oLKedg5DVqlLdZqWwPQzo3aM7v8A9J6V2nmqnpgDNOeGkblm1BKEX5x0Yr46bW2ZN4YGmQPJO1xBvrEzXrW2gbvDZ7EKMaYmkew=',
            items: [
                {
                    tokenId: '0x1',
                    totalSupply: '0xaf298d050e4395d69670b12b7f41000000000000',
                    tokenUri: 'https://token-cdn-domain/1.json',
                },
            ],
        }

        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const owner = '0xe5630ba1783f01f03485ccaf74da3a5d2643ddc1'
        const alias = 'alice-contract'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, queryOptions = {}) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/owner/{owner-address}/token`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
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

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-098: should return KIP-37 token list by owner', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, owner)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-099: should return KIP-37 token list by owner with query options (size)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip37.getTokenListByOwner(alias, owner, queryOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-100: should return KIP-37 token list by owner with query options (cursor)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTIyLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0MiJ9',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, queryOptions)

            const ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, owner, queryOptions)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-101: should return KIP-37 token list by owner with query options (all)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            const ret = await caver.kas.kip37.getTokenListByOwner(alias, owner, queryOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-102: should call callback function with KIP-37 token list by owner', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, owner, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-103: should call callback function with KIP-37 token list by owner with query options', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenOwnershipApi, 'getTokensByOwner')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenOwnershipApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, contractAddress, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip37.getTokenListByOwner(contractAddress, owner, queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip37.setApprovalForAll', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const owner = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
        const to = '0x661e2075de14d267c0f141e917a76871d3b299ad'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, approved) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/approveall`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.from).to.equal(owner)
                    expect(postBody.to).to.equal(to)
                    expect(postBody.approved).to.equal(approved)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-104: should approve for all KIP-37 tokens with alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const approved = true
            setCallFakeForCallApi(callApiStub, alias, approved)

            const ret = await caver.kas.kip37.setApprovalForAll(alias, owner, to, approved)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-105: should approve for all KIP-37 tokens with contract address', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            const approved = true
            setCallFakeForCallApi(callApiStub, contractAddress, approved)

            const ret = await caver.kas.kip37.setApprovalForAll(contractAddress, owner, to, approved)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-106: should call callback function with approving response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            const approved = true
            setCallFakeForCallApi(callApiStub, contractAddress, approved)

            const ret = await caver.kas.kip37.setApprovalForAll(contractAddress, owner, to, approved, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.pause', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const pauserAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, pauser) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/pause`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    if (pauser) expect(postBody.sender).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-107: should pause KIP-37 contract without pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.pause(alias)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-108: should pause KIP-37 contract with pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, pauserAddress)

            const ret = await caver.kas.kip37.pause(contractAddress, pauserAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-109: should call callback function with pausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.pause(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.unpause', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const pauserAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, pauser) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/unpause`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    if (pauser) expect(postBody.sender).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-110: should unpause KIP-37 contract without pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.unpause(alias)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-111: should unpause KIP-37 contract with pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, pauserAddress)

            const ret = await caver.kas.kip37.unpause(contractAddress, pauserAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-112: should call callback function with unpausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.unpause(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.pauseToken', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const pauserAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'
        const tokenId = 1

        function setCallFakeForCallApi(callApiStub, addressOrAlias, pauser) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/token/pause/{token-id}`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['token-id']).to.equal(caver.utils.toHex(tokenId))
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    if (pauser) expect(postBody.sender).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-113: should pause KIP-37 token without pauser (number token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'pauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.pauseToken(alias, tokenId)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-114: should pause KIP-37 token without pauser (hex string token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'pauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.pauseToken(alias, caver.utils.toHex(tokenId))

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-115: should pause KIP-37 token with pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'pauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, pauserAddress)

            const ret = await caver.kas.kip37.pauseToken(contractAddress, tokenId, pauserAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-116: should call callback function with unpausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'pauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.pauseToken(contractAddress, tokenId, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.unpauseToken', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const pauserAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'
        const tokenId = 1

        function setCallFakeForCallApi(callApiStub, addressOrAlias, pauser) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/token/unpause/{token-id}`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['token-id']).to.equal(caver.utils.toHex(tokenId))
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    if (pauser) expect(postBody.sender).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-117: should unpause KIP-37 token without pauser (number token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'unpauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.unpauseToken(alias, tokenId)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-118: should unpause KIP-37 token without pauser (hex string token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'unpauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.unpauseToken(alias, caver.utils.toHex(tokenId))

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-119: should unpause KIP-37 token with pauser', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'unpauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, pauserAddress)

            const ret = await caver.kas.kip37.unpauseToken(contractAddress, tokenId, pauserAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-120: should call callback function with unpausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'unpauseToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.unpauseToken(contractAddress, tokenId, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.create', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const senderAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'
        const tokenId = 1
        const initialSupply = '10000000000'
        const uri = 'https://token-cdn-domain/1.json'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, sender) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/token`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    expect(postBody.id).to.equal(caver.utils.toHex(tokenId))
                    expect(postBody.initialSupply).to.equal(caver.utils.toHex(initialSupply))
                    expect(postBody.uri).to.equal(uri)
                    if (sender) expect(postBody.sender).to.equal(sender)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-121: should create KIP-37 token without sender (number token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, tokenId, initialSupply, uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-122: should create KIP-37 token without sender (hex string token id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, caver.utils.toHex(tokenId), initialSupply, uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-123: should create KIP-37 token without sender (number initialSupply)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, tokenId, Number(initialSupply), uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-124: should create KIP-37 token without sender (BigNumber initialSupply)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, tokenId, new caver.utils.BigNumber(initialSupply), uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-125: should create KIP-37 token without sender (hex string initialSupply)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.create(alias, tokenId, caver.utils.toHex(initialSupply), uri)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-126: should create KIP-37 token with sender', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress, senderAddress)

            const ret = await caver.kas.kip37.create(contractAddress, tokenId, initialSupply, uri, senderAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-127: should call callback function with creating response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'createToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.create(contractAddress, tokenId, initialSupply, uri, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.getTokenList', () => {
        const apiResult = {
            cursor:
                'z53x014AdOQJGNl6V99k3wAap7M08oLKedg5DVqlLdZqWwPQzo3aM7v8A9J6V2nmqnpgDNOeGkblm1BKEX5x0Yr46bW2ZN4YGmQPJO1xBvrEzXrW2gbvDZ7EKMaYmkew=',
            items: [
                {
                    tokenId: '0x1',
                    totalSupply: '0xaf298d050e4395d69670b12b7f41000000000000',
                    tokenUri: 'https://token-cdn-domain/1.json',
                },
            ],
        }

        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const alias = 'alice-contract'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, queryOptions = {}) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/token`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
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

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-128: should return KIP-37 token list', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.getTokenList(contractAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-129: should return KIP-37 token list with query options (size)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip37.getTokenList(alias, queryOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-130: should return KIP-37 token list with query options (cursor)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTIyLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0MiJ9',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, queryOptions)

            const ret = await caver.kas.kip37.getTokenList(contractAddress, queryOptions)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-131: should return KIP-37 token list with query options (all)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            const ret = await caver.kas.kip37.getTokenList(alias, queryOptions)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-132: should call callback function with KIP-37 token list', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip37.getTokenList(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP37-133: should call callback function with KIP-37 token list with query options', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'getTokens')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip37.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, contractAddress, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip37.getTokenList(contractAddress, queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip37.burn', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const fromAddress = '0x0378bc408eb9438d9b54a0066a0324c9ef991457'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, ids, amounts, from) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/token`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.undefined
                    for (let i = 0; i < ids.length; i++) expect(postBody.ids[i]).to.equal(caver.utils.toHex(ids[i]))
                    for (let i = 0; i < amounts.length; i++) expect(postBody.amounts[i]).to.equal(caver.utils.toHex(amounts[i]))
                    if (from) expect(postBody.from).to.equal(from)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-134: should burn a KIP-37 token with not array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = 1
            const amount = 10
            setCallFakeForCallApi(callApiStub, alias, [id], [amount])

            const ret = await caver.kas.kip37.burn(alias, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-135: should burn a KIP-37 token with array parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = [1]
            const amount = [10]
            setCallFakeForCallApi(callApiStub, alias, id, amount)

            const ret = await caver.kas.kip37.burn(alias, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-136: should burn the KIP-37 tokens with array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.burn(contractAddress, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-137: should burn the KIP-37 tokens with hex string and bigNumber parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = ['0x1', '0x2']
            const amounts = ['0xa', new caver.utils.BigNumber(20)]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.burn(contractAddress, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-138: should burn the KIP-37 tokens with from address', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts, fromAddress)

            const ret = await caver.kas.kip37.burn(contractAddress, ids, amounts, fromAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-139: should call callback function with unpausing response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            const ids = [1, 2]
            const amounts = [10, 20]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.burn(contractAddress, ids, amounts, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.mint', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const to = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const senderAddress = '0x96c0b472d47a118e2e641046889bd2ee97e1d8d2'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, ids, amounts, sender) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/token/mint`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.to).to.equal(to)
                    for (let i = 0; i < ids.length; i++) expect(postBody.ids[i]).to.equal(caver.utils.toHex(ids[i]))
                    for (let i = 0; i < amounts.length; i++) expect(postBody.amounts[i]).to.equal(caver.utils.toHex(amounts[i]))
                    if (sender) expect(postBody.sender).to.equal(sender)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-140: should mint a KIP-37 token with not array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = 1
            const amount = 10
            setCallFakeForCallApi(callApiStub, alias, [id], [amount])

            const ret = await caver.kas.kip37.mint(alias, to, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-141: should mint a KIP-37 token with array parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = [1]
            const amount = [10]
            setCallFakeForCallApi(callApiStub, alias, id, amount)

            const ret = await caver.kas.kip37.mint(alias, to, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-142: should mint the KIP-37 tokens with array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.mint(contractAddress, to, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-143: should mint the KIP-37 tokens with hex string and bigNumber parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = ['0x1', '0x2']
            const amounts = ['0xa', new caver.utils.BigNumber(20)]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.mint(contractAddress, to, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-144: should mint the KIP-37 tokens with from address', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts, senderAddress)

            const ret = await caver.kas.kip37.mint(contractAddress, to, ids, amounts, senderAddress)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-145: should call callback function with minting response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.mint(contractAddress, to, ids, amounts, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.transfer', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const to = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const senderAddress = '0x96c0b472d47a118e2e641046889bd2ee97e1d8d2'
        const ownerAddress = '0x93c3c662c84873c33ed2c1eb7cee201c020834ec'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, ids, amounts) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/token/transfer`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.sender).to.equal(senderAddress)
                    expect(postBody.owner).to.equal(ownerAddress)
                    expect(postBody.to).to.equal(to)
                    for (let i = 0; i < ids.length; i++) expect(postBody.ids[i]).to.equal(caver.utils.toHex(ids[i]))
                    for (let i = 0; i < amounts.length; i++) expect(postBody.amounts[i]).to.equal(caver.utils.toHex(amounts[i]))
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-146: should transfer a KIP-37 token with not array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = 1
            const amount = 10
            setCallFakeForCallApi(callApiStub, alias, [id], [amount])

            const ret = await caver.kas.kip37.transfer(alias, senderAddress, ownerAddress, to, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-147: should transfer a KIP-37 token with array parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const id = [1]
            const amount = [10]
            setCallFakeForCallApi(callApiStub, alias, id, amount)

            const ret = await caver.kas.kip37.transfer(alias, senderAddress, ownerAddress, to, id, amount)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-148: should transfer the KIP-37 tokens with array parameter', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.transfer(contractAddress, senderAddress, ownerAddress, to, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-149: should transfer the KIP-37 tokens with hex string and bigNumber parameters', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            const ids = ['0x1', '0x2']
            const amounts = ['0xa', new caver.utils.BigNumber(20)]

            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.transfer(contractAddress, senderAddress, ownerAddress, to, ids, amounts)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-150: should call callback function with transfering response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip37.tokenApi.apiClient, 'callApi')

            let isCalled = false

            const ids = [1, 2]
            const amounts = [10, 20]
            setCallFakeForCallApi(callApiStub, contractAddress, ids, amounts)

            const ret = await caver.kas.kip37.transfer(contractAddress, senderAddress, ownerAddress, to, ids, amounts, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.getDeployer', () => {
        const apiResult = {
            address: '0x076bbe42247da045673a622f5ddb1ec81d53c131',
            krn: 'krn:1001:kip37:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
        }

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
                    expect(path).to.equal(`/v2/deployer/default`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-151: should return default deployer information', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.deployerApi, 'getDefaultDeployer')
            const callApiStub = sandbox.stub(caver.kas.kip37.deployerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.kip37.getDeployer()

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-KIP37-152: should call callback function with getDeployering response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.deployerApi, 'getDefaultDeployer')
            const callApiStub = sandbox.stub(caver.kas.kip37.deployerApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip37.getDeployer(() => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
        })
    })

    context('caver.kas.kip37.getContractOwner', () => {
        const apiResult = {
            owner: '0xa809284C83b901eD106Aba4Ccda14628Af128e14',
        }

        const contractAddress = '0x9a4af95723b972ec6953187cb39b7167e216cbdd'
        const alias = 'jasmine2'
        const owner = '0xa809284C83b901eD106Aba4Ccda14628Af128e14'

        function setCallFakeForCallApi(callApiStub, addressOrAlias) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/owner`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-153: should return contract owner address with contract address', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'owner')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.getContractOwner(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.owner).to.equal(owner)
        })

        it('CAVERJS-EXT-KAS-KIP37-154: should return contract owner address with alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'owner')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip37.getContractOwner(alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.owner).to.equal(owner)
        })

        it('CAVERJS-EXT-KAS-KIP37-155: should call callback function with contract owner', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'owner')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip37.getContractOwner(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.owner).to.equal(owner)
        })
    })

    context('caver.kas.kip37.transferOwnership', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6ed0f6dba64f2faa727e83cd9a666ff50c6864b055ac1d166b2c83cbf057cec3',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const sender = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const owner = '0x0c12a8f720f721cb3879217ee45709c2345c8446'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, ownerAddress, senderAddress) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/owner/transfer`)
                    expect(mtd).to.equal(`PUT`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    if (postBody.sender) expect(postBody.sender).to.equal(senderAddress)
                    expect(postBody.owner).to.equal(ownerAddress)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-156: should transfer KIP-37 owner with alias from same sender and owner (number id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'transferOwnership')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, sender, sender)

            const ret = await caver.kas.kip37.transferOwnership(alias, sender, sender)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-157: should transfer KIP-37 owner with alias from different sender and owner (number id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'transferOwnership')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, owner, sender)

            const ret = await caver.kas.kip37.transferOwnership(alias, owner, sender)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-158: should transfer KIP-37 owner with alias from different sender and owner (hex string id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'transferOwnership')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, owner, sender)

            const ret = await caver.kas.kip37.transferOwnership(alias, owner, sender)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-159: should transfer KIP-37 owner with contract address from same sender and owner (number id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'transferOwnership')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, sender, sender)

            const ret = await caver.kas.kip37.transferOwnership(contractAddress, sender, sender)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-160: should transfer KIP-37 owner with contract address from different sender and owner (number id)', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'transferOwnership')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, owner, sender)

            const ret = await caver.kas.kip37.transferOwnership(contractAddress, owner, sender)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-161: should call callback function with transfering response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'transferOwnership')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress, owner, sender)
            const ret = await caver.kas.kip37.transferOwnership(contractAddress, owner, sender, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip37.renounceOwnership', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6ed0f6dba64f2faa727e83cd9a666ff50c6864b055ac1d166b2c83cbf057cec3',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const from = '0x0c12a8f720f721cb3879217ee45709c2345c8446'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, fromAddress) {
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
                    expect(path).to.equal(`/v2/contract/{contract-address-or-alias}/owner`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    if (postBody.from) expect(postBody.from).to.equal(fromAddress)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP37-162: should renounce KIP-37 with alias', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'renounceContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, from)

            const ret = await caver.kas.kip37.renounceOwnership(alias, from)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-163: should renounce KIP-37 with alias and from', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'renounceContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, from)

            const ret = await caver.kas.kip37.renounceOwnership(alias, from)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-164: should call callback function after renounce KIP-37 with alias and from', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'renounceContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, from)

            let isCalled = false

            const ret = await caver.kas.kip37.renounceOwnership(alias, from, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-165: should renounce KIP-37 owner with contract address ', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'renounceContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip37.renounceOwnership(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-166: should renounce KIP-37 owner with contract address and from ', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'renounceContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, from)

            const ret = await caver.kas.kip37.renounceOwnership(contractAddress, from)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP37-167: should call callback function with renounce response', async () => {
            caver.initKIP37API(chainId, accessKeyId, secretAccessKey, url, 2)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip37.kip37ContractApi, 'renounceContract')
            const callApiStub = sandbox.stub(caver.kas.kip37.kip37ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip37.renounceOwnership(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })
})
