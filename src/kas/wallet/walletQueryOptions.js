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
 * Class where query parameters for Anchor API are defined.
 * @class
 */
class WalletQueryOptions {
    /**
     * Create an instance of WalletQueryOptions from object.
     *
     * @param {object} obj An object where query parameters are defined.
     * @return {WalletQueryOptions}
     */
    static constructFromObject(obj) {
        const size = obj.size

        if (obj.fromTimestamp !== undefined && obj['from-timestamp'] !== undefined)
            throw new Error(`To set from date, it must be defined using only one of 'from-timestamp' or 'fromTimestamp'.`)
        const fromTimestamp = obj.fromTimestamp || obj['from-timestamp']

        if (obj.toTimestamp !== undefined && obj['to-timestamp'] !== undefined)
            throw new Error(`To set to date, it must be defined using only one of 'to-timestamp' or 'toTimestamp'.`)
        const toTimestamp = obj.toTimestamp || obj['to-timestamp']

        const cursor = obj.cursor

        return new WalletQueryOptions(size, fromTimestamp, toTimestamp, cursor)
    }

    /**
     * Creates an instance of WalletQueryOptions.
     * @constructor
     * @param {number} size - Maximum number of data to query.
     * @param {number|string|Date} fromTimestamp - The starting date of the data to be queried.
     * @param {number|string|Date} toTimestamp - The ending date of the data to be queried.
     * @param {string} cursor - Information of the last retrieved cursor.
     */
    constructor(size, fromTimestamp, toTimestamp, cursor) {
        if (size !== undefined) this.size = size
        if (fromTimestamp !== undefined) this.fromTimestamp = fromTimestamp
        if (toTimestamp !== undefined) this.toTimestamp = toTimestamp
        if (cursor !== undefined) this.cursor = cursor
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
        if (!lodash.isString(cursor)) throw new Error(`Invalid type of cursor: cursor should be number type.`)
        this._cursor = cursor
    }

    /**
     * Make sure that only essential ones are defined for the option values defined in WalletQueryOptions.
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

module.exports = WalletQueryOptions
