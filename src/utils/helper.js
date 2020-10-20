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
const utils = require('caver-js').utils

const RestClient = require('../rest-client')
const AccessOptions = require('./accessOptions')

const DEFAULT_CHAIN_ID = 1001 // BAOBAB

/**
 * The util module
 * @module Helper
 */
/**
 * Create an instance of ApiClient and AccessOptions.
 *
 * @param {string} path The target url of KAS to use.
 * @param {number|string} chainId The chain id of network to connect with.
 * @param {string} accessKeyId The access key id.
 * @param {string} secretAccessKey The secret access key.
 * @return {object}
 */
const createClient = function(path, chainId, accessKeyId, secretAccessKey) {
    const client = new RestClient.ApiClient()

    client.basePath = path
    chainId = chainId || DEFAULT_CHAIN_ID
    client.authentications.auth.username = accessKeyId
    client.authentications.auth.password = secretAccessKey

    const accessOptions = new AccessOptions(accessKeyId, secretAccessKey, chainId)

    return { client, accessOptions }
}

/**
 * Create an instance of Date.
 *
 * @param {number|string|Date} date The date to format.
 * @return {Date}
 */
const formatDate = function(date) {
    let dte = date
    const invalidDateError = `Invalid date format. You should use a timestamp or date string (i.e. 'yy-mm-dd', 'yy-mm-dd hh:mm', 'yy-mm-dd hh:mm:ss', or 'yy-mm-dd hh:mm:ss:sss')`
    if (_.isString(dte)) {
        const convertToNumber = Number(dte)
        if (isNaN(convertToNumber)) {
            if (utils.isHex(dte) || dte.split('-').length !== 3) throw new Error(invalidDateError)

            if (dte.split(':').length < 2) {
                dte = `${dte.replace(' ', '')} 00:00:00`
            }
        } else {
            dte = convertToNumber
        }
    }

    if (_.isNumber(dte) && dte.toString().length < 13) {
        dte *= 1000
    }

    dte = new Date(dte)

    if (dte.toString() === 'Invalid Date') throw new Error(invalidDateError)

    return dte
}

/**
 * Format object key without underscore.
 *
 * @param {object} obj The object to format
 * @return {object}
 */
const formatObjectKeyWithoutUnderscore = function(obj) {
    if (!_.isObject(obj)) return obj
    if (_.isArray(obj)) {
        const arr = []
        for (const o of obj) {
            arr.push(formatObjectKeyWithoutUnderscore(o))
        }
        return arr
    }

    const keys = Object.keys(obj)
    const ret = {}
    for (const key of keys) {
        const formattedKey = key.startsWith('_') ? key.slice(1) : key

        ret[formattedKey] = formatObjectKeyWithoutUnderscore(obj[key])
    }

    return ret
}

/**
 * Format uncompressed public key with 04 prefix.
 * If public key is compressed format, return without precessing.
 *
 * @param {string} pub The public key to format.
 * @return {string}
 */
const addUncompressedPublickeyPrefix = function(pub) {
    if (utils.isCompressedPublicKey(pub)) return pub

    let stripped = pub.replace('0x', '')
    if (stripped.length === 128) stripped = `04${stripped}`

    return `0x${stripped}`
}

/**
 * Format uncompressed public key in accountKey with 04 prefix.
 *
 * @param {object} accountKey The account key to format.
 * @return {object}
 */
const formatAccountKey = function(accountKey) {
    if (accountKey.keyType === 1 || accountKey.keyType === 3) return accountKey

    switch (accountKey.keyType) {
        case 2:
            accountKey.key = addUncompressedPublickeyPrefix(accountKey.key)
            break
        case 4:
            for (let i = 0; i < accountKey.key.weightedKeys.length; i++) {
                accountKey.key.weightedKeys[i].publicKey = addUncompressedPublickeyPrefix(accountKey.key.weightedKeys[i].publicKey)
            }
            break
        case 5:
            for (let i = 0; i < accountKey.key.length; i++) {
                accountKey.key[i] = formatAccountKey(accountKey.key[i])
            }
            break

        default:
            throw new Error(`Invalid accountKey`)
    }

    return accountKey
}

module.exports = {
    createClient,
    formatDate,
    formatObjectKeyWithoutUnderscore,
    addUncompressedPublickeyPrefix,
    formatAccountKey,

    DEFAULT_CHAIN_ID,
}
