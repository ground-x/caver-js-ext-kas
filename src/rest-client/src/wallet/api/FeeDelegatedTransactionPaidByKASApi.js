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
            '../model/ErrorResponse',
            '../model/FDAccountUpdateTransactionRequest',
            '../model/FDAnchorTransactionRequest',
            '../model/FDCancelTransactionRequest',
            '../model/FDContractDeployTransactionRequest',
            '../model/FDContractExecutionTransactionRequest',
            '../model/FDProcessRLPRequest',
            '../model/FDTransactionResult',
            '../model/FDValueTransferTransactionRequest',
        ], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(
            require('../../ApiClient'),
            require('../model/ErrorResponse'),
            require('../model/FDAccountUpdateTransactionRequest'),
            require('../model/FDAnchorTransactionRequest'),
            require('../model/FDCancelTransactionRequest'),
            require('../model/FDContractDeployTransactionRequest'),
            require('../model/FDContractExecutionTransactionRequest'),
            require('../model/FDProcessRLPRequest'),
            require('../model/FDTransactionResult'),
            require('../model/FDValueTransferTransactionRequest')
        )
    } else {
        // Browser globals (root is window)
        if (!root.WalletApi) {
            root.WalletApi = {}
        }
        root.WalletApi.FeeDelegatedTransactionPaidByKASApi = factory(
            root.WalletApi.ApiClient,
            root.WalletApi.ErrorResponse,
            root.WalletApi.FDAccountUpdateTransactionRequest,
            root.WalletApi.FDAnchorTransactionRequest,
            root.WalletApi.FDCancelTransactionRequest,
            root.WalletApi.FDContractDeployTransactionRequest,
            root.WalletApi.FDContractExecutionTransactionRequest,
            root.WalletApi.FDProcessRLPRequest,
            root.WalletApi.FDTransactionResult,
            root.WalletApi.FDValueTransferTransactionRequest
        )
    }
})(this, function(
    ApiClient,
    ErrorResponse,
    FDAccountUpdateTransactionRequest,
    FDAnchorTransactionRequest,
    FDCancelTransactionRequest,
    FDContractDeployTransactionRequest,
    FDContractExecutionTransactionRequest,
    FDProcessRLPRequest,
    FDTransactionResult,
    FDValueTransferTransactionRequest
) {
    /**
     * FeeDelegatedTransactionPaidByKAS service.
     * @class FeeDelegatedTransactionPaidByKASApi
     * @version 1.0
     */

    /**
     * Constructs a new FeeDelegatedTransactionPaidByKASApi.
     * @alias FeeDelegatedTransactionPaidByKASApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    const FeeDelegatedTransactionPaidByKASApi = function(apiClient) {
        this.apiClient = apiClient || ApiClient.instance

        /**
         * Callback function to receive the result of the fDAccountUpdateTransactionResponse operation.
         * @callback FeeDelegatedTransactionPaidByKASApi~fDAccountUpdateTransactionResponseCallback
         * @param {String} error Error message, if any.
         * @param {FDTransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * FDAccountUpdateTransactionResponse
         * Create a transaction that updates Klaytn account keys. You can find Klaytn account key types in  [Klaytn docs](https://docs.klaytn.com/klaytn/design/accounts).<p></p> If you update the account to Legacy key type (1), you can start using your account once it is enabled. If you update the account to Public key type (2), the account cannot be used within the wallet. To restore your account, use Global Fee Delegation RLP API, or update to legacy externally and before enabling the account. If you update the key to Fail key type (3), the account will automatically be disabled.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {FDAccountUpdateTransactionRequest} opts.body
         * @param {FeeDelegatedTransactionPaidByKASApi~fDAccountUpdateTransactionResponseCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link FDTransactionResult}
         */
        this.fDAccountUpdateTransactionResponse = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling fDAccountUpdateTransactionResponse")
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
            const returnType = FDTransactionResult

            return this.apiClient.callApi(
                '/v2/tx/fd/account',
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
         * Callback function to receive the result of the fDAnchorTransaction operation.
         * @callback FeeDelegatedTransactionPaidByKASApi~fDAnchorTransactionCallback
         * @param {String} error Error message, if any.
         * @param {FDTransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * FDAnchorTransaction
         * Create a transaction for anchoring blockchain data using KAS global fee payer account.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {FDAnchorTransactionRequest} opts.body
         * @param {FeeDelegatedTransactionPaidByKASApi~fDAnchorTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link FDTransactionResult}
         */
        this.fDAnchorTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling fDAnchorTransaction")
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
            const returnType = FDTransactionResult

            return this.apiClient.callApi(
                '/v2/tx/fd/anchor',
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
         * Callback function to receive the result of the fDCancelTransactionResponse operation.
         * @callback FeeDelegatedTransactionPaidByKASApi~fDCancelTransactionResponseCallback
         * @param {String} error Error message, if any.
         * @param {FDTransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * FDCancelTransactionResponse
         * Create a transaction for cancelling a pending transaction that had been sent to Klaytn with the KAS global fee payer account. To cancel, you need either the nonce or the transaction hash.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {FDCancelTransactionRequest} opts.body
         * @param {FeeDelegatedTransactionPaidByKASApi~fDCancelTransactionResponseCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link FDTransactionResult}
         */
        this.fDCancelTransactionResponse = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling fDCancelTransactionResponse")
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
            const returnType = FDTransactionResult

            return this.apiClient.callApi(
                '/v2/tx/fd',
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
         * Callback function to receive the result of the fDContractDeployTransaction operation.
         * @callback FeeDelegatedTransactionPaidByKASApi~fDContractDeployTransactionCallback
         * @param {String} error Error message, if any.
         * @param {FDTransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * FDContractDeployTransaction
         * Create a transaction for deploying contracts using KAS global fee payer account.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {FDContractDeployTransactionRequest} opts.body
         * @param {FeeDelegatedTransactionPaidByKASApi~fDContractDeployTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link FDTransactionResult}
         */
        this.fDContractDeployTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling fDContractDeployTransaction")
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
            const returnType = FDTransactionResult

            return this.apiClient.callApi(
                '/v2/tx/fd/contract/deploy',
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
         * Callback function to receive the result of the fDContractExecutionTransaction operation.
         * @callback FeeDelegatedTransactionPaidByKASApi~fDContractExecutionTransactionCallback
         * @param {String} error Error message, if any.
         * @param {FDTransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * FDContractExecutionTransaction
         * Create a transaction for executing contracts using KAS global fee payer account.
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {FDContractExecutionTransactionRequest} opts.body
         * @param {FeeDelegatedTransactionPaidByKASApi~fDContractExecutionTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link FDTransactionResult}
         */
        this.fDContractExecutionTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling fDContractExecutionTransaction")
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
            const returnType = FDTransactionResult

            return this.apiClient.callApi(
                '/v2/tx/fd/contract/execute',
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
         * Callback function to receive the result of the fDProcessRLP operation.
         * @callback FeeDelegatedTransactionPaidByKASApi~fDProcessRLPCallback
         * @param {String} error Error message, if any.
         * @param {FDTransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * FDProcessRLP
         * Create transaction using rlp (SigRLP or TxHashRLP). The rlp from the transaction API of Wallet API is in the TxHashRLP format, which includes signature. You can create a SigRLP without signature easily using caver. If you want to create a SigRLP for each transaction method on caver, use `getRLPEncodingForSignature()`, and `getRLPEncoding()` to create TxHashRLP. For SigRLP, you sign with the private key of the `from` account, For more details on SigRLP and TxHashRLP by each transaction type, please refer to [Klaytn Docs](https://docs.klaytn.com/klaytn/design/transactions).
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {FDProcessRLPRequest} opts.body
         * @param {FeeDelegatedTransactionPaidByKASApi~fDProcessRLPCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link FDTransactionResult}
         */
        this.fDProcessRLP = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling fDProcessRLP")
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
            const returnType = FDTransactionResult

            return this.apiClient.callApi(
                '/v2/tx/fd/rlp',
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
         * Callback function to receive the result of the fDValueTransferTransaction operation.
         * @callback FeeDelegatedTransactionPaidByKASApi~fDValueTransferTransactionCallback
         * @param {String} error Error message, if any.
         * @param {FDTransactionResult} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * FDValueTransferTransaction
         * Create a transaction for KLAY transfers with/without memos using KAS Global Fee Payer account.\"
         * @param {String} xChainId Klaytn Chain Network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {FDValueTransferTransactionRequest} opts.body
         * @param {FeeDelegatedTransactionPaidByKASApi~fDValueTransferTransactionCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link FDTransactionResult}
         */
        this.fDValueTransferTransaction = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling fDValueTransferTransaction")
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
            const returnType = FDTransactionResult

            return this.apiClient.callApi(
                '/v2/tx/fd/value',
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

    return FeeDelegatedTransactionPaidByKASApi
})
