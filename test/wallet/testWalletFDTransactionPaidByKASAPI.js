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

describe('Wallet API - FD transaction API paid by KAS', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer', () => {
        const resultOfApi = {
            rlp:
                '0x09f8dc808505d21dba0082c3509476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194ac3bd4b108f56ffcec6339fda14f649be01819c8f847f8458207f5a07b253fdb79561ba2d24ee39a0ba0a6edf0a2df60ebeae6713015288a0c0cfb20a0150c054bb93919b4fb3bed927b5dfb7162a54c29a6da52c9ad60ce6e2b62ef25941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f6a03be553ff9d261860fbb0c4b2c2d6ad7dd8093a35ff4ee7ba7cccd9f88841e289a0559530699189bccbf9684af9e66e7609aa6a09253f98f1bfe626856f089a9414',
            feePayer: '0x1b71a63903e35371e2fc41c6012effb99b9a2c0f',
            from: '0xac3bd4b108f56ffcec6339fda14f649be01819c8',
            gas: 50000,
            gasPrice: '0x5d21dba00',
            nonce: 0,
            status: 'Submitted',
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            typeInt: 9,
            value: '0x1',
            signatures: [
                {
                    R: '0x7b253fdb79561ba2d24ee39a0ba0a6edf0a2df60ebeae6713015288a0c0cfb20',
                    S: '0x150c054bb93919b4fb3bed927b5dfb7162a54c29a6da52c9ad60ce6e2b62ef25',
                    V: '0x7f5',
                },
            ],
            transactionHash: '0xf09b03035d5af3f25ce1d3fc3bf94fe18a6dcf8fc06e776af1d8e6f17d78e445',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            value: '0x12',
            to: '0x2F87Ba64de5526F7880F21481Effbf950f70005c',
            memo: 'memo',
            nonce: 0,
            gas: 1000000,
            submit: true,
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
                    expect(path).to.equal(`/v2/tx/fd/value`)
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

        it('CAVERJS-EXT-KAS-WALLET-080: should request fd value transfer transaction Paid by KAS to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-081: should request fd value transfer memo transaction Paid by KAS to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const withMemo = Object.assign({ memo: 'memo' }, txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, withMemo)

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(withMemo)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-082: should request fd value transfer transaction Paid by KAS to KAS (with FDValueTransferTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDValueTransferTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-083: should request fd value transfer transaction Paid by KAS to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-084: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDValueTransferTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-085: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer', () => {
        const resultOfApi = {
            rlp:
                '0x29f9060d0b8505d21dba00832dc6c0808094c1e80b7ec60a677207a2d392d596e8be31fa06e8b9053f608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e149900298080f847f8458207f5a0f0d5fdf1ec0f48bebc47cb5b22b833ae2a6ae370df70792ef82aca901193ee9ba04d100ad4bb9cb36168495e65a0f9c9b3965afc8852c7be4f9a51183db29abc72941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f5a06531ebda9cf222caf4e15e971bada01d5e78291d602b413d91a390dc93bc423ea078146f8bba8f103a6365c0dc08516e1cc373386b575c152f535fa0521c0abf74',
            feePayer: '0x1b71a63903e35371e2fc41c6012effb99b9a2c0f',
            from: '0xc1e80b7ec60a677207a2d392d596e8be31fa06e8',
            gas: 3000000,
            gasPrice: '0x5d21dba00',
            input:
                '0x608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029',
            nonce: 11,
            status: 'Submitted',
            typeInt: 41,
            value: '0x0',
            signatures: [
                {
                    R: '0xf0d5fdf1ec0f48bebc47cb5b22b833ae2a6ae370df70792ef82aca901193ee9b',
                    S: '0x4d100ad4bb9cb36168495e65a0f9c9b3965afc8852c7be4f9a51183db29abc72',
                    V: '0x7f5',
                },
            ],
            transactionHash: '0xbdda5a9309fffb11c16591ad8291a3abfb0f34502ff3ab02f5069a5adef62ce4',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            value: '0x0',
            input:
                '0x60806040526000805534801561001457600080fd5b50610116806100246000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a7230582064856de85a2706463526593b08dd790054536042ef66d3204018e6790a2208d10029',
            nonce: 0,
            gas: 1000000,
            submit: true,
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
                    expect(path).to.equal(`/v2/tx/fd/contract/deploy`)
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

        it('CAVERJS-EXT-KAS-WALLET-086: should request fd smart contract deploy transaction Paid by KAS to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDContractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-087: should request fd smart contract deploy transaction Paid by KAS to KAS (with FDContractDeployTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDContractDeployTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDContractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-088: should request fd smart contract deploy transaction Paid by KAS to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDContractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-089: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDContractDeployTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-090: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer', () => {
        const resultOfApi = {
            rlp:
                '0x31f901a3018505d21dba008307a120942e2db13fea7b150ae7eafd9ad50aa08b21c69c058094841bf82bb4784335347a299f19e6f2c7577199abb8c4e942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000f847f8458207f6a0e551099a486a37a21baef19a495dba1fd393f1b179c38b3488e85d130a382eefa0037a72cf62dbe73e2a08f3b426bcb0c300078a40a97d271a21c94a5acc8a3ab3941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f6a0702303a85e26f93491798979f6107724681bc9e17c577b8f7e858fcfae1f0dbea0611eecea5d7c5ecf42f3c0f6e97a0ba40a55fe5022d6b26dd787b2a7984e57ff',
            feePayer: '0x1b71a63903e35371e2fc41c6012effb99b9a2c0f',
            from: '0x841bf82bb4784335347a299f19e6f2c7577199ab',
            gas: 500000,
            gasPrice: '0x5d21dba00',
            input:
                '0xe942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000',
            nonce: 1,
            status: 'Submitted',
            to: '0x2e2db13fea7b150ae7eafd9ad50aa08b21c69c05',
            typeInt: 49,
            value: '0x0',
            signatures: [
                {
                    R: '0xe551099a486a37a21baef19a495dba1fd393f1b179c38b3488e85d130a382eef',
                    S: '0x37a72cf62dbe73e2a08f3b426bcb0c300078a40a97d271a21c94a5acc8a3ab3',
                    V: '0x7f6',
                },
            ],
            transactionHash: '0xbfb934a678431f573746c1dd56b197f87c2e5dff3a07702815b0f603bede3916',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            value: '0x0',
            to: '0x71ca8095264fdf58f1a2007e0f91140d67292736',
            input: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005',
            nonce: 0,
            gas: 1000000,
            submit: true,
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
                    expect(path).to.equal(`/v2/tx/fd/contract/execute`)
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

        it('CAVERJS-EXT-KAS-WALLET-091: should request fd smart contract execution transaction paid by KAS to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDContractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-092: should request fd smart contract execution transaction paid by KAS to KAS (with FDContractExecutionTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDContractExecutionTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDContractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-093: should request fd smart contract deploy transaction paid by KAS to KAS (with number value)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            requestObject.value = Number(requestObject.value)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDContractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-094: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDContractExecutionTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-095: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer', () => {
        const resultOfApi = {
            rlp:
                '0x39f8c6018505d21dba0082afc894841bf82bb4784335347a299f19e6f2c7577199abf847f8458207f5a0105af7a8c01ce93e5230dce3ec63fa77160581107ad21afa3b5d0239b451b30ca00d6e9173398efd5db71274684ac90fb4b30dd3845e56ed6ce7204d3bb261a12a941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f6a023f6412c1b7734e991c213f02f62cdcf3f902f2b2c94ea08aeb7b538848730fca0619502665581ae82fbd63c0f6e4786d4ed730774c02f0237a30b9d4d55483439',
            feePayer: '0x1b71a63903e35371e2fc41c6012effb99b9a2c0f',
            from: '0x841bf82bb4784335347a299f19e6f2c7577199ab',
            gas: 45000,
            gasPrice: '0x5d21dba00',
            nonce: 1,
            status: 'Submitted',
            typeInt: 57,
            signatures: [
                {
                    R: '0x105af7a8c01ce93e5230dce3ec63fa77160581107ad21afa3b5d0239b451b30c',
                    S: '0xd6e9173398efd5db71274684ac90fb4b30dd3845e56ed6ce7204d3bb261a12a',
                    V: '0x7f5',
                },
            ],
            transactionHash: '0xd013a4a6b624a7fa06b4a017eb61f0e16e9943c1160429d5123632262c39b0f5',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            nonce: 0,
            gas: 1000000,
            submit: true,
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
                    expect(path).to.equal(`/v2/tx/fd`)
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

        it('CAVERJS-EXT-KAS-WALLET-096: should request fd cancel transaction paid by KAS to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDCancelTransactionResponse')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-097: should request fd cancel transaction paid by KAS to KAS (with txHash)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestObject = Object.assign({}, txObj)
            delete requestObject.nonce
            requestObject.transactionHash = '0x7b0cccd1faf451086d73da2a08341827695ee716752b0069e7aede8713a0b2d9'

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDCancelTransactionResponse')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestObject)

            const ret = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(requestObject)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-098: should request fd cancel transaction paid by KAS to KAS (with FDCancelTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDCancelTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDCancelTransactionResponse')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-099: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDCancelTransactionResponse')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-100: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer', () => {
        const resultOfApi = {
            rlp:
                '0x49f8ca808505d21dba00830186a0942d903845cc553f13c76ad6748304ed998ab050ef820123f847f8458207f6a05aa15f8893f5df61faf690c35809c0bb3c4a06c87e1c5da075165e7968f6b452a013a4a2c245b88388cd9483b5166448dc2277a4281df044da059ce592f1ead871941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f6a0dfbb08825369e533c42537a089bc9a5428caca5a54789d74d74b9eb9e6f140a3a021987e3ccef366ab277689a6dc6e7685cbf6dec83328ea6f783f203d7c909443',
            feePayer: '0x1b71a63903e35371e2fc41c6012effb99b9a2c0f',
            from: '0x2d903845cc553f13c76ad6748304ed998ab050ef',
            gas: 100000,
            gasPrice: '0x5d21dba00',
            input: '0x0123',
            nonce: 0,
            status: 'Submitted',
            typeInt: 73,
            signatures: [
                {
                    R: '0x5aa15f8893f5df61faf690c35809c0bb3c4a06c87e1c5da075165e7968f6b452',
                    S: '0x13a4a2c245b88388cd9483b5166448dc2277a4281df044da059ce592f1ead871',
                    V: '0x7f6',
                },
            ],
            transactionHash: '0x34200208e1a81e690ae60b0f127194da2f877b606bd34f62568ed007133af7ea',
        }

        const txObj = {
            from: '0x5bb85d4032354E88020595AFAFC081C24098202e',
            input: '0xadf',
            nonce: 0,
            gas: 1000000,
            submit: true,
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
                    expect(path).to.equal(`/v2/tx/fd/anchor`)
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

        it('CAVERJS-EXT-KAS-WALLET-101: should request fd chain data anchoring transaction paid by KAS to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDAnchorTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-102: should request fd chain data anchoring transaction paid by KAS to KAS (with FDAnchorTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDAnchorTransactionRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDAnchorTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-103: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDAnchorTransaction')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-104: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer', () => {
        const resultOfApi = {
            rlp:
                '0x09f8dc018505d21dba0082c3509476c6b1f34562ed7a843786e1d7f57d0d7948a6f101942d903845cc553f13c76ad6748304ed998ab050eff847f8458207f6a00c641e9a0cd50a62242e6998108a02ebacc89d48dd1e6a5a6e67524fd5d46e3ba06864a8891408c61e1cab4ffe8f76c945fa68f41bb36b926590f150429aeb2c34941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f5a07ebe3dd5fec86fca2acb22798f3c1f81729b5db26dce26d12f15b4c5d064eda7a0149cb5e8dd5421623965a9431c90c8f293f83dad3ee5c0fea21bc8106a98d344',
            feePayer: '0x1b71a63903e35371e2fc41c6012effb99b9a2c0f',
            from: '0x2d903845cc553f13c76ad6748304ed998ab050ef',
            gas: 50000,
            gasPrice: '0x5d21dba00',
            nonce: 1,
            status: 'Submitted',
            to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
            typeInt: 9,
            value: '0x1',
            signatures: [
                {
                    R: '0xc641e9a0cd50a62242e6998108a02ebacc89d48dd1e6a5a6e67524fd5d46e3b',
                    S: '0x6864a8891408c61e1cab4ffe8f76c945fa68f41bb36b926590f150429aeb2c34',
                    V: '0x7f6',
                },
            ],
            transactionHash: '0x73c845e2244abeaac5f47955f9994f7c48712ff6626b28e46306267af8fa3df8',
        }

        const txObj = {
            rlp:
                '0x2af90209028505d21dba00830f4240808094040f2bc5a8e96c0ac776296f21c5f35a5ba0fa5bb9013a60806040526000805534801561001457600080fd5b50610116806100246000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a7230582064856de85a2706463526593b08dd790054536042ef66d3204018e6790a2208d10029801e80f847f8458207f6a0b9d8ece1dcf988f2ab4176608d3f865c04fd37cfefd95daf921df29d28ff6fd8a016d6fd13bd534c769a1d453572ad84f20afc05f9c5c8dae7783ac3c3da572062941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f5a06092cab93d1002c5712588894736ccbdff252d3cb49fddd923aae8af0cabc33ba027501d67e650953982684ec69cdb727a0c87f5a09f4359b10a650e575822e682',
            submit: true,
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
                    expect(path).to.equal(`/v2/tx/fd/rlp`)
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

        it('CAVERJS-EXT-KAS-WALLET-105: should request fd transaction paid by KAS to KAS via RLP-encoded string (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDProcessRLP')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            const ret = await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer(txObj)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-106: should request fd transaction paid by KAS to KAS (with FDProcessRLPRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const requestModel = FDProcessRLPRequest.constructFromObject(txObj)
            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDProcessRLP')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, requestModel)

            const ret = await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer(requestModel)

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-107: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDProcessRLP')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObj)

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer(txObj, () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-108: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer(txObj)

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })

    context('caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer', () => {
        const resultOfApi = {
            rlp:
                '0x21f8ca808505d21dba00830f42409423cf9150d9dfd64c77a06e9fb2aa515178e8a4668201c0f847f8458207f6a011b5132d54ab5a17c417d3e47cbbf3589bea9f167d8da7945f3cb1d5f239a0e2a0278ccd3975b662fa59ee4bb00f81bd5a460ea6f1ad6e6bea16a98d47688afc9b941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f6a08843bc30b8ffcc7260574eccacf3561912160e711ad548bbf3b7d66c0828e4cba06b5d10842a87c00b874f61d6ba5c11761bb9a2d6cdf5f4ee409d1e02f3c6de23',
            feePayer: '0x1b71a63903e35371e2fc41c6012effb99b9a2c0f',
            from: '0x23cf9150d9dfd64c77a06e9fb2aa515178e8a466',
            gas: 1000000,
            gasPrice: '0x5d21dba00',
            nonce: 0,
            status: 'Submitted',
            typeInt: 33,
            signatures: [
                {
                    R: '0x11b5132d54ab5a17c417d3e47cbbf3589bea9f167d8da7945f3cb1d5f239a0e2',
                    S: '0x278ccd3975b662fa59ee4bb00f81bd5a460ea6f1ad6e6bea16a98d47688afc9b',
                    V: '0x7f6',
                },
            ],
            transactionHash: '0xa0d49a891412c7477918d4288c6409a89444a3244729ea238d9446627ed804f6',
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
                    expect(path).to.equal(`/v2/tx/fd/account`)
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

        it('CAVERJS-EXT-KAS-WALLET-109: should request fd account update transaction paid by KAS to KAS (with object)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDAccountUpdateTransactionResponse')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')

            for (const obj of txObjects) {
                setCallFakeForCallApi(callApiStub, obj)

                const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer(obj)

                expect(ret).not.to.be.undefined
            }

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(apiFunctionSpy.callCount).to.equal(txObjects.length)
            expect(callApiStub.callCount).to.equal(txObjects.length)
        })

        it('CAVERJS-EXT-KAS-WALLET-110: should request fd account update transaction paid by KAS to KAS (with FDAccountUpdateTransactionRequest)', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDAccountUpdateTransactionResponse')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')

            for (const obj of txObjects) {
                const requestModel = FDAccountUpdateTransactionRequest.constructFromObject(obj)
                setCallFakeForCallApi(callApiStub, requestModel)

                const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer(requestModel)

                expect(ret).not.to.be.undefined
            }

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(apiFunctionSpy.callCount).to.equal(txObjects.length)
            expect(callApiStub.callCount).to.equal(txObjects.length)
        })

        it('CAVERJS-EXT-KAS-WALLET-111: should call callback function with api result', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const apiFunctionSpy = sandbox.spy(caver.kas.wallet.fdTransactionPaidByKASApi, 'fDAccountUpdateTransactionResponse')
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, txObjects[0])

            let isCalled = false

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer(txObjects[0], () => {
                isCalled = true
            })

            expect(apiFunctionSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-WALLET-112: should resolve the promise when error is returned from KAS server', async () => {
            caver.initWalletAPI(chainId, accessKeyId, secretAccessKey, url)

            const errorResult = { code: 1010008, message: 'The authorization header you provided is invalid.' }
            const callApiStub = sandbox.stub(caver.kas.wallet.fdTransactionPaidByKASApi.apiClient, 'callApi')
            callApiStub.callsFake((...args) => {
                const callback = args[args.length - 1]
                callback(null, errorResult, {})
            })

            const ret = await caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer(txObjects[0])

            expect(ret.code).to.equal(errorResult.code)
            expect(ret.message).to.equal(errorResult.message)
        })
    })
})
