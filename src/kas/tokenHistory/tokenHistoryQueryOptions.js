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
const utils = require('caver-js').utils
const { formatDate } = require('../../utils/helper')

class TokenHistoryQueryOptions {
    /**
     * Create an instance of TokenHistoryQueryOptions from object. <br>
     * You can use object instead of TokenHistoryQueryOptions instance when using `caver.kas.tokenHistory`. <br>
     * Because the function of `caver.kas.tokenHistory` internally converts object to TokenHistoryQueryOptions instance,
     * and when converting, validation of the field defined inside Object is performed. <br>
     *
     * @example
     * const options = caver.kas.tokenHistory.queryOptions.constructFromObject({ kind, range, size, cursor, ... })
     *
     * @param {object} obj An object where query parameters are defined.
     * @return {TokenHistoryQueryOptions}
     */
    static constructFromObject(obj) {
        const kind = obj.kind
        const range = obj.range
        const size = obj.size
        const cursor = obj.cursor
        const caFilter = obj.caFilter || obj['ca-filter']
        const caFilters = obj.caFilters || obj['ca-filters']
        const status = obj.status
        const type = obj.type
        const excludeZeroKlay = obj.excludeZeroKlay || obj['exclude-zero-klay']
        const fromOnly = obj.fromOnly || obj['from-only']
        const toOnly = obj.toOnly || obj['to-only']

        return new TokenHistoryQueryOptions(kind, range, size, cursor, caFilter, caFilters, status, type, excludeZeroKlay, fromOnly, toOnly)
    }

    /**
     * Creates an instance of TokenHistoryQueryOptions.
     *
     * @example
     * const options = new caver.kas.tokenHistory.queryOptions(kind, range, size, cursor, caFilter, caFilters, status, type, excludeZeroKlay, fromOnly, toOnly)
     *
     * @constructor
     * @param {Array.<string>} kind - Indicate the [“klay”, “ft”, “nft”, "mt"] type. All types will be searched if no type is specified. You can use `caver.kas.tokenHistory.queryOptions.kind`.
     * @param {string} range - Search range (block number of Unix time).
     * @param {number} size - Maximum number of items to retrieve (min=1, max=1000, default=100).
     * @param {string} cursor - Information of the last retrieved cursor.
     * @param {string} caFilter - The token contract address to filter from the result.
     * @param {string} caFilters - Contract address list to filter.
     * @param {string} status - Labeling status [completed, processing, failed, cancelled]. You can use `caver.kas.tokenHistory.queryOptions.status`.
     * @param {string} type - Contract type. If not set, return all types. You can use `caver.kas.tokenHistory.queryOptions.type`.
     * @param {boolean} excludeZeroKlay - Exclude transfers of 0 KLAY if true (default=false).
     * @param {boolean} fromOnly If true, return transactions when sender corresponds to the given address. (default=false)
     * @param {boolean} toOnly If true, return transactions when recipient corresponds to the given address. (default=false)
     */
    constructor(kind, range, size, cursor, caFilter, caFilters, status, type, excludeZeroKlay, fromOnly, toOnly) {
        if (kind !== undefined) this.kind = kind
        if (range !== undefined) this.range = range
        if (size !== undefined) this.size = size
        if (cursor !== undefined) this.cursor = cursor
        if (caFilter !== undefined) this.caFilter = caFilter
        if (caFilters !== undefined) this.caFilters = caFilters
        if (status !== undefined) this.status = status
        if (type !== undefined) this.type = type
        if (excludeZeroKlay !== undefined) this.excludeZeroKlay = excludeZeroKlay
        if (fromOnly !== undefined) this.fromOnly = fromOnly
        if (toOnly !== undefined) this.toOnly = toOnly
    }

    /**
     * @type {Array.<string>}
     */
    get kind() {
        if (this._kind === undefined) return undefined
        return this._kind.toString()
    }

    set kind(kind) {
        if (!lodash.isArray(kind)) kind = [kind]

        for (let k of kind) {
            if (!lodash.isString(k)) throw new Error(`Invalid type of kind: kind should be string or string array type.`)
            const lowerCaseK = k.toLowerCase()
            if (lowerCaseK !== 'klay' && lowerCaseK !== 'ft' && lowerCaseK !== 'nft' && lowerCaseK !== 'mt') {
                throw new Error(`Invalid kind. The kind can specify the type to search among 'klay','ft', 'ntf' or 'mt'.`)
            }
            k = k.toLowerCase()
        }

        this._kind = Array.from(new Set(kind))
    }

    /**
     * @type {string}
     */
    get range() {
        return this._range
    }

