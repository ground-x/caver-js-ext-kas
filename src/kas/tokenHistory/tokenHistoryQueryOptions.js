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

class TokenHistoryQueryOptions {
    static constructFromObject(obj) {
        const kind = obj.kind
        const range = obj.range
        const size = obj.size
        const cursor = obj.cursor
        const presets = obj.presets
        const caFilter = obj.caFilter || obj['ca-filter']
        const status = obj.status
        const type = obj.type

        return new TokenHistoryQueryOptions(kind, range, size, cursor, presets, caFilter, status, type)
    }

    constructor(kind, range, size, cursor, presets, caFilter, status, type) {
        if (kind !== undefined) this.kind = kind
        if (range !== undefined) this.range = range
        if (size !== undefined) this.size = size
        if (cursor !== undefined) this.cursor = cursor
        if (presets !== undefined) this.presets = presets
        if (caFilter !== undefined) this.caFilter = caFilter
        if (status !== undefined) this.status = status
        if (type !== undefined) this.type = type
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
            if (lowerCaseK !== 'klay' && lowerCaseK !== 'ft' && lowerCaseK !== 'nft') {
                throw new Error(`Invalid kind. The kind can specify the type to search among 'klay','ft' or 'ntf'.`)
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

        const types = ['KIP-7', 'ERC-20', 'KIP-17', 'ERC-721']
        if (!types.includes(type.toUpperCase()))
            throw new Error(
                `Invalid type. The type can specify the token contact type to search among 'KIP-7', 'ERC-20', 'KIP-17' or 'ERC-721'.`
            )

        this._type = type.toUpperCase()
    }

    /**
     * Make sure that only essential ones are defined for the option values defined in TokenHistoryQueryOptions.
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
    ERC20: 'ERC-20',
    ERC721: 'ERC-721',
}

module.exports = TokenHistoryQueryOptions
