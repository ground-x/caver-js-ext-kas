/*
 * Wallet API
 * # Introduction Wallet API is an API for creating and managing Klaytn accounts as well as sending transactions. If you create your Klaytn account using Wallet API, you don't have to manage your private key yourself. Wallet API provides a wallet for safe storage of your Klaytn account private keys that you would need to use BApps. For more details on how to use Wallet API, please refer to this [tutorial](https://docs.klaytnapi.com/v/en/tutorial). Wallet API can be divided into the Account part, which creates and manages Klaytn accounts, and the Transaction part, which sends different kinds of transactions. Wallet API creates, deletes and monitors Klaytn accounts and updates the accounts to multisig, and manages all private keys for all accounts registered on KAS. Wallet API can also create transaction to send it to Klaytn. These include transactions sent from multisig accounts. In case of muiltisig accounts, a transaction will automatically be sent to Klaytn once \\(Threshold\\) is met. For more detail, please refer to this [tutorial](https://docs.klaytnapi.com/v/en/tutorial). There are mainly two types of transactions: basic transactions and fee delegation transactions. Fee delegation transactions include Global Fee Delegation transaction and user fee deletation transaction. With the Global Fee Delegation transaction scheme, the transaction fee will initially be paid by GroundX and then be charged to you at a later date. With the User Fee Delegation transaction scheme, you create an account that pays the transaction fees on behalf of the users when a transaction. The functionalities and limits of Wallet API are shown below: | Version | Item | Description | | :--- | :--- | :--- | | 2.0 | Limits | Supports Cypress(Mainnet), Baobab(Testnet) \\ Doesn't support (Service Chain \\) | |  |  | Doesn't support account management for external custodial keys | |  |  | Doesn't support multisig for RLP encoded transactions | |  | Account management | Create, retrieve and delete account | |  |  | Multisig account update | |  | Managing transaction | [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic) creating and sending transaction | |  |  | [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) creating and sending transaction | |  |  | RLP encoded transaction\\([Legacy](https://ko.docs.klaytn.com/klaytn/design/transactions/basic#txtypelegacytransaction), [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic), [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation)\\) creating and sending | |  |  | Managing and sending multisig transactions | |  | Administrator | Manage resource pool\\(create, query pool, delete, retrieve account \\) | # Error Codes ## 400: Bad Request  | Code | Messages |   | --- | --- |   | 1061010 | data don't exist</br>data don't exist; krn:1001:wallet:68ec0e4b-0f61-4e6f-ae35-be865ab23187:account-pool:default:0x9b2f4d85d7f7abb14db229b5a81f1bdca0aa24c8ff0c4c100b3f25098b7a6152 1061510 | account has been already deleted or disabled 1061511 | account has been already deleted or enabled 1061512 | account is invalid to sign the transaction; 0x18925BDD724614bF13Bd5d53a74adFd228903796</br>account is invalid to sign the transaction; 0x6d06e7cA9F26d6D30B3b4Dff6084E74C51908fef 1061515 | the requested account must be a legacy account; if the account is multisig account, use `PUT /v2/tx/{fd|fd-user}/account` API for multisig transaction and /v2/multisig/_**_/_** APIs 1061607 | it has to start with '0x' and allows [0-9a-fA-F]; input</br>it has to start with '0x' and allows [0-9a-fA-F]; transaction-id 1061608 | cannot be empty or zero value; to</br>cannot be empty or zero value; keyId</br>cannot be empty or zero value; address 1061609 | it just allow Klaytn address form; to 1061615 | its value is out of range; size 1061616 | fee ratio must be between 1 and 99; feeRatio 1061903 | failed to decode account keys; runtime error: slice bounds out of range [:64] with length 4 1061905 | failed to get feepayer 1061912 | rlp value and request value are not same; feeRatio</br>rlp value and request value are not same; feePayer 1061914 | already submitted transaction. Confirm transaction hash; 0x6f2e9235a48a86c3a7912b4237f83e760609c7ca609bbccbf648c8617a3a980c</br>already submitted transaction. Confirm transaction hash; 0xfb1fae863da42bcefdde3d572404bf5fcb89c1809e9253d5fff7c07a4bb5210f 1061917 | AccountKeyLegacy type is not supported in AccountKeyRoleBased type 1061918 | it just allow (Partial)FeeDelegation transaction type 1061919 | PartialFeeDelegation transaction must set fee ratio to non-zero value 1061920 | FeeDelegation transaction cannot set fee ratio, use PartialFeeDelegation transaction type 1061921 | it just allow Basic transaction type 1065000 | failed to retrieve a transaction from klaytn node 1065001 | failed to send a raw transaction to klaytn node; -32000::insufficient funds of the sender for value </br>failed to send a raw transaction to klaytn node; -32000::not a program account (e.g., an account having code and storage)</br>failed to send a raw transaction to klaytn node; -32000::nonce too low</br>failed to send a raw transaction to klaytn node; -32000::insufficient funds of the fee payer for gas * price 1065100 | failed to get an account</br>failed to get an account; data don't exist</br>failed to get an account; account key corrupted. can not use this account 1065102 | account key corrupted. can not use this account |
 *
 * OpenAPI spec version: 1.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.19
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
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
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
         * Create Klaytn account. Generate a Klaytn account address and random private/public key pair and get ID of public key and private key returned.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
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
         * Deactivate this Klaytn account. Once the account is deactivated, the account won't be retrieved.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
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
         * Delete the Klaytn account.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
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
         * Update the Klaytn account to a multisig account. Your account needs to have balances to pay the transaction fee when executing the account update transaction.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
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
         * Retrieve the Klaytn account.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
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
         * Retrieve a list of all Klaytn accounts.<p></p> ## Size<p></p> * The query parameter `size` is optional. (Min = 1, Max = 1000, Default = 100)<br> * Returns an error when given a negative number<br> * Uses default value (`size=100`) when `size=0`<br> * Uses the maximum value (`size=1000`) when given a value higher than the maximum value.<br>
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {Number} opts.size Maximum size of the account to be queried (default to 100)
         * @param {String} opts.cursor Information on the last cursor
         * @param {Number} opts.toTimestamp Limit of the time range to be queried (Timestamp in seconds)
         * @param {Number} opts.fromTimestamp Starting point of the time range to be queried (Timestamp in seconds)
         * @param {String} opts.status State of the account to be retrieved. 'all` retrieves accounts of all states, 'disable' retrieves deactivated accounts, and 'corrupted' retrieves accounts whose keys have been changed and rendered unusable. Default value will be set as 'enabled'. (default to enabled)
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
                status: opts.status,
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
         * Retrieve a list of Klaytn accounts by public key.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
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
         * Sign the transaction with a certain ID using this Klaytn account.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
         * @param {String} address Klaytn account address
         * @param {String} transactionId ID of the transaction to be signed
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