    set range(range) {
        if (!lodash.isString(range)) throw new Error(`Invalid type of range: range should be string type.`)

        range = range.replace(' ', '')
        const splitted = range.split(',')
        if (splitted.length > 2)
            throw new Error(`Invalid format of range: The range must be a string where 'from' and 'to' are separated by comma(,).`)
        if (splitted[splitted.length - 1] === '') throw new Error(`Invalid range format: ${range}`)

        // Check format of from and to.
        let isHexToCompare
        for (let i = 0; i < splitted.length; i++) {
            const isHexForCurrent = splitted[i].slice(0, 2) === '0x'

            if (!isHexForCurrent) splitted[i] = parseInt(formatDate(splitted[i]).getTime() / 1000)

            if (isHexToCompare === undefined) {
                isHexToCompare = isHexForCurrent
            } else if (isHexForCurrent !== isHexToCompare) {
                throw new Error(`'from' and 'to' can only be in the same format.`)
            }
        }

        this._range = splitted.toString()
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
    get caFilter() {
        return this._caFilter
    }

    set caFilter(caFilter) {
        if (!lodash.isString(caFilter)) throw new Error(`Invalid type of caFilter: caFilter should be string type.`)
        this._caFilter = caFilter
    }

    /**
     * @type {Array.<string>}
     */
    get caFilters() {
        if (this._caFilters === undefined) return undefined
        return this._caFilters.toString()
    }

    set caFilters(caFilters) {
        if (lodash.isString(caFilters)) caFilters = [caFilters]
        if (!lodash.isArray(caFilters)) throw new Error(`Invalid type of caFilters: caFilters should be string or array type.`)
        this._caFilters = Array.from(new Set(caFilters))
    }

    /**
     * @type {string}
     */
    get status() {
        return this._status
    }

    set status(status) {
        if (!lodash.isString(status)) throw new Error(`Invalid type of status: status should be string type.`)

        const statusCandidates = ['completed', 'processing', 'failed', 'cancelled']
        if (!statusCandidates.includes(status.toLowerCase()))
            throw new Error(
                `Invalid status. The status can specify the token contact status to search among 'completed', 'processing', 'failed' or 'cancelled'.`
            )

        this._status = status.toLowerCase()
    }

    /**
     * @type {string}
     */
    get type() {
        return this._type
    }

    set type(type) {
        if (!lodash.isString(type)) throw new Error(`Invalid type of type: type should be string type.`)

        const types = ['KIP-7', 'ERC-20', 'KIP-17', 'ERC-721', 'KIP-37', 'ERC-1155']
        if (!types.includes(type.toUpperCase()))
            throw new Error(
                `Invalid type. The type can specify the token contact type to search among 'KIP-7', 'ERC-20', 'KIP-17', 'ERC-721', 'KIP-37' or 'ERC-1155'.`
            )

        this._type = type.toUpperCase()
    }

    /**
     * @type {boolean}
     */
    get excludeZeroKlay() {
        return this._excludeZeroKlay
    }

    set excludeZeroKlay(excludeZeroKlay) {
        if (!lodash.isBoolean(excludeZeroKlay)) throw new Error(`Invalid type of excludeZeroKlay: excludeZeroKlay should be boolean type.`)
        this._excludeZeroKlay = excludeZeroKlay
    }

    /**
     * @type {boolean}
     */
    get fromOnly() {
        return this._fromOnly
    }

    set fromOnly(fromOnly) {
        if (!lodash.isBoolean(fromOnly)) throw new Error(`Invalid type of fromOnly: fromOnly should be boolean type.`)
        this._fromOnly = fromOnly
    }

    /**
     * @type {boolean}
     */
    get toOnly() {
        return this._toOnly
    }

    set toOnly(toOnly) {
        if (!lodash.isBoolean(toOnly)) throw new Error(`Invalid type of toOnly: toOnly should be boolean type.`)
        this._toOnly = toOnly
    }

    /**
     * Make sure that only essential ones are defined for the option values defined in TokenHistoryQueryOptions.
     *
     * @example
     * const options = caver.kas.tokenHistory.queryOptions.constructFromObject({ ... })
     * const isValid = options.isValidOptions(['kind', 'range'])
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

TokenHistoryQueryOptions.kind = {
    KLAY: 'klay',
    FT: 'ft',
    NFT: 'nft',
    MT: 'mt',
}

TokenHistoryQueryOptions.status = {
    COMPLETED: 'completed',
    PROCESSING: 'processing',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
}

TokenHistoryQueryOptions.type = {
    KIP7: 'KIP-7',
    KIP17: 'KIP-17',
    KIP37: 'KIP-37',
    ERC20: 'ERC-20',
    ERC721: 'ERC-721',
    ERC1155: 'ERC-1155',
}

module.exports = TokenHistoryQueryOptions
