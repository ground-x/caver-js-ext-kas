/*
 * Wallet API
 * # Introduction Wallet API is used to create and manage Klaytn accounts and transfer transactions. If you create a Klaytn account with Wallet API, you do not need to manage private keys separately. Wallet API provides a secure wallet to keep your Klaytn account’s private keys for BApp. For more details on Wallet API, refer to our [tutorial](https://docs.klaytnapi.com/v/ko/tutorial).  Wallet API features an “Account” section for creating and managing Klaytn accounts and a “Transaction” section for transferring transactions. Wallet API creates, deletes, and monitors Klaytn accounts; updates multisig accounts; and manages the privates keys of all accounts registered to KAS.  In addition, Wallet API creates transactions and transfers them to Klaytn. They include transactions that are sent through the multisig accounts. A transaction will be automatically transferred to Klaytn if the threshold is met for the number of signatures. For more details on multisignatures, refer to [the followings](https://docs.klaytnapi.com/v/ko/tutorial).  Transactions include basic and fee delegation transactions. In particular, fee delegation transactions include global and user fee delegation transactions. In the global fee delegation transaction, Ground X’s KAS account first pays the transaction fee and charges the users later. Meanwhile, in the user fee delegation transaction, a user creates an account to pay for transaction fees when sending transactions.  Wallet API has the following functions and limitations.  | Version | Item | Description | | :--- | :--- | :--- | | 2.0 | Limitations | Support for Cypress (mainnet) and Baobab (testnet) (Service Chain not supported) | |  |  | Account management for external management keys not supported | |  |  | Multisignatures of RLP-encoded transactions not supported | |  | Account management  | Account creation, search, and deletion | |  |  | Multisignature account updates | |  | Transaction management | [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic) Transaction Creation and Transfer | |  |  | [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) Transaction Creation and Transfer | |  |  | RLP-encoded transaction \\([Legacy](https://ko.docs.klaytn.com/klaytn/design/transactions/basic#txtypelegacytransaction), [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic), [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) Transaction Creation and Transfer \\) | |  |  | Multisignature transaction management and transfer | |  | Administrator | Resource pool management (creation, pool search, deletion, and account search) |    # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |   | 1061010 | data don't exist</br>data don't exist; krn:1001:wallet:68ec0e4b-0f61-4e6f-ae35-be865ab23187:account-pool:default:0x9b2f4d85d7f7abb14db229b5a81f1bdca0aa24c8ff0c4c100b3f25098b7a6152 1061510 | account has been already deleted or disabled 1061511 | account has been already deleted or enabled 1061512 | account is invalid to sign the transaction; 0xc9bFDDabf2c38396b097C8faBE9151955413995D</br>account is invalid to sign the transaction; 0x35Cc4921B17Dfa67a58B93c9F8918f823e58b77e 1061515 | the requested account must be a legacy account; if the account is multisig account, use `PUT /v2/tx/{fd|fd-user}/account` API for multisig transaction and /v2/multisig/_**_/_** APIs 1061607 | it has to start with '0x' and allows [0-9a-fA-F]; input</br>it has to start with '0x' and allows [0-9a-fA-F]; tx_id 1061608 | cannot be empty or zero value; to</br>cannot be empty or zero value; input</br>cannot be empty or zero value; address</br>cannot be empty or zero value; keyId 1061609 | it just allow Klaytn address form; to 1061615 | its value is out of range; size 1061616 | feeration must be between 1 and 99; feeRatio 1061903 | failed to decode account keys 1061905 | failed to get feepayer 1061912 | rlp value and request value are not same; feeRatio</br>rlp value and request value are not same; feePayer 1061914 | already submitted transaction. Confirm transaction hash; 0xb9612ec6ec39bfd3f2841daa7ab062fc94cf33f23503606c979b2f81e50b2cb1 1061917 | AccountKeyLegacy type is not supported in AccountKeyRoleBased type 1061918 | it just allow (Partial)FeeDelegation transaction type 1061919 | PartialFeeDelegation transaction must set fee ratio to non-zero value 1061920 | FeeDelegation transaction cannot set fee ratio, use PartialFeeDelegation transaction type 1061921 | it just allow Basic transaction type 1065000 | failed to retrieve a transaction from klaytn node 1065001 | failed to send a raw transaction to klaytn node; -32000::insufficient funds of the sender for value </br>failed to send a raw transaction to klaytn node; -32000::not a program account (e.g., an account having code and storage)</br>failed to send a raw transaction to klaytn node; -32000::nonce too low</br>failed to send a raw transaction to klaytn node; -32000::insufficient funds of the fee payer for gas * price 1065100 | failed to get an account from AMS</br>failed to get an account from AMS; account key corrupted. can not use this account 1065102 | account key corrupted. can not use this account |   # Authentication  <!-- ReDoc-Inject: <security-definitions> -->
 *
 * OpenAPI spec version: 1.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.18
 *
 * Do not edit the class manually.
 *
 */

;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            '../../ApiClient',
            '../model/AccountRegistration',
            '../model/ErrorResponse',
            '../model/RegistrationStatusResponse',
        ], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(
            require('../../ApiClient'),
            require('../model/AccountRegistration'),
            require('../model/ErrorResponse'),
            require('../model/RegistrationStatusResponse')
        )
    } else {
        // Browser globals (root is window)
        if (!root.WalletApi) {
            root.WalletApi = {}
        }
        root.WalletApi.RegistrationApi = factory(
            root.WalletApi.ApiClient,
            root.WalletApi.AccountRegistration,
            root.WalletApi.ErrorResponse,
            root.WalletApi.RegistrationStatusResponse
        )
    }
})(this, function(ApiClient, AccountRegistration, ErrorResponse, RegistrationStatusResponse) {
    /**
     * Registration service.
     * @class RegistrationApi
     * @version 1.0
     */

    /**
     * Constructs a new RegistrationApi.
     * @alias RegistrationApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    const RegistrationApi = function(apiClient) {
        this.apiClient = apiClient || ApiClient.instance

        /**
         * Callback function to receive the result of the registerAccount operation.
         * @callback RegistrationApi~registerAccountCallback
         * @param {String} error Error message, if any.
         * @param {RegistrationStatusResponse} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * RegisterAccount
         * Register account which used before
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {Object} opts Optional parameters
         * @param {Array.<AccountRegistration>} opts.body
         * @param {RegistrationApi~registerAccountCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link RegistrationStatusResponse}
         */
        this.registerAccount = function(xChainId, opts, callback) {
            opts = opts || {}
            const postBody = opts.body

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling registerAccount")
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
            const returnType = RegistrationStatusResponse

            return this.apiClient.callApi(
                '/v2/registration/account',
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

    return RegistrationApi
})
