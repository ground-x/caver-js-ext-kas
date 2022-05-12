/**
 * KIP-17 API
 * # Introduction The KIP-17 API helps BApp (Blockchain Application) developers to manage contracts and tokens created in accordance with the [KIP-17](https://docs.klaytnapi.com/v/en/api#kip-17-api) standard, which is Klaytn's technical speficication for Non-Fungible Tokens.  The functionality of the multiple endpoints enables you to do the following actions: - deploy smart contracts - manage the entire life cycle of an NFT from minting, to sending and burning - get contract or token data - authorize a third party to execute token transfers - view token ownership history  For more details on KAS, please refer to [KAS Docs](https://docs.klaytnapi.com/). If you have any questions or comments, please leave them in the [Klaytn Developers Forum](http://forum.klaytn.com).    **alias**  When a method of the KIP-17 API requires a contract address, you can use the contract **alias**. You can give the contract an alias when deploying, and use it in place of the complicated address.  # Fee Payer Options KAS KIP-17 supports four ways to pay the transaction fees.<br />  **1. Only using KAS Global FeePayer Account** <br /> Sends all transactions using KAS Global FeePayer Account. ``` {     \"options\": {       \"enableGlobalFeePayer\": true     } } ``` <br />  **2. Using User FeePayer Account** <br /> Sends all transactions using User FeePayer Account. ``` {   \"options\": {     \"enableGlobalFeePayer\": false,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ``` <br />  **3. Using both KAS Global FeePayer Account + User FeePayer Account** <br /> Sends transactions using User FeePayer Account by default, and switches to the KAS Global FeePayer Account when balances are insufficient. ``` {   \"options\": {     \"enableGlobalFeePayer\": true,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ``` <br />  **4. Not using FeePayer Account** <br /> Sends transactions the default way, paying the transaction fee from the user's account. ``` {   \"options\": {     \"enableGlobalFeePayer\": false   } } ``` <br />  # Error Code This section contains the errors that might occur when using the KIP-17 API. KAS uses HTTP status codes. More details can be found in this [link](https://developer.mozilla.org/en/docs/Web/HTTP/Status).
 *
 * OpenAPI spec version: 1.0
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

const ApiClient = require('../../../ApiClient')
const GetKip17TokenHistoryResponse = require('../../model/GetKip17TokenHistoryResponse')
const GetKip17TokenResponse = require('../../model/GetKip17TokenResponse')
const GetOwnerKip17TokensResponse = require('../../model/GetOwnerKip17TokensResponse')
const Kip17TokenListResponse = require('../../model/Kip17TokenListResponse')
const Kip17TransactionStatusResponse = require('../../model/Kip17TransactionStatusResponse')

/**
 * Kip17Token service.
 * @class Kip17TokenApi
 * @version 1.0
 */
