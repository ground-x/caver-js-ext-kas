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

const {
    Kip17ContractApi,
    Kip17TokenApi,
    DeployKip17ContractRequest,
    MintKip17TokenRequest,
    TransferKip17TokenRequest,
    BurnKip17TokenRequest,
    ApproveKip17TokenRequest,
    ApproveAllKip17Request,
} = require('../../../rest-client/src')
const KIP17QueryOptions = require('../kip17QueryOptions')
const KIP17FeePayerOptions = require('../kip17FeePayerOptions')

const NOT_INIT_API_ERR_MSG = `KIP17 API is not initialized. Use 'caver.initKIP17API' function to initialize KIP17 API.`

/**
 * A warpping class that connects KIP17 API.
 * @class
 */
class KIP17 {
    /**
     * Creates an instance of KIP17 api.
     * @constructor
     * @param {ApiClient} client - The Api client to use to connect with KAS.
     * @param {AccessOptions} accessOptions - An instance of AccessOptions including `chainId`, `accessKeyId` and `secretAccessKey`.
     */
    constructor(client, accessOptions) {
        this.accessOptions = accessOptions

        this.apiInstances = {}

        if (client) {
            this.apiInstances = {
                kip17Contract: new Kip17ContractApi(client),
                token: new Kip17TokenApi(client),
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
        return this.apiInstances.kip17.apiClient
    }

    set client(client) {
        this.apiInstances = {
            kip17Contract: new Kip17ContractApi(client),
            token: new Kip17TokenApi(client),
        }
    }

    /**
     * @type {Kip17ContractApi}
     */
    get kip17ContractApi() {
        return this.apiInstances.kip17Contract
    }

    /**
     * @type {Kip17TokenApi}
     */
    get tokenApi() {
        return this.apiInstances.token
    }

    /**
     * Deploy KIP-17 token contract with a Klaytn account in KAS. <br>
     * POST /v1/contract
     * @example
     * const ret = await caver.kas.kip17.deploy('Alice', 'ALI', 'alice-alias')
     *
     * @param {string} name The name of KIP-17 token.
     * @param {string} symbol The symbol of KIP-17 token.
     * @param {string} alias The alias of KIP-17 token. Your `alias` must only contain lowercase alphabets, numbers and hyphens and begin with an alphabet.
     * @param {KIP17FeePayerOptions|object} [options] Options for paying the transaction fee.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip17DeployResponse}
     */
    deploy(name, symbol, alias, options, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(name) || !_.isString(symbol)) throw new Error(`The name and symbol of KIP-17 token contract should be string type.`)
        if (!_.isString(alias)) throw new Error(`The alias of KIP-17 token contract should be string type.`)

        if (_.isFunction(options)) {
            callback = options
            options = {}
        }

        const opts = {
            body: DeployKip17ContractRequest.constructFromObject({
                name,
                symbol,
                alias,
                options: KIP17FeePayerOptions.constructFromObject(options || {}),
            }),
        }

        return new Promise((resolve, reject) => {
            this.kip17ContractApi.deployContract(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Edits the information of a contract. <br>
     * PUT /v1/contract/{contract-address-or-alias}
     *
     * @example
     * const ret = await caver.kas.kip17.updateContractOptions('0x{address in hex}', { enableGlobalFeePayer: true })
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {KIP17FeePayerOptions|object} [options] Options for paying the transaction fee.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip17ContractInfoResponse}
     */
    updateContractOptions(addressOrAlias, options, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)

        if (_.isFunction(options)) {
            callback = options
            options = {}
        }

        const opts = { body: { options: KIP17FeePayerOptions.constructFromObject(options || {}) } }

        return new Promise((resolve, reject) => {
            this.kip17ContractApi.updateContract(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Search the list of deployed KIP-17 contracts using the Klaytn account in KAS. <br>
     * GET /v1/contract
     * @example
     * // without query parameter
     * const ret = await caver.kas.kip17.getContractList()
     *
     * // with query parameter
     * const ret = await caver.kas.kip17.getContractList({ size: 1, cursor: 'eyJjc...' })
     *
     * @param {KIP17QueryOptions} [queryOptions] Filters required when retrieving data. `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip17ContractListResponse}
     */
    getContractList(queryOptions, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = KIP17QueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.kip17ContractApi.listContractsInDeployerPool(this.chainId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves KIP-17 contract information by either contract address or alias. <br>
     * GET /v1/contract/{contract-address-or-alias}
     * @example
     * // with contract address
     * const ret = await caver.kas.kip17.getContract('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16')
     *
     * // with contract alias
     * const ret = await caver.kas.kip17.getContract('alice-alias')
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip17ContractInfoResponse}
     */
    getContract(addressOrAlias, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)

        return new Promise((resolve, reject) => {
            this.kip17ContractApi.getContract(this.chainId, addressOrAlias, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Mints a new token on the requested KIP-17 contract. The target contract can be requested by either contract address or alias.<br>
     * POST /v1/contract/{contract-address-or-alias}/token
     * @example
     * // with contract address and token id in hex
     * const ret = await caver.kas.kip17.mint('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16', '0x6650d7f9bfb13561a37b15707b486f103f3a15cd', '0x1', 'uri')
     *
     * // with contract alias and token id in number
     * const ret = await caver.kas.kip17.mint('alice-alias', '0x6650d7f9bfb13561a37b15707b486f103f3a15cd', 1, 'uri string')
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string} to The address of recipient EOA account for the newly minted token.
     * @param {string|number} tokenId The token ID for the newly minted token. This cannot be overlapped with an existing ID.
     * @param {string} tokenURI The token URI for the newly minted token.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip17TransactionStatusResponse}
     */
    mint(addressOrAlias, to, tokenId, tokenURI, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)
        if (!utils.isAddress(to)) throw new Error(`Invalid address format: ${to}`)
        if (!_.isString(tokenURI)) throw new Error(`The token URI should be string type.`)
        if (!_.isString(tokenId) && !_.isNumber(tokenId)) throw new Error(`The token Id should be hexadecimal string or number type.`)

        tokenId = utils.toHex(tokenId)

        const opts = {
            body: MintKip17TokenRequest.constructFromObject({ to, uri: tokenURI, id: tokenId }),
        }

        return new Promise((resolve, reject) => {
            this.tokenApi.mintToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Return all tokens minted from a particular KIP-17 contract. <br>
     * GET /v1/contract/{contract-address-or-alias}/token
     * @example
     * // with contract address and without query parameter
     * const ret = await caver.kas.kip17.getTokenList('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16')
     *
     * // with contract alias and query parameter
     * const ret = await caver.kas.kip17.getTokenList('alice-alias', { size: 1, cursor: 'eyJjc...' })
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {KIP17QueryOptions} [queryOptions] Filters required when retrieving data. `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {ListKip17TokensResponse}
     */
    getTokenList(addressOrAlias, queryOptions, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = KIP17QueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenApi.listTokens(this.chainId, addressOrAlias, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves the requested token information of a parcitular KIP-17 contract. <br>
     * GET /v1/contract/{contract-address-or-alias}/token/{token-id}
     * @example
     * // with contract address and token id in hex
     * const ret = await caver.kas.kip17.getToken('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16', '0x1')
     *
     * // with contract alias and token id in number
     * const ret = await caver.kas.kip17.getToken('alice-alias', 1)
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string|number} tokenId The token ID to retreive.
     * @param {Function} [callback] The callback function to call.
     * @return {GetKip17TokenResponse}
     */
    getToken(addressOrAlias, tokenId, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)
        if (!_.isString(tokenId) && !_.isNumber(tokenId)) throw new Error(`The token Id should be hexadecimal string or number type.`)

        tokenId = utils.toHex(tokenId)

        return new Promise((resolve, reject) => {
            this.tokenApi.getToken(this.chainId, addressOrAlias, tokenId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Transfers a token. If `sender` and `owner` are not the same, then `sender` must have been approved for this token transfer. <br>
     * POST /v1/contract/{contract-address-or-alias}/token/{token-id}
     * @example
     * const sender = '0x6650d7f9bfb13561a37b15707b486f103f3a15cd'
     * const owner = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
     * const to = '0x661e2075de14d267c0f141e917a76871d3b299ad'
     *
     * // with contract address and token id in hex
     * const ret = await caver.kas.kip17.transfer('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16', sender, owner, to, '0x1')
     *
     * // with contract alias and token id in number
     * const ret = await caver.kas.kip17.transfer('alice-alias', sender, owner, to, 1)
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string} sender The address of the account sending the transaction to transfer the token. The sender must be the owner of the token or have been approved by the owner for the token to be transfered.
     * @param {string} owner The address of the account that owns the token.
     * @param {string} to The address of account to receive tokens.
     * @param {string|number} tokenId The token ID to transfer.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip17TransactionStatusResponse}
     */
    transfer(addressOrAlias, sender, owner, to, tokenId, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)
        if (!_.isString(tokenId) && !_.isNumber(tokenId)) throw new Error(`The token Id should be hexadecimal string or number type.`)
        if (!utils.isAddress(sender)) throw new Error(`Invalid address format: ${sender}`)
        if (!utils.isAddress(owner)) throw new Error(`Invalid address format: ${owner}`)
        if (!utils.isAddress(to)) throw new Error(`Invalid address format: ${to}`)

        tokenId = utils.toHex(tokenId)

        const opts = {
            body: TransferKip17TokenRequest.constructFromObject({ sender, owner, to }),
        }

        return new Promise((resolve, reject) => {
            this.tokenApi.transferToken(this.chainId, addressOrAlias, tokenId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Burns a token. If `from` is not the owner or has been approved for this operation, then the transaction submitted from this API will be reverted. <br>
     * DELETE /v1/contract/{contract-address-or-alias}/token/{token-id}
     * @example
     * const from = '0x661e2075de14d267c0f141e917a76871d3b299ad'
     *
     * // with contract address and token id in hex
     * const ret = await caver.kas.kip17.burn('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16', from, '0x1')
     *
     * // with contract alias and token id in number
     * const ret = await caver.kas.kip17.burn('alice-alias', from, 1)
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string} from The address of sender or owner. If the from that burns the token is not the owner, the sender that sends the transaction to burn the token must have been approved by the owner.
     * @param {string|number} tokenId The token ID to burn.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip17TransactionStatusResponse}
     */
    burn(addressOrAlias, from, tokenId, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)
        if (!_.isString(tokenId) && !_.isNumber(tokenId)) throw new Error(`The token Id should be hexadecimal string or number type.`)
        if (!utils.isAddress(from)) throw new Error(`Invalid address format: ${from}`)

        tokenId = utils.toHex(tokenId)

        const opts = {
            body: BurnKip17TokenRequest.constructFromObject({ from }),
        }

        return new Promise((resolve, reject) => {
            this.tokenApi.burnToken(this.chainId, addressOrAlias, tokenId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Approves an EOA, `to`, to perform token operations on a particular token of a contract which `from` owns. <br>
     * If `from` is not the owner, then the transaction submitted from this API will be reverted. <br>
     * POST /v1/contract/{contract-address-or-alias}/approve/{token-id}
     * @example
     * const from = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
     * const to = '0x661e2075de14d267c0f141e917a76871d3b299ad'
     *
     * // with contract address and token id in hex
     * const ret = await caver.kas.kip17.approve('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16', from, to, '0x1')
     *
     * // with contract alias and token id in number
     * const ret = await caver.kas.kip17.approve('alice-alias', from, to, 1)
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string} from The address of owner.
     * @param {string} to The address of EOA to be approved.
     * @param {string|number} tokenId The token ID to approve.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip17TransactionStatusResponse}
     */
    approve(addressOrAlias, from, to, tokenId, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)
        if (!_.isString(tokenId) && !_.isNumber(tokenId)) throw new Error(`The token Id should be hexadecimal string or number type.`)
        if (!utils.isAddress(from)) throw new Error(`Invalid address format: ${from}`)
        if (!utils.isAddress(to)) throw new Error(`Invalid address format: ${to}`)

        tokenId = utils.toHex(tokenId)

        const opts = {
            body: ApproveKip17TokenRequest.constructFromObject({ from, to }),
        }

        return new Promise((resolve, reject) => {
            this.tokenApi.approveToken(this.chainId, addressOrAlias, tokenId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Approves an EOA, `to`, to perform token operations on all token of a contract which `from` owns. <br>
     * POST /v1/contract/{contract-address-or-alias}/approveall
     * @example
     * const from = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
     * const to = '0x661e2075de14d267c0f141e917a76871d3b299ad'
     *
     * // with contract address
     * const ret = await caver.kas.kip17.approveAll('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16', from, to, true)
     *
     * // with contract alias
     * const ret = await caver.kas.kip17.approveAll('alice-alias', from, to, true)
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string} from The address of owner.
     * @param {string} to The address of EOA to be approved.
     * @param {boolean} approved A boolean value to set; true for approval, false for revocation.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip17TransactionStatusResponse}
     */
    approveAll(addressOrAlias, from, to, approved, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)
        if (!utils.isAddress(from)) throw new Error(`Invalid address format: ${from}`)
        if (!utils.isAddress(to)) throw new Error(`Invalid address format: ${to}`)

        const opts = {
            body: ApproveAllKip17Request.constructFromObject({ from, to, approved }),
        }

        return new Promise((resolve, reject) => {
            this.tokenApi.approveAll(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Lists all tokens of the same owner (`owner-address`) of a contract. <br>
     * GET /v1/contract/{contract-address-or-alias}/owner/{owner-address}
     * @example
     * const owner = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
     *
     * // without query parameter
     * const ret = await caver.kas.kip17.getTokenListByOwner('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16', owner)
     *
     * // with query parameter
     * const ret = await caver.kas.kip17.getTokenListByOwner('alice-alias', owner, { size: 1, cursor: 'eyJjc...' })
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string} owner The address of owner.
     * @param {KIP17QueryOptions} [queryOptions] Filters required when retrieving data. `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {GetOwnerKip17TokensResponse}
     */
    getTokenListByOwner(addressOrAlias, owner, queryOptions, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = KIP17QueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenApi.getOwnerTokens(this.chainId, addressOrAlias, owner, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Lists token transfer histories starting from the time the requested token was minted, where each entry of the response items shows a transfer record. <br>
     * GET /v1/contract/{contract-address-or-alias}/token/{token-id}/history
     * @example
     * // with token id in hex and without query parameter
     * const ret = await caver.kas.kip17.getContractList('0x9ad4163329aa90eaf52a27ac8f5e7981becebc16', '0x1')
     *
     * // with token id in number and query parameter
     * const ret = await caver.kas.kip17.getContractList('alice-alias', 1, { size: 1, cursor: 'eyJjc...' })
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string|number} tokenId The token ID to search transfer history.
     * @param {KIP17QueryOptions} [queryOptions] Filters required when retrieving data. `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {GetKip17TokenHistoryResponse}
     */
    getTransferHistory(addressOrAlias, tokenId, queryOptions, callback) {
        if (!this.accessOptions || !this.kip17ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-17 token contract should be string type.`)
        if (!_.isString(tokenId) && !_.isNumber(tokenId)) throw new Error(`The token Id should be hexadecimal string or number type.`)

        tokenId = utils.toHex(tokenId)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = KIP17QueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenApi.getTokenHistory(this.chainId, addressOrAlias, tokenId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }
}

module.exports = KIP17
