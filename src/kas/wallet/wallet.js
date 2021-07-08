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
    FeepayerApi,
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
                feePayer: new FeepayerApi(client),
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
            feePayer: new FeepayerApi(client),
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
     * @type {FeepayerApi}
     */
    get feePayerApi() {
        return this.apiInstances.feePayer
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
     *    {
     *        address: '0xc756f6809bc34c2458fcb82fb16d5add3dbad9e3',
     *        key: '0x{private key1}',
     *    },
     *    {
     *        address: '0x5bae5e458ad1a9b210bf0a10434c39be1a5b7983',
     *        key: [
     *            '0x{private key2}',
     *            '0x{private key3}',
     *        ],
     *    },
     *    {
     *        address: '0x5bae5e458ad1a9b210bf0a10434c39be1a5b7983',
     *        key: [
     *            [
     *                '0x{private key4}',
     *                '0x{private key5}',
     *            ],
     *            [
     *                '0x{private key6}',
     *            ],
     *            [
     *                '0x{private key7}',
     *                '0x{private key8}',
     *            ],
     *        ],
     *    }
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
     * @example
     * const result = await caver.kas.wallet.createAccount()
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
     * @example
     * const query = {
     *    size: 1,
     *    fromTimestamp: 1501970769,
     *    toTimestamp: 1601970769,
     *    cursor: 'eyJBZGRyZXNzIjoia3JuOjEwMDE6d2FsbGV0OjhlNzZkMDAzLWQ2ZGQtNDI3OC04ZDA1LTUxNzJkOGYwMTBjYTphY2NvdW50LXBvb2w6ZGVmYXVsdDoweDUzM0ZjQzMyMWE4ODgxQzllNEEzNUIzMUJhZWI4MEI1MWE3RDI2OEQiLCJUeXBlIjoiQUNDIiwiY3JlYXRlZF9hdCI6MTYwMTk3MDc2OSwicnBuIjoia3JuOjEwMDE6d2FsbGV0OjhlNzZkMDAzLWQ2ZGQtNDI3OC04ZDA1LTUxNzJkOGYwMTBjYTphY2NvdW50LXBvb2w6ZGVmYXVsdCJ9',
     * }
     * const result = await caver.kas.wallet.getAccountList(query)
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
     * @example
     * const result = await caver.kas.wallet.getAccount('0x74a0a04c16025da4d24154440918035497795c14')
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
     * @example
     * const publicKey = '0x04334fbfedaa65df28797fdbd54778179ecc0929ddf40189e1470029e5efca4a0fadd510680228d261234e11f425ce85adb2a3ad014b2bb07470e66425ed483fd0'
     * const result = await caver.kas.wallet.getAccountListByPublicKey(publicKey)
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
     * @example
     * const result = await caver.kas.wallet.deleteAccount('0x74a0a04c16025da4d24154440918035497795c14')
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
     * @example
     * const result = await caver.kas.wallet.disableAccount('0x74a0a04c16025da4d24154440918035497795c14')
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
     * @example
     * const result = await caver.kas.wallet.enableAccount('0x74a0a04c16025da4d24154440918035497795c14')
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
     * @example
     * const address = '0xDbe780a8db6Dd219Fad25CDe29cB27392714f3ba'
     * const transactionId = '0x846534f00729fb838ade7478770d32d54f2b9ad4994f0c2ba8c5d569b241ae77'
     * const result = await caver.kas.wallet.signTransaction(address, transactionId)
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
     * @example
     * const address = '0x385500f711c20f22Ebe9599C7cb7Ed2e8495AA87'
     * const weightedMultisig = {
     *    threshold: 3,
     *    weightedKeys: [
     *        { weight: 1, publicKey: '0x047080d0a3368c2e6e2e03dbe40e82a07109bcbff199fc1650b4ed1d0a2bd7a39eef8c1b6d59423e2de48f391ed996eee6fa876be13c54fafde52301f290453c9a' },
     *        { weight: 1, publicKey: '0x04023337c168044de198c556a842344c3c3b173a5b8628ad2f9b0bf5b8481847844cda8b08acfec66fd483fcf2a3b007adf1f34d72aae59df664b031e012bae72a' },
     *        { weight: 1, publicKey: '0x0429f095fabc59bd3dadf43103acc5a1c090d0fe238b7d8ebd89684a768ca21fa82ad4dfb146825783c8b2e0f51c9d0f9ddea57bce65cf7e967f8454ba3195dc86' }
     *    ]
     * }
     * const result = await caver.kas.wallet.updateToMultiSigAccount(address, weightedMultisig)
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
     * @example
     * const tx = {
     *     from: '0x602846DDC31F6Fc092edcF945565fBE9c48BdD7E',
     *     to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
     *     value: 1,
     *     gas: 25000,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestLegacyTransaction(tx)
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
     * @example
     * const tx = {
     *     from: '0x13a9f77304cE84bb4EecA9E7d56AeE644bdd71bd',
     *     to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
     *     value: 1,
     *     gas: 25000,
     *     memo: 'memo',
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestValueTransfer(tx)
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
     * @example
     * const tx = {
     *     from: '0x48c08e034c4c9779800713A9ad5BA768dA196288',
     *     value: 0,
     *     input: '0x608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029',
     *     gas: 1000000,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestSmartContractDeploy(tx)
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
     * @example
     * const tx = {
     *     from: '0x48c08e034c4c9779800713A9ad5BA768dA196288',
     *     to: '0x9c44fdb25e96d49731336b0346f09eea501ee895',
     *     value: 0,
     *     input: '0xe942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000',
     *     gas: 500000,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestSmartContractExecution(tx)
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
     * @example
     * const tx = {
     *     from: '0x008Ad97530612A272d16228ec893e6Ce0F180b06',
     *     gas: 25000,
     *     nonce: '0x1',
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestCancel(tx)
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
     * @example
     * const tx = {
     *     from: '0x23a386d059a41512f3aC36952cFc6CC4BAAe4Ed5',
     *     gas: 100000,
     *     input: '0x0123',
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestChainDataAnchoring(tx)
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
     * @example
     * const rlp = '0x08f87e808505d21dba008261a89476c6b1f34562ed7a843786e1d7f57d0d7948a6f10194dbe9312beb546a5b518f8bb7ac315cc6eb96b34cf847f8458207f6a0276299929f4b805b1e1376543001652eff9f47cf34332e042c8aded29fd022fca077f1ff2f4bb668b49aa228c170e72d84ffdc456bd3ac9e5e6291d8e6cd61508b'
     * const result = await caver.kas.wallet.requestRawTransaction({ rlp, submit: true })
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
     * @example
     * // Update to AccountKeyLegay
     * const tx = {
     *     from: '0xA209b6D2DF012d63D798cB0BD0D7E0c53FddF649',
     *     accountKey: { keyType: 1 },
     *     gas: 1000000,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestAccountUpdate(tx)
     *
     * // Update to AccountKeyPublic
     * const tx = {
     *     from: '0x948C163A29Fc31996CCb478Fe4bA17C891Dc6221',
     *     accountKey: {
     *          keyType: 2,
     *          key: '0x049e24b9f7b59730cd45cb8be47b32f88fb428798dde1d723e79f80f2c200cc8a2fcdaa340979c09dbaecad698825537c401624cf9ba1b7724650fe67056968c1c'
     *     },
     *     gas: 1000000,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestAccountUpdate(tx)
     *
     * // Update to AccountKeyFail
     * const tx = {
     *     from: '0x7d0B0321FB82d70C3A2dDa1ab9112a6d58c94ADF',
     *     accountKey: { keyType: 3 },
     *     gas: 1000000,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestAccountUpdate(tx)
     *
     * // Update to AccountKeyWeightedMultiSig
     * const tx = {
     *     from: '0x443f01B81ECC1e83dC46edA711F3D707511ef257',
     *     accountKey: {
     *          keyType: 4,
     *          key: {
     *               threshold: 2,
     *               weightedKeys: [
     *                    {
     *                         weight: 1,
     *                         publicKey: '0x04a4dad8e41de69fdbf7c2d3b76eeeed47d449fd680d7dda0ae6346ac9e2c8de1637d8cbc4adbfa7b0f02ffedf39d8edb7dae983ba24a33fcdde37feedbe2a5cd7'
     *                    },
     *                    {
     *                         weight: 1,
     *                         publicKey: '0x0424a43009be004a10cf6d2d7ddb3fa31aa8e73bf540d8ad2a7a870c697981f3743f3691a45fc1c5ff13a7f521c5488b5a7926063b307c0def3d5f8f1f3a7fde0b'
     *                    }
     *               ]
     *          }
     *     },
     *     gas: 1000000,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestAccountUpdate(tx)
     *
     * // Update to AccountKeyRoleBased
     * const tx = {
     *     from: '0x7fe2434DA3B6Af4e23bB234a3972ab0bD9bad1bc',
     *     accountKey: {
     *          keyType: 5,
     *          key: [
     *               { keyType: 3, key: {} },
     *               {
     *                    keyType: 4,
     *                    key: {
     *                         threshold: 2,
     *                         weightedKeys: [
     *                              {
     *                                   weight: 1,
     *                                   publicKey: '0x04abad100b699ea183959102c17d7792ba86b324548888ab4affb19bf814ea821066792679df7f1d8ce9075b93e29072d5600684a41a4614c1be9b3714302d9c4a'
     *                              },
     *                              {
     *                                   weight: 1,
     *                                   publicKey: '0x04c32ba77e5741783945a1ad7e2f201961d11e8e8192b104a2402e6307e9d7d9a77412693846eedc33083279e7e78e5619400bf194d8230ecec1f57cd14b791c2d'
     *                              }
     *                         ]
     *                    }
     *               },
     *               {
     *                    keyType: 2,
     *                    key: '0x045505870ac8b7024e2b9eee23b8317eb79b796e44ece3fbb1d637d7a657bdbf0b3274216df59b1edf35bc94e4859357b5051cfaa8b5f659aae78a4d9bd2d8d6be'
     *               }
     *          ]
     *     },
     *     gas: 1000000,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestAccountUpdate(tx)
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
     * GET /v2/tx/{transaction-hash
     *
     * @example
     * const transactionHash = '0x00a2e38b03abe9aeb85d9baa82ca3b1d4d55a4c2b354dc67ab23b82420f470f6'
     * const result = await caver.kas.wallet.getTransaction(transactionHash)
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
     *
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
     * @example
     * const tx = {
     *     from: '0xd2061D4bdbee433Dd2f99C28E25d301593f544e0',
     *     to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
     *     value: 1,
     *     gas: 50000,
     *     memo: 'memo',
     *     feeRatio: 99,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDValueTransferPaidByGlobalFeePayer(tx)
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
     * @example
     * const tx = {
     *     from: '0x79d1Fa3e6a69F0b2662ebd885B3c85A055927A97',
     *     value: 0,
     *     input: '0x608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029',
     *     gas: 3000000,
     *     submit: true,
     *     feeRatio: 99
     * }
     * const result = await caver.kas.wallet.requestFDSmartContractDeployPaidByGlobalFeePayer(tx)
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
     * @example
     * const tx = {
     *     from: '0xa3E4f619C1D5d737a72f1df74e14a57Fae5f2867',
     *     to: '0x24553ed65819df0fc78bb5544c84c8bcff35b89e',
     *     value: 0,
     *     input: '0xe942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000',
     *     gas: 500000,
     *     feeRatio: 99,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDSmartContractExecutionPaidByGlobalFeePayer(tx)
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
     * @example
     * const tx = {
     *     from: '0xBB0fDDc3F01BE0E72EFDaE72B30Db509d9a2396A',
     *     gas: 45000,
     *     nonce: '0x1',
     *     feeRatio: 99,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDCancelPaidByGlobalFeePayer(tx)
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
     * @example
     * const tx = {
     *     from: '0x6c4C0226d58f0F87411e1Ec085f3629fA156bf06',
     *     gas: 100000,
     *     input: '0x0123',
     *     feeRatio: 99,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDChainDataAnchoringPaidByGlobalFeePayer(tx)
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
     * @example
     * const rlp = '0x0af8de018505d21dba00830111709476c6b1f34562ed7a843786e1d7f57d0d7948a6f101944c11080ccdbc63ae369b4baf44bee383779123d863f847f8458207f5a099855401a5cb69181c252d183af8281eea35767040f9526a0f6305b9c593f0a8a0276d996d4b7e4c68e7fa1571b4d4b753958cca1192701b67c9aaef7cd50a4754941b71a63903e35371e2fc41c6012effb99b9a2c0ff847f8458207f5a076d33208facdb2f45dba5ba82bebb84a4df0311b66ebea2e27796df97f863868a01a2ddad4029ce983f885a69c433e701bc32f4d51f598ada490565e77ebb936d6'
     * const result = await caver.kas.wallet.requestFDRawTransactionPaidByGlobalFeePayer({ rlp:, submit: true, feeRatio: 99 })
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
     * Create FeeDelegatedAccountUpdate. For examples of various AccountKeys, see the example [requestAccountUpdate]{@link Wallet#requestAccountUpdate} function. <br>
     * PUT /v2/tx/fd/account
     *
     * @example
     * const tx = {
     *     from: '0xd19CeD8B6CA1d5924ECaf4321c1C8Fae64C2ADf8',
     *     accountKey: {
     *          keyType: 4,
     *          key: {
     *               threshold: 2,
     *               weightedKeys: [
     *                    {
     *                         weight: 1,
     *                         publicKey: '0x04371334d038d983f3b560b2534385138ffaf69cf1aef039b268ef69c1736ec6544bc9a04598ca5ba4c2e75e648c6d8e6a892b33662bfe680544daa53c75b06e35'
     *                    },
     *                    {
     *                         weight: 1,
     *                         publicKey: '0x041640a55aed2c871f8896a263b378ce73e323254de9173fd071bb29aa8d4c52855ed8b4164db5db21d3c4e3baed2611d9d34932f36b6096086eee0c690417fb97'
     *                    }
     *               ]
     *          }
     *     },
     *     gas: 1000000,
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDAccountUpdatePaidByGlobalFeePayer(tx)
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
     * @example
     * const tx = {
     *     from: '0xd2061D4bdbee433Dd2f99C28E25d301593f544e0',
     *     to: '0x76c6b1f34562ed7a843786e1d7f57d0d7948a6f1',
     *     value: 1,
     *     gas: 50000,
     *     memo: 'memo',
     *     feeRatio: 99,
     *     feePayer: '0x44Ee3906a7a2007762E9d706dF6E4eF63FA1edA8',
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDValueTransferPaidByUser(tx)
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
     * @example
     * const tx = {
     *     from: '0x48c08e034c4c9779800713A9ad5BA768dA196288',
     *     value: 0,
     *     input: '0x608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029',
     *     gas: 3000000,
     *     submit: true,
     *     feePayer: '0x44Ee3906a7a2007762E9d706dF6E4eF63FA1edA8',
     *     feeRatio: 99
     * }
     * const result = await caver.kas.wallet.requestFDSmartContractDeployPaidByUser(tx)
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
     * @example
     * const tx = {
     *     from: '0x48c08e034c4c9779800713A9ad5BA768dA196288',
     *     to: '0x9c44fdb25e96d49731336b0346f09eea501ee895',
     *     value: 0,
     *     input: '0xe942b5160000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036b65790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000576616c7565000000000000000000000000000000000000000000000000000000',
     *     gas: 500000,
     *     feePayer: '0x44Ee3906a7a2007762E9d706dF6E4eF63FA1edA8',
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDSmartContractExecutionPaidByUser(tx)
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
     * @example
     * const tx = {
     *     from: '0x008Ad97530612A272d16228ec893e6Ce0F180b06',
     *     gas: 45000,
     *     nonce: '0x1',
     *     feeRatio: 99,
     *     feePayer: '0x44Ee3906a7a2007762E9d706dF6E4eF63FA1edA8',
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDCancelPaidByUser(tx)
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
     * @example
     * const tx = {
     *     from: '0x7A78fe7544dD2a448c6a147a34018B72dDDAC620',
     *     gas: 100000,
     *     input: '0x0123',
     *     feePayer: '0x44Ee3906a7a2007762E9d706dF6E4eF63FA1edA8',
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDChainDataAnchoringPaidByUser(tx)
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
     * @example
     * const rlp = '0x09f8dc808505d21dba0082c3509476c6b1f34562ed7a843786e1d7f57d0d7948a6f1019418aa5d1726d42a16e53eea8e1eda13f5f3d18bf4f847f8458207f6a0620fa593f92d9697ff4a4ce10e7d7edb443903c80b972c18fa1b71b58666dfd0a0208e2ea6f0a357000c5b2926ea86f7cef7237dca9a6c2a102fac9b36f282b1669444ee3906a7a2007762e9d706df6e4ef63fa1eda8f847f8458207f6a013a4969b6edad58dd526db2495aa68d25a3f0d105ec6d6e6feba34d1f6c20573a00275cbcb9aa3a7dbb38619e5e54b8398cc9893ea73b5d1b2184d3de9dc929f1c'
     * const result = await caver.kas.wallet.requestFDRawTransactionPaidByUser({ rlp, feePayer: '0x44Ee3906a7a2007762E9d706dF6E4eF63FA1edA8', submit: true })
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
     * Create FeeDelegatedAccountUpdate. For examples of various AccountKeys, see the example [requestAccountUpdate]{@link Wallet#requestAccountUpdate} function. <br>
     * PUT /v2/tx/fd-user/account
     *
     * @example
     * const tx = {
     *     from: '0xA3E79115c78bbC8eFdDA2a17a4Bdb48Dca2b5333',
     *     accountKey: {
     *          keyType: 4,
     *          key: {
     *               threshold: 2,
     *               weightedKeys: [
     *                    {
     *                         weight: 1,
     *                         publicKey: '0x04371334d038d983f3b560b2534385138ffaf69cf1aef039b268ef69c1736ec6544bc9a04598ca5ba4c2e75e648c6d8e6a892b33662bfe680544daa53c75b06e35'
     *                    },
     *                    {
     *                         weight: 1,
     *                         publicKey: '0x041640a55aed2c871f8896a263b378ce73e323254de9173fd071bb29aa8d4c52855ed8b4164db5db21d3c4e3baed2611d9d34932f36b6096086eee0c690417fb97'
     *                    }
     *               ]
     *          }
     *     },
     *     gas: 1000000,
     *     feePayer: '0x44Ee3906a7a2007762E9d706dF6E4eF63FA1edA8',
     *     submit: true
     * }
     * const result = await caver.kas.wallet.requestFDAccountUpdatePaidByUser(tx)
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
     * @example
     * const result = await caver.kas.wallet.getMultiSigTransactionList('0x3EE8aC5eBDDcF408020D1125437302B2267e5A8C')
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
     * @example
     * const address = '0x127089fF8154B145e8dcad7C112A949C2a452cb8'
     * const transactionId = '0xfe2be4de37ed40c6c049d3c2771a6e7577916c951dd331b297b517b25609b4ad'
     * const result = await caver.kas.wallet.signMultiSigTransction(address, transactionId)
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
     * @example
     * const transactionId = '0x7e7f18b16fb1807654d9cd2b1ad1c0cbb649b81648543a792a6db2f43e1a8ad5'
     * const signatures = [
     *    {
     *        V: '0x7f6'
     *        R: '0xc2902ebb52f554fd257eda57a3fe7cbf1e046bb43d1472bd396f2c3053f8bf55',
     *        S: '0x32f7d5b99e91510ecaefc5fe65816e6e43043c408873b2453d02116be1674278',
     *    }
     * ]
     * const result = await caver.kas.wallet.appendSignatures(transactionId, signatures)
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
     * @example
     * const result = await caver.kas.wallet.getAccountCount()
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
     * @example
     * const result = await caver.kas.wallet.getAccountCountByKRN()
     *
     * @param {string} [krn] The krn string to search.
     * @param {Function} [callback] The callback function to call.
     * @return {AccountCountByKRN}
     */
    getAccountCountByKRN(krn, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(krn)) {
            callback = krn
            krn = undefined
        }

        if (krn !== undefined)
            throw new Error(`Defining krn to get account count is not supported yet. You can search only with the default krn.`)

        return new Promise((resolve, reject) => {
            this.statisticsApi.getAccountCountByKRN(this.chainId, (err, data, response) => {
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
     * @example
     * const result = await caver.kas.wallet.createKeys(1)
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
     * @example
     * const keyId = 'krn:1001:wallet:test:account-pool:default:0xd80ff4019cfd96f0812adece82dd956c5e781b79ca707cb5e957c97f27593221'
     * const result = await caver.kas.wallet.getKey(keyId)
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
     * @example
     * const keyId = 'krn:1001:wallet:test:account-pool:default:0xd80ff4019cfd96f0812adece82dd956c5e781b79ca707cb5e957c97f27593221'
     * const dataToSign = '0x88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589'
     * const result = await caver.kas.wallet.signMessage(keyId, dataToSign)
     *
     * @param {string} keyId The key id to use for signing.
     * @param {string} dataToSign The data to sign.
     * @param {Function} [callback] The callback function to call.
     * @return {KeySignDataResponse}
     */
    signMessage(keyId, dataToSign, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(keyId)) throw new Error(`Invalid keyId. You should pass string type parameter.`)
        if (!_.isString(dataToSign)) throw new Error(`Invalid data. You should pass string type parameter.`)

        if (callback && !_.isFunction(callback))
            throw new Error(`Invalid parameter: Please check your parameter ("signMessage(keyId, dataToSign [, callback])")`)

        return new Promise((resolve, reject) => {
            this.keyApi.keySignData(this.chainId, keyId, { body: { data: dataToSign } }, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Delete a key. <br>
     * DELETE /v2/key/{key-id}
     *
     * @example
     * const keyId = 'krn:1001:wallet:test:account-pool:default:0xd80ff4019cfd96f0812adece82dd956c5e781b79ca707cb5e957c97f27593221'
     * const result = await caver.kas.wallet.deleteKey(keyId)
     *
     * @param {string} keyId The key id to delete.
     * @param {Function} [callback] The callback function to call.
     * @return {KeyStatus}
     */
    deleteKey(keyId, callback) {
        if (!this.accessOptions || !this.accountApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!_.isString(keyId)) throw new Error(`Invalid keyId. You should pass string type parameter.`)

        return new Promise((resolve, reject) => {
            this.keyApi.keyDeletion(this.chainId, keyId, (err, data, response) => {
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
     * RegisterAccount presents an account to be registered in KAS Wallet API.
     *
     * @typedef {Object} RegisterAccount
     * @property {string} keyId - Key ID which is create in KMS(Key Management System).
     * @property {string} address - Klaytn address.
     * @property {string} [rlp] - RLP value. If RLP value is received, account update is executed using the value.
     */

    /**
     * Register account which used before. <br>
     * POST /v2/registration/account
     *
     * @example
     * const accounts = [
     *    {
     *        keyId: 'krn:1001:wallet:68ec0e4b-0f61-4e6f-ae35-be865ab23187:account-pool:default:0xa4e7b80d97beba9b480e35ae21428302e51ea7a072f3ab4f10c3ebb9854b0d61',
     *        address: '0x93c274186F9763d3761B8F60A105FB204BB9fa26',
     *    },
     *    {
     *        keyId: 'krn:1001:wallet:68ec0e4b-0f61-4e6f-ae35-be865ab23187:account-pool:default:0x9b2f4d85d7f7abb14db229b5a81f1bdca0aa24c8ff0c4c100b3f25098b7a6151',
     *        address: '0xa53333EFFd4F2c4889a23B8b0761b277b007Da4A',
     *        rlp: '0x21f90117808505d21dba00830f424094a53333effd4f2c4889a23b8b0761b277b007da4ab84e04f84b04f848e303a1036d87c660a30eff8b28d90f97c611ed27d0c85d47fdd9185584c54b6347c1218ee301a102c40482ec234279eed13734293dba10974dcbf1c24264afffb5bd35eb40773af5f847f8458207f6a0b6a175b7cc025d3589540e5f748a46115fc4b3fab506fff298af9d3cb0374792a03c916518f7b91195cfaadd1129fd870f1deb1ab241cd970b909936a2baed88d19485b98485444c89880cd9c48807cef727c296f2daf847f8458207f6a01ffa1cec9bdfead66854704de716141554a62d532c36f6bfb58d4e9deb8fdb7da04feee14b21c337e9f1e8ff57a8abb4a0e446a5cc733306afe69a2c32af46f130'
     *    }
     * ]
     * const ret = await caver.kas.wallet.registerAccounts(accounts)
     *
     * @param {Array.<RegisterAccount>} accounts The account information to be registered in KAS.
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

    // Fee Payer Api

    /**
     * Create a Klaytn fee payer account. Generate a Klaytn account address and random private/public key pair and get ID of public key and private key returned. <br>
     * Klaytn fee payer account should be updated to [AccountKeyRoleBased](https://docs.klaytn.com/klaytn/design/accounts#accountkeyrolebased) and can only be used for fee delegation. <br>
     * POST /v2/feepayer
     *
     * @example
     * const ret = await caver.kas.wallet.createFeePayer()
     *
     * @param {Function} [callback] The callback function to call.
     * @return {Account}
     */
    createFeePayer(callback) {
        if (!this.accessOptions || !this.feePayerApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.feePayerApi.creatFeePayerAccount(this.chainId, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Delete a certain Klaytn fee payer account. <br>
     * DELETE /v2/feepayer/{address}
     *
     * @example
     * const feePayer = '0x{address in hex}'
     * const ret = await caver.kas.wallet.deleteFeePayer(feePayer)
     *
     * @param {string} address The fee payer address to delete.
     * @param {Function} [callback] The callback function to call.
     * @return {AccountStatus}
     */
    deleteFeePayer(address, callback) {
        if (!this.accessOptions || !this.feePayerApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.feePayerApi.deleteFeePayerAccount(this.chainId, address, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieve a certain Klaytn fee payer account. <br>
     * GET /v2/feepayer/{address}
     *
     * @example
     * const feePayer = '0x{address in hex}'
     * const ret = await caver.kas.wallet.getFeePayer(feePayer)
     *
     * @param {string} address The fee payer address to retrieve.
     * @param {Function} [callback] The callback function to call.
     * @return {Account}
     */
    getFeePayer(address, callback) {
        if (!this.accessOptions || !this.feePayerApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.feePayerApi.retrieveFeePayerAccount(this.chainId, address, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieve the Klaytn fee payer accounts. <br>
     * GET /v2/feepayer
     *
     * @example
     * const ret = await caver.kas.wallet.getFeePayerList()
     *
     * const queryOptions = { size: 1, cursor: '...' }
     * const ret = await caver.kas.wallet.getFeePayerList(queryOptions)
     *
     * @param {WalletQueryOptions} [queryOptions] Filters required when retrieving data. `size`, `cursor`, `fromTimestamp` or `toTimestamp`.
     * @param {Function} [callback] The callback function to call.
     * @return {Accounts}
     */
    getFeePayerList(queryOptions, callback) {
        if (!this.accessOptions || !this.feePayerApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = WalletQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor', 'fromTimestamp', 'toTimestamp']))
            throw new Error(`Invalid query options: 'size', 'cursor', 'fromTimestamp' or 'toTimestamp' can be used.`)

        return new Promise((resolve, reject) => {
            this.feePayerApi.retrieveFeePayerAccounts(this.chainId, queryOptions, (err, data, response) => {
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
