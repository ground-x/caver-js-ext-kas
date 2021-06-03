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

const lodash = require('lodash')

class KIP7QueryOptions {
    /**
     * Create an instance of KIP7QueryOptions from object. <br>
     * You can use object instead of KIP7QueryOptions instance when using `caver.kas.kip7`. <br>
     * Because the function of `caver.kas.kip7` internally converts object to KIP7QueryOptions instance,
     * and when converting, validation of the field defined inside Object is performed. <br>
     *
     * @example
     * const options = caver.kas.kip7.queryOptions.constructFromObject({ size, cursor, status })
     *
     * @param {object} obj An object where query parameters are defined.
     * @return {KIP7QueryOptions}
     */
    static constructFromObject(obj) {
        const size = obj.size
        const cursor = obj.cursor
        const status = obj.status

        return new KIP7QueryOptions(size, cursor, status)
    }

    /**
     * Creates an instance of KIP7QueryOptions.
     *
     * @example
     * const options = new caver.kas.kip7.queryOptions(size, cursor)
     *
     * @constructor
     * @param {number} size - Maximum number of data to query.
     * @param {string} cursor - Information of the last retrieved cursor.
     * @param {string} status - Labeling status ['all', 'init', 'submitted', 'deployed']. You can use `caver.kas.kip7.queryOptions.status`.
     */
    constructor(size, cursor, status) {
        if (size !== undefined) this.size = size
        if (cursor !== undefined) this.cursor = cursor
        if (status !== undefined) this.status = status
    }

    /**
     * @type {number}
     */
    get size() {
        return this._size
    }

    set size(size) {
        if (!lodash.isNumber(size)) throw new Error(`Invalid type of size: size should be number type.`)
        if (size < 1 || size > 1000) throw new Error(`Invalid size. min=1, max=1000`)
        this._size = size
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
    get status() {
        return this._status
    }

    set status(status) {
        if (!lodash.isString(status)) throw new Error(`Invalid type of status: status should be string type.`)

        const statusCandidates = ['all', 'init', 'submitted', 'deployed']
        if (!statusCandidates.includes(status.toLowerCase()))
            throw new Error(
                `Invalid status. The status can specify the token contact status to search among 'all', 'init', 'submitted' or 'deployed'.`
            )

        this._status = status.toLowerCase()
    }

    /**
     * Make sure that only essential ones are defined for the option values defined in KIP7QueryOptions.
     *
     * @example
     * const options = caver.kas.kip7.queryOptions.constructFromObject({ ... })
     * const isValid = options.isValidOptions(['size', 'cursor'])
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

KIP7QueryOptions.status = {
    ALL: 'all',
    INIT: 'init',
    SUBMITTED: 'submitted',
    DEPLOYED: 'deployed',
}

module.exports = KIP7QueryOptions
