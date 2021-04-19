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

class KIP17QueryOptions {
    /**
     * Create an instance of KIP17QueryOptions from object. <br>
     * You can use object instead of KIP17QueryOptions instance when using `caver.kas.kip17`. <br>
     * Because the function of `caver.kas.kip17` internally converts object to KIP17QueryOptions instance,
     * and when converting, validation of the field defined inside Object is performed. <br>
     *
     * @example
     * const options = caver.kas.kip17.queryOptions.constructFromObject({ size, cursor })
     *
     * @param {object} obj An object where query parameters are defined.
     * @return {KIP17QueryOptions}
     */
    static constructFromObject(obj) {
        const size = obj.size
        const cursor = obj.cursor

        return new KIP17QueryOptions(size, cursor)
    }

    /**
     * Creates an instance of KIP17QueryOptions.
     *
     * @example
     * const options = new caver.kas.kip17.queryOptions(size, cursor)
     *
     * @constructor
     * @param {number} size - Maximum number of data to query.
     * @param {string} cursor - Information of the last retrieved cursor.
     */
    constructor(size, cursor) {
        if (size !== undefined) this.size = size
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
     * Make sure that only essential ones are defined for the option values defined in KIP17QueryOptions.
     *
     * @example
     * const options = caver.kas.kip17.queryOptions.constructFromObject({ ... })
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

module.exports = KIP17QueryOptions
