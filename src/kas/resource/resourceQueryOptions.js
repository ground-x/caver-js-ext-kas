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

const lodash = require('lodash')
const { formatDate } = require('../../utils/helper')

/**
 * Class where query parameters for Resource API are defined.
 * @class
 */
class ResourceQueryOptions {
    /**
     * Create an instance of ResourceQueryOptions from object. <br>
     * You can use object instead of ResourceQueryOptions instance when using `caver.kas.resource`. <br>
     * Because the function of `caver.kas.resource` internally converts object to ResourceQueryOptions instance,
     * and when converting, validation of the field defined inside Object is performed. <br>
     *
     * @example
     * const options = caver.kas.resource.queryOptions.constructFromObject({ kind, range, size, cursor, ... })
     *
     * @param {object} obj An object where query parameters are defined.
     * @return {ResourceQueryOptions}
     */
    static constructFromObject(obj) {
        const size = obj.size
        const cursor = obj.cursor
        const resourceType = obj.resourceType || obj['resource-type']
        const serviceId = obj.serviceId || obj['service-id']

        if (obj.fromTimestamp !== undefined && obj['from-timestamp'] !== undefined)
            throw new Error(`To set from date, it must be defined using only one of 'from-timestamp' or 'fromTimestamp'.`)
        const fromTimestamp = obj.fromTimestamp || obj['from-timestamp']
        if (obj.toTimestamp !== undefined && obj['to-timestamp'] !== undefined)
            throw new Error(`To set to date, it must be defined using only one of 'to-timestamp' or 'toTimestamp'.`)
        const toTimestamp = obj.toTimestamp || obj['to-timestamp']

        return new ResourceQueryOptions(size, fromTimestamp, toTimestamp, cursor, resourceType, serviceId)
    }

    /**
     * Creates an instance of ResourceQueryOptions.
     * @constructor
     * @param {number} size - Maximum size of the account query.
     * @param {number|string|Date} fromTimestamp - The starting date of the data to be queried.
     * @param {number|string|Date} toTimestamp - The ending date of the data to be queried.
     * @param {string} cursor - Last cursor record.
     * @param {string} resourceType - Resource type.
     * @param {string} serviceId - Service name.
     */
    constructor(size, fromTimestamp, toTimestamp, cursor, resourceType, serviceId) {
        if (size !== undefined) this.size = size
        if (fromTimestamp !== undefined) this.fromTimestamp = fromTimestamp
        if (toTimestamp !== undefined) this.toTimestamp = toTimestamp
        if (cursor !== undefined) this.cursor = cursor
        if (resourceType !== undefined) this.resourceType = resourceType
        if (serviceId !== undefined) this.serviceId = serviceId
    }

    /**
     * @type {number}
     */
    get size() {
        return this._size
    }

    set size(size) {
        if (!lodash.isNumber(size)) throw new Error(`Invalid type of size: size should be number type.`)
        this._size = size
    }

    /**
     * @type {Date}
     */
    get fromTimestamp() {
        if (this._fromTimestamp === undefined) return undefined
        return parseInt(this._fromTimestamp.getTime() / 1000)
    }

    set fromTimestamp(fromTimestamp) {
        this._fromTimestamp = formatDate(fromTimestamp)
    }

    /**
     * @type {Date}
     */
    get toTimestamp() {
        if (this._toTimestamp === undefined) return undefined
        return parseInt(this._toTimestamp.getTime() / 1000)
    }

    set toTimestamp(toTimestamp) {
        this._toTimestamp = formatDate(toTimestamp)
    }

    /**
     * @type {string}
     */
    get cursor() {
        return this._cursor
    }

    set cursor(cursor) {
        if (!lodash.isString(cursor)) throw new Error(`Invalid type of cursor: cursor should be string type.`)
        this._cursor = cursor
    }

    /**
     * @type {string}
     */
    get resourceType() {
        return this._resourceType
    }

    set resourceType(resourceType) {
        if (!lodash.isString(resourceType)) throw new Error(`Invalid type of resourceType: resourceType should be string type.`)
        this._resourceType = resourceType
    }

    /**
     * @type {string}
     */
    get serviceId() {
        return this._serviceId
    }

    set serviceId(serviceId) {
        if (!lodash.isString(serviceId)) throw new Error(`Invalid type of serviceId: serviceIdshould be string type.`)
        this._serviceId = serviceId
    }

    /**
     * Make sure that only essential ones are defined for the option values defined in ResourceQueryOptions.
     *
     * @example
     * const options = caver.kas.resource.queryOptions.constructFromObject({ ... })
     * const isValid = options.isValidOptions(['status'])
     *
     * @param {Array.<string>} options An array containing the names of options used in the function.
     * @return {boolean}
     */
    isValidOptions(options) {
        const keys = Object.keys(this)
        for (let k of keys) {
            k = k.replace('_', '')
            if (!options.includes(k)) return false
        }
        return true
    }
}

module.exports = ResourceQueryOptions
