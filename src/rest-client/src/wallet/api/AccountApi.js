/*
 * Wallet API
 * # Introduction Wallet API is used to create and manage Klaytn accounts and transfer transactions. If you create a Klaytn account with Wallet API, you do not need to manage private keys separately. Wallet API provides a secure wallet to keep your Klaytn account’s private keys for BApp. For more details on Wallet API, refer to our [tutorial](https://docs.klaytnapi.com/v/ko/tutorial).  Wallet API features an “Account” section for creating and managing Klaytn accounts and a “Transaction” section for transferring transactions. Wallet API creates, deletes, and monitors Klaytn accounts; updates multisig accounts; and manages the privates keys of all accounts registered to KAS.  In addition, Wallet API creates transactions and transfers them to Klaytn. They include transactions that are sent through the multisig accounts. A transaction will be automatically transferred to Klaytn if the threshold is met for the number of signatures. For more details on multisignatures, refer to [the followings](https://docs.klaytnapi.com/v/ko/tutorial).  Transactions include basic and fee delegation transactions. In particular, fee delegation transactions include global and user fee delegation transactions. In the global fee delegation transaction, Ground X’s KAS account first pays the transaction fee and charges the users later. Meanwhile, in the user fee delegation transaction, a user creates an account to pay for transaction fees when sending transactions.  Wallet API has the following functions and limitations.  | Version | Item | Description | | :--- | :--- | :--- | | 2.0 | Limitations | Support for Cypress (mainnet) and Baobab (testnet) (Service Chain not supported) | |  |  | Account management for external management keys not supported | |  |  | Multisignatures of RLP-encoded transactions not supported | |  | Account management  | Account creation, search, and deletion | |  |  | Multisignature account updates | |  | Transaction management | [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic) Transaction Creation and Transfer | |  |  | [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) Transaction Creation and Transfer | |  |  | RLP-encoded transaction \\([Legacy](https://ko.docs.klaytn.com/klaytn/design/transactions/basic#txtypelegacytransaction), [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic), [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) Transaction Creation and Transfer \\) | |  |  | Multisignature transaction management and transfer | |  | Administrator | Resource pool management (creation, pool search, deletion, and account search) |    # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |   | 1061010 | data don't exist 1061510 | account has been already deleted or disabled 1061511 | account has been already deleted or enabled 1061512 | account is invalid to sign the transaction; 0xc9bFDDabf2c38396b097C8faBE9151955413995D</br>account is invalid to sign the transaction; 0x35Cc4921B17Dfa67a58B93c9F8918f823e58b77e 1061515 | the requested account must be a legacy account; if the account is multisig account, use `PUT /v2/tx/{fd|fd-user}/account` API for multisig transaction and /v2/multisig/_**_/_** APIs 1061607 | it has to start with '0x' and allows [0-9a-fA-F]; input</br>it has to start with '0x' and allows [0-9a-fA-F]; tx_id 1061608 | cannot be empty or zero value; to</br>cannot be empty or zero value; input 1061609 | it just allow Klaytn address form; to 1061615 | its value is out of range; size 1061616 | feeration must be between 1 and 99; feeRatio 1061903 | failed to decode account keys 1061905 | failed to get feepayer 1061912 | rlp value and request value are not same; feeRatio</br>rlp value and request value are not same; feePayer 1061914 | already submitted transaction. Confirm transaction hash; 0xb9612ec6ec39bfd3f2841daa7ab062fc94cf33f23503606c979b2f81e50b2cb1 1061917 | AccountKeyLegacy type is not supported in AccountKeyRoleBased type 1061918 | it just allow (Partial)FeeDelegation transaction type 1061919 | PartialFeeDelegation transaction must set fee ratio to non-zero value 1061920 | FeeDelegation transaction cannot set fee ratio, use PartialFeeDelegation transaction type 1061921 | it just allow Basic transaction type 1065000 | failed to retrieve a transaction from klaytn node 1065001 | failed to send a raw transaction to klaytn node; -32000::insufficient funds of the sender for value </br>failed to send a raw transaction to klaytn node; -32000::not a program account (e.g., an account having code and storage)</br>failed to send a raw transaction to klaytn node; -32000::nonce too low</br>failed to send a raw transaction to klaytn node; -32000::insufficient funds of the fee payer for gas * price 1065100 | failed to get an account from AMS</br>failed to get an account from AMS; account key corrupted. can not use this account 1065102 | account key corrupted. can not use this account |
 *
 * OpenAPI spec version: 1.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.17
 *
 * Do not edit the class manually.
 *
 */

