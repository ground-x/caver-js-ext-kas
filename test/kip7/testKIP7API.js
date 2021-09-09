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
            expect(caver.kas.kip7.kip7Api).not.to.be.undefined
            expect(caver.kas.kip7.deployerApi).not.to.be.undefined
        })
    })

    context('caver.kas.kip7.deploy', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0xf4a9c11fb3e5148050ac2a19ab221be72bebfea95078317dda01a1c207f6f779',
        }

        const name = 'Jasmine'
        const symbol = 'JAS'
        const decimals = 18
        const initialSupply = '1000000000000000000000000000'
        const alias = 'jasmine'

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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

            setCallFakeForCallApi(callApiStub, alias)
            const ret = await caver.kas.kip7.deploy(name, symbol, decimals, initialSupply, alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-004: should call callback function with deployment response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'deployContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, alias)
            const ret = await caver.kas.kip7.deploy(name, symbol, decimals, initialSupply, alias, () => {
                isCalled = true
            })

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.status).to.equal('Submitted')
        })
    })

    context('caver.kas.kip7.getContract', () => {
        const apiResult = {
            address: '0xfa40c93100adfcd2c26d723d36bd77fbaa48a464',
            decimals: 18,
            name: 'Jasmine',
            symbol: 'JAS',
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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.getContract(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })

        it('CAVERJS-EXT-KAS-KIP7-006: should return KIP-7 contract with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.getContract(alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.address).to.equal(contractAddress)
        })

        it('CAVERJS-EXT-KAS-KIP7-007: should call callback function with KIP-7 contract', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'getContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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
                    alias: 'jasmine-3c5sysini01',
                    decimals: 18,
                    name: 'Jasmine',
                    status: 'deployed',
                    symbol: 'JAS',
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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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
            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'listContractsInDeployerPool')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'getTokenAllowance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            await caver.kas.kip7.allowance(contractAddress, owner, spender)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
        })

        it('CAVERJS-EXT-KAS-KIP7-016: should return allowance with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'getTokenAllowance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            await caver.kas.kip7.allowance(alias, owner, spender)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
        })

        it('CAVERJS-EXT-KAS-KIP7-017: should call callback function with allowance', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'getTokenAllowance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'getTokenBalance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            await caver.kas.kip7.balance(contractAddress, owner)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
        })

        it('CAVERJS-EXT-KAS-KIP7-019: should return balance with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'getTokenBalance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            await caver.kas.kip7.balance(alias, owner)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
        })

        it('CAVERJS-EXT-KAS-KIP7-020: should call callback function with balance', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'getTokenBalance')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.approve(alias, owner, spender, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-022: should approve KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.approve(contractAddress, owner, spender, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-023: should call callback function with approveing response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'approveToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.transfer(alias, from, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-025: should transfer KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.transfer(contractAddress, from, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-026: should call callback function with transfering response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'transferToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'transferFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.transferFrom(alias, spender, owner, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-028: should transferFrom KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'transferFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.transferFrom(contractAddress, spender, owner, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-029: should call callback function with transfer-from response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'transferFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.mint(alias, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-031: should mint KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.mint(contractAddress, to, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-032: should call callback function with minting response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'mintToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.burn(alias, from, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-034: should burn KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.burn(contractAddress, from, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-035: should call callback function with burning response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'burnToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

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

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'burnFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.burnFrom(alias, spender, owner, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-037: should burnFrom KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'burnFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.burnFrom(contractAddress, spender, owner, amount)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-038: should call callback function with burnFroming response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'burnFromToken')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/pause`)
                    expect(mtd).to.equal(`POST`)
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

        it('CAVERJS-EXT-KAS-KIP7-039: should pause KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.pause(alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-040: should pause KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.pause(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-041: should call callback function with pauseing response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'pauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

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
    })

    context('caver.kas.kip7.unpause', () => {
        const apiResult = {
            status: 'Submitted',
            transactionHash: '0x6f26c79853c62262c8425db6bc7b4266ed606069d09a04464b785aaaf0f344a4',
        }

        const alias = 'simple-alias'
        const contractAddress = '0x9ad4163329aa90eaf52a27ac8f5e7981becebc16'

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
                    expect(path).to.equal(`/v1/contract/{contract-address-or-alias}/unpause`)
                    expect(mtd).to.equal(`POST`)
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

        it('CAVERJS-EXT-KAS-KIP7-042: should unpause KIP-7 token with alias', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, alias)

            const ret = await caver.kas.kip7.unpause(alias)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-043: should unpause KIP-7 token with contractAddress', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, contractAddress)

            const ret = await caver.kas.kip7.unpause(contractAddress)

            expect(clientFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.status).to.equal('Submitted')
        })

        it('CAVERJS-EXT-KAS-KIP7-044: should call callback function with unpauseing response', async () => {
            caver.initKIP7API(chainId, accessKeyId, secretAccessKey, url)

            const clientFunctionSpy = sandbox.spy(caver.kas.kip7.kip7Api, 'unpauseContract')
            const callApiStub = sandbox.stub(caver.kas.kip7.kip7Api.apiClient, 'callApi')

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
                    expect(postBody).to.be.null
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
