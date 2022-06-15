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
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const CaverExtKAS = require('../../index.js')

let caver
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.kip7API

const sandbox = sinon.createSandbox()

const feePayerOptionsObj = {
    enableGlobalFeePayer: true,
    userFeePayer: { krn: 'krn:1001:wallet:test:account-pool:default', address: '0x18cff7e7054784e666535de1b609c05625d23a1d' },
}

describe('KIP7 API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.initKIP7API', () => {
        it('CAVERJS-EXT-KAS-KIP7-001: should return error if kip7API is not initialized', async () => {
            const expectedError = `KIP7 API is not initialized. Use 'caver.initKIP7API' function to initialize KIP7 API.`
            expect(() => caver.kas.kip7.getContractList()).to.throw(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-KIP7-002: should set valid auth and chain id', () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            expect(caver.kas.kip7.accessOptions).not.to.be.undefined
            expect(caver.kas.kip7.accessKeyId).to.equal(accessKeyId)
            expect(caver.kas.kip7.secretAccessKey).to.equal(secretAccessKey)
            expect(caver.kas.kip7.auth).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(caver.kas.kip7.chainId).to.equal(chainId)
            expect(caver.kas.kip7.apiInstances).not.to.be.undefined
            expect(caver.kas.kip7.kip7ContractApi).not.to.be.undefined
            expect(caver.kas.kip7.deployerApi).not.to.be.undefined
        })
    })

    context('caver.kas.kip7.deploy', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xf4a9c11fb3e5148050ac2a19ab221be72bebfea95078317dda01a1c207f6f779',
        }

        const name = 'Alice'
        const symbol = 'ALI'
        const decimals = 18
        const initialSupply = '1000000000000000000000000000'
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
                    expect(postBody.decimals).to.equal(decimals)
                    expect(postBody.initialSupply).to.equal(caver.utils.toHex(initialSupply))
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

        it('CAVERJS-EXT-KAS-KIP7-003: should deploy KIP-7 token contract', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip7.deploy(name, symbol, decimals, initialSupply, alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-049: should deploy KIP-7 token contract with fee payer options', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip7.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, feePayerOptions)
            const ret = await caver.kas.kip7.deploy(name, symbol, decimals, initialSupply, alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-004: should call callback function with deployment response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip7.deploy(name, symbol, decimals, initialSupply, alias, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.updateContractOptions', () => {
        const contractAddress = '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280'
        const alias = 'alice-contract'

        const apiResult = {
            address: '0xb5fa02d64cd194b9e4dcaa593723efd655e3b280',
            decimals: 18,
            name: 'Alice',
            symbol: 'ALI',
            totalSupply: '0x8ac7230489e80000',
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

        it('CAVERJS-EXT-KAS-KIP7-050: should import KIP-7 token contract with address and alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'updateContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.updateContractOptions(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })

        it('CAVERJS-EXT-KAS-KIP7-051: should import KIP-7 token contract with address, alias and feePayerOptions', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'updateContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            const feePayerOptions = caver.kas.kip7.feePayerOptions.constructFromObject(feePayerOptionsObj)
            setCallFakeForCallApi(callApiStub, alias, feePayerOptions)
            const ret = await caver.kas.kip7.updateContractOptions(alias, feePayerOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })

        it('CAVERJS-EXT-KAS-KIP7-052: should call callback function with deployment response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'updateContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.updateContractOptions(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })
    })

    context('caver.kas.kip7.getContract', () => {
        const apiResult = {
            address: '0xfa40c93100adfcd2c26d723d36bd77fbaa48a464',
            decimals: 18,
            name: 'Alice',
            symbol: 'ALI',
            totalSupply: '0x8ac7230489e80000',
        }

        const contractAddress = '0xfa40c93100adfcd2c26d723d36bd77fbaa48a464'
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

        it('CAVERJS-EXT-KAS-KIP7-005: should return KIP-7 contract with contract address', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.getContract(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })

        it('CAVERJS-EXT-KAS-KIP7-006: should return KIP-7 contract with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.getContract(alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })

        it('CAVERJS-EXT-KAS-KIP7-007: should call callback function with KIP-7 contract', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            const ret = await caver.kas.kip7.getContract(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })
    })

    context('caver.kas.kip7.getContractList', () => {
        const apiResult = {
            items: [
                {
                    address: '0x260e78c96d294fcac8c65b07c63622b328b3471d',
                    alias: 'alice-3c5sysini01',
                    decimals: 18,
                    name: 'Alice',
                    status: 'deployed',
                    symbol: 'ALI',
                    totalSupply: '0x8ac7230489e80000',
                },
            ],
            cursor:
                'eyJjcmVhdGVkX2F0IjoxNjIwMDk1MTk1LCJpZCI6ImNvbnRyYWN0IzEwMDEjZjY4NDllMDgtNDMyNi00Y2NjLTg3MGItZGViZDcwMjhjYjkxIiwic19pZCI6Imphc21pbmUtM2M1c3lzaW5pMDEifQ==',
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

        it('CAVERJS-EXT-KAS-KIP7-008: should return KIP-7 contract list', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.kip7.getContractList()

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP7-009: should return KIP-7 contract list with query options (size)', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = { size: 1 }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip7.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP7-010: should return KIP-7 contract list with query options (cursor)', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                cursor:
                    'eyJjcmVhdGVkX2F0IjoxNjEwNTg3MTIyLCJnc2kyIjoiOGU3NmQwMDMtZDZkZC00Mjc4LThkMDUtNTE3MmQ4ZjAxMGNhIiwicGsiOiI4ZTc2ZDAwMy1kNmRkLTQyNzgtOGQwNS01MTcyZDhmMDEwY2EjMTAwMSNqYXNtaW5lLWNvbnRyYWN0MiJ9',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip7.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP7-011: should return KIP-7 contract list with query options (status)', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                status: caver.kas.kip7.queryOptions.status.DEPLOYED,
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, queryOptions)

            const ret = await caver.kas.kip7.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP7-012: should return KIP-7 contract list with query options (all)', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                status: caver.kas.kip7.queryOptions.status.DEPLOYED,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip7.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            const ret = await caver.kas.kip7.getContractList(queryOptions)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP7-013: should call callback function with KIP-7 contract list', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false

            const ret = await caver.kas.kip7.getContractList(() => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })

        it('CAVERJS-EXT-KAS-KIP7-014: should call callback function with KIP-7 contract list with query options', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const queryOptions = {
                size: 1,
                status: caver.kas.kip7.queryOptions.status.DEPLOYED,
                cursor:
                    '36rxE5ek8gVWPp2JZlvmBPq17z94O06eXYwLgWNpPq6gxBYdeaNQ8A4DzV0wW9nQkrR1KL3X5oGmlkOp72JrvMZEbrZEkDGaoKQ2M5lbdJVxA38zKoB09MbQXYGNwODm',
            }
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            const expectedQueryParams = caver.kas.kip7.queryOptions.constructFromObject(queryOptions)
            setCallFakeForCallApi(callApiStub, expectedQueryParams)

            let isCalled = false

            const ret = await caver.kas.kip7.getContractList(queryOptions, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.items).not.to.be.undefined
            expect(ret.cursor).to.equal(apiResult.cursor)
        })
    })

    context('caver.kas.kip7.allowance', () => {
        const apiResult = { balance: '0x2540be400', decimals: 18 }

        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const alias = 'simple-alias'
        const owner = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const spender = '0x7366f54429185bbcb6053b2fb5947358a9752103'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/account/{owner}/allowance/{spender}`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(3)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams.owner).to.equal(owner)
                    expect(pathParams.spender).to.equal(spender)
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

        it('CAVERJS-EXT-KAS-KIP7-015: should return allowance with contract address', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'getTokenAllowance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            await caver.kas.kip7.allowance(contractAddress, owner, spender)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
        })

        it('CAVERJS-EXT-KAS-KIP7-016: should return allowance with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'getTokenAllowance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            await caver.kas.kip7.allowance(alias, owner, spender)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
        })

        it('CAVERJS-EXT-KAS-KIP7-017: should call callback function with allowance', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'getTokenAllowance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            await caver.kas.kip7.allowance(contractAddress, owner, spender, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
        })
    })

    context('caver.kas.kip7.balance', () => {
        const apiResult = { balance: '0x2540be400', decimals: 18 }

        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const alias = 'simple-alias'
        const owner = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/account/{owner}/balance`)
                    expect(mtd).to.equal(`GET`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams.owner).to.equal(owner)
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

        it('CAVERJS-EXT-KAS-KIP7-018: should return balance with contract address', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'getTokenBalance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            await caver.kas.kip7.balance(contractAddress, owner)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
        })

        it('CAVERJS-EXT-KAS-KIP7-019: should return balance with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'getTokenBalance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            await caver.kas.kip7.balance(alias, owner)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
        })

        it('CAVERJS-EXT-KAS-KIP7-020: should call callback function with balance', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'getTokenBalance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            let isCalled = false

            await caver.kas.kip7.balance(contractAddress, owner, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
        })
    })

    context('caver.kas.kip7.approve', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x09b6ce214fd4abcf8f214dc80581a168381ce76fa210b3f068902e4d5e973713',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

        const owner = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const spender = '0x7366f54429185bbcb6053b2fb5947358a9752103'
        const amount = 10

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/approve`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.owner).to.equal(owner)
                    expect(postBody.spender).to.equal(spender)
                    expect(postBody.amount).to.equal(caver.utils.toHex(amount))
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-021: should approve KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.approve(alias, owner, spender, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-022: should approve KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.approve(contractAddress, owner, spender, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-023: should call callback function with approveing response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.approve(contractAddress, owner, spender, amount, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.transfer', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

        const from = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const to = '0x7366f54429185bbcb6053b2fb5947358a9752103'
        const amount = 10

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/transfer`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.from).to.equal(from)
                    expect(postBody.to).to.equal(to)
                    expect(postBody.amount).to.equal(caver.utils.toHex(amount))
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-024: should transfer KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.transfer(alias, from, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-025: should transfer KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.transfer(contractAddress, from, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-026: should call callback function with transfering response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.transfer(contractAddress, from, to, amount, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.transferFrom', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

        const spender = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
        const owner = '0x85c581b577b927d8a19b29d35a63728620e354d8'
        const to = '0x7366f54429185bbcb6053b2fb5947358a9752103'
        const amount = 10

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/transfer-from`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.spender).to.equal(spender)
                    expect(postBody.owner).to.equal(owner)
                    expect(postBody.to).to.equal(to)
                    expect(postBody.amount).to.equal(caver.utils.toHex(amount))
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-027: should transferFrom KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'transferFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.transferFrom(alias, spender, owner, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-028: should transferFrom KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'transferFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.transferFrom(contractAddress, spender, owner, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-029: should call callback function with transfer-from response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'transferFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.transferFrom(contractAddress, spender, owner, to, amount, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.mint', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xcb3a7ed6132633702474528dd9a616daf5b6b2242a5b75e76335d99c9daaa0cf',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

        const to = '0x7366f54429185bbcb6053b2fb5947358a9752103'
        const amount = 10

        function setCallFakeForCallApi(callApiStub, addressOrAlias, minter) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/mint`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.to).to.equal(to)
                    expect(postBody.amount).to.equal(caver.utils.toHex(amount))
                    if (minter) expect(postBody.from).to.equal(minter)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-030: should mint KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.mint(alias, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-031: should mint KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.mint(contractAddress, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-053: should mint KIP-7 token with minter', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')

            const minter = '0xbbe5527501a7e954ee1a492705ae472f776b2ea2'
            setCallFakeForCallApi(callApiStub, contractAddress, minter)

            const ret = await caver.kas.kip7.mint(contractAddress, to, amount, minter)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-032: should call callback function with minting response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.mint(contractAddress, to, amount, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.burn', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

        const from = '0x7366f54429185bbcb6053b2fb5947358a9752103'
        const amount = 10

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/burn`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.from).to.equal(from)
                    expect(postBody.amount).to.equal(caver.utils.toHex(amount))
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-033: should burn KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.burn(alias, from, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-034: should burn KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.burn(contractAddress, from, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-035: should call callback function with burning response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.burn(contractAddress, from, amount, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.burnFrom', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

        const spender = '0x7366f54429185bbcb6053b2fb5947358a9752103'
        const owner = '0x85c581b577b927d8a19b29d35a63728620e354d8'
        const amount = 10

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/burn-from`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    expect(postBody.spender).to.equal(spender)
                    expect(postBody.owner).to.equal(owner)
                    expect(postBody.amount).to.equal(caver.utils.toHex(amount))
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-036: should burnFrom KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'burnFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.burnFrom(alias, spender, owner, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-037: should burnFrom KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'burnFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.burnFrom(contractAddress, spender, owner, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-038: should call callback function with burnFroming response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'burnFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.burnFrom(contractAddress, spender, owner, amount, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.pause', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

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
                    expect(postBody).not.to.be.null
                    if (pauser) expect(postBody.pauser).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-039: should pause KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.pause(alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-040: should pause KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.pause(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-041: should call callback function with pauseing response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.pause(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-047: should pause with pauser', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            const pauser = '0xbbe5527501a7e954ee1a492705ae472f776b2ea2'
            setCallFakeForCallApi(callApiStub, contractAddress, pauser)
            const ret = await caver.kas.kip7.pause(contractAddress, pauser)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.unpause', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

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
                    expect(postBody).not.to.be.null
                    if (pauser) expect(postBody.pauser).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-042: should unpause KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.unpause(alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-043: should unpause KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.unpause(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-044: should call callback function with unpauseing response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.unpause(contractAddress, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-048: should unpause with pauser', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            const pauser = '0xbbe5527501a7e954ee1a492705ae472f776b2ea2'
            setCallFakeForCallApi(callApiStub, contractAddress, pauser)
            const ret = await caver.kas.kip7.unpause(contractAddress, pauser)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.addMinter', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const account = '0xbbe5527501a7e954ee1a492705ae472f776b2ea2'
        const authorized = '0xae9c424eda885463d33193ac37b5bdacb916772b'

        function setCallFakeForCallApi(callApiStub, addressOrAlias, minter) {
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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/minter`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    if (minter) expect(postBody.sender).to.equal(minter)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-053: should add minter with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'addMinter')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.addMinter(alias, account)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-054: should add minter with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'addMinter')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.addMinter(contractAddress, account)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-055: should add minter with minter address', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'addMinter')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, authorized)

            const ret = await caver.kas.kip7.addMinter(contractAddress, account, authorized)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-056: should call callback function with adding response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'addMinter')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.addMinter(contractAddress, account, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.renounceMinter', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const account = '0xbbe5527501a7e954ee1a492705ae472f776b2ea2'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/minter/{minter-address}`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['minter-address']).to.equal(account)
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

        it('CAVERJS-EXT-KAS-KIP7-057: should remove minter with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'renounceMinter')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.renounceMinter(alias, account)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-058: should remove minter with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'renounceMinter')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.renounceMinter(contractAddress, account)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-059: should call callback function with renouncing response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7TokenApi, 'renounceMinter')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7TokenApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.renounceMinter(contractAddress, account, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.addPauser', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const account = '0xbbe5527501a7e954ee1a492705ae472f776b2ea2'
        const authorized = '0xae9c424eda885463d33193ac37b5bdacb916772b'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/pauser`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(1)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(Object.keys(queryParams).length).to.equal(0)

                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).not.to.be.null
                    if (pauser) expect(postBody.sender).to.equal(pauser)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-060: should add pauser with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'addPauser')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.addPauser(alias, account)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-061: should add pauser with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'addPauser')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.addPauser(contractAddress, account)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-062: should add pauser with pauser address', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'addPauser')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress, authorized)

            const ret = await caver.kas.kip7.addPauser(contractAddress, account, authorized)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-063: should call callback function with adding response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'addPauser')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.addPauser(contractAddress, account, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.renouncePauser', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'
        const account = '0xbbe5527501a7e954ee1a492705ae472f776b2ea2'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/pauser/{pauser-address}`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(Object.keys(pathParams).length).to.equal(2)
                    expect(pathParams['contract-address-or-alias']).to.equal(addressOrAlias)
                    expect(pathParams['pauser-address']).to.equal(account)
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

        it('CAVERJS-EXT-KAS-KIP7-064: should remove pauser with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'renouncePauser')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.renouncePauser(alias, account)

            expect(clientFunctionSpy.calledWith(alias)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-065: should remove pauser with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'renouncePauser')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.renouncePauser(contractAddress, account)

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-066: should call callback function with renouncing response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7ContractApi, 'renouncePauser')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7ContractApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, contractAddress)
            const ret = await caver.kas.kip7.renouncePauser(contractAddress, account, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(contractAddress)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.getDeployer', () => {
        const apiResult = {
            address: '0x076bbe42247da045673a622f5ddb1ec81d53c131',
            krn: 'krn:1001:kip7:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
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
                    // expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(Object.keys(contentTypes).length).to.equal(0)
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, apiResult, { body: apiResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-KIP7-045: should return default deployer information', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.deployerApi, 'getDefaultDeployer')
            const callApiStub = sandbox.stub(caver.kas.kip7.deployerApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.kip7.getDeployer()

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).not.to.be.undefined
            expect(ret.krn).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-KIP7-046: should call callback function with getDeployering response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.deployerApi, 'getDefaultDeployer')
            const callApiStub = sandbox.stub(caver.kas.kip7.deployerApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)
            const ret = await caver.kas.kip7.getDeployer(() => {
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
