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

const _ = require('lodash')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const CaverExtKAS = require('../../index.js')
const {
    LegacyTransactionRequest,
    ValueTransferTransactionRequest,
    ContractDeployTransactionRequest,
    ContractExecutionTransactionRequest,
    CancelTransactionRequest,
    AnchorTransactionRequest,
    ProcessRLPRequest,
    AccountUpdateTransactionRequest,
} = require('../../src/rest-client')

let caver
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.walletAPI

const sandbox = sinon.createSandbox()

describe('Wallet API - Basic transaction API', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.kas.wallet.requestLegacyTransaction', () => {
        const resultOfApi = {
            address: '0x72A328cEB689962B66d3af17BD50a6003f42ca01',
            chainId: 1001,
            createdAt: 1599632462,
            keyId:
                'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default:0xf6bd39c66fdf5111646c291011f65c72455da6ecbebb01d5b17b8dfe9c385ee1',
            krn: 'krn:1001:wallet:8e76d003-d6dd-4278-8d05-5172d8f010ca:account-pool:default',
            publicKey:
                '0x040e6423d1dcd66fa28f34745aaefe4480130f670e834a889a9c05958755a13ab574c93f527a5042554ad7bff17b3abfd5d18cbca9cee2ca829215acfdb716772e',
            updatedAt: 1599632462,
        }

        const txObj = {
            from: '0x72A328cEB689962B66d3af17BD50a6003f42ca01',
            to: '0xa20f03fa4360fe3c58b034c30a91b45500e96383',
            value: 1,
            gas: 250000,
            submit: false,
        }

        function setCallFakeForCallApi(callApiStub, tx) {
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
                    expect(path).to.equal(`/v2/tx/legacy`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    Object.keys(tx).map(key => {
                        expect(postBody[key]).to.equal(tx[key])
                    })
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-038: should request legacy transaction to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'legacyTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestLegacyTransaction(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-039: should request legacy transaction to KAS (with contract deploy object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const deploy = {
                from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
                value: '0x12',
                input:
                    '0x60806040526000805534801561001457600080fd5b50610116806100246000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a7230582064856de85a2706463526593b08dd790054536042ef66d3204018e6790a2208d10029',
                nonce: 0,
                gas: 1000000,
                submit: true,
            }
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'legacyTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, deploy)

            const ret = await caver.kas.wallet.requestLegacyTransaction(deploy)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-040: should request legacy transaction to KAS (with LegacyTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = LegacyTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'legacyTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestLegacyTransaction(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-041: should request legacy transaction to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'legacyTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestLegacyTransaction(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-042: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'legacyTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestLegacyTransaction(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-043: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestLegacyTransaction(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestValueTransfer', () => {
        const resultOfApi = {
            from: '0xe5bde240904a6a76449c2e7247e2538cbd7c9f1f',
            gas: 25000,
            gasPrice: '0x5d21dba00',
            nonce: 0,
            rlp:
                '0x08f87e808505d21dba008261a89476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194e5bde240904a6a76449c2e7247e2538cbd7c9f1ff847f8458207f6a06568ad615e9491e4ba8006eb29871e674ca6627a7bcfcb489a76ee88cc1a5ab9a030e765a841a482b543f3530ce3e0f3d0098281b3b9741f4102e617f201ea6d39',
            typeInt: 8,
            signatures: [
                {
                    R: '0x6568ad615e9491e4ba8006eb29871e674ca6627a7bcfcb489a76ee88cc1a5ab9',
                    S: '0x30e765a841a482b543f3530ce3e0f3d0098281b3b9741f4102e617f201ea6d39',
                    V: '0x7f6',
                },
            ],
            status: 'Submitted',
            transactionHash: '0x834a72bc8ff3d701428bc7b8d98d024aadf9db681700311b082f507d1ee6cb89',
            value: '0x1',
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            value: '0x100',
            to: '0x2F87Ba64de5526F7880F21481Effbf950f70005c',
            nonce: 0,
            gas: 1000000,
            submit: true,
        }

        function setCallFakeForCallApi(callApiStub, tx) {
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
                    expect(path).to.equal(`/v2/tx/value`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    Object.keys(tx).map(key => {
                        expect(postBody[key]).to.equal(tx[key])
                    })
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-044: should request value transfer transaction to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'valueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestValueTransfer(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-045: should request value transfer memo transaction to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const withMemo = Object.assign({ memo: 'memo' }, txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'valueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, withMemo)

            const ret = await caver.kas.wallet.requestValueTransfer(withMemo)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-046: should request value transfer transaction to KAS (with ValueTransferTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = ValueTransferTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'valueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestValueTransfer(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-047: should request value transfer transaction to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'valueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestValueTransfer(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-048: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'valueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestValueTransfer(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-049: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestValueTransfer(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestSmartContractDeploy', () => {
        const resultOfApi = {
            from: '0x0736e6993bd0034cbe626f0a74503bf554ec29a8',
            gas: 1000000,
            gasPrice: '0x5d21dba00',
            nonce: 0,
            rlp:
                '0x28f905af808505d21dba00830f42408080940736e6993bd0034cbe626f0a74503bf554ec29a8b9053f608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e149900298080f847f8458207f5a09d6f9f76614446baebb0225005fc4aacddbf4af51777baa7d2b9670bee78effea04c07f8ffefc0986625ba40ec1de75928dc49bd0504d988159c3501a81c69985f',
            typeInt: 40,
            input:
                '0x608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029',
            signatures: [
                {
                    R: '0x9d6f9f76614446baebb0225005fc4aacddbf4af51777baa7d2b9670bee78effe',
                    S: '0x4c07f8ffefc0986625ba40ec1de75928dc49bd0504d988159c3501a81c69985f',
                    V: '0x7f5',
                },
            ],
            status: 'Submitted',
            transactionHash: '0xff996a6010bffb1e4af779ab8aebb21a4a635b54357e53c0c99dc936128516e9',
            value: '0x0',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            value: '0x0',
            input:
                '0x60806040526000805534801561001457600080fd5b50610116806100246000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a7230582064856de85a2706463526593b08dd790054536042ef66d3204018e6790a2208d10029',
            nonce: 0,
            gas: 1000000,
            submit: true,
        }

        function setCallFakeForCallApi(callApiStub, tx) {
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
                    expect(path).to.equal(`/v2/tx/contract/deploy`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    Object.keys(tx).map(key => {
                        expect(postBody[key]).to.equal(tx[key])
                    })
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-050: should request smart contract deploy transaction to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'contractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestSmartContractDeploy(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-051: should request smart contract deploy transaction to KAS (with ContractDeployTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = ContractDeployTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'contractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestSmartContractDeploy(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-052: should request smart contract deploy transaction to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'contractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestSmartContractDeploy(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-053: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'contractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestSmartContractDeploy(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-054: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestSmartContractDeploy(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestSmartContractExecution', () => {
        const resultOfApi = {
            from: '0x0736e6993bd0034cbe626f0a74503bf554ec29a8',
            gas: 500000,
            gasPrice: '0x5d21dba00',
            nonce: 1,
            rlp:
                '0x30f90145018505d21dba008307a1209484766c765da926416dec431b7404c4c6cc8aa49780940736e6993bd0034cbe626f0a74503bf554ec29a8b8c4e942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000f847f8458207f5a07075293febd759ccae1c9495142c31f67207a67d41137b32c65c2aba8eb06e65a01a90b3ea206afa91a18bd74fc21de3fc1a3b7cf56c43d6c74d2a20fd348b172a',
            typeInt: 48,
            input:
                '0xe942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000',
            signatures: [
                {
                    R: '0x7075293febd759ccae1c9495142c31f67207a67d41137b32c65c2aba8eb06e65',
                    S: '0x1a90b3ea206afa91a18bd74fc21de3fc1a3b7cf56c43d6c74d2a20fd348b172a',
                    V: '0x7f5',
                },
            ],
            status: 'Submitted',
            transactionHash: '0x9bce0b4f07c17607e35c6f4a58d48979fdaaee87c25b473ad79cf4b0248d824a',
            value: '0x0',
            to: '0x84766c765da926416dec431b7404c4c6cc8aa497',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            value: '0x0',
            to: '0x71ca8095264fdf58f1a2007e0f91140d67292736',
            input: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005',
            nonce: 0,
            gas: 1000000,
            submit: true,
        }

        function setCallFakeForCallApi(callApiStub, tx) {
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
                    expect(path).to.equal(`/v2/tx/contract/execute`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    Object.keys(tx).map(key => {
                        expect(postBody[key]).to.equal(tx[key])
                    })
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-055: should request smart contract execution transaction to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'contractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestSmartContractExecution(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-056: should request smart contract execution transaction to KAS (with ContractExecutionTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = ContractExecutionTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'contractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestSmartContractExecution(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-057: should request smart contract deploy transaction to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'contractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestSmartContractExecution(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-058: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'contractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestSmartContractExecution(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-059: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestSmartContractExecution(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestCancel', () => {
        const resultOfApi = {
            from: '0xf3103a29d34e254d6133fb7462babae41644a2de',
            gas: 25000,
            gasPrice: '0x5d21dba00',
            nonce: 2,
            rlp:
                '0x38f868028505d21dba008261a894f3103a29d34e254d6133fb7462babae41644a2def847f8458207f6a0cf9c2fd2fda1e4f25ce143876fc8279a34c64d859a026bd0ef2935f1fb040caaa00ce0ef4e877bc61a2d32f5c87f4e2885e096921dce3e72983f77650825444b22',
            typeInt: 56,
            signatures: [
                {
                    R: '0xcf9c2fd2fda1e4f25ce143876fc8279a34c64d859a026bd0ef2935f1fb040caa',
                    S: '0xce0ef4e877bc61a2d32f5c87f4e2885e096921dce3e72983f77650825444b22',
                    V: '0x7f6',
                },
            ],
            status: 'Submitted',
            transactionHash: '0xde5d82aa3c23ba63db820ef999363f7aec4e75d42ba746379fc2ac1bb2fec0f0',
        }

        const txObj = {
            from: '0x72A328cEB689962B66d3af17BD50a6003f42ca01',
            nonce: 0,
            gas: 30000,
            submit: false,
        }

        function setCallFakeForCallApi(callApiStub, tx) {
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
                    expect(path).to.equal(`/v2/tx`)
                    expect(mtd).to.equal(`DELETE`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    Object.keys(tx).map(key => {
                        expect(postBody[key]).to.equal(tx[key])
                    })
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-060: should request cancel transaction to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'cancelTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestCancel(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-061: should request cancel transaction to KAS (with txHash)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            delete requestObject.nonce
            requestObject.transactionHash = '0x02e13becf638cac359381fa5dfc3ef8f598a90cceb9842eb714019bcd883fd59'

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'cancelTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestObject)

            const ret = await caver.kas.wallet.requestCancel(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-062: should request cancel transaction to KAS (with CancelTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = CancelTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'cancelTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestCancel(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-063: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'cancelTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestCancel(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-064: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestCancel(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestChainDataAnchoring', () => {
        const resultOfApi = {
            from: '0xc183ec8d95dcc96b1ace474d9821b67dde481475',
            gas: 100000,
            gasPrice: '0x5d21dba00',
            nonce: 2,
            rlp:
                '0x48f96c.8028505d21dba00830186a094c183ec8d95dcc96b1ace474d9821b67dde48147581.8123f847f8458207f5a0c12d7a2a3bfcc469a39526fd1916710e8a0e509b276de955cdac9490913b8dc4a007a640ef61fe6ed0002690ccb5f8225f2430e83d0c4027e8e406e09663ad2245',
            typeInt: 72,
            input: '0x123',
            signatures: [
                {
                    R: '0xc12d7a2a3bfcc469a39526fd1916710e8a0e509b276de955cdac9490913b8dc4',
                    S: '0x7a640ef61fe6ed0002690ccb5f8225f2430e83d0c4027e8e406e09663ad2245',
                    V: '0x7f5',
                },
            ],
            status: 'Submitted',
            transactionHash: '0xc37e8fc962ea8ab4c586547ef6ae52364bc622f3257ec93e3ea0180b8459c823',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            input: '0x123',
            nonce: 0,
            gas: 1000000,
            submit: true,
        }

        function setCallFakeForCallApi(callApiStub, tx) {
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
                    expect(path).to.equal(`/v2/tx/anchor`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    Object.keys(tx).map(key => {
                        expect(postBody[key]).to.equal(tx[key])
                    })
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-065: should request chain data anchoring transaction to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'anchorTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestChainDataAnchoring(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-066: should request chain data anchoring transaction to KAS (with AnchorTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = AnchorTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'anchorTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestChainDataAnchoring(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-067: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'anchorTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestChainDataAnchoring(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-068: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestChainDataAnchoring(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestRawTransaction', () => {
        const resultOfApi = {
            from: '0x418dad870aaaad954f245b3d0c4c13ff6a6dc201',
            gas: 25000,
            gasPrice: '0x5d21dba00',
            nonce: 1,
            rlp:
                '0x08f87e018505d21dba008261a89476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194418dad870aaaad954f245b3d0c4c13ff6a6dc201f847f8458207f6a0137491673d0014cca219705291f3ee7350295ef549069e639b5e9d0d8014ffd2a03289ed52548303f7f2f5fbb85e88ba7f373026178d30105f9738c71ae07b4a5a',
            typeInt: 8,
            signatures: [
                {
                    R: '0x137491673d0014cca219705291f3ee7350295ef549069e639b5e9d0d8014ffd2',
                    S: '0x3289ed52548303f7f2f5fbb85e88ba7f373026178d30105f9738c71ae07b4a5a',
                    V: '0x7f6',
                },
            ],
            status: 'Submitted',
            transactionHash: '0xc16b3c03af303224d85326894eaf59c46c11f64cd5bb991ee6e03cfbb328acb8',
            value: '0x1',
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
        }

        const txObj = {
            rlp:
                '0x28f901aa808505d21dba00830f42408080941912815891d07a9874536f6d2446ec8580642058b9013a60806040526000805534801561001457600080fd5b50610116806100246000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a7230582064856de85a2706463526593b08dd790054536042ef66d3204018e6790a2208d100298080f847f8458207f6a0509de4e189a13f1e024b0fa00da6f7c519710f3f14b2d28ef91aa2904e5d619fa07dae5868cb6d037e0849ef2d28985549619d16b01a40d8412cad65c0711f1e75',
            submit: true,
        }

        function setCallFakeForCallApi(callApiStub, tx) {
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
                    expect(path).to.equal(`/v2/tx/rlp`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    Object.keys(tx).map(key => {
                        expect(postBody[key]).to.equal(tx[key])
                    })
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-069: should request transaction to KAS via RLP-encoded string (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'processRLP')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestRawTransaction(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-070: should request transaction to KAS (with ProcessRLPRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = ProcessRLPRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'processRLP')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestRawTransaction(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-071: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'processRLP')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestRawTransaction(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-072: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestRawTransaction(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestAccountUpdate', () => {
        const resultOfApi = {
            from: '0x4077c9f583bc96470cab9873dac8c7222b3a824c',
            gas: 1000000,
            gasPrice: '0x5d21dba00',
            nonce: 0,
            rlp:
                '0x20f86c808505d21dba00830f4240944077c9f583bc96470cab9873dac8c7222b3a824c8201c0f847f8458207f6a00bc4ba2047bde2d4ed9e0b27b09122bfe773810302f77f5fc1f084e28cfc41caa0313cb1ac6f67474e9754497e16ed68ae38fa42e50053b09d11ecf14c74f04fda',
            typeInt: 32,
            signatures: [
                {
                    R: '0xbc4ba2047bde2d4ed9e0b27b09122bfe773810302f77f5fc1f084e28cfc41ca',
                    S: '0x313cb1ac6f67474e9754497e16ed68ae38fa42e50053b09d11ecf14c74f04fda',
                    V: '0x7f6',
                },
            ],
            status: 'Submitted',
            transactionHash: '0x8e67ca54c29083aec32a3c5fd2b25aa1be351aa75f504f8b6b19560845c0d764',
            accountKey: '0x01c0',
        }

        const accountKeys = [
            {
                keyType: 1,
            },
            {
                keyType: 2,
                key:
                    '0xbaa7dd7bc5e7572130e9d94f4d0a99a813598cc637cb3d218815f50f8bf10d5edafd4fd4ff26d497fc591c539939aded3a142ed7b3da9b2d8b53c05c69f9b5c0',
            },
            {
                keyType: 3,
            },
            {
                keyType: 4,
                key: {
                    threshold: 3,
                    weightedKeys: [
                        {
                            weight: 1,
                            publicKey:
                                '0xbaa7dd7bc5e7572130e9d94f4d0a99a813598cc637cb3d218815f50f8bf10d5edafd4fd4ff26d497fc591c539939aded3a142ed7b3da9b2d8b53c05c69f9b5c0',
                        },
                        {
                            weight: 1,
                            publicKey:
                                '0xcd78cb05fe43fb04e8478dc29de8aa48e67afb0148eff0480fba41e7e85a0abd8cca47d72914467ff46154fa0d033be120d0db6f29008a6a067e29243678169e',
                        },
                        {
                            weight: 1,
                            publicKey:
                                '0xdec12f482669670c092bf83464ebc74c49e65bc66b2861a48d0c63e077c6b8258bc9a02f7a80a0e08763dab9436eb4452de06c1d7a7036cfad931254bf90bf12',
                        },
                        {
                            weight: 1,
                            publicKey:
                                '0x8636163d74ea6fc3a98ffafe375094f2a685e05591725522fd3e4beecfc5b63cd6396f5c296261b2d84dd4ea127578b18f9c1e2e20712d857db712df3c4d2c85',
                        },
                    ],
                },
            },
            {
                keyType: 5,
                key: [
                    {
                        keyType: 3,
                        key: {},
                    },
                    {
                        keyType: 4,
                        key: {
                            threshold: 2,
                            weightedKeys: [
                                {
                                    weight: 1,
                                    publicKey:
                                        '0xbaa7dd7bc5e7572130e9d94f4d0a99a813598cc637cb3d218815f50f8bf10d5edafd4fd4ff26d497fc591c539939aded3a142ed7b3da9b2d8b53c05c69f9b5c0',
                                },
                                {
                                    weight: 1,
                                    publicKey:
                                        '0x9e83f5e91348568c3ba98358dd481788eb1acb72fb141191fb9ddf87ec4e781cef0e5fbeda3961c88e26aae222439820fe239ca16162a279b1968c5f65ccf56a',
                                },
                            ],
                        },
                    },
                    {
                        keyType: 2,
                        key:
                            '0xa4006ba163794a75f08c47171be134507aea62c27b8dc0f70003e14f276d5529288e7cb1cba4045f38fb9a105968c7cf9afd3987989ea0d8be761fe3e7720ad2',
                    },
                ],
            },
        ]

        const baseObj = {
            from: '0x21A597c43aBFf23A0db33AE4d60C2151160947e1',
            nonce: 0,
            gas: 1000000,
            submit: true,
        }

        const txObjects = [
            Object.assign({ accountKey: accountKeys[0] }, baseObj),
            Object.assign({ accountKey: accountKeys[1] }, baseObj),
            Object.assign({ accountKey: accountKeys[2] }, baseObj),
            Object.assign({ accountKey: accountKeys[3] }, baseObj),
            Object.assign({ accountKey: accountKeys[4] }, baseObj),
        ]

        function compareAccountKeyObject(obj, obj2) {
            if (!_.isObject(obj)) {
                expect(obj2).to.deep.equal(obj)
            } else {
                Object.keys(obj).map(k => {
                    if (_.isArray(obj[k])) {
                        expect(obj[k].length).to.equal(obj2[k].length)
                        for (let i = 0; i < obj[k].length; i++) {
                            compareAccountKeyObject(obj[k][i], obj2[k][i])
                        }
                    } else if (_.isObject(obj[k])) {
                        compareAccountKeyObject(obj[k], obj2[k])
                    } else {
                        expect(obj2[k]).to.deep.equal(obj[k])
                    }
                })
            }
        }

        function setCallFakeForCallApi(callApiStub, tx) {
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
                    expect(path).to.equal(`/v2/tx/account`)
                    expect(mtd).to.equal(`PUT`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    Object.keys(tx).map(key => {
                        if (key === 'accountKey') {
                            compareAccountKeyObject(tx[key], postBody[key])
                        } else {
                            expect(postBody[key]).to.equal(tx[key])
                        }
                    })
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined

                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-073: should request account update transaction to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'accountUpdateTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')

            for (const obj of txObjects) {
                setCallFakeForCallApi(callApiStub, obj)

                const ret = await caver.kas.wallet.requestAccountUpdate(obj)

                expect(ret).not.to.be.undefined
            }

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(apiFunctionSpy.callCount).to.equal(txObjects.length)
            expect(callApiStub.callCount).to.equal(txObjects.length)
        })

        it('CAVERJS-EXT-KAS-WALLET-074: should request account update transaction to KAS (with AccountUpdateTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'accountUpdateTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')

            for (const obj of txObjects) {
                const requestModel = AccountUpdateTransactionRequest.constructFromObject(obj)
                setCallFakeForCallApi(callApiStub, requestModel)

                const ret = await caver.kas.wallet.requestAccountUpdate(requestModel)

                expect(ret).not.to.be.undefined
            }

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(apiFunctionSpy.callCount).to.equal(txObjects.length)
            expect(callApiStub.callCount).to.equal(txObjects.length)
        })

        it('CAVERJS-EXT-KAS-WALLET-075: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'accountUpdateTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObjects[0])

            let isCalled = false

            const ret = await caver.kas.wallet.requestAccountUpdate(txObjects[0], () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-076: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestAccountUpdate(txObjects[0])

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.getTransaction', () => {
        const resultOfApi = {
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            blockNumber: '0x0',
            from: '0xc2d66132f5236debdbaad2aa003f81f76fb8cc32',
            gas: '0x61a8',
            gasPrice: '0x5d21dba00',
            hash: '0x76ab009f467b61332c2442e3a83a26f384797a78df0efd25e325990dfa3bcaea',
            input: '0x',
            nonce: '0x0',
            senderTxHash: '0x76ab009f467b61332c2442e3a83a26f384797a78df0efd25e325990dfa3bcaea',
            signatures: [
                {
                    R: '0xb1b2ab66f408856f8e816b94043b35b8e17538a8a96c19b6a848837e03971f6d',
                    S: '0x4edcc3a24e6addd2b0ab6c9fce0cf7edec6747d08f44b6942d5078c434cf16f',
                    V: '0x7f5',
                },
            ],
            status: 'Submitted',
            transactionIndex: '0x0',
            type: 'TxTypeLegacyTransaction',
            typeInt: 0,
            value: '0x1',
        }
        const transactionHash = '0x76ab009f467b61332c2442e3a83a26f384797a78df0efd25e325990dfa3bcaea'

        function setCallFakeForCallApi(callApiStub) {
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
                    expect(path).to.equal(`/v2/tx/{transaction-hash}`)
                    expect(mtd).to.equal(`GET`)
                    expect(pathParams['transaction-hash']).to.equal(transactionHash)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(Object.keys(collectionQueryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('auth')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined
                    callback(null, resultOfApi, { body: resultOfApi })
                }
            )
        }

        it('CAVERJS-EXT-KAS-WALLET-077: should return transaction from KAS', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'transactionReceipt')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.wallet.getTransaction(transactionHash)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret.code).to.equal(resultOfApi.code)
            expect(ret.result).to.deep.equal(resultOfApi.result)
        })

        it('CAVERJS-EXT-KAS-WALLET-078: should call callback function with transaction', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.basicTransactionApi, 'transactionReceipt')
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            let isCalled = false
            const ret = await caver.kas.wallet.getTransaction(transactionHash, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret.code).to.equal(resultOfApi.code)
            expect(ret.result).to.deep.equal(resultOfApi.result)
        })

        it('CAVERJS-EXT-KAS-WALLET-079: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1071010, message: "data don't exist" }
            const callApiStub = sandbox.stub(caver.kas.wallet.basicTransactionApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.getTransaction(transactionHash)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })
})
