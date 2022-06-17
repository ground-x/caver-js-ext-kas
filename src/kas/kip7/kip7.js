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
    Kip7DeployerApi,
    Kip7ContractApi,
    Kip7TokenApi,
} = require('../../rest-client/src')
const KIP7QueryOptions = require('./kip7QueryOptions')
const KIP7FeePayerOptions = require('./kip7FeePayerOptions')

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
                kip7Contract: new Kip7ContractApi(client),
                kip7Token: new Kip7TokenApi(client),
                deployer: new Kip7DeployerApi(client),
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
        return this.apiInstances.kip7Contract.apiClient
    }

    set client(client) {
        this.apiInstances = {
            kip7Contract: new Kip7ContractApi(client),
            kip7Token: new Kip7TokenApi(client),
            deployer: new Kip7DeployerApi(client),
        }
    }

    /**
     * @type {Kip7ContractApi}
     */
    get kip7ContractApi() {
        return this.apiInstances.kip7Contract
    }

    /**
     * @type {Kip7TokenApi}
     */
    get kip7TokenApi() {
        return this.apiInstances.kip7Token
    }

    /**
     * @type {Kip7DeployerApi}
     */
    get deployerApi() {
        return this.apiInstances.deployer
    }

    /**
     * Deploy KIP-7 token contract with a Klaytn account in KAS. <br>
     * POST /v1/contract
     *
     * @example
     * const ret = await caver.kas.kip7.deploy('Alice', 'ALI', 18, '1000000000000000000', 'alice-alias')
     *
     * @param {string} name The name of KIP-7 token.
     * @param {string} symbol The symbol of KIP-7 token.
     * @param {number} decimals The number of decimal places the token uses.
     * @param {string|number|BigNumber} initialSupply The total amount of token to be supplied initially.
     * @param {string} alias The alias of KIP-7 token. Your `alias` must only contain lowercase alphabets, numbers and hyphens and begin with an alphabet.
     * @param {KIP7FeePayerOptions|object} [options] Options for paying the transaction fee.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7DeployResponse}
     */
    deploy(name, symbol, decimals, initialSupply, alias, options, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
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

        if (_.isFunction(options)) {
            callback = options
            options = {}
        }

        const opts = {
            body: DeployKip7ContractRequest.constructFromObject({
                name,
                symbol,
                decimals,
                initialSupply,
                alias,
                options: KIP7FeePayerOptions.constructFromObject(options || {}),
            }),
        }

        return new Promise((resolve, reject) => {
            this.kip7ContractApi.deployContract(this.chainId, opts, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.updateContractOptions('0x{address in hex}', { enableGlobalFeePayer: true })
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {KIP7FeePayerOptions|object} [options] Options for paying the transaction fee.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7ContractMetadataResponse}
     */
    updateContractOptions(addressOrAlias, options, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-7 token contract should be string type.`)

        if (_.isFunction(options)) {
            callback = options
            options = {}
        }

        const opts = { body: { options: KIP7FeePayerOptions.constructFromObject(options || {}) } }

        return new Promise((resolve, reject) => {
            this.kip7ContractApi.updateContract(this.chainId, addressOrAlias, opts, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.getContract('alice-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7ContractMetadataResponse}
     */
    getContract(addressOrAlias, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-7 token contract should be string type.`)

        return new Promise((resolve, reject) => {
            this.kip7ContractApi.getContract(this.chainId, addressOrAlias, (err, data, response) => {
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
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = KIP7QueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor', 'status']))
            throw new Error(`Invalid query options: 'size', 'cursor' and 'status' can be used.`)

        return new Promise((resolve, reject) => {
            this.kip7ContractApi.listContractsInDeployerPool(this.chainId, queryOptions, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.allowance('alice-alias', owner, spender)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} owner Token owner's Klaytn account address.
     * @param {string} spender Klaytn account address to search the amount of tokens approved by the owner.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TokenBalanceResponse}
     */
    allowance(addressOrAlias, owner, spender, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-7 token contract should be string type.`)
        if (!utils.isAddress(owner)) throw new Error(`Invalid owner address: ${owner}.`)
        if (!utils.isAddress(spender)) throw new Error(`Invalid spender address: ${spender}.`)

        return new Promise((resolve, reject) => {
            this.kip7TokenApi.getTokenAllowance(this.chainId, addressOrAlias, owner, spender, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.allowance('alice-alias', owner)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} owner Token owner's Klaytn account address.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TokenBalanceResponse}
     */
    balance(addressOrAlias, owner, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(addressOrAlias)) throw new Error(`The address and alias of KIP-7 token contract should be string type.`)
        if (!utils.isAddress(owner)) throw new Error(`Invalid owner address: ${owner}.`)

        return new Promise((resolve, reject) => {
            this.kip7TokenApi.getTokenBalance(this.chainId, addressOrAlias, owner, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.approve('alice-alias', owner, spender, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [owner] Klaytn account address of the owner delegating the token tranfer. The default is the contract deployer account.
     * @param {string} spender Klaytn account address to approve delegated token transfer.
     * @param {string|number|BigNumber} amount Klaytn account address to approve delegated token transfer.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    approve(addressOrAlias, owner, spender, amount, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
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
            this.kip7TokenApi.approveToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.transfer('alice-alias', from, to, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [from] Token owner's Klaytn account address. The default value is the contract deployer account.
     * @param {string} to Klaytn account address to receive tokens.
     * @param {string|number|BigNumber} amount Transfer amount.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    transfer(addressOrAlias, from, to, amount, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

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
            this.kip7TokenApi.transferToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.transferFrom('alice-alias', spender, owner, to, '0x1')
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
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
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
            this.kip7TokenApi.transferFromToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.mint('alice-alias', to, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} to Klaytn account address to receive the newly created token.
     * @param {string|number|BigNumber} amount Amount of tokens to create.
     * @param {string} [minter] The Klaytn account address to mint the tokens. The default value is the `deployer`'s account.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    mint(addressOrAlias, to, amount, minter, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(to)) throw new Error(`Invalid to address: ${to}.`)
        if (!_.isNumber(amount) && !utils.isBigNumber(amount) && (!_.isString(amount) || !utils.isHex(amount))) {
            throw new Error(`The amount should be hex string, number or BigNumber type.`)
        }

        amount = utils.toHex(amount)

        if (_.isFunction(minter)) {
            callback = minter
            minter = undefined
        }
        const opts = {
            body: MintKip7TokenRequest.constructFromObject({ to, amount, from: minter }),
        }

        return new Promise((resolve, reject) => {
            this.kip7TokenApi.mintToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.burn('alice-alias', from, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [from] Klaytn account address on which the tokens will be burned. The default value is the contract deployer account.
     * @param {string|number|BigNumber} amount The amount of tokens to burn.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    burn(addressOrAlias, from, amount, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

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
            this.kip7TokenApi.burnToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.burnFrom('alice-alias', spender, owner, '0x1')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} spender Klaytn account address on which the tokens will be burned.
     * @param {string} owner Klaytn account address of the owner of the tokens to be burned.
     * @param {string|number|BigNumber} amount The amount of tokens to burn.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    burnFrom(addressOrAlias, spender, owner, amount, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
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
            this.kip7TokenApi.burnFromToken(this.chainId, addressOrAlias, opts, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.pause('alice-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [pauser] The Klaytn account address whose authority to send contracts will be removed. The default value is the `deployer`'s address.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    pause(addressOrAlias, pauser, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(pauser)) {
            callback = pauser
            pauser = undefined
        }
        if (pauser && !utils.isAddress(pauser)) throw new Error(`Invalid address: ${pauser}`)
        const opts = { body: { pauser: pauser || '' } }

        return new Promise((resolve, reject) => {
            this.kip7ContractApi.pauseContract(this.chainId, addressOrAlias, opts, (err, data, response) => {
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
     * const ret = await caver.kas.kip7.unpause('alice-alias')
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} [pauser] The Klaytn account address whose authority to send contracts will be removed. The default value is the `deployer`'s address.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    unpause(addressOrAlias, pauser, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(pauser)) {
            callback = pauser
            pauser = undefined
        }
        if (pauser && !utils.isAddress(pauser)) throw new Error(`Invalid address: ${pauser}`)
        const opts = { body: { pauser: pauser || '' } }

        return new Promise((resolve, reject) => {
            this.kip7ContractApi.unpauseContract(this.chainId, addressOrAlias, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Grants a specified account the authority to mint and burn tokens from a contract. <br>
     * You can remove the authority by using {@link KIP7#renounceMinter|caver.kas.kip7.renonuceMinter}. <br>
     * POST v1/contract/{contract-address-or-alias}/minter
     *
     * @example
     * const minterToBe = '0x{addree in hex}'
     * const minter = '0x{minter address}' // should have authority to mint
     *
     * // with contract address
     * const ret = await caver.kas.kip7.addMinter('0x{address in hex}', minterToBe)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.addMinter('alice-alias', minterToBe, minter)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} accountToBeMinter The Klaytn account address to be granted authority to mint and burn tokens.
     * @param {string} [minter] The Klaytn account address that grants authority to mint and burn a token. The default value is the `deployer`'s address'.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    addMinter(addressOrAlias, accountToBeMinter, minter, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(accountToBeMinter)) throw new Error(`Invalid address: ${accountToBeMinter}`)

        if (_.isFunction(minter)) {
            callback = minter
            minter = undefined
        }
        if (minter && !utils.isAddress(minter)) throw new Error(`Invalid address: ${minter}`)

        const opts = { body: { minter: accountToBeMinter, sender: minter } }

        return new Promise((resolve, reject) => {
            this.kip7TokenApi.addMinter(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Removes the authority granted to a specifed account to mint and burn tokens from a contract. <br>
     * The address whose authority to mint and burn tokens will be removed. <br>
     * DELETE v1/contract/{contract-address-or-alias}/minter
     *
     * @example
     * const minter = '0x{minter address}' // should have authority to mint
     *
     * // with contract address
     * const ret = await caver.kas.kip7.addMinter('0x{address in hex}', minter)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.addMinter('alice-alias', minter)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} minter Klaytn account address that grants authority to mint and burn a token. The default value is the `deployer`'s address'.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    renounceMinter(addressOrAlias, minter, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(minter)) throw new Error(`Invalid address: ${minter}`)

        return new Promise((resolve, reject) => {
            this.kip7TokenApi.renounceMinter(addressOrAlias, minter, this.chainId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Grants a specified account the authority to pause the actions of a contract. <br>
     * The actions of a contract here refer to sending tokens and sending tokens on the owner's behalf. <br>
     * To remove the authority, use {@link KIP7#renouncePauser|caver.kas.kip7.renouncePauser}. <br>
     * POST v1/contract/{contract-address-or-alias}/pauser
     *
     * @example
     * const pauserToBe = '0x{addree in hex}'
     * const pauser = '0x{pauser address}' // should have authority to pause
     *
     * // with contract address
     * const ret = await caver.kas.kip7.addPauser('0x{address in hex}', pauserToBe)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.addPauser('alice-alias', pauserToBe, pauser)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} accountToBePauser The Klaytn account address to be granted authority to send and pause a contract.
     * @param {string} [pauser] The Klaytn account address that grants to be granted authority to send and pause a contract. The default value is the `deployer`'s address.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    addPauser(addressOrAlias, accountToBePauser, pauser, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(accountToBePauser)) throw new Error(`Invalid address: ${accountToBePauser}`)

        if (_.isFunction(pauser)) {
            callback = pauser
            pauser = undefined
        }
        if (pauser && !utils.isAddress(pauser)) throw new Error(`Invalid address: ${pauser}`)

        const opts = { body: { pauser: accountToBePauser, sender: pauser } }

        return new Promise((resolve, reject) => {
            this.kip7ContractApi.addPauser(addressOrAlias, this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Removes the authority given to a certain account to pause the actions of specified contract. <br>
     * The actions of a contract here refer to sending tokens and sending tokens on the owner's behalf. <br>
     * DELETE /v1/contract/{contract-address-or-alias}/pauser/{pauser-address}
     *
     * @example
     * const pauser = '0x{pauser address}' // should have authority to pause
     *
     * // with contract address
     * const ret = await caver.kas.kip7.renouncePauser('0x{address in hex}', pauser)
     *
     * // with contract alias
     * const ret = await caver.kas.kip7.renouncePauser('alice-alias', pauser)
     *
     * @param {string} addressOrAlias Contract address (in hexadecimal with the 0x prefix) or an alias.
     * @param {string} pauser Klaytn account address that grants authority to mint and burn a token. The default value is the `deployer`'s address'.
     * @param {Function} [callback] The callback function to call.
     * @return {Kip7TransactionStatusResponse}
     */
    renouncePauser(addressOrAlias, pauser, callback) {
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(pauser)) throw new Error(`Invalid address: ${pauser}`)

        return new Promise((resolve, reject) => {
            this.kip7ContractApi.renouncePauser(addressOrAlias, pauser, this.chainId, (err, data, response) => {
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
        if (!this.accessOptions || !this.kip7ContractApi) throw new Error(NOT_INIT_API_ERR_MSG)

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
