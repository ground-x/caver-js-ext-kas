/**
 * Wallet API
 * # Introduction Wallet API is an API for creating and managing Klaytn accounts as well as sending transactions. If you create your Klaytn account using Wallet API, you don't have to manage your private key yourself. Wallet API provides a wallet for safe storage of your Klaytn account private keys that you would need to use BApps. For more details on how to use Wallet API, please refer to this [tutorial](https://docs.klaytnapi.com/v/en/tutorial).  Wallet API can be divided into the Account part, which creates and manages Klaytn accounts, and the Transaction part, which sends different kinds of transactions.  Wallet API creates, deletes and monitors Klaytn accounts and updates the accounts to multisig, and manages all private keys for all accounts registered on KAS.  Wallet API can also create transaction to send it to Klaytn. These include transactions sent from multisig accounts. In case of muiltisig accounts, a transaction will automatically be sent to Klaytn once \\(Threshold\\) is met. For more detail, please refer to this [tutorial](https://docs.klaytnapi.com/v/en/tutorial).  There are mainly two types of transactions: basic transactions and fee delegation transactions. Fee delegation transactions include Global Fee Delegation transaction and user fee deletation transaction. With the Global Fee Delegation transaction scheme, the transaction fee will initially be paid by GroundX and then be charged to you at a later date. With the User Fee Delegation transaction scheme, you create an account that pays the transaction fees on behalf of the users when a transaction.  The functionalities and limits of Wallet API are shown below:  | Version | Item | Description | | :--- | :--- | :--- | | 2.0 | Limits | Supports Cypress(Mainnet), Baobab(Testnet) \\ Doesn't support (Service Chain \\) | |  |  | Doesn't support account management for external custodial keys | |  |  | Doesn't support multisig for RLP encoded transactions | |  | Account management | Create, retrieve and delete account | |  |  | Multisig account update | |  | Managing transaction | [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic) creating and sending transaction | |  |  | [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) creating and sending transaction | |  |  | RLP encoded transaction\\([Legacy](https://ko.docs.klaytn.com/klaytn/design/transactions/basic#txtypelegacytransaction), [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic), [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation)\\) creating and sending | |  |  | Managing and sending multisig transactions | |  | Administrator | Manage resource pool\\(create, query pool, delete, retrieve account \\) |    # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |   | 1061010 | data don't exist</br>data don't exist; krn:1001:wallet:68ec0e4b-0f61-4e6f-ae35-be865ab23187:account-pool:default:0x9b2f4d85d7f7abb14db229b5a81f1bdca0aa24c8ff0c4c100b3f25098b7a6152 1061510 | account has been already deleted or disabled 1061511 | account has been already deleted or enabled 1061512 | account is invalid to sign the transaction; 0x18925BDD724614bF13Bd5d53a74adFd228903796</br>account is invalid to sign the transaction; 0x6d06e7cA9F26d6D30B3b4Dff6084E74C51908fef 1061515 | the requested account must be a legacy account; if the account is multisig account, use `PUT /v2/tx/{fd|fd-user}/account` API for multisig transaction and /v2/multisig/_**_/_** APIs 1061607 | it has to start with '0x' and allows [0-9a-fA-F]; input</br>it has to start with '0x' and allows [0-9a-fA-F]; transaction-id 1061608 | cannot be empty or zero value; to</br>cannot be empty or zero value; keyId</br>cannot be empty or zero value; address 1061609 | it just allow Klaytn address form; to 1061615 | its value is out of range; size 1061616 | fee ratio must be between 1 and 99; feeRatio 1061903 | failed to decode account keys; runtime error: slice bounds out of range [:64] with length 4 1061905 | failed to get feepayer 1061912 | rlp value and request value are not same; feeRatio</br>rlp value and request value are not same; feePayer 1061914 | already submitted transaction. Confirm transaction hash; 0x6f2e9235a48a86c3a7912b4237f83e760609c7ca609bbccbf648c8617a3a980c</br>already submitted transaction. Confirm transaction hash; 0xfb1fae863da42bcefdde3d572404bf5fcb89c1809e9253d5fff7c07a4bb5210f 1061917 | AccountKeyLegacy type is not supported in AccountKeyRoleBased type 1061918 | it just allow (Partial)FeeDelegation transaction type 1061919 | PartialFeeDelegation transaction must set fee ratio to non-zero value 1061920 | FeeDelegation transaction cannot set fee ratio, use PartialFeeDelegation transaction type 1061921 | it just allow Basic transaction type 1065000 | failed to retrieve a transaction from klaytn node 1065001 | failed to send a raw transaction to klaytn node; -32000::insufficient funds of the sender for value </br>failed to send a raw transaction to klaytn node; -32000::not a program account (e.g., an account having code and storage)</br>failed to send a raw transaction to klaytn node; -32000::nonce too low</br>failed to send a raw transaction to klaytn node; -32000::insufficient funds of the fee payer for gas * price 1065100 | failed to get an account</br>failed to get an account; data don't exist</br>failed to get an account; account key corrupted. can not use this account 1065102 | account key corrupted. can not use this account |
 *
 * OpenAPI spec version: 1.0
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

const ApiClient = require('../../ApiClient')
const ErrorResponse = require('../model/ErrorResponse')
const FDTransactionResult = require('../model/FDTransactionResult')
const FDUserAccountUpdateTransactionRequest = require('../model/FDUserAccountUpdateTransactionRequest')
const FDUserAnchorTransactionRequest = require('../model/FDUserAnchorTransactionRequest')
const FDUserCancelTransactionRequest = require('../model/FDUserCancelTransactionRequest')
const FDUserContractDeployTransactionRequest = require('../model/FDUserContractDeployTransactionRequest')
const FDUserContractExecutionTransactionRequest = require('../model/FDUserContractExecutionTransactionRequest')
const FDUserProcessRLPRequest = require('../model/FDUserProcessRLPRequest')
const FDUserValueTransferTransactionRequest = require('../model/FDUserValueTransferTransactionRequest')

/**
 * FeeDelegatedTransactionPaidByUser service.
 * @class FeeDelegatedTransactionPaidByUserApi
 * @version 1.0
 */
