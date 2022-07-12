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
const path = require('path')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
const { createMetadataFilename } = require('../testUtils')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const CaverExtKAS = require('../../index.js')

let caver
const { url, chainId, accessKeyId, secretAccessKey, krn } = require('../testEnv').auths.metadataAPI
const { timeout } = require('../testUtils')

describe('Metadata API service', () => {
    before(() => {
        caver = new CaverExtKAS()
        caver.initMetadataAPI(chainId, accessKeyId, secretAccessKey, url)
    })

    it('CAVERJS-EXT-KAS-INT-001: caver.kas.metadata.uploadMetadata should return metadata data', async () => {
        const metadata = {
            name: 'Puppy Heaven NFT',
            description: 'This is a sample description',
            image: 'https://metadata-store.klaytnapi.com/e2d83vdb-c108-823c-d5f3-69vdf2d871c51/4a85e6be-3215-93e6-d8a9-3a7d633584e7.png',
        }

        const ret = await caver.kas.metadata.uploadMetadata(metadata)
        expect(ret).not.to.be.undefined
        expect(ret.filename).not.to.be.undefined
        expect(ret.contentType).to.be.equal('application/json')
        expect(ret.uri).not.to.be.undefined
    })


    it('CAVERJS-EXT-KAS-INT-002: caver.kas.metaData.uploadMetadata with filename should return metadata data ', async () => {
        const metadata = {
            name: 'Puppy Heaven NFT',
            description: 'This is a sample description',
            image: 'https://metadata-store.klaytnapi.com/e2d83vdb-c108-823c-d5f3-69vdf2d871c51/4a85e6be-3215-93e6-d8a9-3a7d633584e7.png',
        }
        
        const customFileName = createMetadataFilename('caver')
        const ret = await caver.kas.metadata.uploadMetadata(metadata, customFileName)
        expect(ret).not.to.be.undefined
        expect(ret.filename).to.be.equal(customFileName)
        expect(ret.contentType).to.be.equal('application/json')
        expect(ret.uri).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-003: caver.kas.metadata.uploadAsset with jpg file should return asset metadata data ', async () => {
        const filepath = path.join(__dirname, '../fixture/img-jpg.jpg')
        const file = fs.createReadStream(filepath)

        const ret = await caver.kas.metadata.uploadAsset(file)

        expect(ret).not.to.be.undefined
        expect(ret.contentType).to.be.equal('image/jpeg')
        expect(ret.filename).not.to.be.undefined
        expect(ret.uri).not.to.be.undefined
    })


    it('CAVERJS-EXT-KAS-INT-004: caver.kas.metadata.uploadAsset with png file should return asset metadata data ', async () => {

        const filepath = path.join(__dirname, '../fixture/img-png.png')
        const file = fs.createReadStream(filepath)

        const ret = await caver.kas.metadata.uploadAsset(file)

        expect(ret).not.to.be.undefined
        expect(ret.contentType).to.be.equal('image/png')
        expect(ret.filename).not.to.be.undefined
        expect(ret.uri).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-005: caver.kas.metadata.uploadKIPMetadataWithAsset should return metadata data when image type is String', async () => {
        const filepath = path.join(__dirname, '../fixture/img-png.png')
        const file = fs.createReadStream(filepath)

        const ret = await caver.kas.metadata.uploadKIPMetadataWithAsset(file)

        expect(ret).not.to.be.undefined
        expect(ret.contentType).to.be.equal('application/json')
        expect(ret.filename).not.to.be.undefined
        expect(ret.uri).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-006: caver.kas.metadata.uploadKIPMetadataWithAsset with krn should return metadata data when image type is String', async () => {
        const filepath = path.join(__dirname, '../fixture/img-png.png')
        const file = fs.createReadStream(filepath)

        const ret = await caver.kas.metadata.uploadKIPMetadataWithAsset(file, krn)

        expect(ret).not.to.be.undefined
        expect(ret.contentType).to.be.equal('application/json')
        expect(ret.filename).not.to.be.undefined
        expect(ret.uri).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-007: caver.kas.metadata.uploadAsset with storage krn should return asset metadata data ', async () => {
        const filepath = path.join(__dirname, '../fixture/img-jpg.jpg')
        const file = fs.createReadStream(filepath)

        const ret = await caver.kas.metadata.uploadAsset(file, krn)

        expect(ret).not.to.be.undefined
        expect(ret.contentType).to.be.equal('image/jpeg')
        expect(ret.filename).not.to.be.undefined
        expect(ret.uri).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-008: caver.kas.metadata.uploadMetadata with krn should return metadata data', async () => {
        const metadata = {
            name: 'Puppy Heaven NFT',
            description: 'This is a sample description',
            image: 'https://metadata-store.klaytnapi.com/e2d83vdb-c108-823c-d5f3-69vdf2d871c51/4a85e6be-3215-93e6-d8a9-3a7d633584e7.png',
        }

        const ret = await caver.kas.metadata.uploadMetadata(metadata, krn)
        expect(ret).not.to.be.undefined
        expect(ret.filename).not.to.be.undefined
        expect(ret.contentType).to.be.equal('application/json')
        expect(ret.uri).not.to.be.undefined
    })

    it('CAVERJS-EXT-KAS-INT-009 : caver.kas.metadata.uploadMetadata with filename , krn should return metadata data ', async () => {
        const metadata = {
            name: 'Puppy Heaven NFT',
            description: 'This is a sample description',
            image: 'https://metadata-store.klaytnapi.com/e2d83vdb-c108-823c-d5f3-69vdf2d871c51/4a85e6be-3215-93e6-d8a9-3a7d633584e7.png',
        }
        const customFilename = createMetadataFilename('caver')
        const ret = await caver.kas.metadata.uploadMetadata(metadata, customFilename, krn)
        expect(ret).not.to.be.undefined
        expect(ret.filename).to.be.equal(customFilename)
        expect(ret.contentType).to.be.equal('application/json')
        expect(ret.uri).not.to.be.undefined
    })
})
