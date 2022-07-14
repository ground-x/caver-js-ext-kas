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
const helper = require('../../utils/helper')

const { DataUploadApi } = require('../../rest-client/src')

const NOT_INIT_API_ERR_MSG = `Metadata API is not initialized. Use 'caver.initMetadataAPI' function to initialize Metadata API.`


/**
 * A warpping class that connects Metadata API.
 * @class
 */
class Metadata {
    /**
     * Creates an instance of metadata history api.
     * @constructor
     * @param {ApiClient} client - The Api client to use to connect with KAS.
     * @param {AccessOptions} accessOptions - An instance of AccessOptions including `chainId`, `accessKeyId` and `secretAccessKey`.
     */
    constructor(client, accessOptions) {
        this.accessOptions = accessOptions

        this.apiInstances = {}

        if (client) {
            this.apiInstances = {
                dataUpload: new DataUploadApi(client),
            }
        }
    }

    /**
     * @type {string}
     */
    get auth() {
        return this.accessOptions.auth
    }

    /**
     * @type {string}
     */
    get accessKeyId() {
        return this.accessOptions.accessKeyId
    }

    /**
     * @type {string}
     */
    get secretAccessKey() {
        return this.accessOptions.secretAccessKey
    }

    /**
     * @type {string}
     */
    get chainId() {
        return this.accessOptions.chainId
    }

    /**
     * @type {AccessOptions}
     */
    get accessOptions() {
        return this._accessOptions
    }

    set accessOptions(accessOptions) {
        this._accessOptions = accessOptions
    }

    /**
     * @type {object}
     */
    get apiInstances() {
        return this._apiInstances
    }

    set apiInstances(apiInstances) {
        this._apiInstances = apiInstances
    }

    /**
     * @type {object}
     */
    get client() {
        return this.apiInstances.dataUpload.apiClient
    }

    set client(client) {
        this.apiInstances = {
            dataUpload: new DataUploadApi(client),
        }
    }

    /**
     * @type {DataUploadApi}
     */
    get dataUploadApi() {
        return this.apiInstances.dataUpload
    }

    /**
     * Uploads an asset. Supported file types include jpg, png, and gif etc.. After uploading the asset file, it returns a public URI to access the asset. <br>
     * POST /v1/metadata/asset
     *
     * @example
     * const krn = 'krn:1001:metadata:{account-id}:metadata-storage:{storage-name}'
     *
     * const result = await caver.kas.metadata.uploadAsset(file [, krn] [, callback])
     * @param {file} file Addes a file with multipart/form-data. File number is limited to one, and file size is limited to 10MB. If the file size exceeds 10MB, you will get an invalid input error.
     * @param {string} [krn] If you want to set up storage, you have to provide the Storage KRN object in the header. KRN must start with "krn:"
     * @param {Function} [callback] The callback function to call.
     * @return {UploadAssetResponse}
     */
    uploadAsset(file, krn, callback) {
        if (!this.accessOptions || !this.dataUploadApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (file === undefined) throw new Error(`File should be defined`)
        if (!_.isObject(file)) throw new Error(`File must be object type.`)
        if (_.isFunction(krn)) {
            callback = krn
            krn = undefined
        }

        const opts = {
            file,
        }

        return new Promise((resolve, reject) => {
            this.dataUploadApi.uploadAsset(this.chainId, krn, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }
    /**
     * Uploads metadata. After uploading the metadata, it returns an externally accessible public URI for that metadata.
     * POST /v1/metadata
     *
     * @example
     * const metadata = { "name": "Puppy Heaven NFT", "description": "This is a sample description", "image": "url" }
     * const filename = "PuppyHeavenNFT.json"
     * const result = await caver.kas.metadata.uploadMetadata(metadata,filename)
     *
     * @param {object} metadata JSON metadata.
     * @param {string} [filename] File extension must be .json. If the file name is already taken you will get a duplicate key error.
     * @param {string} [krn] If you want to set up storage, you have to provide the Storage KRN object in the header. KRN must start with "krn:"
     * @param {Function} [callback] The callback function to call.
     * @return {UploadMetadataResponse}
     */

    uploadMetadata(metadata, filename, krn, callback) {
        if (!this.accessOptions || !this.dataUploadApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (metadata === undefined) throw new Error(`The metadata should be defined.`)
        if (!_.isObject(metadata)) throw new Error(`The metadata must be Object type.`)

        if (krn !== undefined && _.isFunction(krn)) {
            callback = krn
            krn = ''
        }
        if (filename !== undefined) {
            switch (typeof filename) {
                case 'function':
                    callback = filename
                    filename = ''
                    break
                case 'string':
                    if (helper.isKRN(filename)) {
                        krn = filename
                        filename = ''
                    }
                    break
                default:
                    throw new Error(`The second param must be a string or a function.`)
            }
        }

        const opts = {
            body: { metadata, filename },
        }
        return new Promise((resolve, reject) => {
            this.dataUploadApi.uploadMetadata(this.chainId, krn, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }
    /**
     * Uploads metadata. After uploading the metadata, it returns an externally accessible public URI for that metadata.
     *
     * @example
     * const metadata = { "name": "Puppy Heaven NFT", "description": "This is a sample description", "image": FILE || "url" }
     * const filename = "PuppyHeavenNFT.json"
     * const result = await caver.kas.metadata.uploadAssetMetadata(metadata, filename ,krn)
     *
     * @param {object} metadata JSON metadata.
     * @param {string} [filename] File extension must be .json. If the file name is already taken you will get a duplicate key error.
     * @param {string} [krn] If you want to set up storage, you have to provide the Storage KRN object in the header. KRN must start with "krn:"
     * @param {Function} [callback] The callback function to call.
     * @return {UploadMetadataResponse}
     */

    async uploadKIPMetadataWithAsset(metadata, filename, krn, callback) {
        if (!this.accessOptions || !this.dataUploadApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (metadata === undefined) throw new Error(`The metadata should be defined.`)
        if (!_.isObject(metadata)) throw new Error(`The metadata must be Object type.`)

        if (krn !== undefined && _.isFunction(krn)) {
            callback = krn
            krn = ''
        }

        if (filename !== undefined) {
            switch (typeof filename) {
                case 'function':
                    callback = filename
                    filename = ''
                    break
                case 'string':
                    if (helper.isKRN(filename)) {
                        krn = filename
                        filename = ''
                    }
                    break
                default:
                    throw new Error(`The second param must be a string or a function.`)
            }
        }

        if (metadata.image && !_.isString(metadata.image)) {
            const url = await this.uploadAsset(metadata.image, krn)
            metadata.image = url
        }

        const opts = {
            body: { metadata, filename },
        }
        return new Promise((resolve, reject) => {
            this.dataUploadApi.uploadMetadata(this.chainId, krn, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }
}
module.exports = Metadata
