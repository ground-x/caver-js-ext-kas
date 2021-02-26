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
    AccountApi,
    BasicTransactionApi,
    FeeDelegatedTransactionPaidByKASApi,
    FeeDelegatedTransactionPaidByUserApi,
    MultisigTransactionManagementApi,
    KeyApi,
    RegistrationApi,
    StatisticsApi,
    MultisigAccountUpdateRequest,
    LegacyTransactionRequest,
    ValueTransferTransactionRequest,
    ContractDeployTransactionRequest,
    ContractExecutionTransactionRequest,
    CancelTransactionRequest,
    AnchorTransactionRequest,
    ProcessRLPRequest,
    AccountUpdateTransactionRequest,
    FDValueTransferTransactionRequest,
    FDContractDeployTransactionRequest,
    FDContractExecutionTransactionRequest,
    FDCancelTransactionRequest,
    FDAnchorTransactionRequest,
    FDProcessRLPRequest,
    FDAccountUpdateTransactionRequest,
    FDUserValueTransferTransactionRequest,
    FDUserContractDeployTransactionRequest,
    FDUserContractExecutionTransactionRequest,
    FDUserCancelTransactionRequest,
    FDUserAnchorTransactionRequest,
    FDUserProcessRLPRequest,
    FDUserAccountUpdateTransactionRequest,
    SignPendingTransactionBySigRequest,
    AccountRegistration,
    AccountRegistrationRequest,
    Key,
    KeyCreationRequest,
    KeyCreationResponse,
    ContractCallRequest,
} = require('../../rest-client/src')
const WalletQueryOptions = require('./walletQueryOptions')
const { formatObjectKeyWithoutUnderscore, addUncompressedPublickeyPrefix, formatAccountKey } = require('../../utils/helper')

const NOT_INIT_API_ERR_MSG = `Wallet API is not initialized. Use 'caver.initWalletAPI' function to initialize Wallet API.`
const INCORRECT_MIGRATE_ACCOUNTS = `You must pass a list of accounts as an argument.`

/**
 * A warpping class that connects Wallet API.
 * @class
 */
