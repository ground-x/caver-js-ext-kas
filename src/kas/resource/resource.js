/*
 * Copyright 2020 The caver-js-ext-kas Authors.
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
const ResourceQueryOptions = require('./resourceQueryOptions')
const { ResourceListApi } = require('../../rest-client/src')

const NOT_INIT_API_ERR_MSG = `Resource API is not initialized. Use 'caver.initResourceAPI' function to initialize Resource API.`

/**
 * A warpping class that connects Metadata API.
 * @class
 */
class Resource {
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
                resourceListApi: new ResourceListApi(client),
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
            resourceListApi: new ResourceListApi(client),
        }
    }

    /**
     * @type {ResourceListApi}
     */
    get resourceListApi() {
        return this.apiInstances.resourceListApi
    }

    /**
     * Returns a list of user resources. <br>
     * GET v1/resource/account/{account-id}
     *
     * @example
     * const accountId = "1dw1d3991-c8f1-4fs1-ba28-16f1e3w528"
     * const query = {
     *    size: 1,
     *    fromTimestamp: 1501970769,
     *    toTimestamp: 1601970769,
     *    cursor: 'eyJBZGRyZXNzIjoia3JuOjEwMDE6d2FsbGV0OjhlNzZkMDAzLWQ2ZGQtNDI3OC04ZDA1LTUxNzJkOGYwMTBjYTphY2NvdW50LXBvb2w6ZGVmYXVsdDoweDUzM0ZjQzMyMWE4ODgxQzllNEEzNUIzMUJhZWI4MEI1MWE3RDI2OEQiLCJUeXBlIjoiQUNDIiwiY3JlYXRlZF9hdCI6MTYwMTk3MDc2OSwicnBuIjoia3JuOjEwMDE6d2FsbGV0OjhlNzZkMDAzLWQ2ZGQtNDI3OC04ZDA1LTUxNzJkOGYwMTBjYTphY2NvdW50LXBvb2w6ZGVmYXVsdCJ9',
     *    resourceId : 'account-pool',
     *    serviceId : 'wallet'
     * }
     * const result = await caver.kas.wallet.getResourceList(accountId,query)
     *
     * @param {string} accountId KAS account ID to query resource lists
     * @param {ResourceQueryOptions} [queryOptions] Filters required when retrieving data. `size`, `cursor`, `fromTimestamp`, `toTimestamp`, `resourceType`, `serviceId`.
     * @param {Function} [callback] The callback function to call.
     * @return {UploadAssetResponse}
     */
    getResourceList(accountId, queryOptions, callback) {
        if (!this.accessOptions || !this.resourceListApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (accountId === undefined) throw new Error(`The account id should be defined`)
        if (!_.isString(accountId)) throw new Error(`The account id must be string type`)
        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }
        queryOptions = ResourceQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor', 'fromTimestamp', 'toTimestamp', 'resourceType', 'serviceId']))
            throw new Error(
                `Invalid query options: 'size', 'cursor', 'fromTimestamp', 'toTimestamp', 'resourceType', 'serviceId'  can be used.`
            )

        return new Promise((resolve, reject) => {
            this.resourceListApi.getResources(this.chainId, accountId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }
}
module.exports = Resource
