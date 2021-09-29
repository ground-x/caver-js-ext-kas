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

class KIP7FeePayerOptions {
    /**
     * Create an instance of KIP7FeePayerOptions from object. <br>
     * You can use object instead of KIP7FeePayerOptions instance when using `caver.kas.kip7`. <br>
     * Because the function of `caver.kas.kip7` internally converts object to KIP7FeePayerOptions instance,
     * and when converting, validation of the field defined inside Object is performed. <br>
     *
     * @example
     * const options = caver.kas.kip7.feePayerOptions.constructFromObject({ enableGlobalFeePayer: true })
     * const options = caver.kas.kip7.feePayerOptions.constructFromObject({ userFeePayer: { krn, address } })
     *
     * @param {object} obj An object where query parameters are defined.
     * @return {KIP7FeePayerOptions}
     */
    static constructFromObject(obj) {
        const enableGlobalFeePayer = obj.enableGlobalFeePayer
        const userFeePayer = obj.userFeePayer

        const options = new KIP7FeePayerOptions(enableGlobalFeePayer, userFeePayer)
        return options.toObject()
    }

    /**
     * Creates an instance of KIP7FeePayerOptions.
     *
     * @example
     * const options = new caver.kas.kip7.feePayerOptions(enableGlobalFeePayer, userFeePayer)
     *
     * @constructor
     * @param {boolean} [enableGlobalFeePayer] - A boolean value of whether KAS Global FeePayer is used.
     * @param {object} [userFeePayer] - The user fee payer object. This will include `krn` and `address` of the fee payer.
     * @param {string} [userFeePayer.krn] - The feepayer-pool KRN of the FeePayer account.
     * @param {string} [userFeePayer.address] - Klaytn FeePayer account address.
     */
    constructor(enableGlobalFeePayer, userFeePayer) {
        if (enableGlobalFeePayer !== undefined) this.enableGlobalFeePayer = enableGlobalFeePayer
        if (userFeePayer !== undefined) this.userFeePayer = userFeePayer
    }

    /**
     * @type {boolean}
     */
    get enableGlobalFeePayer() {
        return this._enableGlobalFeePayer
    }

    set enableGlobalFeePayer(enableGlobalFeePayer) {
        if (!lodash.isBoolean(enableGlobalFeePayer))
            throw new Error(`Invalid type of enableGlobalFeePayer: enableGlobalFeePayer should be boolean type.`)

        this._enableGlobalFeePayer = enableGlobalFeePayer
    }

    /**
     * @type {object}
     */
    get userFeePayer() {
        return this._userFeePayer
    }

    set userFeePayer(userFeePayer) {
        if (!lodash.isObject(userFeePayer)) throw new Error(`Invalid type of userFeePayer: userFeePayer should be object type.`)

        const keys = Object.keys(userFeePayer)
        for (let k of keys) {
            k = k.replace('_', '')
            if (k !== 'krn' && k !== 'address')
                throw new Error('Invalid userFeePayer object: userFeePayer can define only `krn` and `address` of the fee payer')
        }

        this._userFeePayer = Object.assign({}, userFeePayer)
    }

    /**
     * Returns an object without '_' prefix at variables.
     * This function will be used at `constructFromObject`.
     *
     * @example
     * options.toObject()
     *
     * @return {object}
     */
    toObject() {
        const obj = {}
        if (this.enableGlobalFeePayer !== undefined) obj.enableGlobalFeePayer = this.enableGlobalFeePayer
        if (this.userFeePayer !== undefined) {
            obj.userFeePayer = {}
            if (this.userFeePayer.krn) obj.userFeePayer.krn = this.userFeePayer.krn
            if (this.userFeePayer.address) obj.userFeePayer.address = this.userFeePayer.address
        }
        return obj
    }
}

module.exports = KIP7FeePayerOptions