;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            '../../ApiClient',
            '../model/Account',
            '../model/AccountStatus',
            '../model/AccountSummary',
            '../model/Accounts',
            '../model/AccountsByPubkey',
            '../model/ErrorResponse',
            '../model/MultisigAccount',
            '../model/MultisigAccountUpdateRequest',
            '../model/Signature',
        ], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(
            require('../../ApiClient'),
            require('../model/Account'),
            require('../model/AccountStatus'),
            require('../model/AccountSummary'),
            require('../model/Accounts'),
            require('../model/AccountsByPubkey'),
            require('../model/ErrorResponse'),
            require('../model/MultisigAccount'),
            require('../model/MultisigAccountUpdateRequest'),
            require('../model/Signature')
        )
    } else {
        // Browser globals (root is window)
        if (!root.WalletApi) {
            root.WalletApi = {}
        }
        root.WalletApi.AccountApi = factory(
            root.WalletApi.ApiClient,
            root.WalletApi.Account,
            root.WalletApi.AccountStatus,
            root.WalletApi.AccountSummary,
            root.WalletApi.Accounts,
            root.WalletApi.AccountsByPubkey,
            root.WalletApi.ErrorResponse,
            root.WalletApi.MultisigAccount,
            root.WalletApi.MultisigAccountUpdateRequest,
            root.WalletApi.Signature
        )
    }
})(this, function(
    ApiClient,
    Account,
    AccountStatus,
    AccountSummary,
    Accounts,
    AccountsByPubkey,
    ErrorResponse,
    MultisigAccount,
    MultisigAccountUpdateRequest,
    Signature
) {
    /**
     * Account service.
     * @class AccountApi
     * @version 1.0
     */

    /**
     * Constructs a new AccountApi.
     * @alias AccountApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    const AccountApi = function(apiClient) {
        this.apiClient = apiClient || ApiClient.instance

        /**
         * Callback function to receive the result of the activateAccount operation.
         * @callback AccountApi~activateAccountCallback
         * @param {String} error Error message, if any.
         * @param {AccountSummary} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * ActivateAccount
         * Reactivate a deactivated Klaytn account.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {String} address Klaytn account address
         * @param {AccountApi~activateAccountCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link AccountSummary}
         */
        this.activateAccount = function(xChainId, address, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling activateAccount")
            }

            // verify the required parameter 'address' is set
            if (address === undefined || address === null) {
                throw new Error("Missing the required parameter 'address' when calling activateAccount")
            }

            const pathParams = {
                address: address,
            }
            const queryParams = {}
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = AccountSummary

            return this.apiClient.callApi(
                '/v2/account/{address}/enable',
                'PUT',
                pathParams,
                queryParams,
                collectionQueryParams,
                headerParams,
                formParams,
                postBody,
                authNames,
                contentTypes,
                accepts,
                returnType,
                callback
            )
        }

        /**
         * Callback function to receive the result of the createAccount operation.
         * @callback AccountApi~createAccountCallback
         * @param {String} error Error message, if any.
         * @param {Account} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * CreateAccount
         * Creates a Klaytn account. Creates random Klaytn account addresses and private/public key pairs, and returns public key and private key IDs.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {AccountApi~createAccountCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Account}
         */
        this.createAccount = function(xChainId, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling createAccount")
            }

            const pathParams = {}
            const queryParams = {}
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = Account

            return this.apiClient.callApi(
                '/v2/account',
                'POST',
                pathParams,
                queryParams,
                collectionQueryParams,
                headerParams,
                formParams,
                postBody,
                authNames,
                contentTypes,
                accepts,
                returnType,
                callback
            )
        }

        /**
         * Callback function to receive the result of the deactivateAccount operation.
         * @callback AccountApi~deactivateAccountCallback
         * @param {String} error Error message, if any.
         * @param {AccountSummary} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * DeactivateAccount
         * Deactivate a Klaytn account. If the account is deactivated, the account cannot be searched.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {String} address Klaytn account address
         * @param {AccountApi~deactivateAccountCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link AccountSummary}
         */
        this.deactivateAccount = function(xChainId, address, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling deactivateAccount")
            }

            // verify the required parameter 'address' is set
            if (address === undefined || address === null) {
                throw new Error("Missing the required parameter 'address' when calling deactivateAccount")
            }

            const pathParams = {
                address: address,
            }
            const queryParams = {}
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = AccountSummary

            return this.apiClient.callApi(
                '/v2/account/{address}/disable',
                'PUT',
                pathParams,
                queryParams,
                collectionQueryParams,
                headerParams,
                formParams,
                postBody,
                authNames,
                contentTypes,
                accepts,
                returnType,
                callback
            )
        }

        /**
         * Callback function to receive the result of the deleteAccount operation.
         * @callback AccountApi~deleteAccountCallback
         * @param {String} error Error message, if any.
         * @param {AccountStatus} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * DeleteAccount
         * Deletes Klaytn account.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {String} address Klaytn account address
         * @param {AccountApi~deleteAccountCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link AccountStatus}
         */
        this.deleteAccount = function(xChainId, address, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling deleteAccount")
            }

            // verify the required parameter 'address' is set
            if (address === undefined || address === null) {
                throw new Error("Missing the required parameter 'address' when calling deleteAccount")
            }

            const pathParams = {
                address: address,
            }
            const queryParams = {}
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = AccountStatus

            return this.apiClient.callApi(
                '/v2/account/{address}',
                'DELETE',
                pathParams,
                queryParams,
                collectionQueryParams,
                headerParams,
                formParams,
                postBody,
                authNames,
                contentTypes,
                accepts,
                returnType,
                callback
            )
        }

        /**
         * Callback function to receive the result of the multisigAccountUpdate operation.
         * @callback AccountApi~multisigAccountUpdateCallback
         * @param {String} error Error message, if any.
         * @param {MultisigAccount} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * MultisigAccountUpdate
         * Update a Klaytn account to a multisig account. Sufficient balance is required for a transaction fee payment when executing the update transaction.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {String} address Klaytn account address
         * @param {Object} opts Optional parameters
         * @param {MultisigAccountUpdateRequest} opts.body
         * @param {AccountApi~multisigAccountUpdateCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link MultisigAccount}
         */
        this.multisigAccountUpdate = function(xChainId, address, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling multisigAccountUpdate")
            }

            // verify the required parameter 'address' is set
            if (address === undefined || address === null) {
                throw new Error("Missing the required parameter 'address' when calling multisigAccountUpdate")
            }

            const pathParams = {
                address: address,
            }
            const queryParams = {}
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = MultisigAccount

            return this.apiClient.callApi(
                '/v2/account/{address}/multisig',
                'PUT',
                pathParams,
                queryParams,
                collectionQueryParams,
                headerParams,
                formParams,
                postBody,
                authNames,
                contentTypes,
                accepts,
                returnType,
                callback
            )
        }

        /**
         * Callback function to receive the result of the retrieveAccount operation.
         * @callback AccountApi~retrieveAccountCallback
         * @param {String} error Error message, if any.
         * @param {Account} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * RetrieveAccount
         * Search for a Klaytn account
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {String} address Klaytn account address
         * @param {AccountApi~retrieveAccountCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Account}
         */
        this.retrieveAccount = function(xChainId, address, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling retrieveAccount")
            }

            // verify the required parameter 'address' is set
            if (address === undefined || address === null) {
                throw new Error("Missing the required parameter 'address' when calling retrieveAccount")
            }

            const pathParams = {
                address: address,
            }
            const queryParams = {}
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = Account

            return this.apiClient.callApi(
                '/v2/account/{address}',
                'GET',
                pathParams,
                queryParams,
                collectionQueryParams,
                headerParams,
                formParams,
                postBody,
                authNames,
                contentTypes,
                accepts,
                returnType,
                callback
            )
        }

        /**
         * Callback function to receive the result of the retrieveAccounts operation.
         * @callback AccountApi~retrieveAccountsCallback
         * @param {String} error Error message, if any.
         * @param {Accounts} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * RetrieveAccounts
         * Search for a list of existing Klaytn accounts.<p></p>  ## Size<p></p>  * The `size` query parameter is optional (minimum = 1, maximum = 1000, default = 100).<br> * Submitting negative values result in errors.<br> * Submitting zero results in a query with `size=100`, which is the default value.<br> * Submitting values greater than 1000 result in queries with `size=1000`, which is the maximum value.<br>
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {Number} opts.size Maximum size of account to search (default to 100)
         * @param {String} opts.cursor Information on last searched cursor
         * @param {Number} opts.toTimestamp Timestamp of the end time to be searched (in seconds)
         * @param {Number} opts.fromTimestamp Timestamp of the start time to be searched (in seconds)
         * @param {AccountApi~retrieveAccountsCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Accounts}
         */
        this.retrieveAccounts = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling retrieveAccounts")
            }

            const pathParams = {}
            const queryParams = {
                size: opts.size,
                cursor: opts.cursor,
                'to-timestamp': opts.toTimestamp,
                'from-timestamp': opts.fromTimestamp,
            }
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = Accounts

            return this.apiClient.callApi(
                '/v2/account',
                'GET',
                pathParams,
                queryParams,
                collectionQueryParams,
                headerParams,
                formParams,
                postBody,
                authNames,
                contentTypes,
                accepts,
                returnType,
                callback
            )
        }

        /**
         * Callback function to receive the result of the retrieveAccountsByPubkey operation.
         * @callback AccountApi~retrieveAccountsByPubkeyCallback
         * @param {String} error Error message, if any.
         * @param {AccountsByPubkey} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * RetrieveAccountsByPubkey
         * Search for a list of Klaytn accounts with a public key.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {String} publicKey Klaytn public key
         * @param {AccountApi~retrieveAccountsByPubkeyCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link AccountsByPubkey}
         */
        this.retrieveAccountsByPubkey = function(xChainId, publicKey, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling retrieveAccountsByPubkey")
            }

            // verify the required parameter 'publicKey' is set
            if (publicKey === undefined || publicKey === null) {
                throw new Error("Missing the required parameter 'publicKey' when calling retrieveAccountsByPubkey")
            }

            const pathParams = {
                'public-key': publicKey,
            }
            const queryParams = {}
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = AccountsByPubkey

            return this.apiClient.callApi(
                '/v2/pubkey/{public-key}/account',
                'GET',
                pathParams,
                queryParams,
                collectionQueryParams,
                headerParams,
                formParams,
                postBody,
                authNames,
                contentTypes,
                accepts,
                returnType,
                callback
            )
        }

        /**
         * Callback function to receive the result of the signTransactionIDResponse operation.
         * @callback AccountApi~signTransactionIDResponseCallback
         * @param {String} error Error message, if any.
         * @param {Signature} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * SignTransactionIDResponse
         * Sign transactions with a transaction ID using the corresponding Klaytn account.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {String} address Klaytn account address
         * @param {String} transactionId ID of transaction to be signed
         * @param {AccountApi~signTransactionIDResponseCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Signature}
         */
        this.signTransactionIDResponse = function(xChainId, address, transactionId, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling signTransactionIDResponse")
            }

            // verify the required parameter 'address' is set
            if (address === undefined || address === null) {
                throw new Error("Missing the required parameter 'address' when calling signTransactionIDResponse")
            }

            // verify the required parameter 'transactionId' is set
            if (transactionId === undefined || transactionId === null) {
                throw new Error("Missing the required parameter 'transactionId' when calling signTransactionIDResponse")
            }

            const pathParams = {
                address: address,
                'transaction-id': transactionId,
            }
            const queryParams = {}
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = Signature

            return this.apiClient.callApi(
                '/v2/account/{address}/tx/{transaction-id}/sign',
                'POST',
                pathParams,
                queryParams,
                collectionQueryParams,
                headerParams,
                formParams,
                postBody,
                authNames,
                contentTypes,
                accepts,
                returnType,
                callback
            )
        }
    }

    return AccountApi
})
