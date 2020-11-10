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
            '../model/AccountUpdateTransactionRequest',
            '../model/AnchorTransactionRequest',
            '../model/CancelTransactionRequest',
            '../model/ContractDeployTransactionRequest',
            '../model/ContractExecutionTransactionRequest',
            '../model/ErrorResponse',
            '../model/LegacyTransactionRequest',
            '../model/ProcessRLPRequest',
            '../model/TransactionReceipt',
            '../model/TransactionResult',
            '../model/ValueTransferTransactionRequest',
        ], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(
            require('../../ApiClient'),
            require('../model/AccountUpdateTransactionRequest'),
            require('../model/AnchorTransactionRequest'),
            require('../model/CancelTransactionRequest'),
            require('../model/ContractDeployTransactionRequest'),
            require('../model/ContractExecutionTransactionRequest'),
            require('../model/ErrorResponse'),
            require('../model/LegacyTransactionRequest'),
            require('../model/ProcessRLPRequest'),
            require('../model/TransactionReceipt'),
            require('../model/TransactionResult'),
            require('../model/ValueTransferTransactionRequest')
        )
    } else {
        // Browser globals (root is window)
        if (!root.WalletApi) {
            root.WalletApi = {}
        }
        root.WalletApi.BasicTransactionApi = factory(
            root.WalletApi.ApiClient,
            root.WalletApi.AccountUpdateTransactionRequest,
            root.WalletApi.AnchorTransactionRequest,
            root.WalletApi.CancelTransactionRequest,
            root.WalletApi.ContractDeployTransactionRequest,
            root.WalletApi.ContractExecutionTransactionRequest,
            root.WalletApi.ErrorResponse,
            root.WalletApi.LegacyTransactionRequest,
            root.WalletApi.ProcessRLPRequest,
            root.WalletApi.TransactionReceipt,
            root.WalletApi.TransactionResult,
            root.WalletApi.ValueTransferTransactionRequest
        )
    }
})(this, function(
    ApiClient,
    AccountUpdateTransactionRequest,
    AnchorTransactionRequest,
    CancelTransactionRequest,
    ContractDeployTransactionRequest,
    ContractExecutionTransactionRequest,
    ErrorResponse,
    LegacyTransactionRequest,
    ProcessRLPRequest,
    TransactionReceipt,
    TransactionResult,
    ValueTransferTransactionRequest
) {
    /**
     * BasicTransaction service.
     * @class BasicTransactionApi
     * @version 1.0
     */

    /**
     * Constructs a new BasicTransactionApi.
     * @alias BasicTransactionApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    const BasicTransactionApi = function(apiClient) {
        this.apiClient = apiClient || ApiClient.instance

        /**
         * Callback function to receive the result of the accountUpdateTransaction operation.
         * @callback BasicTransactionApi~accountUpdateTransactionCallback
         * @param {String} error Error message, if any.
         * @param {TransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * AccountUpdateTransaction
         * Create a transaction for updating Klaytn account keys. For more details about the types of Klaytn account keys, refer to the following.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {AccountUpdateTransactionRequest} opts.body
         * @param {BasicTransactionApi~accountUpdateTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link TransactionResult}
         */
        this.accountUpdateTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling accountUpdateTransaction")
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
            const returnType = TransactionResult

            return this.apiClient.callApi(
                '/v2/tx/account',
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
         * Callback function to receive the result of the anchorTransaction operation.
         * @callback BasicTransactionApi~anchorTransactionCallback
         * @param {String} error Error message, if any.
         * @param {TransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * AnchorTransaction
         * Create a transaction for anchoring service chain data to the Klaytn main chain.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {AnchorTransactionRequest} opts.body
         * @param {BasicTransactionApi~anchorTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link TransactionResult}
         */
        this.anchorTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling anchorTransaction")
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
            const returnType = TransactionResult

            return this.apiClient.callApi(
                '/v2/tx/anchor',
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
         * Callback function to receive the result of the cancelTransaction operation.
         * @callback BasicTransactionApi~cancelTransactionCallback
         * @param {String} error Error message, if any.
         * @param {TransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * CancelTransaction
         * Create a transaction for canceling a pending transaction. Either a nonce or transaction hash is required for cancellation.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {CancelTransactionRequest} opts.body
         * @param {BasicTransactionApi~cancelTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link TransactionResult}
         */
        this.cancelTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling cancelTransaction")
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
            const returnType = TransactionResult

            return this.apiClient.callApi(
                '/v2/tx',
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
         * Callback function to receive the result of the contractDeployTransaction operation.
         * @callback BasicTransactionApi~contractDeployTransactionCallback
         * @param {String} error Error message, if any.
         * @param {TransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * ContractDeployTransaction
         * Create a transaction for deploying a contract.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {ContractDeployTransactionRequest} opts.body
         * @param {BasicTransactionApi~contractDeployTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link TransactionResult}
         */
        this.contractDeployTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling contractDeployTransaction")
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
            const returnType = TransactionResult

            return this.apiClient.callApi(
                '/v2/tx/contract/deploy',
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
         * Callback function to receive the result of the contractExecutionTransaction operation.
         * @callback BasicTransactionApi~contractExecutionTransactionCallback
         * @param {String} error Error message, if any.
         * @param {TransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * ContractExecutionTransaction
         * Create a transaction for executing a released contract function.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {ContractExecutionTransactionRequest} opts.body
         * @param {BasicTransactionApi~contractExecutionTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link TransactionResult}
         */
        this.contractExecutionTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling contractExecutionTransaction")
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
            const returnType = TransactionResult

            return this.apiClient.callApi(
                '/v2/tx/contract/execute',
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
         * Callback function to receive the result of the legacyTransaction operation.
         * @callback BasicTransactionApi~legacyTransactionCallback
         * @param {String} error Error message, if any.
         * @param {TransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * LegacyTransaction
         * Create a transaction that supports legacy accounts (which have a public key that is derived from a private key) and transaction formats. Through KAS, any Klaytn account will be created as a legacy account by default.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {LegacyTransactionRequest} opts.body
         * @param {BasicTransactionApi~legacyTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link TransactionResult}
         */
        this.legacyTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling legacyTransaction")
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
            const returnType = TransactionResult

            return this.apiClient.callApi(
                '/v2/tx/legacy',
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
         * Callback function to receive the result of the processRLP operation.
         * @callback BasicTransactionApi~processRLPCallback
         * @param {String} error Error message, if any.
         * @param {TransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * ProcessRLP
         * Create a transaction using the rlp(SigRLP or TxHashRLP). Rlp value from transaction API is TxHashRLP format which contains signatures. SigRLP which does not contain signatures can easily be made from caver.<p></p>  If you want to make SigRLP, you can use method `getRLPEncodingForSignature()` of certain transaction object. If you want to make TxHashRLP, you can use method `getRLPEncoding()` of certain transaction object. If you give SigRLP in rlp value, we sign the trasnaction using `from` address in your account pool. If you need detail description about SigRLP, TxHashRLP of each of transaction, you can refer [Klaytn Docs](https://docs.klaytn.com/klaytn/design/transactions).
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {ProcessRLPRequest} opts.body
         * @param {BasicTransactionApi~processRLPCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link TransactionResult}
         */
        this.processRLP = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling processRLP")
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
            const returnType = TransactionResult

            return this.apiClient.callApi(
                '/v2/tx/rlp',
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
         * Callback function to receive the result of the transactionReceipt operation.
         * @callback BasicTransactionApi~transactionReceiptCallback
         * @param {String} error Error message, if any.
         * @param {TransactionReceipt} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * TransactionReceipt
         * Search for the transaction execution result using the transaction hash value. The status field of the response indicates if the execution is successful.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {String} transactionHash Transaction hash value
         * @param {BasicTransactionApi~transactionReceiptCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link TransactionReceipt}
         */
        this.transactionReceipt = function(xChainId, transactionHash, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling transactionReceipt")
            }

            // verify the required parameter 'transactionHash' is set
            if (transactionHash === undefined || transactionHash === null) {
                throw new Error("Missing the required parameter 'transactionHash' when calling transactionReceipt")
            }

            const pathParams = {
                'transaction-hash': transactionHash,
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
            const returnType = TransactionReceipt

            return this.apiClient.callApi(
                '/v2/tx/{transaction-hash}',
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
         * Callback function to receive the result of the valueTransferTransaction operation.
         * @callback BasicTransactionApi~valueTransferTransactionCallback
         * @param {String} error Error message, if any.
         * @param {TransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * ValueTransferTransaction
         * Create a transaction for transferring KLAYs with or without a memo.
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {ValueTransferTransactionRequest} opts.body
         * @param {BasicTransactionApi~valueTransferTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link TransactionResult}
         */
        this.valueTransferTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling valueTransferTransaction")
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
            const returnType = TransactionResult

            return this.apiClient.callApi(
                '/v2/tx/value',
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

    return BasicTransactionApi
})
