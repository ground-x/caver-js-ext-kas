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
    ApproveKip7TokenRequest,
    BurnFromKip7TokenRequest,
    BurnKip7TokenRequest,
    DeployKip7ContractRequest,
    MintKip7TokenRequest,
    TransferKip7TokenFromRequest,
    TransferKip7TokenRequest,
    KIP7DeployerApi,
    KIP7Api,
} = require('../../rest-client/src')
const KIP7QueryOptions = require('./kip7QueryOptions')

const NOT_INIT_API_ERR_MSG = `KIP7 API is not initialized. Use 'caver.initKIP7API' function to initialize KIP7 API.`

/**
 * A warpping class that connects KIP7 API.
 * @class
 */
class KIP7 {
    /**
     * Creates an instance of KIP7 api.
     * @constructor
     * @param {ApiClient} client - The Api client to use to connect with KAS.
     * @param {AccessOptions} accessOptions - An instance of AccessOptions including `chainId`, `accessKeyId` and `secretAccessKey`.
     */
    constructor(client, accessOptions) {
        this.accessOptions = accessOptions

        this.apiInstances = {}

        if (client) {
            this.apiInstances = {
                kip7: new KIP7Api(client),
                deployer: new KIP7DeployerApi(client),
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
        return this.apiInstances.kip7.apiClient
    }

    set client(client) {
        this.apiInstances = {
            kip7: new KIP7Api(client),
            deployer: new KIP7DeployerApi(client),
        }
    }

    /**
     * @type {KIP7Api}
     */
    get kip7Api() {
        return this.apiInstances.kip7
    }

    /**
     * @type {KIP7DeployerApi}
     */
    get deployerApi() {
        return this.apiInstances.deployer
    }

    /**
     * Deploy KIP-7 token contract with a Klaytn account in KAS. <br>
     * POST /v1/contract
     *
     * @example
     * const ret = await caver.kas.kip7.deploy('Jasmine', 'JAS', 18, '1000000000000000000', 'jasmine-alias')
     *
     * @param {string} name The name of KIP-7 token.
     * @param {string} symbol The symbol of KIP-7 token.
     * @param {number} decimals The number of decimal places the token uses.
     * @param {string|number|BigNumber} initialSupply The total amount of token to be supplied initially.
     * @param {string} alias The alias of KIP-7 token. Your `alias` must only contain lowercase alphabets, numbers and hyphens and begin with an alphabet.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    deploy(name, symbol, decimals, initialSupply, alias, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(name) || !_.isString(symbol)) throw new Error(`The name and symbol of KIP-7 token contract should be string type.`)
        if (!_.isNumber(decimals)) throw new Error(`The decimals of KIP-7 token contract should be number type.`)
        if (!_.isString(alias)) throw new Error(`The alias of KIP-7 token contract should be string type.`)
        if (
            !_.isNumber(initialSupply) &&
            !utils.isBigNumber(initialSupply) &&
            (!_.isString(initialSupply) || !utils.isHex(initialSupply))
        ) {
            throw new Error(`The initialSupply of KIP-7 token contract should be hex string, number or BigNumber type.`)
        }

        initialSupply = utils.toHex(initialSupply)

        const opts = {
            body: DeployKip7ContractRequest.constructFromObject({ name, symbol, decimals, initialSupply, alias }),
        }

        return new Promise((resolve, reject) => {
            this.kip7Api.deployContract(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves KIP-7 contract information by either contract address or alias. <br>
     * GET /v1/contract/{contract-address-or-alias}
     *
     * @example
     * // with contract address
     * const ret = await caver.kas.kip7.getContract('0x{address in hex}')
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.getContract('jasmine-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7ContractMetadataResponse}
     */
    getContract(addressOrAlias, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-7 token contract should be string type.`)

        return new Promise((resolve, reject) => {
            this.kip7Api.getContract(this.chainId, addressOrAlias, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Search the list of deployed KIP-7 contracts using the Klaytn account in KAS. <br>
     * GET /v1/contract
     *
     * @example
     * // without query parameter
     * const ret = await caver.kas.kip7.getContractList()
     *
     * // with query parameter
     * const ret = await caver.kas.kip7.getContractList({
     *     size: 1,
     *     cursor: 'eyJjc...',
     *     status: caver.kas.kip7.queryOptions.status.ALL
     * })
     *
     * @param {KIP7QueryOptions} [queryOptions] Filters required when retrieving data. `size`, `cursor` and `status`.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7ContractListResponse}
     */
    getContractList(queryOptions, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = KIP7QueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor', 'status']))
            throw new Error(`Invalid query options: 'size', 'cursor' and 'status' can be used.`)

        return new Promise((resolve, reject) => {
            this.kip7Api.listContractsInDeployerPool(this.chainId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Shows the amount of tokens approved to the `spender` by the `owner`. <br>
     * GET /v1/contract/{contract-address-or-alias}/account/{owner}/allowance/{spender}
     *
     * @example
     * const owner = '0x{address in hex}'
     * const spender = '0x{address in hex}'
     *
     * // with contract address
     * const ret = await caver.kas.kip7.allowance('0x{contract address}', owner, spender)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.allowance('jasmine-alias', owner, spender)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} owner Token owner's Klaytn account address.
     * @param {string} spender Klaytn account address to search the amount of tokens approved by the owner.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TokenBalanceResponse}
     */
    allowance(addressOrAlias, owner, spender, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-7 token contract should be string type.`)
        if (!utils.isAddress(owner)) throw new Error(`Invalid owner address: ${owner}.`)
        if (!utils.isAddress(spender)) throw new Error(`Invalid spender address: ${spender}.`)

        return new Promise((resolve, reject) => {
            this.kip7Api.getTokenAllowance(this.chainId, addressOrAlias, owner, spender, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Shows the `{owner}`'s balance for the given KIP-7 contract. <br>
     * GET /v1/contract/{contract-address-or-alias}/account/{owner}/balance
     *
     * @example
     * const owner = '0x{address in hex}'
     *
     * // with contract address
     * const ret = await caver.kas.kip7.allowance('0x{contract address}', owner)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.allowance('jasmine-alias', owner)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} owner Token owner's Klaytn account address.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TokenBalanceResponse}
     */
    balance(addressOrAlias, owner, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-7 token contract should be string type.`)
        if (!utils.isAddress(owner)) throw new Error(`Invalid owner address: ${owner}.`)

        return new Promise((resolve, reject) => {
            this.kip7Api.getTokenBalance(this.chainId, addressOrAlias, owner, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Authorizes the `spender` to send a certain amount of tokens on behalf of the `owner`. <br>
     * POST /v1/contract/{contract-address-or-alias}/approve
     *
     * @example
     * const owner = '0x{address in hex}'
     * const spender = '0x{address in hex}'
     *
     * // with contract address
     * const ret = await caver.kas.kip7.approve('0x{contract address}', owner, spender, 10)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.approve('jasmine-alias', owner, spender, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [owner] Klaytn account address of the owner delegating the token tranfer. The default is the contract deployer account.
     * @param {string} spender Klaytn account address to approve delegated token transfer.
     * @param {string|number|BigNumber} amount Klaytn account address to approve delegated token transfer.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    approve(addressOrAlias, owner, spender, amount, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(owner)) throw new Error(`Invalid owner address: ${owner}.`)
        if (!utils.isAddress(spender)) throw new Error(`Invalid spender address: ${spender}.`)
        if (!_.isNumber(amount) && !utils.isBigNumber(amount) && (!_.isString(amount) || !utils.isHex(amount))) {
            throw new Error(`The amount should be hex string, number or BigNumber type.`)
        }

        amount = utils.toHex(amount)

        const opts = {
            body: ApproveKip7TokenRequest.constructFromObject({ owner, spender, amount }),
        }

        return new Promise((resolve, reject) => {
            this.kip7Api.approveToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Sends tokens of the contract. <br>
     * POST /v1/contract/{contract-address-or-alias}/transfer
     *
     * @example
     * const from = '0x{address in hex}'
     * const to = '0x{address in hex}'
     *
     * // with contract address
     * const ret = await caver.kas.kip7.transfer('0x{contract address}', from, to, 10)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.transfer('jasmine-alias', from, to, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [from] Token owner's Klaytn account address. The default value is the contract deployer account.
     * @param {string} to Klaytn account address to receive tokens.
     * @param {string|number|BigNumber} amount Transfer amount.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    transfer(addressOrAlias, from, to, amount, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)

        // If amount is a function, it means that the from parameter is omitted.
        if (_.isFunction(amount)) {
            callback = amount
            amount = to
            to = from
            from = undefined
        }

        if (from && !utils.isAddress(from)) throw new Error(`Invalid from address: ${from}.`)
        if (!utils.isAddress(to)) throw new Error(`Invalid to address: ${to}.`)
        if (!_.isNumber(amount) && !utils.isBigNumber(amount) && (!_.isString(amount) || !utils.isHex(amount))) {
            throw new Error(`The amount should be hex string, number or BigNumber type.`)
        }

        amount = utils.toHex(amount)

        const opts = {
            body: TransferKip7TokenRequest.constructFromObject({ from, to, amount }),
        }

        return new Promise((resolve, reject) => {
            this.kip7Api.transferToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Sends tokens on behalf of the owner. <br>
     * You need to approve token transfers via [caver.kas.kip7.approve]{@link KIP7#approve}. <br>
     * POST /v1/contract/{contract-address-or-alias}/transfer-from
     *
     * @example
     * const spender = '0x{address in hex}'
     * const owner = '0x{address in hex}'
     * const to = '0x{address in hex}'
     *
     * // with contract address
     * const ret = await caver.kas.kip7.transferFrom('0x{contract address}', spender, owner, to, 10)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.transferFrom('jasmine-alias', spender, owner, to, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} spender Klaytn account address to send tokens by delegated token.
     * @param {string} owner Klaytn account address of the owner delegating the token transfer.
     * @param {string} to Klaytn account address to receive tokens.
     * @param {string|number|BigNumber} amount Transfer amount.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    transferFrom(addressOrAlias, spender, owner, to, amount, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(spender)) throw new Error(`Invalid spender address: ${spender}.`)
        if (!utils.isAddress(owner)) throw new Error(`Invalid owner address: ${owner}.`)
        if (!utils.isAddress(to)) throw new Error(`Invalid to address: ${to}.`)
        if (!_.isNumber(amount) && !utils.isBigNumber(amount) && (!_.isString(amount) || !utils.isHex(amount))) {
            throw new Error(`The amount should be hex string, number or BigNumber type.`)
        }

        amount = utils.toHex(amount)

        const opts = {
            body: TransferKip7TokenFromRequest.constructFromObject({ spender, owner, to, amount }),
        }

        return new Promise((resolve, reject) => {
            this.kip7Api.transferFromToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Mints a new token for a given user. <br>
     * POST /v1/contract/{contract-address-or-alias}/mint
     *
     * @example
     * const to = '0x{address in hex}'
     *
     * // with contract address
     * const ret = await caver.kas.kip7.mint('0x{contract address}', to, 10)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.mint('jasmine-alias', to, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} to Klaytn account address to receive the newly created token.
     * @param {string|number|BigNumber} amount Amount of tokens to create.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    mint(addressOrAlias, to, amount, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(to)) throw new Error(`Invalid to address: ${to}.`)
        if (!_.isNumber(amount) && !utils.isBigNumber(amount) && (!_.isString(amount) || !utils.isHex(amount))) {
            throw new Error(`The amount should be hex string, number or BigNumber type.`)
        }

        amount = utils.toHex(amount)

        const opts = {
            body: MintKip7TokenRequest.constructFromObject({ to, amount }),
        }

        return new Promise((resolve, reject) => {
            this.kip7Api.mintToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Burns tokens. <br>
     * POST /v1/contract/{contract-address-or-alias}/burn
     *
     * @example
     * const from = '0x{address in hex}'
     *
     * // with contract address
     * const ret = await caver.kas.kip7.burn('0x{contract address}', from, 10)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.burn('jasmine-alias', from, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [from] Klaytn account address on which the tokens will be burned. The default value is the contract deployer account.
     * @param {string|number|BigNumber} amount The amount of tokens to burn.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    burn(addressOrAlias, from, amount, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)

        // If amount is a function, it means that the from parameter is omitted.
        if (_.isFunction(amount)) {
            callback = amount
            amount = from
            from = undefined
        }

        if (from && !utils.isAddress(from)) throw new Error(`Invalid from address: ${from}.`)
        if (!_.isNumber(amount) && !utils.isBigNumber(amount) && (!_.isString(amount) || !utils.isHex(amount))) {
            throw new Error(`The amount should be hex string, number or BigNumber type.`)
        }

        amount = utils.toHex(amount)

        const opts = {
            body: BurnKip7TokenRequest.constructFromObject({ from, amount }),
        }

        return new Promise((resolve, reject) => {
            this.kip7Api.burnToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * `spender` burns `owner`'s tokens on the `owner`'s behalf. <br>
     * POST /v1/contract/{contract-address-or-alias}/burn-from
     *
     * @example
     * const spender = '0x{address in hex}'
     * const owner = '0x{address in hex}'
     *
     * // with contract address
     * const ret = await caver.kas.kip7.burnFrom('0x{contract address}', spender, owner, 10)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.burnFrom('jasmine-alias', spender, owner, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} spender Klaytn account address on which the tokens will be burned.
     * @param {string} owner Klaytn account address of the owner of the tokens to be burned.
     * @param {string|number|BigNumber} amount The amount of tokens to burn.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    burnFrom(addressOrAlias, spender, owner, amount, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(spender)) throw new Error(`Invalid spender address: ${spender}.`)
        if (!utils.isAddress(owner)) throw new Error(`Invalid owner address: ${owner}.`)
        if (!_.isNumber(amount) && !utils.isBigNumber(amount) && (!_.isString(amount) || !utils.isHex(amount))) {
            throw new Error(`The amount should be hex string, number or BigNumber type.`)
        }

        amount = utils.toHex(amount)

        const opts = {
            body: BurnFromKip7TokenRequest.constructFromObject({ spender, owner, amount }),
        }

        return new Promise((resolve, reject) => {
            this.kip7Api.burnFromToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Pauses all token transfers and validations for a given contract. <br>
     * POST /v1/contract/{contract-address-or-alias}/pause
     *
     * @example
     * // with contract address
     * const ret = await caver.kas.kip7.pause('0x{contract address}')
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.pause('jasmine-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    pause(addressOrAlias, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.kip7Api.pauseContract(this.chainId, addressOrAlias, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Resumes token transfers and validations for a given contract. <br>
     * POST /v1/contract/{contract-address-or-alias}/unpause
     *
     * @example
     * // with contract address
     * const ret = await caver.kas.kip7.unpause('0x{contract address}')
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.unpause('jasmine-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    unpause(addressOrAlias, callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.kip7Api.unpauseContract(this.chainId, addressOrAlias, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Queries the account that deploys and manages the KIP-7 contracts. <br>
     * GET /v1/deployer/default
     *
     * @example
     * const ret = await caver.kas.kip7.getDeployer()
     *
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7DeployerResponse}
     */
    getDeployer(callback) {
        if (!this.accessOptions || !this.kip7Api) throw new Error(NOT_INIT_API_ERR_MSG)

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
}

module.exports = KIP7