class FeeDelegatedTransactionPaidByUserApi {
    /**
     * Constructs a new FeeDelegatedTransactionPaidByUserApi.
     * @alias FeeDelegatedTransactionPaidByUserApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance
    }

    /**
     * Callback function to receive the result of the uFDAccountUpdateTransaction operation.
     * @callback FeeDelegatedTransactionPaidByUserApi~uFDAccountUpdateTransactionCallback
     * @param {String} error Error message, if any.
     * @param {FDTransactionResult} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * User Fee Delegation account update transaction
     * Create a transaction for updating the Klaytn account key to another key, using user&#x27;s fee payer account. You can find Klaytn account key types in [Accounts](https://ko.docs.klaytn.com/klaytn/design/accounts).&lt;p&gt;&lt;/p&gt;  To use this API, you need two &#x60;x-krn&#x60; for &#x60;account-pool&#x60;  and &#x60;feepayer-pool&#x60;. The values for &#x60;x-krn&#x60; is written separated with a comma, as shown below.&lt;p&gt;&lt;/p&gt;  &#x60;&#x60;&#x60; x-krn: krn:1001:wallet:local:account-pool:{{account-pool-id}},krn:1001:wallet:local:feepayer-pool:{{feepayer-pool-id}} &#x60;&#x60;&#x60;
     * @param {Object} opts Optional parameters
     * @param {FeeDelegatedTransactionPaidByUserApi~uFDAccountUpdateTransactionCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link FDTransactionResult}
     */
    uFDAccountUpdateTransaction(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = FDTransactionResult

        return this.apiClient.callApi(
            '/v2/tx/fd-user/account',
            'PUT',
            pathParams,
            queryParams,
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
     * Callback function to receive the result of the uFDAnchorTransaction operation.
     * @callback FeeDelegatedTransactionPaidByUserApi~uFDAnchorTransactionCallback
     * @param {String} error Error message, if any.
     * @param {FDTransactionResult} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * User Fee Delegation anchor transaction
     * Create a transaction for anchoring the service chain data on the main chain with the user fee payer account.&lt;p&gt;&lt;/p&gt;  To use this API, you need two &#x60;x-krn&#x60; for &#x60;account-pool&#x60;  and &#x60;feepayer-pool&#x60;. The values for &#x60;x-krn&#x60; are written separated with a comma, as shown below.&lt;p&gt;&lt;/p&gt;  &#x60;&#x60;&#x60; x-krn: krn:1001:wallet:local:account-pool:{{account-pool-id}},krn:1001:wallet:local:feepayer-pool:{{feepayer-pool-id}} &#x60;&#x60;&#x60;
     * @param {Object} opts Optional parameters
     * @param {FeeDelegatedTransactionPaidByUserApi~uFDAnchorTransactionCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link FDTransactionResult}
     */
    uFDAnchorTransaction(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = FDTransactionResult

        return this.apiClient.callApi(
            '/v2/tx/fd-user/anchor',
            'POST',
            pathParams,
            queryParams,
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
     * Callback function to receive the result of the uFDContractDeployTransaction operation.
     * @callback FeeDelegatedTransactionPaidByUserApi~uFDContractDeployTransactionCallback
     * @param {String} error Error message, if any.
     * @param {FDTransactionResult} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Contract deploy transaction with user fee delegation
     * Create a transaction for deploying contracts with the fee payer account created by user.&lt;p&gt;&lt;/p&gt;  To use this API, you need two &#x60;x-krn&#x60; for &#x60;account-pool&#x60;  and &#x60;feepayer-pool&#x60;. The values for &#x60;x-krn&#x60; are written separated with a comma, as shown below.&lt;p&gt;&lt;/p&gt;  &#x60;&#x60;&#x60; x-krn: krn:1001:wallet:local:account-pool:{{account-pool-id}},krn:1001:wallet:local:feepayer-pool:{{feepayer-pool-id}} &#x60;&#x60;&#x60;
     * @param {Object} opts Optional parameters
     * @param {FeeDelegatedTransactionPaidByUserApi~uFDContractDeployTransactionCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link FDTransactionResult}
     */
    uFDContractDeployTransaction(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = FDTransactionResult

        return this.apiClient.callApi(
            '/v2/tx/fd-user/contract/deploy',
            'POST',
            pathParams,
            queryParams,
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
     * Callback function to receive the result of the uFDContractExecutionTransaction operation.
     * @callback FeeDelegatedTransactionPaidByUserApi~uFDContractExecutionTransactionCallback
     * @param {String} error Error message, if any.
     * @param {FDTransactionResult} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Execution of transaction with user fee delegation
     * Create a transaction that executes contracts deployed with the user fee payer account.&lt;p&gt;&lt;/p&gt;  To use this API, you need two &#x60;x-krn&#x60; for &#x60;account-pool&#x60;  and &#x60;feepayer-pool&#x60;. The values for &#x60;x-krn&#x60; are written separated with a comma, as shown below.&lt;p&gt;&lt;/p&gt;  &#x60;&#x60;&#x60; x-krn: krn:1001:wallet:local:account-pool:{{account-pool-id}},krn:1001:wallet:local:feepayer-pool:{{feepayer-pool-id}} &#x60;&#x60;&#x60;
     * @param {Object} opts Optional parameters
     * @param {FeeDelegatedTransactionPaidByUserApi~uFDContractExecutionTransactionCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link FDTransactionResult}
     */
    uFDContractExecutionTransaction(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = FDTransactionResult

        return this.apiClient.callApi(
            '/v2/tx/fd-user/contract/execute',
            'POST',
            pathParams,
            queryParams,
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
     * Callback function to receive the result of the uFDProcessRLP operation.
     * @callback FeeDelegatedTransactionPaidByUserApi~uFDProcessRLPCallback
     * @param {String} error Error message, if any.
     * @param {FDTransactionResult} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Transaction with a user fee delegation RLP
     * Create transaction using rlp (SigRLP or TxHashRLP). The rlp from the transaction API of Wallet API is in the TxHashRLP format, which includes signature.  You can create a SigRLP without signature easily using caver.&lt;p&gt;&lt;/p&gt; If you want to create a SigRLP for each transaction method on caver, use &#x60;getRLPEncodingForSignature()&#x60;, and &#x60;getRLPEncoding()&#x60; to create TxHashRLP. For SigRLP, you sign with the private key of the &#x60;from&#x60; account, as long as the accounts have been created in the account pool. For more details on SigRLP and TxHashRLP by each transaction type, please refer to [Klaytn Docs](https://docs.klaytn.com/klaytn/design/transactions).  To use this API, you need two &#x60;x-krn&#x60; for &#x60;account-pool&#x60;  and &#x60;feepayer-pool&#x60;. The values for &#x60;x-krn&#x60; are written separated with a comma, as shown below.&lt;p&gt;&lt;/p&gt;  &#x60;&#x60;&#x60; x-krn: krn:1001:wallet:local:account-pool:{{account-pool-id}},krn:1001:wallet:local:feepayer-pool:{{feepayer-pool-id}} &#x60;&#x60;&#x60;
     * @param {Object} opts Optional parameters
     * @param {FeeDelegatedTransactionPaidByUserApi~uFDProcessRLPCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link FDTransactionResult}
     */
    uFDProcessRLP(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = FDTransactionResult

        return this.apiClient.callApi(
            '/v2/tx/fd-user/rlp',
            'POST',
            pathParams,
            queryParams,
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
     * Callback function to receive the result of the uFDUserCancelTransaction operation.
     * @callback FeeDelegatedTransactionPaidByUserApi~uFDUserCancelTransactionCallback
     * @param {String} error Error message, if any.
     * @param {FDTransactionResult} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Transaction for cancelling user fee delegation
     * Create a transaction for cancelling a pending transaction that had been sent to Klaytn with the user fee payer account. To cancel, you need either the nonce or the transaction hash.&lt;p&gt;&lt;/p&gt;  To use this API, you need two &#x60;x-krn&#x60; for &#x60;account-pool&#x60;  and &#x60;feepayer-pool&#x60;. The values for &#x60;x-krn&#x60; are written separated with a comma, as shown below.&lt;p&gt;&lt;/p&gt;  &#x60;&#x60;&#x60; x-krn: krn:1001:wallet:local:account-pool:{{account-pool-id}},krn:1001:wallet:local:feepayer-pool:{{feepayer-pool-id}} &#x60;&#x60;&#x60;
     * @param {Object} opts Optional parameters
     * @param {FeeDelegatedTransactionPaidByUserApi~uFDUserCancelTransactionCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link FDTransactionResult}
     */
    uFDUserCancelTransaction(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = FDTransactionResult

        return this.apiClient.callApi(
            '/v2/tx/fd-user',
            'DELETE',
            pathParams,
            queryParams,
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
     * Callback function to receive the result of the uFDValueTransferTransaction operation.
     * @callback FeeDelegatedTransactionPaidByUserApi~uFDValueTransferTransactionCallback
     * @param {String} error Error message, if any.
     * @param {FDTransactionResult} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * User Fee Delegation KLAY transfer transaction
     * Create a transaction for transferring KLAY with memo with the fee payer account created by user.&lt;p&gt;&lt;/p&gt;  To use this API, you need two &#x60;x-krn&#x60; for &#x60;account-pool&#x60; and &#x60;feepayer-pool&#x60;. The values for &#x60;x-krn&#x60; are written separated with a comma, as shown below.&lt;p&gt;&lt;/p&gt;  &#x60;&#x60;&#x60; x-krn: krn:1001:wallet:local:account-pool:{{account-pool-id}},krn:1001:wallet:local:feepayer-pool:{{feepayer-pool-id}} &#x60;&#x60;&#x60;
     * @param {Object} opts Optional parameters
     * @param {FeeDelegatedTransactionPaidByUserApi~uFDValueTransferTransactionCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link FDTransactionResult}
     */
    uFDValueTransferTransaction(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = FDTransactionResult

        return this.apiClient.callApi(
            '/v2/tx/fd-user/value',
            'POST',
            pathParams,
            queryParams,
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
module.exports = FeeDelegatedTransactionPaidByUserApi
