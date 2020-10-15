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
    FDValueTransferTransactionRequest,
    FDContractDeployTransactionRequest,
    FDContractExecutionTransactionRequest,
    FDCancelTransactionRequest,
    FDAnchorTransactionRequest,
    FDProcessRLPRequest,
    FDAccountUpdateTransactionRequest,
} = require('../../src/rest-client/src')

let caver
const { url, chainId, accessKeyId, secretAccessKey } = require('../testEnv').auths.walletAPI

const sandbox = sinon.createSandbox()

describe('Wallet API - FD transaction API paid by User', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.kas.wallet.requestFDValueTransferPaidByUser', () => {
        const resultOfApi = {
            rlp:
                '0x09f8dc808505d21dba0082c3509476c6b1f34562ed7a843786e1d7f57d0d7948a6f1019474903dd6af3fd2464279a3a28ae7beb7ddd418a3f847f8458207f6a06c0202a55c59fe739e03e75c3866057b0bd8d3da7e475111bece5ba6e7fe8107a04204a584d29a0d0bba221556a93c9a80d2982e1f94d12fe634d934eaa675ac289444ee3906a7a2007762e9d706df6e4ef63fa1eda8f847f8458207f5a022e946590675c0fe7fe7acd061c0c67ebd7bef6a2ac9c0db7e08a0b7a1f7a218a03d5b16143a5e93474b2d11e865cd49142f279ead23182f1225e491b26352690b',
            feePayer: '0x44ee3906a7a2007762e9d706df6e4ef63fa1eda8',
            from: '0x74903dd6af3fd2464279a3a28ae7beb7ddd418a3',
            gas: 50000,
            gasPrice: '0x5d21dba00',
            nonce: 0,
            status: 'Submitted',
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            typeInt: 9,
            value: '0x1',
            signatures: [
                {
                    R: '0x6c0202a55c59fe739e03e75c3866057b0bd8d3da7e475111bece5ba6e7fe8107',
                    S: '0x4204a584d29a0d0bba221556a93c9a80d2982e1f94d12fe634d934eaa675ac28',
                    V: '0x7f6',
                },
            ],
            transactionHash: '0x9ffe9b4dda5bc5209fbddefead202b9b81f0a0112342bbe25ff18f95940b8ad1',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            value: '0x12',
            to: '0x2F87Ba64de5526F7880F21481Effbf950f70005c',
            memo: 'memo',
            nonce: 0,
            gas: 1000000,
            submit: true,
            feePayer: '0x85B98485444c89880cD9C48807CEF727C296F2da',
            feeRatio: 0,
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
                    expect(path).to.equal(`/v2/tx/fd-user/value`)
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

        it('CAVERJS-EXT-KAS-WALLET-113: should request fd value transfer transaction paid by User to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-114: should request fd value transfer memo transaction paid by User to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const withMemo = Object.assign({ memo: 'memo' }, txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, withMemo)

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(withMemo)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-115: should request fd value transfer transaction paid by User to KAS (with FDValueTransferTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDValueTransferTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-116: should request fd value transfer transaction paid by User to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-117: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-118: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByUser(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDSmartContractDeployPaidByUser', () => {
        const resultOfApi = {
            rlp:
                '0x29f9060d018505d21dba00832dc6c080809474903dd6af3fd2464279a3a28ae7beb7ddd418a3b9053f608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e149900298080f847f8458207f5a076825035876daf9dd591061586841019e94711074730e4481324082bf6093141a05fe8fe1c5241a84c8c475ce089d8ca0661a9149c033f461126e65a54776c341f9444ee3906a7a2007762e9d706df6e4ef63fa1eda8f847f8458207f6a0b5dd022ad74174eadea91dbeff74fcfd806a324df358a1ca78ef05304b2f294ba02e3c68b3f6e9ddd99d5c0a1739d4c283df65b5bcc2874e6248bbcf07d66fab7a',
            feePayer: '0x44ee3906a7a2007762e9d706df6e4ef63fa1eda8',
            from: '0x74903dd6af3fd2464279a3a28ae7beb7ddd418a3',
            gas: 3000000,
            gasPrice: '0x5d21dba00',
            input:
                '0x608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029',
            nonce: 1,
            status: 'Submitted',
            typeInt: 41,
            value: '0x0',
            signatures: [
                {
                    R: '0x76825035876daf9dd591061586841019e94711074730e4481324082bf6093141',
                    S: '0x5fe8fe1c5241a84c8c475ce089d8ca0661a9149c033f461126e65a54776c341f',
                    V: '0x7f5',
                },
            ],
            transactionHash: '0xb16d3923dcb1e92cc964e019cab1e2e06d8c0c6d0ee59d41960858602370e753',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            value: '0x0',
            input:
                '0x60806040526000805534801561001457600080fd5b50610116806100246000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a7230582064856de85a2706463526593b08dd790054536042ef66d3204018e6790a2208d10029',
            nonce: 0,
            gas: 1000000,
            submit: true,
            feePayer: '0x85B98485444c89880cD9C48807CEF727C296F2da',
            feeRatio: 0,
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
                    expect(path).to.equal(`/v2/tx/fd-user/contract/deploy`)
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

        it('CAVERJS-EXT-KAS-WALLET-119: should request fd smart contract deploy transaction paid by User to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDContractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByUser(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-120: should request fd smart contract deploy transaction paid by User to KAS (with FDContractDeployTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDContractDeployTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDContractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByUser(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-121: should request fd smart contract deploy transaction paid by User to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDContractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByUser(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-122: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDContractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByUser(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-123: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByUser(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDSmartContractExecutionPaidByUser', () => {
        const resultOfApi = {
            rlp:
                '0x31f901a3028505d21dba008307a12094943a89841c335b8366b31ae35e7e38a85ad1d2b7809474903dd6af3fd2464279a3a28ae7beb7ddd418a3b8c4e942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000f847f8458207f6a098f3076b6b8f89d222c02f8744639c4d42993cf821b1319b1e1756eccefbc235a073b4514c152a08666f6d2baa90e175a54a09ce1f4c90b1daa3d22ed4f29684539444ee3906a7a2007762e9d706df6e4ef63fa1eda8f847f8458207f6a0ed847d62218757ac32158cd6b5c190224421a7bec90377045c6bd57209af53ada0778c8d4b1ef0d38f5b6b68269067dac64fe9f59073bee7e41f20078e975cc72c',
            feePayer: '0x44ee3906a7a2007762e9d706df6e4ef63fa1eda8',
            from: '0x74903dd6af3fd2464279a3a28ae7beb7ddd418a3',
            gas: 500000,
            gasPrice: '0x5d21dba00',
            input:
                '0xe942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000',
            nonce: 2,
            status: 'Submitted',
            to: '0x943a89841c335b8366b31ae35e7e38a85ad1d2b7',
            typeInt: 49,
            value: '0x0',
            signatures: [
                {
                    R: '0x98f3076b6b8f89d222c02f8744639c4d42993cf821b1319b1e1756eccefbc235',
                    S: '0x73b4514c152a08666f6d2baa90e175a54a09ce1f4c90b1daa3d22ed4f2968453',
                    V: '0x7f6',
                },
            ],
            transactionHash: '0xbdb67a11bb7dbf3cb64a600738628d919bc3c60ad15b773d28c43602be446809',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            value: '0x0',
            to: '0x71ca8095264fdf58f1a2007e0f91140d67292736',
            input: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005',
            nonce: 0,
            gas: 1000000,
            submit: true,
            feePayer: '0x85B98485444c89880cD9C48807CEF727C296F2da',
            feeRatio: 0,
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
                    expect(path).to.equal(`/v2/tx/fd-user/contract/execute`)
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

        it('CAVERJS-EXT-KAS-WALLET-124: should request fd smart contract execution transaction paid by User to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDContractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-125: should request fd smart contract execution transaction paid by User to KAS (with FDContractExecutionTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDContractExecutionTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDContractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-126: should request fd smart contract deploy transaction paid by User to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDContractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-127: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDContractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-128: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDCancelPaidByUser', () => {
        const resultOfApi = {
            rlp:
                '0x39f8c6018505d21dba0082afc894758473e68179c446437b74ca8a74b58706792806f847f8458207f5a0fbe119a60264b8923fd43aa14b4494076d61beb85453ac3fb29d4f70907382fda013762a1886909c3493ab189795219888f2770ad2c98a0fe5787a2f1db403f9969444ee3906a7a2007762e9d706df6e4ef63fa1eda8f847f8458207f5a04900c8437fa5396fcfe5084b582d49efd3d6a3c0c98f8e3374a4f412eadc0e89a070232cb09d7d89879c8e13b8a331d6e5038ae4ae71f2a54e601e4b90eb41e227',
            feePayer: '0x44ee3906a7a2007762e9d706df6e4ef63fa1eda8',
            from: '0x758473e68179c446437b74ca8a74b58706792806',
            gas: 45000,
            gasPrice: '0x5d21dba00',
            nonce: 1,
            status: 'Submitted',
            typeInt: 57,
            signatures: [
                {
                    R: '0xfbe119a60264b8923fd43aa14b4494076d61beb85453ac3fb29d4f70907382fd',
                    S: '0x13762a1886909c3493ab189795219888f2770ad2c98a0fe5787a2f1db403f996',
                    V: '0x7f5',
                },
            ],
            transactionHash: '0xa989074eecb3dbb1979003dcfbf16c94315f4e515d7b9e6c0ea47dc9983f2ab7',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            nonce: 0,
            gas: 1000000,
            submit: true,
            feePayer: '0x85B98485444c89880cD9C48807CEF727C296F2da',
            feeRatio: 0,
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
                    expect(path).to.equal(`/v2/tx/fd-user`)
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

        it('CAVERJS-EXT-KAS-WALLET-129: should request fd cancel transaction paid by User to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDUserCancelTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDCancelPaidByUser(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-130: should request fd cancel transaction paid by User to KAS (with txHash)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            delete requestObject.nonce
            requestObject.transactionHash = '0x02e13becf638cac359381fa5dfc3ef8f598a90cceb9842eb714019bcd883fd59'

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDUserCancelTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestObject)

            const ret = await caver.kas.wallet.requestFDCancelPaidByUser(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-131: should request fd cancel transaction paid by User to KAS (with FDCancelTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDCancelTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDUserCancelTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDCancelPaidByUser(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-132: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDUserCancelTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDCancelPaidByUser(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-133: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDCancelPaidByUser(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDChainDataAnchoringPaidByUser', () => {
        const resultOfApi = {
            rlp:
                '0x49f8ca028505d21dba00830186a094758473e68179c446437b74ca8a74b58706792806820123f847f8458207f6a05f08dc67c125f2493bcfdc188da11e7227036b516c750955dc4b05726fa390aba009c36e9084d1eb006136240875a0f22b1681b9e067bf3f4df3cb6455a5315fbe9444ee3906a7a2007762e9d706df6e4ef63fa1eda8f847f8458207f6a0bb8182702d37adf09b04b1c3ff5046218109314fe4ef90ca9850d1d7c3b1ee85a00e3b324e5561030799559864a973ad379103ebf1976db891e4fbc6c52f5f90ab',
            feePayer: '0x44ee3906a7a2007762e9d706df6e4ef63fa1eda8',
            from: '0x758473e68179c446437b74ca8a74b58706792806',
            gas: 100000,
            gasPrice: '0x5d21dba00',
            input: '0x0123',
            nonce: 2,
            status: 'Submitted',
            typeInt: 73,
            signatures: [
                {
                    R: '0x5f08dc67c125f2493bcfdc188da11e7227036b516c750955dc4b05726fa390ab',
                    S: '0x9c36e9084d1eb006136240875a0f22b1681b9e067bf3f4df3cb6455a5315fbe',
                    V: '0x7f6',
                },
            ],
            transactionHash: '0x88b3b17d18893547a710a070a0277643aa14cf6d3b8a8c82328c45a86e59c4ae',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            input: '0x123',
            nonce: 0,
            gas: 1000000,
            submit: true,
            feePayer: '0x85B98485444c89880cD9C48807CEF727C296F2da',
            feeRatio: 0,
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
                    expect(path).to.equal(`/v2/tx/fd-user/anchor`)
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

        it('CAVERJS-EXT-KAS-WALLET-134: should request fd chain data anchoring transaction paid by User to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDAnchorTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByUser(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-135: should request fd chain data anchoring transaction paid by User to KAS (with FDAnchorTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDAnchorTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDAnchorTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByUser(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-136: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDAnchorTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByUser(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-137: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByUser(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDRawTransactionPaidByUser', () => {
        const resultOfApi = {
            rlp:
                '0x09f8dc038505d21dba0082c3509476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194758473e68179c446437b74ca8a74b58706792806f847f8458207f6a0ef617aa7de05d4e807bbc5b9c67ecf05ef067ca6a01aeff6cc81b1f4548216c5a023510f58c1dd82c583cd47302aac1d077c97926ba9bcaa9ca4ad0bc809cf08909444ee3906a7a2007762e9d706df6e4ef63fa1eda8f847f8458207f6a0637426d1221cf48837634c86fb31c96dc2c5f2f847cbdd8cff959308f2331cf0a02299f5f184fa1b9ba545ba6fa90474695b6e4860255f8c3837ec31495f0e0f39',
            feePayer: '0x44ee3906a7a2007762e9d706df6e4ef63fa1eda8',
            from: '0x758473e68179c446437b74ca8a74b58706792806',
            gas: 50000,
            gasPrice: '0x5d21dba00',
            nonce: 3,
            status: 'Submitted',
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            typeInt: 9,
            value: '0x1',
            signatures: [
                {
                    R: '0xef617aa7de05d4e807bbc5b9c67ecf05ef067ca6a01aeff6cc81b1f4548216c5',
                    S: '0x23510f58c1dd82c583cd47302aac1d077c97926ba9bcaa9ca4ad0bc809cf0890',
                    V: '0x7f6',
                },
            ],
            transactionHash: '0x2a7c62262e4ff747afe429992f4f4dd48dc085ccc93c4993c8dd798593fa2d57',
        }

        const txObj = {
            rlp:
                '0x2af90209038505d21dba00830f4240808094040f2bc5a8e96c0ac776296f21c5f35a5ba0fa5bb9013a60806040526000805534801561001457600080fd5b50610116806100246000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a7230582064856de85a2706463526593b08dd790054536042ef66d3204018e6790a2208d10029801e80f847f8458207f5a0b9e9d0ea57888216800d1ddd877a24b8897c1f9e7d052d2609b5612c4914dc7fa02e57cd70fa324c9e3c33096b496de683b0fc683842544008650c18a753f3057794368851f346bee4fd1bbf37fa96f55dfc2dc9a7fef847f8458207f5a065907fd756e28ef88db3dd4acd4f4105990507be579aeaf0b460629ddbdcc187a0402e2ba314c8293982e2b8a479b07974707299854a352bd53b56fe520aeb7da3',
            feePayer: '0x85B98485444c89880cD9C48807CEF727C296F2da',
            feeRatio: 0,
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
                    expect(path).to.equal(`/v2/tx/fd-user/rlp`)
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

        it('CAVERJS-EXT-KAS-WALLET-138: should request fd transaction paid by User to KAS via RLP-encoded string (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDProcessRLP')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDRawTransactionPaidByUser(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-139: should request fd transaction paid by User to KAS (with FDProcessRLPRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDProcessRLPRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDProcessRLP')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDRawTransactionPaidByUser(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-140: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDProcessRLP')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDRawTransactionPaidByUser(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-141: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDRawTransactionPaidByUser(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDAccountUpdatePaidByUser', () => {
        const resultOfApi = {
            rlp:
                '0x21f8ca808505d21dba00830f424094ff20ad046e57c74e6a4cb050e9adfca7b679b40b8201c0f847f8458207f5a068bea045076775ecf832ba7ea5065b3e58a7dbae7147f8bb1bf64084e61bf6aea060639e9b5297680d6db8222a824a7dfd9cc8e6764bc06dd161d6ad4d7bdf44ce9444ee3906a7a2007762e9d706df6e4ef63fa1eda8f847f8458207f5a0cfc30adfbe77f0003a74ca2ccfcb61071370fbcbb2c4dd9a75600c2ccd4085bba00cf752e35ea3937968b9a6539de62c3ae3810e444c51f7fffe3c38a766d29e5e',
            feePayer: '0x44ee3906a7a2007762e9d706df6e4ef63fa1eda8',
            from: '0xff20ad046e57c74e6a4cb050e9adfca7b679b40b',
            gas: 1000000,
            gasPrice: '0x5d21dba00',
            nonce: 0,
            status: 'Submitted',
            typeInt: 33,
            signatures: [
                {
                    R: '0x68bea045076775ecf832ba7ea5065b3e58a7dbae7147f8bb1bf64084e61bf6ae',
                    S: '0x60639e9b5297680d6db8222a824a7dfd9cc8e6764bc06dd161d6ad4d7bdf44ce',
                    V: '0x7f5',
                },
            ],
            transactionHash: '0xa5bd3c93221469817b8ab9da16fe8cf832115bc15fb1e5b0ea71fb56aa060ebf',
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
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            nonce: 0,
            gas: 1000000,
            submit: true,
            feePayer: '0x85B98485444c89880cD9C48807CEF727C296F2da',
            feeRatio: 0,
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
                    expect(path).to.equal(`/v2/tx/fd-user/account`)
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

        it('CAVERJS-EXT-KAS-WALLET-142: should request fd account update transaction paid by User to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDAccountUpdateTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')

            for (const obj of txObjects) {
                setCallFakeForCallApi(callApiStub, obj)

                const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByUser(obj)

                expect(ret).not.to.be.undefined
            }

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(apiFunctionSpy.callCount).to.equal(txObjects.length)
            expect(callApiStub.callCount).to.equal(txObjects.length)
        })

        it('CAVERJS-EXT-KAS-WALLET-143: should request fd account update transaction paid by User to KAS (with FDAccountUpdateTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDAccountUpdateTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')

            for (const obj of txObjects) {
                const requestModel = FDAccountUpdateTransactionRequest.constructFromObject(obj)
                setCallFakeForCallApi(callApiStub, requestModel)

                const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByUser(requestModel)

                expect(ret).not.to.be.undefined
            }

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(apiFunctionSpy.callCount).to.equal(txObjects.length)
            expect(callApiStub.callCount).to.equal(txObjects.length)
        })

        it('CAVERJS-EXT-KAS-WALLET-144: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByUserApi, 'uFDAccountUpdateTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObjects[0])

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByUser(txObjects[0], () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-145: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByUserApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByUser(txObjects[0])

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })
})
