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
const { url, chainId, accessKeyId, secretAccessKey, operator } = require('../testEnv').auths.metaDataAPI

const sandbox = sinon.createSandbox()

describe('Metadata API service enabling', () => {
    beforeEach(() => {
        caver = new CaverExtKAS()
    })

    afterEach(() => {
        sandbox.restore()
    })

    context('caver.initMetadataAPI', () => {
        it('CAVERJS-EXT-KAS-MATADATA-001: should return error if metadataAPI is not initialized', async () => {
            const expectedError = `Metadata API is not initialized. Use 'caver.initMetadataAPI' function to initialize Metadata API.`
            expect(() => caver.kas.metaData.uploadMetadata()).to.throw(expectedError)
        }).timeout(50000)

        it('CAVERJS-EXT-KAS-MATADATA-002: should set valid auth and chain id', () => {
            caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey, url)

            expect(caver.kas.metaData.accessOptions).not.to.be.undefined
            expect(caver.kas.metaData.accessKeyId).to.equal(accessKeyId)
            expect(caver.kas.metaData.secretAccessKey).to.equal(secretAccessKey)
            expect(caver.kas.metaData.auth).to.equal(`Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`)
            expect(caver.kas.metaData.chainId).to.equal(chainId)
            expect(caver.kas.metaData.apiInstances).not.to.be.undefined
            expect(caver.kas.metaData.dataUploadApi).not.to.be.undefined
        })
    })

    context('caver.kas.metaData.uploadAsset', () => {
        const uploadResult = {
            contentType: 'image/png',
            filename: '4a85e6be-3215-93e6-d8a9-3a7d633584e7.png',
            uri: 'https://metadata-store.klaytnapi.com/e2d83fbb-c123-811c-d5f3-69132v482c51/4a85e6be-3215-93e6-d8a9-3a7d633584e7.png',
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
                    expect(path).to.equal(`/v1/metadata/asset`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(1)
                    expect(postBody).to.be.null
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('multipart/form-data')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined
                    callback(null, uploadResult, { body: uploadResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-METADATA-003: should send post request to jpg file data', async () => {
            caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey, url)
            const filepath = fpath.join(__dirname, '../fixture/img-jpg.jpg')
            const file = fs.createReadStream(filepath)

            const metadataSpy = sandbox.spy(caver.kas.metaData.dataUploadApi, 'uploadAsset')
            const callApiStub = sandbox.stub(caver.kas.metaData.dataUploadApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.metaData.uploadAsset(file)

            expect(metadataSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
            expect(ret.contentType).to.be.equal('image/png')
            expect(ret.filename).not.to.be.undefined
            expect(ret.uri).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-METADATA-004: should send post request to png file data', async () => {
            caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey, url)
            const filepath = fpath.join(__dirname, '../fixture/img-png.png')
            const file = fs.createReadStream(filepath)

            const metadataSpy = sandbox.spy(caver.kas.metaData.dataUploadApi, 'uploadAsset')
            const callApiStub = sandbox.stub(caver.kas.metaData.dataUploadApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.metaData.uploadAsset(file)

            expect(metadataSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
            expect(ret.contentType).to.be.equal('image/png')
            expect(ret.filename).not.to.be.undefined
            expect(ret.uri).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-METADATA-005: should call callback function with assest upload response', async () => {
            caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey, url)
            const filepath = fpath.join(__dirname, '../fixture/img-png.png')
            const file = fs.createReadStream(filepath)

            const metadataSpy = sandbox.spy(caver.kas.metaData.dataUploadApi, 'uploadAsset')
            const callApiStub = sandbox.stub(caver.kas.metaData.dataUploadApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub)

            const ret = await caver.kas.metaData.uploadAsset(file, () => {
                isCalled = true
            })

            expect(metadataSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
            expect(ret.contentType).to.be.equal('image/png')
            expect(ret.filename).not.to.be.undefined
            expect(ret.uri).not.to.be.undefined
        })
    })

    context('caver.kas.metaData.uploadMetadata', () => {
        const metadata = {
            name: 'Puppy Heaven NFT',
            description: 'This is a sample description',
            image: 'https://metadata-store.klaytnapi.com/e2d83vdb-c108-823c-d5f3-69vdf2d871c51/4a85e6be-3215-93e6-d8a9-3a7d633584e7.png',
        }
        const uploadResult = {
            filename: 'puppy.json',
            contentType: 'application/json',
            uri: 'https://metadata-store.klaytnapi.com/e2d83vdb-c108-823c-d5f3-69vdf2d871c51/4f9asvf2f5-02d0-5b86-4f99-50acds269c8a.json',
        }

        function setCallFakeForCallApi(callApiStub, uploadData, filename) {
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
                    expect(path).to.equal(`/v1/metadata`)
                    expect(mtd).to.equal(`POST`)
                    expect(Object.keys(pathParams).length).to.equal(0)
                    expect(Object.keys(queryParams).length).to.equal(0)
                    expect(headerParams['x-chain-id']).to.equal(chainId)
                    expect(Object.keys(formParams).length).to.equal(0)
                    expect(postBody.metadata).to.equal(uploadData)
                    if (filename) expect(postBody.filename).to.equal(filename)
                    expect(authNames[0]).to.equal('basic')
                    expect(contentTypes[0]).to.equal('application/json')
                    expect(accepts[0]).to.equal('application/json')
                    expect(returnType).not.to.be.undefined
                    callback(null, uploadResult, { body: uploadResult })
                }
            )
        }

        it('CAVERJS-EXT-KAS-METADATA-006: should return meta data result without file name', async () => {
            caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey, url)

            const metadataSpy = sandbox.spy(caver.kas.metaData.dataUploadApi, 'uploadMetadata')
            const callApiStub = sandbox.stub(caver.kas.metaData.dataUploadApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, metadata)

            const ret = await caver.kas.metaData.uploadMetadata(metadata)

            expect(metadataSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
            expect(ret.contentType).to.equal('application/json')
            expect(ret.filename).not.to.be.undefined
            expect(ret.uri).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-METADATA-007: should return meta data result with file name', async () => {
            caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey, url)

            const filename = 'puppy.json'
            const metadataSpy = sandbox.spy(caver.kas.metaData.dataUploadApi, 'uploadMetadata')
            const callApiStub = sandbox.stub(caver.kas.metaData.dataUploadApi.apiClient, 'callApi')
            setCallFakeForCallApi(callApiStub, metadata, filename)

            const ret = await caver.kas.metaData.uploadMetadata(metadata, filename)

            expect(metadataSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(ret).not.to.be.undefined
            expect(ret.filename).to.equal(filename)
            expect(ret.contentType).to.equal('application/json')
            expect(ret.uri).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-METADATA-008: should call callback function with meta data upload response without file name', async () => {
            caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey, url)

            const metadataSpy = sandbox.spy(caver.kas.metaData.dataUploadApi, 'uploadMetadata')
            const callApiStub = sandbox.stub(caver.kas.metaData.dataUploadApi.apiClient, 'callApi')

            let isCalled = false

            setCallFakeForCallApi(callApiStub, metadata)

            const ret = await caver.kas.metaData.uploadMetadata(metadata, () => {
                isCalled = true
            })

            expect(metadataSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
            expect(ret.contentType).to.equal('application/json')
            expect(ret.filename).not.to.be.undefined
            expect(ret.uri).not.to.be.undefined
        })

        it('CAVERJS-EXT-KAS-METADATA-009: should call callback function with meta data upload response with file name', async () => {
            caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey, url)

            const metadataSpy = sandbox.spy(caver.kas.metaData.dataUploadApi, 'uploadMetadata')
            const callApiStub = sandbox.stub(caver.kas.metaData.dataUploadApi.apiClient, 'callApi')
            const filename = 'puppy.json'

            let isCalled = false

            setCallFakeForCallApi(callApiStub, metadata)

            const ret = await caver.kas.metaData.uploadMetadata(metadata, filename, () => {
                isCalled = true
            })

            expect(metadataSpy.calledWith(chainId)).to.be.true
            expect(callApiStub.calledOnce).to.be.true
            expect(isCalled).to.be.true
            expect(ret).not.to.be.undefined
            expect(ret.contentType).to.equal('application/json')
            expect(ret.filename).not.to.be.undefined
            expect(ret.uri).not.to.be.undefined
        })
    })
})