class Wallet {
    /**
     * Creates an instance of token history api.
     * @constructor
     * @param {ApiClient} client - The Api client to use to connect with KAS.
     * @param {AccessOptions} accessOptions - An instance of AccessOptions including `chainId`, `accessKeyId` and `secretAccessKey`.
     */
    constructor(client, accessOptions) {
        this.accessOptions = accessOptions

        this.apiInstances = {}

        if (client) {
            this.apiInstances = {
                account: new AccountApi(client),
                basicTransaction: new BasicTransactionApi(client),
                fdTransactionPaidByKAS: new FeeDelegatedTransactionPaidByKASApi(client),
                fdTransactionPaidByUser: new FeeDelegatedTransactionPaidByUserApi(client),
                multisigTransactionManagement: new MultisigTransactionManagementApi(client),
                statistics: new StatisticsApi(client),
                key: new KeyApi(client),
                registration: new RegistrationApi(client),
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
        return this.apiInstances.account.apiClient
    }

    set client(client) {
        this.apiInstances = {
            account: new AccountApi(client),
            basicTransaction: new BasicTransactionApi(client),
            fdTransactionPaidByKAS: new FeeDelegatedTransactionPaidByKASApi(client),
            fdTransactionPaidByUser: new FeeDelegatedTransactionPaidByUserApi(client),
            multisigTransactionManagement: new MultisigTransactionManagementApi(client),
            statistics: new StatisticsApi(client),
            key: new KeyApi(client),
            registration: new RegistrationApi(client),
        }
    }

    /**
     * @type {AccountApi}
     */
    get accountApi() {
        return this.apiInstances.account
    }

    /**
     * @type {BasicTransactionApi}
     */
    get basicTransactionApi() {
        return this.apiInstances.basicTransaction
    }

    /**
     * @type {FeeDelegatedTransactionPaidByKASApi}
     */
    get fdTransactionPaidByKASApi() {
        return this.apiInstances.fdTransactionPaidByKAS
    }

    /**
     * @type {FeeDelegatedTransactionPaidByUserApi}
     */
    get fdTransactionPaidByUserApi() {
        return this.apiInstances.fdTransactionPaidByUser
    }

    /**
     * @type {MultisigTransactionManagementApi}
     */
    get multisigTransactionManagementApi() {
        return this.apiInstances.multisigTransactionManagement
    }

    /**
     * @type {StatisticsApi}
     */
    get statisticsApi() {
        return this.apiInstances.statistics
    }

    /**
     * @type {KeyApi}
     */
    get keyApi() {
        return this.apiInstances.key
    }

    /**
     * @type {RegistrationApi}
     */
    get registrationApi() {
        return this.apiInstances.registration
    }

    /**
     * SinglePrivateKey presents a single private key such as account types of a legacy key or public key.
     * @typedef {string} SinglePrivateKey
     */

    /**
     * MutisigPrivateKeys presents a set of private keys of weighted multisig key account type.
     * @typedef {string[]} MultisigPrivateKeys
     */

    /**
     * RoleBasedPrivateKeys presents a set of private keys of role based account type. Additionally, each private key can contains multiple private keys
     * for multisig account type.
     * @typedef {MultisigPrivateKeys[]} RoleBasedPrivateKeys
     */

    /**
     * MigrationAccount presents an account to be migrated. Each account can have one of three types of keys.
     *
     * @typedef {Object} MigrationAccount
     * @property {string} address - Indicates Klaytn's address of an account.
     * @property {number} [nonce] - Indicates nonce for a transaction. If the nonce is not defined, the nonce is automatically filled using the KAS Node API.
     * @property {(SinglePrivateKey|MultisigPrivateKeys|RoleBasedPrivateKeys)} key - Indicates a set of private keys of an account.
     */

    /**
     * Migrates Klaytn accounts to KAS Wallet API. <br>
     * This function needs Node API. Therefore, it is essential to have initialized to use Node API. <br>
     * Node API initialization is possible through [caver.initKASAPI]{@link CaverExtKAS#initKASAPI} or [caver.initNodeAPI]{@link CaverExtKAS#initNodeAPI}. <br>
     *
     * @example
     * const accounts = [
     *      {
     *          address: '0xc756f6809bc34c2458fcb82fb16d5add3dbad9e3',
     *          key: '0x{private key1}',
     *      },
     *      {
     *          address: '0x5bae5e458ad1a9b210bf0a10434c39be1a5b7983',
     *          key: [
     *              '0x{private key2}',
     *              '0x{private key3}',
     *          ],
     *      },
     *      {
     *          address: '0x5bae5e458ad1a9b210bf0a10434c39be1a5b7983',
     *          key: [
     *              [
     *                  '0x{private key4}',
     *                  '0x{private key5}',
     *              ],
     *              [
     *                  '0x{private key6}',
     *              ],
     *              [
     *                  '0x{private key7}',
     *                  '0x{private key8}',
     *              ],
     *          ],
     *      }
     * ]
     * const ret = await caver.kas.wallet.migarateAccounts(accounts)
     *
     * @param {Array.<MigrationAccount>} accounts An array of account objects migrated into KAS.
     * @return {RegistrationStatusResponse}
     */
    async migrateAccounts(accounts) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!Array.isArray(accounts)) throw new Error(INCORRECT_MIGRATE_ACCOUNTS)

        // Request a set of public keys generated by KAS wallet service.
        const keys = await this.createKeys(accounts.length)

        // Define an empty request for account migration.
        const req = []

        for (const account of accounts) {
            const key = keys.items.pop()

            // Create a keyring instance.
            const keyring = this.keyring.create(account.address, account.key)

            // Compose a transaction for fee delegated account update with a public key generated by KAS.
            const updateTx = new this.accountsMigration.feeDelegatedAccountUpdate({
                from: account.address,
                account: this.accountsMigration.createWithAccountKeyPublic(account.address, key.publicKey),
                gas: 1000000,
                chainId: this.chainId,
            })
            if (account.nonce !== undefined) updateTx.nonce = account.nonce

            // Sign the transaction with keyring instance.
            await updateTx.sign(keyring)

            // Append an item for updating the account into the request.
            req.push({
                keyId: key.keyId,
                address: account.address,
                rlp: updateTx.getRLPEncoding(),
            })
        }

        // Call an account registration API with the request containing a set of transaction RLP for updating account.
        // This API will invoke transactions for RLPs if they are included.
        // Otherwise, you can update your Klaytn's account with your own Klaytn node in advance.
        return new Promise((resolve, reject) => {
            this.registrationApi.registerAccount(this.chainId, { body: req }, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        })
    }

    /**
     * Creates Klaytn Account through KAS Wallet API. <br>
     * POST /v2/account
     *
     * @param {Function} [callback] The callback function to call.
     * @return {Account}
     */
    createAccount(callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.accountApi.createAccount(this.chainId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves the list of accounts created using the KAS Wallet API. <br>
     * GET /v2/account
     *
     * @param {WalletQueryOptions} [queryOptions] Filters required when retrieving data. `size`, `cursor`, `fromTimestamp` or `toTimestamp`.
     * @param {Function} [callback] The callback function to call.
     * @return {Accounts}
     */
    getAccountList(queryOptions, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = WalletQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor', 'fromTimestamp', 'toTimestamp', 'status']))
            throw new Error(`Invalid query options: 'size', 'cursor', 'fromTimestamp', 'toTimestamp' or 'status' can be used.`)

        return new Promise((resolve, reject) => {
            this.accountApi.retrieveAccounts(this.chainId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves an account created using the KAS Wallet API. <br>
     * GET /v2/account/{address}
     *
     * @param {string} address The address of Klaytn account.
     * @param {Function} [callback] The callback function to call.
     * @return {Account}
     */
    getAccount(address, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.accountApi.retrieveAccount(this.chainId, address, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves the list of Klaytn accounts with the corresponding public key. <br>
     * GET /v2/pubkey/{public-key}/account
     *
     * @param {string} publicKey The public key to search.
     * @param {Function} [callback] The callback function to call.
     * @return {AccountsByPubkey}
     */
    getAccountListByPublicKey(publicKey, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.accountApi.retrieveAccountsByPubkey(this.chainId, publicKey, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Deletes an account created using the KAS Wallet API. <br>
     * DELETE /v2/account/{address}
     *
     * @param {string} address The address of Klaytn account to delete from KAS Wallet API service.
     * @param {Function} [callback] The callback function to call.
     * @return {AccountStatus}
     */
    deleteAccount(address, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.accountApi.deleteAccount(this.chainId, address, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Deactivates Klaytn Account. <br>
     * PUT /v2/account/{address}/disable
     *
     * @param {string} address The address of Klaytn account to disable from KAS Wallet API service.
     * @param {Function} [callback] The callback function to call.
     * @return {AccountSummary}
     */
    disableAccount(address, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.accountApi.deactivateAccount(this.chainId, address, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Activates Klaytn Account. <br>
     * PUT /v2/account/{address}/enable
     *
     * @param {string} address The address of Klaytn account to enable from KAS Wallet API service.
     * @param {Function} [callback] The callback function to call.
     * @return {AccountSummary}
     */
    enableAccount(address, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.accountApi.activateAccount(this.chainId, address, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Signs the transaction with this transactionId with that Klaytn account. <br>
     * POST /v2/account/{address}/tx/{transaction-id}/sign
     *
     * @param {string} address The address of the Klaytn account you want to use for signing.
     * @param {string} transactionId The ID of the transaction you want to sign.
     * @param {Function} [callback] The callback function to call.
     * @return {Signature}
     */
    signTransaction(address, transactionId, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.accountApi.signTransactionIDResponse(this.chainId, address, transactionId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Signs the transaction with this transactionId with that Klaytn account. <br>
     * PUT /v2/account/{address}/multisig
     *
     * @param {string} address The address of the Klaytn account you want to use for signing.
     * @param {object|AccountKeyWeightedMultiSig} accountKeyWeightedMultiSig The ID of the transaction you want to sign.
     * @param {Function} [callback] The callback function to call.
     * @return {MultisigAccount}
     */
    updateToMultiSigAccount(address, weightedMultiSig, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        // CaverExtKAS class use '_' prefix for private variable
        // so if parameter object has '_' prefix, call formatObjectKeyWithoutUnderscore to format
        const multisig = formatObjectKeyWithoutUnderscore(weightedMultiSig)

        // AccountKeyWeightedMultiSig class has 'weightedPublicKeys' variable
        // Converts 'weightedPublicKeys' to 'weightedKeys'
        if (multisig.weightedPublicKeys !== undefined) {
            multisig.weightedKeys = multisig.weightedPublicKeys
            delete multisig.weightedPublicKeys
        }

        // Add 04 uncompressed public key prefix to public key strings
        for (let i = 0; i < multisig.weightedKeys.length; i++) {
            multisig.weightedKeys[i].publicKey = addUncompressedPublickeyPrefix(multisig.weightedKeys[i].publicKey)
        }

        const opts = {
            body: MultisigAccountUpdateRequest.constructFromObject(multisig),
        }

        return new Promise((resolve, reject) => {
            this.accountApi.multisigAccountUpdate(this.chainId, address, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    // Basic Transaction Api

    /**
     * Create LegacyTransaction. <br>
     * POST /v2/tx/legacy
     *
     * @param {LegacyTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {TransactionResult}
     */
    requestLegacyTransaction(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)

        const opts = {
            body: LegacyTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.legacyTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create ValueTransfer or ValueTransferMemo. <br>
     * POST /v2/tx/value
     *
     * @param {ValueTransferTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {TransactionResult}
     */
    requestValueTransfer(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)

        const opts = {
            body: ValueTransferTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.valueTransferTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create SmartContractDeploy. <br>
     * POST /v2/tx/contract/deploy
     *
     * @param {ContractDeployTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {TransactionResult}
     */
    requestSmartContractDeploy(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)

        const opts = {
            body: ContractDeployTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.contractDeployTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create SmartContractExecution. <br>
     * POST /v2/tx/contract/execute
     *
     * @param {ContractExecutionTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {TransactionResult}
     */
    requestSmartContractExecution(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)

        const opts = {
            body: ContractExecutionTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.contractExecutionTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create Cancel. <br>
     * DELETE /v2/tx
     *
     * @param {CancelTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {TransactionResult}
     */
    requestCancel(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: CancelTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.cancelTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create ChainDataAnchoring. <br>
     * POST /v2/tx/anchor
     *
     * @param {AnchorTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {TransactionResult}
     */
    requestChainDataAnchoring(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: AnchorTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.anchorTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create transaction through RLP-encoded string. <br>
     * POST /v2/tx/rlp
     *
     * @param {ProcessRLPRequest} rlpRequest The object that includes rlp request informations.
     * @param {Function} [callback] The callback function to call.
     * @return {TransactionResult}
     */
    requestRawTransaction(rlpRequest, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (rlpRequest.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: ProcessRLPRequest.constructFromObject(rlpRequest),
        }

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.processRLP(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create AccountUpdate. <br>
     * PUT /v2/tx/account
     *
     * @param {AccountUpdateTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {TransactionResult}
     */
    requestAccountUpdate(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: AccountUpdateTransactionRequest.constructFromObject(transaction),
        }

        // Format accountKey for 04 prefix
        opts.body.accountKey = formatAccountKey(opts.body.accountKey)

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.accountUpdateTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves the transaction by the transaction hash value. <br>
     * GET /v2/tx/{transaction-hash}
     *
     * @param {string} transactionHash The hash of the transaction.
     * @param {Function} [callback] The callback function to call.
     * @return {TransactionReceipt}
     */
    getTransaction(transactionHash, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.transactionReceipt(this.chainId, transactionHash, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Call the contract. You can view certain value in the contract and validate that you can submit executable transaction.<br>
     * POST /v2/tx/contract/call
     * @example
     * const contractAddress = '0x7278841B4300639A8827dc9f8345CC49ef876804'
     *
     * // with send options
     * const sendOptions = {
     *      from: '0x0aFA15F32D1F1283c09d5d2034957A7E79b7ae21',
     *      gas: 300000,
     *      value: 0,
     * }
     * const ret = await caver.kas.wallet.callContract(contractAddress, 'increase', callArguments)
     *
     * // with call arguments
     * const callArguments = [
     *      {
     *          type: 'address',
     *          value: '0x0aFA15F32D1F1283c09d5d2034957A7E79b7ae21',
     *      },
     * ]
     * const ret = await caver.kas.wallet.callContract(contractAddress, 'isMinter', callArguments)
     *
     * // with call arguments and send options
     * const callArguments = [
     *      {
     *          type: 'address',
     *          value: '0x0aFA15F32D1F1283c09d5d2034957A7E79b7ae21',
     *      },
     *      { type: 'uint256', value: 1 }
     * ]
     * const sendOptions = {
     *      from: '0x0aFA15F32D1F1283c09d5d2034957A7E79b7ae21',
     *      gas: 300000,
     *      value: 0,
     * }
     * const ret = await caver.kas.wallet.callContract(contractAddress, 'transfer', callArguments, sendOptions)
     *
     * @param {string} contractAddress The krn string to search.
     * @param {string} methodName The method name to call.
     * @param {Array.<object>} [callArguments] `type` and `value` are defined. The ABI type can be `uint256`, `uint32`, `string`, `bool`, `address`, `uint64[2]` and `address[]`. The value can be `number`, `string`, `array` and `boolean`.
     * @param {object} [sendOptions] `from`, `gas` and `value` can be defined.
     * @param {Function} [callback] The callback function to call.
     * @return {ContractCallResponse}
     */
    callContract(contractAddress, methodName, callArguments, sendOptions, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(sendOptions)) {
            if (callback) {
                if (_.isFunction(callback)) throw new Error(`Invalid sendOptions: ${sendOptions}`)
                throw new Error(`Invalid callback: ${callback}`)
            }
            callback = sendOptions
            sendOptions = undefined
        }
        if (callArguments !== undefined && !_.isArray(callArguments)) {
            if (_.isObject(callArguments) && !sendOptions) {
                sendOptions = callArguments
                callArguments = []
            } else {
                throw new Error(`Invalid callArguments: ${callArguments}`)
            }
        }

        if (!utils.isAddress(contractAddress)) throw new Error(`Invalid contract address: ${contractAddress}`)
        if (!_.isString(methodName)) throw new Error(`Invalid method name: ${methodName}`)

        callArguments = callArguments || []
        sendOptions = sendOptions || {}
        if (sendOptions.value !== undefined) sendOptions.value = utils.toHex(sendOptions.value)

        const obj = Object.assign({ ...sendOptions }, { to: contractAddress, data: { methodName, arguments: callArguments } })
        const body = ContractCallRequest.constructFromObject(obj)
        body.data.arguments = body.data._arguments
        delete body.data._arguments

        return new Promise((resolve, reject) => {
            this.basicTransactionApi.contractCall(this.chainId, { body }, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    // Fee Delegated Transaction Paid by KAS Api

    /**
     * Create FeeDelegatedValueTransfer, FeeDelegatedValueTransferMemo,
     * FeeDelegatedValueTransferWithRatio or FeeDelegatedValueTransferMemoWithRatio. <br>
     * POST /v2/tx/fd/value
     *
     * @param {FDValueTransferTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDValueTransferPaidByGlobalFeePayer(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)

        const opts = {
            body: FDValueTransferTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByKASApi.fDValueTransferTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedSmartContractDeploy. <br>
     * POST /v2/tx/fd/contract/deploy
     *
     * @param {FDContractDeployTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDSmartContractDeployPaidByGlobalFeePayer(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)

        const opts = {
            body: FDContractDeployTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByKASApi.fDContractDeployTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedSmartContractExecution. <br>
     * POST /v2/tx/fd/contract/execute
     *
     * @param {FDContractExecutionTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDSmartContractExecutionPaidByGlobalFeePayer(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)

        const opts = {
            body: FDContractExecutionTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByKASApi.fDContractExecutionTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedCancel. <br>
     * DELETE /v2/tx/fd
     *
     * @param {FDCancelTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDCancelPaidByGlobalFeePayer(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        const opts = {
            body: FDCancelTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByKASApi.fDCancelTransactionResponse(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedChainDataAnchoring. <br>
     * POST /v2/tx/fd/anchor
     *
     * @param {FDAnchorTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDChainDataAnchoringPaidByGlobalFeePayer(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        const opts = {
            body: FDAnchorTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByKASApi.fDAnchorTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create transaction through RLP-encoded string. <br>
     * POST /v2/tx/fd/rlp
     *
     * @param {FDProcessRLPRequest} rlpRequest The object that includes rlp request informations.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDRawTransactionPaidByGlobalFeePayer(rlpRequest, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (rlpRequest.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: FDProcessRLPRequest.constructFromObject(rlpRequest),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByKASApi.fDProcessRLP(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedAccountUpdate. <br>
     * PUT /v2/tx/fd/account
     *
     * @param {FDAccountUpdateTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDAccountUpdatePaidByGlobalFeePayer(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: FDAccountUpdateTransactionRequest.constructFromObject(transaction),
        }

        // Format accountKey for 04 prefix
        opts.body.accountKey = formatAccountKey(opts.body.accountKey)

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByKASApi.fDAccountUpdateTransactionResponse(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    // Fee Delegated Transaction Paid by User Api

    /**
     * Create FeeDelegatedValueTransfer, FeeDelegatedValueTransferMemo,
     * FeeDelegatedValueTransferWithRatio or FeeDelegatedValueTransferMemoWithRatio. <br>
     * POST /v2/tx/fd-user/value
     *
     * @param {FDUserValueTransferTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDValueTransferPaidByUser(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)

        const opts = {
            body: FDUserValueTransferTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByUserApi.uFDValueTransferTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedSmartContractDeploy. <br>
     * POST /v2/tx/fd-user/contract/deploy
     *
     * @param {FDUserContractDeployTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDSmartContractDeployPaidByUser(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)

        const opts = {
            body: FDUserContractDeployTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByUserApi.uFDContractDeployTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedSmartContractExecution. <br>
     * POST /v2/tx/fd-user/contract/execute
     *
     * @param {FDUserContractExecutionTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDSmartContractExecutionPaidByUser(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.value !== undefined) transaction.value = utils.toHex(transaction.value)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: FDUserContractExecutionTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByUserApi.uFDContractExecutionTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedCancel. <br>
     * DELETE /v2/tx/fd-user
     *
     * @param {FDUserCancelTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDCancelPaidByUser(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: FDUserCancelTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByUserApi.uFDUserCancelTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedChainDataAnchoring. <br>
     * POST /v2/tx/fd-user/anchor
     *
     * @param {FDUserAnchorTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDChainDataAnchoringPaidByUser(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: FDUserAnchorTransactionRequest.constructFromObject(transaction),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByUserApi.uFDAnchorTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create transaction through RLP-encoded string. <br>
     * POST /v2/tx/fd-user/rlp
     *
     * @param {FDUserProcessRLPRequest} rlpRequest The object that includes rlp request informations.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDRawTransactionPaidByUser(rlpRequest, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (rlpRequest.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: FDUserProcessRLPRequest.constructFromObject(rlpRequest),
        }

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByUserApi.uFDProcessRLP(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Create FeeDelegatedAccountUpdate. <br>
     * PUT /v2/tx/fd-user/account
     *
     * @param {FDUserAccountUpdateTransactionRequest} transaction Transaction to be requested to KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {FDTransactionResult}
     */
    requestFDAccountUpdatePaidByUser(transaction, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (transaction.nonce !== undefined) transaction.nonce = utils.hexToNumber(transaction.nonce)
        if (transaction.submit === undefined) throw new Error(`'submit' is not defined.`)

        const opts = {
            body: FDUserAccountUpdateTransactionRequest.constructFromObject(transaction),
        }

        // Format accountKey for 04 prefix
        opts.body.accountKey = formatAccountKey(opts.body.accountKey)

        return new Promise((resolve, reject) => {
            this.fdTransactionPaidByUserApi.uFDAccountUpdateTransaction(this.chainId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    // Multisig Transaction Management Api

    /**
     * Retrieves the list of pending transactions among transactions sent from the account. <br>
     * GET /v2/multisig/account/{address}/tx
     *
     * @param {string} address Account address with multi-signature key or signer account address.
     * @param {WalletQueryOptions} [queryOptions] Filters required when retrieving data. `size`, `cursor`, `fromTimestamp` or `toTimestamp`.
     * @param {Function} [callback] The callback function to call.
     * @return {MultisigTransactions}
     */
    getMultiSigTransactionList(address, queryOptions, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = WalletQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor', 'fromTimestamp', 'toTimestamp']))
            throw new Error(`Invalid query options: 'size', 'cursor', 'fromTimestamp' or 'toTimestamp' can be used.`)

        return new Promise((resolve, reject) => {
            this.multisigTransactionManagementApi.retrieveMultisigTransactions(
                this.chainId,
                address,
                queryOptions,
                (err, data, response) => {
                    if (err) {
                        reject(err)
                    }
                    if (callback) callback(err, data, response)
                    resolve(data)
                }
            )
        })
    }

    /**
     * Signs a pending transaction with the Klaytn account created by KAS. <br>
     * POST /v2/multisig/account/{address}/tx/{transaction-id}/sign
     *
     * @param {string} address Account address to use for signing.
     * @param {string} transactionId The transaction id to sign.
     * @param {Function} [callback] The callback function to call.
     * @return {MultisigTransactionStatus}
     */
    signMultiSigTransction(address, transactionId, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.multisigTransactionManagementApi.signPendingTransaction(this.chainId, address, transactionId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Signs a pending transaction with the Klaytn account created by KAS. <br>
     * POST /v2/multisig/tx/{transaction-id}/sign
     *
     * @param {string} transactionId The transacion id.
     * @param {string} sigs The signatures to appen.
     * @param {Function} [callback] The callback function to call.
     * @return {MultisigTransactionStatus}
     */
    appendSignatures(transactionId, sigs, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isArray(sigs)) {
            sigs = { signatures: sigs }
        } else if (_.isObject(sigs) && sigs.V && sigs.R && sigs.S) {
            sigs = { signatures: [sigs] }
        }
        const opts = {
            body: SignPendingTransactionBySigRequest.constructFromObject(sigs),
        }

        return new Promise((resolve, reject) => {
            this.multisigTransactionManagementApi.signPendingTransactionBySig(this.chainId, transactionId, opts, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    // Statistics Api

    /**
     * Return the number of accounts in KAS. <br>
     * GET /v2/stat/count
     *
     * @param {Function} [callback] The callback function to call.
     * @return {AccountCountByAccountID}
     */
    getAccountCount(callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.statisticsApi.getAccountCountByAccountID(this.chainId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Return the number of accounts by KRN in KAS. <br>
     * GET /v2/stat/count/krn
     *
     * @param {string} krn The krn string to search.
     * @param {Function} [callback] The callback function to call.
     * @return {AccountCountByKRN}
     */
    getAccountCountByKRN(krn, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.statisticsApi.getAccountCountByKRN(this.chainId, { xKrn: krn }, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    // Key Api

    /**
     * Create keys in KAS. <br>
     * POST /v2/key
     *
     * @param {number} numberOfKeys The number of keys to create.
     * @param {Function} [callback] The callback function to call.
     * @return {KeyCreationResponse}
     */
    createKeys(numberOfKeys, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isNumber(numberOfKeys)) throw new Error(`Invalid numberOfKeys. You should pass number type parameter.`)

        const body = KeyCreationRequest.constructFromObject({ size: numberOfKeys })

        return new Promise((resolve, reject) => {
            this.keyApi.keyCreation(this.chainId, { body }, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Find key information from KAS. <br>
     * GET /v2/key/{key-id}
     *
     * @param {string} keyId The key id to find from KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {Key}
     */
    getKey(keyId, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(keyId)) throw new Error(`Invalid keyId. You should pass string type parameter.`)

        return new Promise((resolve, reject) => {
            this.keyApi.getKey(this.chainId, keyId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Sign the data using key. <br>
     * POST /v2/key/{key-id}/sign
     *
     * @param {string} keyId The key id to use for signing.
     * @param {string} dataToSign The data to sign.
     * @param {string} [krn] The krn string.
     * @param {Function} [callback] The callback function to call.
     * @return {KeySignDataResponse}
     */
    signMessage(keyId, dataToSign, krn, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(keyId)) throw new Error(`Invalid keyId. You should pass string type parameter.`)
        if (!_.isString(dataToSign)) throw new Error(`Invalid data. You should pass string type parameter.`)

        if (_.isFunction(krn)) {
            callback = krn
            krn = undefined
        }

        return new Promise((resolve, reject) => {
            this.keyApi.keySignData(this.chainId, keyId, { body: { data: dataToSign }, xKrn: krn }, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    // Registration Api

    /**
     * Register account which used before. <br>
     * POST /v2/registration/account
     *
     * @param {Array.<object>} accounts The account information to be registered in KAS.
     * @param {Function} [callback] The callback function to call.
     * @return {RegistrationStatusResponse}
     */
    registerAccounts(accounts, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isArray(accounts)) throw new Error(`Invalid accounts. You should pass array type parameter.`)

        for (const acct of accounts) {
            if (!acct.keyId || !acct.address) throw new Error(`Invalid account information. The keyId and address should be defined.`)
            if (!Object.keys(acct).every(key => ['keyId', 'address', 'rlp'].includes(key)))
                throw new Error(`Invalid field is defined in ${JSON.stringify(acct)}`)
        }

        return new Promise((resolve, reject) => {
            this.registrationApi.registerAccount(this.chainId, { body: accounts }, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }
}

module.exports = Wallet
