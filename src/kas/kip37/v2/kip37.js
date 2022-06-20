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

const _ = require('lodash')
const utils = require('caver-js').utils

const {
    Kip37ContractTransferRequest,
    RenounceKIP37Request,
    Kip37ContractDeleteResponse,
    Kip37ContractApiV2,
    Kip37DeployerApiV2,
    Kip37TokenApiV2,
    Kip37TokenOwnershipApiV2,
} = require('../../../rest-client/src/')
const KIP37QueryOptions = require('../kip37QueryOptions')
const KIP37FeePayerOptions = require('../kip37FeePayerOptions')
const { checkTypeAndConvertForIdsAndAmounts } = require('../../../utils/helper')

const NOT_INIT_API_ERR_MSG = `KIP37 API is not initialized. Use 'caver.initKIP37API' function to initialize KIP37 API.`

/**
 * A warpping class that connects KIP37 API.
 * @class
 */
class KIP37 {
    /**
     * Creates an instance of KIP37 api.
     * @constructor
     * @param {ApiClient} client - The Api client to use to connect with KAS.
     * @param {AccessOptions} accessOptions - An instance of AccessOptions including `chainId`, `accessKeyId` and `secretAccessKey`.
     */
    constructor(client, accessOptions) {
        this.accessOptions = accessOptions

        this.apiInstances = {}

        if (client) {
            this.apiInstances = {
                kip37Contract: new Kip37ContractApiV2(client),
                deployer: new Kip37DeployerApiV2(client),
                token: new Kip37TokenApiV2(client),
                tokenOwnership: new Kip37TokenOwnershipApiV2(client),
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
        return this.apiInstances.kip37Contract.apiClient
    }

    set client(client) {
        this.apiInstances = {
            kip37Contract: new Kip37ContractApiV2(client),
            deployer: new Kip37DeployerApiV2(client),
            token: new Kip37TokenApiV2(client),
            tokenOwnership: new Kip37TokenOwnershipApiV2(client),
        }
    }

    /**
     * @type {Kip37ContractApiV2}
     */
    get kip37ContractApi() {
        return this.apiInstances.kip37Contract
    }

    /**
     * @type {Kip37DeployerApiV2}
     */
    get deployerApi() {
        return this.apiInstances.deployer
    }

    /**
     * @type {Kip37TokenApiV2}
     */
    get tokenApi() {
        return this.apiInstances.token
    }

    /**
     * @type {Kip37TokenOwnershipApiV2}
     */
    get tokenOwnershipApi() {
        return this.apiInstances.tokenOwnership
    }

    /**
     * Deploys KIP-37 token contract with a Klaytn account in KAS. <br>
     * POST /v2/contract
     *
     * @example
     * const ret = await caver.kas.kip37.deploy('https://caver.example/id/{id}.json', 'alice-alias')
     *
     * @param {string} uri The URI for all token types, by relying on the {@link http://kips.klaytn.com/KIPs/kip-37#metadata|token type ID substitution mechanism}.
     * @param {string} alias The alias of KIP-37 token. Your `alias` must only contain lowercase alphabets, numbers and hyphens and begin with an alphabet.
     * @param {KIP37FeePayerOptions|object} [options] Options for paying the transaction fee.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37DeployResponse}
     */
    deploy(uri, alias, options, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(uri)) throw new Error(`The uri of KIP-37 token contract should be string type.`)
        if (!_.isString(alias)) throw new Error(`The alias of KIP-37 token contract should be string type.`)

        if (_.isFunction(options)) {
            callback = options
            options = {}
        }

        const opts = { body: { uri, alias, options: KIP37FeePayerOptions.constructFromObject(options || {}) } }

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.deployContract(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Imports a contract that has already been deployed. <br>
     * POST /v2/contract/import
     *
     * @example
     * const ret = await caver.kas.kip37.importContract('0x{address in hex}', 'https://caver.example/id/{id}.json', 'alice-alias')
     *
     * @param {string} address The contract address to import to the KAS KIP-37 API service.
     * @param {string} uri The URI for all token types, by relying on the {@link http://kips.klaytn.com/KIPs/kip-37#metadata|token type ID substitution mechanism}.
     * @param {string} alias The alias of KIP-37 token. Your `alias` must only contain lowercase alphabets, numbers and hyphens and begin with an alphabet.
     * @param {KIP37FeePayerOptions|object} [options] Options for paying the transaction fee.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37Contract}
     */
    importContract(address, uri, alias, options, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(address)) throw new Error(`Invalid address: ${address}`)
        if (!_.isString(uri)) throw new Error(`The uri of KIP-37 token contract should be string type.`)
        if (!_.isString(alias)) throw new Error(`The alias of KIP-37 token contract should be string type.`)

        if (_.isFunction(options)) {
            callback = options
            options = {}
        }

        const opts = { body: { address, uri, alias, options: KIP37FeePayerOptions.constructFromObject(options || {}) } }

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.importContract(this.chainId, opts, (err, data, response) => {
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
     * PUT /v2/contract/{contract-address-or-alias}
     *
     * @example
     * const ret = await caver.kas.kip37.updateContractOptions('0x{address in hex}', { enableGlobalFeePayer: true })
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {KIP37FeePayerOptions|object} [options] Options for paying the transaction fee.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37Contract}
     */
    updateContractOptions(addressOrAlias, options, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        if (_.isFunction(options)) {
            callback = options
            options = {}
        }

        const opts = { body: { options: KIP37FeePayerOptions.constructFromObject(options || {}) } }

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.putContract(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves KIP-37 contract information by either contract address or alias. <br>
     * GET /v2/contract/{contract-address-or-alias}
     *
     * @example
     * // with contract address
     * const ret = await caver.kas.kip37.getContract('0x{address in hex}')
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.getContract('alice-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37Contract}
     */
    getContract(addressOrAlias, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.getContract(addressOrAlias, this.chainId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Searches the list of deployed KIP-37 contracts using the Klaytn account in KAS. <br>
     * GET /v2/contract
     *
     * @example
     * // without query parameter
     * const ret = await caver.kas.kip37.getContractList()
     *
     * // with query parameter
     * const ret = await caver.kas.kip37.getContractList({
     *     size: 1,
     *     cursor: 'eyJjc...',
     *     status: caver.kas.kip37.queryOptions.status.ALL
     * })
     *
     * @param {KIP37QueryOptions} [queryOptions] Filters required when retrieving data. `size`, `cursor` and `status`.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37ContractListResponse}
     */
    getContractList(queryOptions, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = KIP37QueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor', 'status']))
            throw new Error(`Invalid query options: 'size', 'cursor' and 'status' can be used.`)

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.listContractsInDeployerPool(this.chainId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Returns a list of tokens owned by a certain account. <br>
     * GET /v2/contract/{contract-address-or-alias}/owner/{owner-address}/token
     *
     * @example
     * // without query parameter
     * const ret = await caver.kas.kip37.getTokenListByOwner('0x{contract address}', '0x{owner address}')
     *
     * // with query parameter
     * const ret = await caver.kas.kip37.getTokenListByOwner('alice-alias', '0x{owner address}', {
     *     size: 1,
     *     cursor: 'eyJjc...',
     * })
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} owner Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {KIP37QueryOptions} [queryOptions] Filters required when retrieving data. `size` and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TokenListResponse}
     */
    getTokenListByOwner(addressOrAlias, owner, queryOptions, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)
        if (!utils.isAddress(owner)) throw new Error(`Invalid owner address: ${owner}.`)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = KIP37QueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size' and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenOwnershipApi.getTokensByOwner(addressOrAlias, owner, this.chainId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Grants/Removes Authorization for Token Transfers. <br>
     * Grants/cancels authorization to a third party (`to`) to transfer all tokens for a specified contract. <br>
     * POST /v2/contract/{contract-address-or-alias}/approveall
     *
     * @example
     * const from = '0x{address in hex}'
     * const to = '0x{address in hex}'
     *
     * // with contract address
     * const ret = await caver.kas.kip37.setApprovalForAll('0x{contract address}', from, to, true)
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.setApprovalForAll('alice-alias', from, to, true)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} from The Klaytn account address of the owner.
     * @param {string} to The Klaytn account address to be authrorized for token transfer.
     * @param {string} [approved] Authorization granted/cancelled. The default value is `true`.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TransactionStatusResponse}
     */
    setApprovalForAll(addressOrAlias, from, to, approved, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)
        if (!utils.isAddress(from)) throw new Error(`Invalid from address: ${from}.`)
        if (!utils.isAddress(to)) throw new Error(`Invalid to address: ${to}.`)

        if (_.isFunction(approved)) {
            callback = approved
            approved = true
        }

        const opts = { body: { from, to, approved } }

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.approveAll(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Pauses all operations for a specified contract, such as minting, transfering tokens. <br>
     * You can resume using {@link KIP37#unpause|caver.kas.kip37.unpause}. <br>
     * POST /v2/contract/{contract-address-or-alias}/pause
     *
     * @example
     * // with contract address
     * const ret = await caver.kas.kip37.pause('0x{contract address}')
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.pause('alice-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [pauser] Account to execute token operations such as pause and resume. The default value is the account that deployed the contract.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TransactionStatusResponse}
     */
    pause(addressOrAlias, pauser, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        if (_.isFunction(pauser)) {
            callback = pauser
            pauser = undefined
        }
        if (pauser && !utils.isAddress(pauser)) throw new Error(`Invalid address: ${pauser}`)

        const opts = { body: { sender: pauser } }

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.pauseContract(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Resumes the operations for a paused contract.<br>
     * POST /v2/contract/{contract-address-or-alias}/unpause
     *
     * @example
     * // with contract address
     * const ret = await caver.kas.kip37.unpause('0x{contract address}')
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.unpause('alice-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [pauser] Account to execute token operations such as pause and resume. The default value is the account that deployed the contract.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TransactionStatusResponse}
     */
    unpause(addressOrAlias, pauser, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        if (_.isFunction(pauser)) {
            callback = pauser
            pauser = undefined
        }
        if (pauser && !utils.isAddress(pauser)) throw new Error(`Invalid address: ${pauser}`)

        const opts = { body: { sender: pauser } }

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.unpauseContract(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Pause the operations of a specified token, such as minting and creating tokens. <br>
     * You can resume using {@link KIP37#unpauseToken|caver.kas.kip37.unpauseToken}. <br>
     * POST /v2/contract/{contract-address-or-alias}/token/pause/{token-id}
     *
     * @example
     * const tokenId = 1
     *
     * // with contract address
     * const ret = await caver.kas.kip37.pauseToken('0x{contract address}', tokenId)
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.pauseToken('alice-alias', tokenId, '0x{address in hex}')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string|number} tokenId ID of the token to pause.
     * @param {string} [pauser] Account to execute token operations such as pause and resume. The default value is the account that deployed the contract.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TransactionStatusResponse}
     */
    pauseToken(addressOrAlias, tokenId, pauser, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        if (_.isFunction(pauser)) {
            callback = pauser
            pauser = undefined
        }
        if (pauser && !utils.isAddress(pauser)) throw new Error(`Invalid address: ${pauser}`)

        if (!_.isString(tokenId) && !_.isNumber(tokenId)) throw new Error(`The token Id should be hexadecimal string or number type.`)

        tokenId = utils.toHex(tokenId)
        const opts = { body: { sender: pauser } }

        return new Promise((resolve, reject) => {
            this.tokenApi.pauseToken(addressOrAlias, tokenId, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Resume paused token operations for a given contract.<br>
     * POST /v2/contract/{contract-address-or-alias}/token/unpause/{token-id}
     *
     * @example
     * // with contract address
     * const ret = await caver.kas.kip37.unpauseToken('0x{contract address}')
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.unpauseToken('alice-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string|number} tokenId ID of the token to resume.
     * @param {string} [pauser] Account to execute token operations such as pause and resume. The default value is the account that deployed the contract.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TransactionStatusResponse}
     */
    unpauseToken(addressOrAlias, tokenId, pauser, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        if (_.isFunction(pauser)) {
            callback = pauser
            pauser = undefined
        }
        if (pauser && !utils.isAddress(pauser)) throw new Error(`Invalid address: ${pauser}`)

        if (!_.isString(tokenId) && !_.isNumber(tokenId)) throw new Error(`The token Id should be hexadecimal string or number type.`)

        tokenId = utils.toHex(tokenId)
        const opts = { body: { sender: pauser } }

        return new Promise((resolve, reject) => {
            this.tokenApi.unpauseToken(addressOrAlias, tokenId, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Creates a new token from a specified KIP-37 contract. <br>
     * POST /v2/contract/{contract-address-or-alias}/token
     *
     * @example
     * const sender = '0x{address in hex}'
     * const id = '0x1'
     * const initialSupply = '0x100'
     * const uri = 'https://token-cdn-domain/1.json'
     *
     * // with contract address
     * const ret = await caver.kas.kip37.create('0x{contract address}', id, initialSupply, uri)
     * const ret = await caver.kas.kip37.create('0x{contract address}', id, initialSupply, uri, sender)
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.create('alice-alias', id, initialSupply, uri)
     * const ret = await caver.kas.kip37.create('alice-alias', id, initialSupply, uri, sender)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string|number} id ID of the new token; cannot use an existing one.
     * @param {string|number|BigNumber} initialSupply Initial supply of the token.
     * @param {string} uri Token URI.
     * @param {string} [sender] The Klaytn account address to mint the token. The default value is the address that deployed the contract.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TransactionStatusResponse}
     */
    create(addressOrAlias, id, initialSupply, uri, sender, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        if (_.isFunction(sender)) {
            callback = sender
            sender = undefined
        }

        if (!_.isString(id) && !_.isNumber(id)) throw new Error(`The token Id should be hexadecimal string or number type.`)
        if (
            !_.isNumber(initialSupply) &&
            !utils.isBigNumber(initialSupply) &&
            (!_.isString(initialSupply) || !utils.isHex(initialSupply))
        ) {
            throw new Error(`The initialSupply should be hex string, number or BigNumber type.`)
        }
        if (!_.isString(uri)) throw new Error(`The uri of KIP-37 token contract should be string type.`)
        if (sender && !utils.isAddress(sender)) throw new Error(`Invalid sender address: ${sender}.`)

        id = utils.toHex(id)
        initialSupply = utils.toHex(initialSupply)

        const opts = {
            body: { id, initialSupply, uri, sender },
        }

        return new Promise((resolve, reject) => {
            this.tokenApi.createToken(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Returns a list of KIP-37 tokens. <br>
     * GET /v2/contract/{contract-address-or-alias}/token
     *
     * @example
     * // without query parameter
     * const ret = await caver.kas.kip37.getTokenList('0x{contract address}')
     *
     * // with query parameter
     * const ret = await caver.kas.kip37.getTokenList('alice-alias', {
     *     size: 1,
     *     cursor: 'eyJjc...',
     * })
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {KIP37QueryOptions} [queryOptions] Filters required when retrieving data. `size` and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TokenInfoListResponse}
     */
    getTokenList(addressOrAlias, queryOptions, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = KIP37QueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size' and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenApi.getTokens(addressOrAlias, this.chainId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Burns KIP-37 tokens. <br>
     * DELETE /v2/contract/{contract-address-or-alias}/token
     *
     * @example
     * const from = '0x{address in hex}'
     * const ids = [ 0, 1, 2 ]
     * const amounts = [ 10, 20, 30 ]
     *
     * // with contract address
     * const ret = await caver.kas.kip37.burn('0x{contract address}', ids, amounts)
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.burn('alice-alias', ids, amounts, from)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string|number|Array.<string|number>} ids IDs of the token to burn.
     * @param {string|number|BigNumber|Array.<string|number|BigNumber>} amounts Number of the token to burn.
     * @param {string} [from] The owner of the token or the Klaytn account address authorized to burn. The default value is the address that deployed the contract.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TransactionStatusResponse}
     */
    burn(addressOrAlias, ids, amounts, from, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(from)) {
            callback = from
            from = undefined
        }

        if (from && !utils.isAddress(from)) throw new Error(`Invalid from address: ${from}.`)

        const converted = checkTypeAndConvertForIdsAndAmounts(ids, amounts) // Check if ids, amounts converting are applied well
        ids = converted.ids
        amounts = converted.amounts

        const opts = {
            body: { from, ids, amounts },
        }

        return new Promise((resolve, reject) => {
            this.tokenApi.burnToken(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Mints multiple tokens for a given KIP-37 contract. <br>
     * Minting is possible after having created a token with {@link KIP37#create|caver.kct.kip37.create}. <br>
     * POST /v2/contract/{contract-address-or-alias}/token/mint
     *
     * @example
     * const from = '0x{address in hex}'
     * const to = '0x{address in hex}'
     * const ids = [ 0, 1, 2 ]
     * const amounts = [ 10, 20, 30 ]
     *
     * // with contract address
     * const ret = await caver.kas.kip37.mint('0x{contract address}', to, ids, amounts)
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.mint('alice-alias', to, ids, amounts, from)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} to The Klaytn account address of the token owner.
     * @param {string|number|Array.<string|number>} ids Array of the new token IDs.
     * @param {string|number|BigNumber|Array.<string|number|BigNumber>} amounts Array of the new token supplies.
     * @param {string} [sender] The Klaytn account address to mint tokens. The default value is the address that deployed the contract.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TransactionStatusResponse}
     */
    mint(addressOrAlias, to, ids, amounts, sender, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(sender)) {
            callback = sender
            sender = undefined
        }

        if (!utils.isAddress(to)) throw new Error(`Invalid to address: ${to}.`)
        if (sender && !utils.isAddress(sender)) throw new Error(`Invalid sender address: ${sender}.`)

        const converted = checkTypeAndConvertForIdsAndAmounts(ids, amounts) // Check if ids, amounts converting are applied well
        ids = converted.ids
        amounts = converted.amounts

        const opts = {
            body: { to, sender, ids, amounts },
        }

        return new Promise((resolve, reject) => {
            this.tokenApi.mintToken(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Sends multiple tokens for a given KIP-37 contract. <br>
     * POST /v2/contract/{contract-address-or-alias}/token/transfer
     *
     * @example
     * const sender = '0x{address in hex}'
     * const owner = '0x{address in hex}'
     * const to = '0x{address in hex}'
     * const ids = [ 0, 1, 2 ]
     * const amounts = [ 10, 20, 30 ]
     *
     * // with contract address
     * const ret = await caver.kas.kip37.transfer('0x{contract address}', sender, owner, to, ids, amounts)
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.transfer('alice-alias', sender, owner, to, ids, amounts)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} sender The Klaytn account address to send the tokens.
     * @param {string} owner The Klaytn account address that owns the tokens.
     * @param {string} to The Klaytn account address to receive the tokens.
     * @param {string|number|Array.<string|number>} ids Array of IDs of the tokens to send.
     * @param {string|number|BigNumber|Array.<string|number|BigNumber>} amounts Array of the tokens to send.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37TransactionStatusResponse}
     */
    transfer(addressOrAlias, sender, owner, to, ids, amounts, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(sender)) {
            callback = sender
            sender = undefined
        }

        if (!utils.isAddress(to)) throw new Error(`Invalid to address: ${to}.`)
        if (sender && !utils.isAddress(sender)) throw new Error(`Invalid sender address: ${sender}.`)

        const converted = checkTypeAndConvertForIdsAndAmounts(ids, amounts) // Check if ids, amounts converting are applied well
        ids = converted.ids
        amounts = converted.amounts

        const opts = {
            body: { to, sender, ids, amounts, owner },
        }

        return new Promise((resolve, reject) => {
            this.tokenApi.transferToken(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Queries the account that deploys and manages the KIP-37 contracts. <br>
     * GET /v2/deployer/default
     *
     * @example
     * const ret = await caver.kas.kip37.getDeployer()
     *
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37DeployerResponse}
     */
    getDeployer(callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.deployerApi.getDefaultDeployer(this.chainId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Transfers the ownership of the contract.<br/>
     * PUT /v2/contract/{contract-address-or-alias}/owner/transfer
     *
     * @example
     * const owner = '0x661e2075de14d267c0f141e917a76871d3b299ad'
     * const sender = '0x0c12a8f720f721cb3879217ee45709c2345c8446'
     *
     * // without sender
     * const ret = await caver.kas.kip37.transferOwnership('alice-alias', owner)
     *
     * // with sender
     * const ret = await caver.kas.kip37.transferOwnership('0x{address in hex}', owner, sender)
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string} owner The contract address (hexadecimal, starting with 0x)
     * @param {string} [sender] The address of the owner who owns the contract. If nothing is entered, The address of the deployer who created this contract will fill this value.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37ContractTransferResponse}
     */
    transferOwnership(addressOrAlias, owner, sender, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 contract should be string type.`)
        if (!_.isString(owner) && !utils.isAddress(owner)) throw new Error(`Invalid address format: ${owner}`)

        if (sender !== undefined && _.isFunction(sender)) {
            callback = sender
            sender = ''
        }

        const opts = {
            body: Kip37ContractTransferRequest.constructFromObject({ owner, sender }),
        }

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.transferOwnership(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Returns the owner of a specified KIP-37 contract. You can use either the contract alias or contract address. <br>
     * GET /v2/contract/{contract-address-or-alias}/owner
     * @example
     *
     * const ret = await caver.kas.kip37.getContractOwner('0x{contract-address}' )
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {Function} [callback] The callback function to call.
     * @return {GetOwnerKip37TokensResponse}
     */
    getContractOwner(addressOrAlias, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.owner(this.chainId, addressOrAlias, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Renounce the ownership of the contract. You can access the contract to be transferred using either the contract alias or contract address. <br>
     * If `from` is not entered, The address of the deployer who created this contract will fill this value. <br>
     * DELETE /v2/contract/{contract-address-or-alias}/owner
     * @example
     *
     * const from = '0xa809284C83b901eD106Aba4Ccda14628Af128e14'
     *
     * // with contract address and from in hex
     * const ret = await caver.kas.kip37.renounceOwnership('0x{address in hex}', from)
     *
     * // with contract alias
     * const ret = await caver.kas.kip37.renounceOwnership('alice-alias')
     *
     * @param {string} addressOrAlias The contract address (hexadecimal, starting with 0x) or alias.
     * @param {string} [from] The address of the owner who is to give up the contract ownership. If nothing is entered, The address of the deployer who created this contract will fill this value.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip37ContractDeleteResponse}
     */
    renounceOwnership(addressOrAlias, from, callback) {
        if (!this.accessOptions || !this.kip37ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-37 token contract should be string type.`)

        if (from !== undefined) {
            if (_.isFunction(from)) {
                callback = from
                from = ''
            } else if (!utils.isAddress(from)) throw new Error(`Invalid address format: ${from}`)
        }

        const opts = {
            body: RenounceKIP37Request.constructFromObject({ from }),
        }

        return new Promise((resolve, reject) => {
            this.kip37ContractApi.renounceContract(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }
}

module.exports = KIP37
