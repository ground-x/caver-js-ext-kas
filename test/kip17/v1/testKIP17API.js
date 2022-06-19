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

const CaverExtKAS = require('../../../index.js')

let caver
const { url, chainId, accessKeyId, secretAccessKey } = require('../../testEnv').auths.kip17API

const sandbox = sinon.createSandbox()

const feePayerOptionsObj = {
    enableGlobalFeePayer: true,
    userFeePayer: { krn: 'krn:1001:wallet:test:account-pool:default', address: '0x18cff7e7054784e666535de1b609c05625d23a1d' },
}

describe('KIP17 API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.initKIP17API', () => {
        it('CAVERJS-EXT-KAS-KIP17-001: should return error if kip17API is not initialized', async () => {
            const expectedError = `KIP17 API is not initialized. Use 'caver.initKIP17API' function to initialize KIP17 API.`
            expect(() => caver.kas.kip17.getContractList()).to.throw(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-KIP17-002: should set valid auth and chain id', () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            expect(caver.kas.kip17.accessOptions).not.to.be.undefined
            expect(caver.kas.kip17.accessKeyId).to.equal(accessKeyId)
            expect(caver.kas.kip17.secretAccessKey).to.equal(secretAccessKey)
            expect(caver.kas.kip17.auth).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(caver.kas.kip17.chainId).to.equal(chainId)
            expect(caver.kas.kip17.apiInstances).not.to.be.undefined
            expect(caver.kas.kip17.kip17ContractApi).not.to.be.undefined
            expect(caver.kas.kip17.tokenApi).not.to.be.undefined
        })
    })

    context('caver.kas.kip17.deploy', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x0a4f4f97d8a5904721514d60abd3f9ad7938862e415a6c043553a94ab68a5edb',
            options: {
                enableGlobalFeePayer: true,
                userFeePayer: {
                    krn: 'krn:1001:wallet:88c1223c-66af-4122-9818-069b2e3c6b30:feepayer-pool:default',
                    address: '0xE8964cA0C83cBbF520df5597dc1f5EFc27E5E729',
                },
            },
        }

        const name = 'Alice'
        const symbol = 'ALI'
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
                    expect(postBody.name).to.equal(name)
                    expect(postBody.symbol).to.equal(symbol)
                    if (alias) expect(postBody.alias).to.equal(alias)
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

        it('CAVERJS-EXT-KAS-KIP17-004: should deploy KIP-17 token contract with alias', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip17.deploy(name, symbol, alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
            expect(ret.options).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-KIP17-080: should deploy KIP-17 token contract with fee payer options', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip17.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, feePayerOptions)
            const ret = await caver.kas.kip17.deploy(name, symbol, alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
            expect(ret.options).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-KIP17-006: should call callback function with deployment response (with alias)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip17.deploy(name, symbol, alias, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
            expect(ret.options).not.to.be.undefined
        })
    })

    context('caver.kas.kip17.updateContractOptions', () => {
        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const alias = 'alice-contract'

        const apiResult = {
            address: '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280',
            alias: 'alice-contract',
            name: 'Alice',
            symbol: 'ALI',
            options: {
                enableGlobalFeePayer: false,
                userFeePayer: {
                    krn: 'krn:1001:wallet:88c1223c-66af-4122-9818-069b2e3c6b30:feepayer-pool:default',
                    address: '0xd6905b98E4Ba43a24E842d2b66c1410173791cab',
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

        it('CAVERJS-EXT-KAS-KIP17-081: should import KIP-17 token contract with address and alias', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'updateContract')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip17.updateContractOptions(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })

        it('CAVERJS-EXT-KAS-KIP17-082: should import KIP-17 token contract with address, alias and feePayerOptions', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'updateContract')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip17.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, alias, feePayerOptions)
            const ret = await caver.kas.kip17.updateContractOptions(alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })

        it('CAVERJS-EXT-KAS-KIP17-083: should call callback function with deployment response', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'updateContract')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip17.updateContractOptions(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })
    })

    context('caver.kas.kip17.getContractList', () => {
        const apiResult = {
            cursor:
                'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTAwLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0In0=',
            items: [
                {
                    address: '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280',
                    alias: 'alice-contract',
                    name: 'Alice',
                    symbol: 'ALI',
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

        it('CAVERJS-EXT-KAS-KIP17-007: should return KIP-17 contract list', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.kip17.getContractList()

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-008: should return KIP-17 contract list with query options (size)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip17.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-009: should return KIP-17 contract list with query options (cursor)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTIyLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0MiJ9',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip17.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-010: should return KIP-17 contract list with query options (all)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.kip17.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-011: should call callback function with KIP-17 contract list', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.kip17.getContractList(() => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-012: should call callback function with KIP-17 contract list with query options', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip17.getContractList(queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip17.getContract', () => {
        const apiResult = {
            alias: 'simple-alias',
            name: 'Alice',
            symbol: 'ALI',
            address: '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16',
        }

        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const alias = 'simple-alias'

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

        it('CAVERJS-EXT-KAS-KIP17-013: should return KIP-17 contract with contract address', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip17.getContract(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
            expect(ret.alias).to.equal(alias)
        })

        it('CAVERJS-EXT-KAS-KIP17-014: should return KIP-17 contract with alias', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip17.getContract(alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
            expect(ret.alias).to.equal(alias)
        })

        it('CAVERJS-EXT-KAS-KIP17-015: should call callback function with KIP-17 contract', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.kip17ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip17.kip17ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip17.getContract(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(contractAddress)
            expect(ret.alias).to.equal(alias)
        })
    })

    context('caver.kas.kip17.mint', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const tokenId = 1
        const tokenIdHex = '0x1'
        const uri = 'uri'
        const to = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, id) {
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
                    expect(postBody).not.to.be.null
                    expect(postBody.to).to.equal(to)
                    expect(postBody.uri).to.equal(uri)
                    expect(postBody.id).to.equal(caver.utils.toHex(id))
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP17-016: should mint KIP-17 token with alias (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, tokenId)

            const ret = await caver.kas.kip17.mint(alias, to, tokenId, uri)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-017: should mint KIP-17 token with alias (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, tokenIdHex)

            const ret = await caver.kas.kip17.mint(alias, to, tokenIdHex, uri)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-018: should mint KIP-17 token with contractAddress (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, tokenId)

            const ret = await caver.kas.kip17.mint(contractAddress, to, tokenId, uri)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-019: should mint KIP-17 token with contractAddress (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, tokenIdHex)

            const ret = await caver.kas.kip17.mint(contractAddress, to, tokenIdHex, uri)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-020: should call callback function with minting response', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress, tokenId)
            const ret = await caver.kas.kip17.mint(contractAddress, to, tokenId, uri, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip17.getTokenList', () => {
        const apiResult = {
            cursor:
                'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            items: [
                {
                    createdAt: 1610524249,
                    owner: '0x6650d7f9bfb13561a37b15707b486f103f3a15cd',
                    previousOwner: '0x0000000000000000000000000000000000000000',
                    tokenId: '0x1',
                    tokenUri: 'uri',
                    transactionHash: '0x5a1283d301240e52b61c89a08408a4147d0349aace0cc36dc1fe267d4e05c5a4',
                    updatedAt: 1610524249,
                },
            ],
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

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

        it('CAVERJS-EXT-KAS-KIP17-021: should return token list minted from specific KIP-17 contract (with alias)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'listTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip17.getTokenList(alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-022: should return token list minted from specific KIP-17 contract (with contractAddress)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'listTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip17.getTokenList(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-023: should return token list minted from specific KIP-17 contract with query options (size)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'listTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip17.getTokenList(alias, queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-024: should return token list minted from specific KIP-17 contract with query options (cursor)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'listTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip17.getTokenList(alias, queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-025: should return token list minted from specific KIP-17 contract with query options (all)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'listTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            const ret = await caver.kas.kip17.getTokenList(alias, queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-026: should call callback function with token list minted from specific KIP-17 contract (with alias)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'listTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            let isCalled = false

            const ret = await caver.kas.kip17.getTokenList(alias, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-027: should call callback function with token list minted from specific KIP-17 contract (with contractAddress)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'listTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip17.getTokenList(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-028: should call callback function with token list minted from specific KIP-17 contract with query options (with alias)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'listTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip17.getTokenList(alias, queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-029: should call callback function with token list minted from specific KIP-17 contract with query options (with contractAddress)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'listTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, contractAddress, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip17.getTokenList(contractAddress, queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip17.getToken', () => {
        const apiResult = {
            createdAt: 1610524249,
            owner: '0x6650d7f9bfb13561a37b15707b486f103f3a15cd',
            previousOwner: '0x0000000000000000000000000000000000000000',
            tokenId: '0x1',
            tokenUri: 'uri',
            transactionHash: '0x5a1283d301240e52b61c89a08408a4147d0349aace0cc36dc1fe267d4e05c5a4',
            updatedAt: 1610524249,
        }

        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const alias = 'simple-alias'
        const tokenId = 1
        const tokenIdHex = '0x1'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, id) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token/{token-id}`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['token-id']).to.equal(caver.utils.toHex(id))
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

        it('CAVERJS-EXT-KAS-KIP17-030: should return KIP-17 contract with contract address and number id', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, tokenId)

            const ret = await caver.kas.kip17.getToken(contractAddress, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.tokenId).to.equal(tokenIdHex)
        })

        it('CAVERJS-EXT-KAS-KIP17-031: should return token with contract address and hex string id', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, tokenIdHex)

            const ret = await caver.kas.kip17.getToken(contractAddress, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.tokenId).to.equal(tokenIdHex)
        })

        it('CAVERJS-EXT-KAS-KIP17-032: should return token with alias and number id', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, tokenId)

            const ret = await caver.kas.kip17.getToken(alias, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.tokenId).to.equal(tokenIdHex)
        })

        it('CAVERJS-EXT-KAS-KIP17-033: should return token with alias and hex string id', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, tokenIdHex)

            const ret = await caver.kas.kip17.getToken(alias, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.tokenId).to.equal(tokenIdHex)
        })

        it('CAVERJS-EXT-KAS-KIP17-034: should call callback function with token', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, tokenId)

            let isCalled = false

            const ret = await caver.kas.kip17.getToken(contractAddress, tokenId, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.tokenId).to.equal(tokenIdHex)
        })
    })

    context('caver.kas.kip17.transfer', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6ed0f6dba64f2faa727e83cd9a666ff50c6864b055ac1d166b2c83cbf057cec3',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const sender = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const owner = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
        const to = '0x661e2075de14d267c0f141e917a76871d3b299ad'
        const tokenId = 1
        const tokenIdHex = '0x1'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, senderAddress, ownerAddress) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token/{token-id}`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['token-id']).to.equal(tokenIdHex)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.sender).to.equal(senderAddress)
                    expect(postBody.owner).to.equal(ownerAddress)
                    expect(postBody.to).to.equal(to)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP17-035: should transfer KIP-17 token with alias from same sender and owner (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, sender, sender)

            const ret = await caver.kas.kip17.transfer(alias, sender, sender, to, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-036: should transfer KIP-17 token with alias from different sender and owner (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, sender, owner)

            const ret = await caver.kas.kip17.transfer(alias, sender, owner, to, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-037: should transfer KIP-17 token with alias from same sender and owner (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, sender, sender)

            const ret = await caver.kas.kip17.transfer(alias, sender, sender, to, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-038: should transfer KIP-17 token with alias from different sender and owner (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, sender, owner)

            const ret = await caver.kas.kip17.transfer(alias, sender, owner, to, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-039: should transfer KIP-17 token with contract address from same sender and owner (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, sender, sender)

            const ret = await caver.kas.kip17.transfer(contractAddress, sender, sender, to, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-040: should transfer KIP-17 token with contract address from different sender and owner (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, sender, owner)

            const ret = await caver.kas.kip17.transfer(contractAddress, sender, owner, to, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-041: should transfer KIP-17 token with contract address from same sender and owner (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, sender, sender)

            const ret = await caver.kas.kip17.transfer(contractAddress, sender, sender, to, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-042: should transfer KIP-17 token with contract address from different sender and owner (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, sender, owner)

            const ret = await caver.kas.kip17.transfer(contractAddress, sender, owner, to, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-043: should call callback function with transfering response', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress, sender, owner)
            const ret = await caver.kas.kip17.transfer(contractAddress, sender, owner, to, tokenIdHex, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip17.burn', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x423ecce187ce4a50142171d826f88d4ecd9b79e88b59be1d6fa0141e54a77ef7',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const owner = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
        const tokenId = 1
        const tokenIdHex = '0x1'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token/{token-id}`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['token-id']).to.equal(tokenIdHex)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.from).to.equal(owner)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP17-044: should burn KIP-17 token with alias (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip17.burn(alias, owner, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-045: should burn KIP-17 token with alias (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip17.burn(alias, owner, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-046: should burn KIP-17 token with contract address (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip17.burn(contractAddress, owner, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-047: should burn KIP-17 token with contract address (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip17.burn(contractAddress, owner, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-048: should call callback function with burning response', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip17.burn(contractAddress, owner, tokenIdHex, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip17.approve', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xdc95cc96fb68b3777c2f474f238df8dc22f1674a9790bc5984bc07d09441c46c',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const owner = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
        const to = '0x661e2075de14d267c0f141e917a76871d3b299ad'
        const tokenId = 1
        const tokenIdHex = '0x1'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/approve/{token-id}`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['token-id']).to.equal(tokenIdHex)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.from).to.equal(owner)
                    expect(postBody.to).to.equal(to)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP17-049: should approve KIP-17 token with alias (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip17.approve(alias, owner, to, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-050: should approve KIP-17 token with alias (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip17.approve(alias, owner, to, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-051: should approve KIP-17 token with contract address (number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip17.approve(contractAddress, owner, to, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-052: should approve KIP-17 token with contract address (hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip17.approve(contractAddress, owner, to, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-053: should call callback function with approveing response', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip17.approve(contractAddress, owner, to, tokenIdHex, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip17.approveAll', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f85bbb869895eca6fa871a34303c1d4efa6e78cb19e85c4cadd02a1dca846cd',
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

        it('CAVERJS-EXT-KAS-KIP17-054: should approveAll KIP-17 tokens with alias (approved === true)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')

            const approved = true
            setCallFakeForCallApi(callApiStub, alias, approved)

            const ret = await caver.kas.kip17.approveAll(alias, owner, to, approved)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-055: should approveAll KIP-17 tokens with alias (approved === false)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')

            const approved = false
            setCallFakeForCallApi(callApiStub, alias, approved)

            const ret = await caver.kas.kip17.approveAll(alias, owner, to, approved)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-056: should approveAll KIP-17 tokens with contract address (approved === true)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')

            const approved = true
            setCallFakeForCallApi(callApiStub, contractAddress, approved)

            const ret = await caver.kas.kip17.approveAll(contractAddress, owner, to, approved)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-057: should approveAll KIP-17 tokens with contract address (approved === false)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')

            const approved = false
            setCallFakeForCallApi(callApiStub, contractAddress, approved)

            const ret = await caver.kas.kip17.approveAll(contractAddress, owner, to, approved)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP17-058: should call callback function with approveAlling response', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'approveAll')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress, true)
            const ret = await caver.kas.kip17.approveAll(contractAddress, owner, to, true, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip17.getTokenListByOwner', () => {
        const apiResult = {
            cursor:
                'eNoAzq5E6Lwa7WYZMpbpELGg8dMPaWo0KNV2kqY74A0QVJXNodeqKp3BYG92aDy23RWP7bExZ8v1O5zl6MrmwLgkwQmOJex3rlZzB9A4DX16v5PlK10D29kVJX3bgmQ4',
            items: [
                {
                    createdAt: 1610527372,
                    owner: '0x6650d7f9bfb13561a37b15707b486f103f3a15cd',
                    previousOwner: '0x0000000000000000000000000000000000000000',
                    tokenId: '0x5',
                    tokenUri: 'uri',
                    transactionHash: '0x4d96878081c4dfc0e56da026595f78e3da63ab2d34b243a979f138be3bdf2160',
                    updatedAt: 1610527372,
                },
            ],
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const owner = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/owner/{owner-address}`)
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

        it('CAVERJS-EXT-KAS-KIP17-059: should return token list owned by owner at specific KIP-17 contract (with alias)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getOwnerTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip17.getTokenListByOwner(alias, owner)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-060: should return token list owned by owner at specific KIP-17 contract (with contractAddress)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getOwnerTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip17.getTokenListByOwner(contractAddress, owner)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-061: should return token list owned by owner at specific KIP-17 contract with query options (size)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getOwnerTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip17.getTokenListByOwner(alias, owner, queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-062: should return token list owned by owner at specific KIP-17 contract with query options (cursor)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getOwnerTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip17.getTokenListByOwner(alias, owner, queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-063: should return token list owned by owner at specific KIP-17 contract with query options (all)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getOwnerTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            const ret = await caver.kas.kip17.getTokenListByOwner(alias, owner, queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-064: should call callback function with token list owned by owner at specific KIP-17 contract (with alias)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getOwnerTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            let isCalled = false

            const ret = await caver.kas.kip17.getTokenListByOwner(alias, owner, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-065: should call callback function with token list owned by owner at specific KIP-17 contract (with contractAddress)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getOwnerTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip17.getTokenListByOwner(contractAddress, owner, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-066: should call callback function with token list owned by owner at specific KIP-17 contract with query options (with alias)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getOwnerTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip17.getTokenListByOwner(alias, owner, queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-067: should call callback function with token list owned by owner at specific KIP-17 contract with query options (with contractAddress)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getOwnerTokens')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, contractAddress, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip17.getTokenListByOwner(contractAddress, owner, queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip17.getTransferHistory', () => {
        const apiResult = {
            cursor:
                'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R17MxekvGpJXaLnoeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            items: [
                {
                    from: '0x8b2b3fba5e089d8b67e06a0b5d744c4a0d2d21dd',
                    timestamp: 1610527718,
                    to: '0x7c021a7a330e48ccee2bf43bafc01a71cc2b5450',
                },
            ],
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const tokenId = 10
        const tokenIdHex = '0xa'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/token/{token-id}/history`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['token-id']).to.equal(tokenIdHex)
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

        it('CAVERJS-EXT-KAS-KIP17-068: should return transfer history related with specific token at specific KIP-17 contract (with alias and number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip17.getTransferHistory(alias, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-069: should return transfer history related with specific token at specific KIP-17 contract (with alias and hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip17.getTransferHistory(alias, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-070: should return transfer history related with specific token at specific KIP-17 contract (with contractAddress and number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip17.getTransferHistory(contractAddress, tokenId)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-071: should return transfer history related with specific token at specific KIP-17 contract (with contractAddress and hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip17.getTransferHistory(contractAddress, tokenIdHex)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-072: should return transfer history related with specific token at specific KIP-17 contract with query options (size)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip17.getTransferHistory(alias, tokenId, queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-073: should return transfer history related with specific token at specific KIP-17 contract with query options (cursor)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R17MxekOwxwAqYnoeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias, queryOptions)

            const ret = await caver.kas.kip17.getTransferHistory(alias, tokenId, queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-074: should return transfer history related with specific token at specific KIP-17 contract with query options (all)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'N2r8KY15wQ7qoZmxWB7ED2OgV9bQrYXeP6pEd193kvz8GmBQwxWXLab40R17MxekOwxwAqYnoeV2M7OpY5DKlNArZPgq6Jv4GLz1kdMJ58aqNl3KAw0olbBeWpXOadEG',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            const ret = await caver.kas.kip17.getTransferHistory(alias, tokenId, queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-075: should call callback function with transfer history related with specific token at specific KIP-17 contract (with alias and number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            let isCalled = false

            const ret = await caver.kas.kip17.getTransferHistory(alias, tokenId, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-076: should call callback function with transfer history related with specific token at specific KIP-17 contract (with alias and hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            let isCalled = false

            const ret = await caver.kas.kip17.getTransferHistory(alias, tokenIdHex, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-077: should call callback function with transfer history related with specific token at specific KIP-17 contract (with contractAddress and number id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip17.getTransferHistory(contractAddress, tokenId, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-078: should call callback function with transfer history related with specific token at specific KIP-17 contract (with contractAddress and hex string id)', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip17.getTransferHistory(contractAddress, tokenIdHex, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP17-079: should call callback function with transfer history related with specific token at specific KIP-17 contract with query options', async () => {
            caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                cursor:
                    'PdOALgqNme5a9vJ6KDBAZ4gzwx6alLo1Q5mX7q2Oz2d7e8PrK1Jpwbm9LZ6D0lRxNnvx4BMAVXNE5Qao3kqgWGYOp9rW8Y3GEDM0deNPbKvkJVEz4oXVrY0Wxk1lbp7B',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip17.tokenApi, 'getTokenHistory')
            const callApiStub = sandbox.stub(caver.kas.kip17.tokenApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip17.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, alias, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip17.getTransferHistory(alias, tokenId, queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })
})