class Kip17TokenApi {
    /**
     * Constructs a new Kip17TokenApi.
     * @alias Kip17TokenApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance
    }

    /**
     * Callback function to receive the result of the approveAll operation.
     * @callback Kip17TokenApi~approveAllCallback
     * @param {String} error Error message, if any.
     * @param {Kip17TransactionStatusResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Approve/Deny Transfers of All Token
     * Grant or deny authorization to &#x60;to&#x60; to send all tokens owned by &#x60;from&#x60; in a specified contract.&lt;p&gt;&lt;/p&gt;   You will see in &#x60;Submitted&#x60; in the response even when you enter the wrong address or token ID, or when the &#x60;from&#x60; and &#x60;owner&#x60; are different. But that does not mean that it is successfully &#x60;Committed&#x60;). To confirm transaction status, use Get Transaction Receipt from the Wallet API [/v2/tx/{transaction-hash}](https://refs.klaytnapi.com/en/wallet/latest#operation/TransactionReceipt).&lt;p&gt;&lt;/p&gt;
     * @param {Object} opts Optional parameters
     * @param {Kip17TokenApi~approveAllCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip17TransactionStatusResponse}
     */
    approveAll(xChainId, contractAddressOrAlias, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
            'x-krn': opts.xKrn,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip17TransactionStatusResponse

        return this.apiClient.callApi(
            '/v1/contract/{contract-address-or-alias}/approveall',
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
     * Callback function to receive the result of the approveToken operation.
     * @callback Kip17TokenApi~approveTokenCallback
     * @param {String} error Error message, if any.
     * @param {Kip17TransactionStatusResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Approve/Deny Authorization for Token Transfers
     * Grant or deny authorization to &#x60;to&#x60; to send a specified token. To deny authorization, enter &#x60;0x0000000000000000000000000000000000000000&#x60; for &#x60;to&#x60;.   You will see in &#x60;Submitted&#x60; in the response even when you enter the wrong token ID, the &#x60;from&#x60; and &#x60;owner&#x60; are differet. But that does not mean that it is successfully &#x60;Committed&#x60;. To confirm transaction status, use Get Transaction Receipt from the Wallet API [/v2/tx/{transaction-hash}](https://refs.klaytnapi.com/en/wallet/latest#operation/TransactionReceipt).&lt;p&gt;&lt;/p&gt;  ##### From  &#x60;from&#x60; is the address that sends the transaction. If &#x60;from&#x60; is an account in the default &#x60;account-pool&#x60; of KIP-17 or Wallet Service, you can omit the KRN header. &lt;br /&gt; Otherwise you need to include the KRN header (&#x60;x-krn: krn:{chain-id}:wallet:{account-id}:account-pool:{pool name}&#x60;).
     * @param {Object} opts Optional parameters
     * @param {Kip17TokenApi~approveTokenCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip17TransactionStatusResponse}
     */
    approveToken(xChainId, contractAddressOrAlias, tokenId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
            'token-id': tokenId,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
            'x-krn': opts.xKrn,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip17TransactionStatusResponse

        return this.apiClient.callApi(
            '/v1/contract/{contract-address-or-alias}/approve/{token-id}',
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
     * Callback function to receive the result of the burnToken operation.
     * @callback Kip17TokenApi~burnTokenCallback
     * @param {String} error Error message, if any.
     * @param {Kip17TransactionStatusResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Burn Token
     * Burns a token.   You will see &#x60;Submitted&#x60; in the response even when you enter the wrong token ID, the &#x60;from&#x60; and &#x60;owner&#x60; are different, or when &#x60;from&#x60; is not authorized to burn the token. But that does not mean that it is successfully &#x60;Committed&#x60;. To confirm transaction status, use Get Transaction Receipt from the Wallet API [/v2/tx/{transaction-hash}](https://refs.klaytnapi.com/en/wallet/latest#operation/TransactionReceipt).&lt;p&gt;&lt;/p&gt;   ##### From &#x60;from&#x60; is the address that sends the transaction. If &#x60;from&#x60; is an account in the default &#x60;account-pool&#x60; of KIP-17 or Wallet Service, you can omit the KRN header. &lt;br /&gt; Otherwise you need to include the KRN header (&#x60;x-krn: krn:{chain-id}:wallet:{account-id}:account-pool:{pool name}&#x60;).
     * @param {Object} opts Optional parameters
     * @param {Kip17TokenApi~burnTokenCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip17TransactionStatusResponse}
     */
    burnToken(xChainId, contractAddressOrAlias, tokenId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
            'token-id': tokenId,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
            'x-krn': opts.xKrn,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip17TransactionStatusResponse

        return this.apiClient.callApi(
            '/v1/contract/{contract-address-or-alias}/token/{token-id}',
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
     * Callback function to receive the result of the getOwnerTokens operation.
     * @callback Kip17TokenApi~getOwnerTokensCallback
     * @param {String} error Error message, if any.
     * @param {GetOwnerKip17TokensResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * List Tokens by Address
     * Returns a list of all tokens existent for a contract.
     * @param {Object} opts Optional parameters
     * @param {Kip17TokenApi~getOwnerTokensCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link GetOwnerKip17TokensResponse}
     */
    getOwnerTokens(xChainId, contractAddressOrAlias, ownerAddress, opts, callback) {
        opts = opts || {}
        const postBody = null

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
            'owner-address': ownerAddress,
        }
        const queryParams = {
            size: opts.size,
            cursor: opts.cursor,
        }
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = GetOwnerKip17TokensResponse

        return this.apiClient.callApi(
            '/v1/contract/{contract-address-or-alias}/owner/{owner-address}',
            'GET',
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
     * Callback function to receive the result of the getToken operation.
     * @callback Kip17TokenApi~getTokenCallback
     * @param {String} error Error message, if any.
     * @param {GetKip17TokenResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get Token Data
     * Returns the data of a specified token. You can use the contract alias in place of the address.&lt;p&gt;&lt;/p&gt;
     * @param {Kip17TokenApi~getTokenCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link GetKip17TokenResponse}
     */
    getToken(xChainId, contractAddressOrAlias, tokenId, callback) {
        const postBody = null

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
            'token-id': tokenId,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = GetKip17TokenResponse

        return this.apiClient.callApi(
            '/v1/contract/{contract-address-or-alias}/token/{token-id}',
            'GET',
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
     * Callback function to receive the result of the getTokenHistory operation.
     * @callback Kip17TokenApi~getTokenHistoryCallback
     * @param {String} error Error message, if any.
     * @param {GetKip17TokenHistoryResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get Token Ownership History
     * Returns the transaction history of a specified token from the time it was minted. Each item in the response represents a transfer.
     * @param {Object} opts Optional parameters
     * @param {Kip17TokenApi~getTokenHistoryCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link GetKip17TokenHistoryResponse}
     */
    getTokenHistory(xChainId, contractAddressOrAlias, tokenId, opts, callback) {
        opts = opts || {}
        const postBody = null

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
            'token-id': tokenId,
        }
        const queryParams = {
            size: opts.size,
            cursor: opts.cursor,
        }
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = GetKip17TokenHistoryResponse

        return this.apiClient.callApi(
            '/v1/contract/{contract-address-or-alias}/token/{token-id}/history',
            'GET',
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
     * Callback function to receive the result of the listTokens operation.
     * @callback Kip17TokenApi~listTokensCallback
     * @param {String} error Error message, if any.
     * @param {Kip17TokenListResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get Token List
     * Returns a list of all tokens minted from a specified KIP-17 contract. You can use the contract alias in place of the address.
     * @param {Object} opts Optional parameters
     * @param {Kip17TokenApi~listTokensCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip17TokenListResponse}
     */
    listTokens(xChainId, contractAddressOrAlias, opts, callback) {
        opts = opts || {}
        const postBody = null

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {
            size: opts.size,
            cursor: opts.cursor,
        }
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = Kip17TokenListResponse

        return this.apiClient.callApi(
            '/v1/contract/{contract-address-or-alias}/token',
            'GET',
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
     * Callback function to receive the result of the mintToken operation.
     * @callback Kip17TokenApi~mintTokenCallback
     * @param {String} error Error message, if any.
     * @param {Kip17TransactionStatusResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Mint Token
     * Mints a new token from a specified KIP-17 contract. You can use the contract alias in place of the address.  &gt; **NOTE**  &gt; &gt; Minting a token to an address outside the KAS Account Pool hinders you from sending or burning the token using KAS..
     * @param {Object} opts Optional parameters
     * @param {Kip17TokenApi~mintTokenCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip17TransactionStatusResponse}
     */
    mintToken(xChainId, contractAddressOrAlias, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
            'x-krn': opts.xKrn,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip17TransactionStatusResponse

        return this.apiClient.callApi(
            '/v1/contract/{contract-address-or-alias}/token',
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
     * Callback function to receive the result of the transferToken operation.
     * @callback Kip17TokenApi~transferTokenCallback
     * @param {String} error Error message, if any.
     * @param {Kip17TransactionStatusResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Transfer Token
     * Sends a token to a specified address. If the token has a different &#x60;sender&#x60; and &#x60;owner&#x60;, the &#x60;sender&#x60; must be authorized to send the token. You can authorize an account to send tokens via [v1/contract/{contract-address-or-alias}/approve/{token-id}](#operation/ApproveToken).&lt;p&gt;&lt;/p&gt;   You will see &#x60;Submitted&#x60; in the response even when you enter a wrong token ID. But that does not mean that it is successfully &#x60;Committed&#x60;. To confirm transaction status, use Get Transaction Receipt from the Wallet API [/v2/tx/{transaction-hash}](https://refs.klaytnapi.com/en/wallet/latest#operation/TransactionReceipt).   ##### Sender  &#x60;sender&#x60; is the address that sends the transaction. If it is an account in the default &#x60;account-pool&#x60; of KIP-17 or Wallet Service, you can omit the KRN header. &lt;br /&gt; Otherwise you need to include the KRN header (&#x60;x-krn: krn:{chain-id}:wallet:{account-id}:account-pool:{pool name}&#x60;).
     * @param {Object} opts Optional parameters
     * @param {Kip17TokenApi~transferTokenCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip17TransactionStatusResponse}
     */
    transferToken(xChainId, contractAddressOrAlias, tokenId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
            'token-id': tokenId,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
            'x-krn': opts.xKrn,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip17TransactionStatusResponse

        return this.apiClient.callApi(
            '/v1/contract/{contract-address-or-alias}/token/{token-id}',
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
module.exports = Kip17TokenApi