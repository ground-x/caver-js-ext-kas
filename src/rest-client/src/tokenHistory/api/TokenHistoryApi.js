/*
 * Token History API
 * # Introduction  Token History API allows users to search for information and transfer records on KLAY, FT (KIP-7, Labeled ERC-20), and NFT (KIP-17, Labeled ERC-721) tokens. You can use Token History API to check the records of a specific EOA transferring KLAY, retrieve NFT information, or other purposes.  For more details on Token History API, refer to our [tutorial](https://klaytn.com).  For any questions regarding this document or KAS, visit [the developer forum](https://forum.klaytn.com/).  # Authentication  <!-- ReDoc-Inject: <security-definitions> -->
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
        define(['../../ApiClient', '../model/InvalidQueryParameterValue', '../model/PageableTransfers', '../model/Transfers'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(
            require('../../ApiClient'),
            require('../model/InvalidQueryParameterValue'),
            require('../model/PageableTransfers'),
            require('../model/Transfers')
        )
    } else {
        // Browser globals (root is window)
        if (!root.TokenHistoryApi) {
            root.TokenHistoryApi = {}
        }
        root.TokenHistoryApi.TokenHistoryApi = factory(
            root.TokenHistoryApi.ApiClient,
            root.TokenHistoryApi.InvalidQueryParameterValue,
            root.TokenHistoryApi.PageableTransfers,
            root.TokenHistoryApi.Transfers
        )
    }
})(this, function(ApiClient, InvalidQueryParameterValue, PageableTransfers, Transfers) {
    /**
     * TokenHistory service.
     * @class TokenHistoryApi
     * @version 1.0
     */

    /**
     * Constructs a new TokenHistoryApi.
     * @alias TokenHistoryApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    const TokenHistoryApi = function(apiClient) {
        this.apiClient = apiClient || ApiClient.instance

        /**
         * Callback function to receive the result of the getTransfers operation.
         * @callback TokenHistoryApi~getTransfersCallback
         * @param {String} error Error message, if any.
         * @param {PageableTransfers} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getTransfers
         * Search for integrated transfer details. The transfer details include KLAY (`KlayTransfer`), FT (`FtTransfer`), and NFT (`NftTransfer`) transfers.<p></p>  ## KlayTransfer in the FT/NFT Transaction Details Search Result<p></p>  For FT and NFT transfers, the `KlayTransfer` transfer detail for executing the token transfer is included. This is because the FT/NFT token transfer is basically an execution of the FT/NFT contract function, and the API includes the triggering KlayTransfer in response which executed the token transfer. Because transactions that execute contract functions do not generally transfer KLAY, the `value` of the `KlayTransfer` for executing the FT and NFT transfers can be 0.<p></p>  ## Transaction Type<p></p>  * Set the `kind` parameter to search for transaction details regarding KLAY, FT, or NFT.<br> * Transaction details for all types will be included in the search response if the `kind` parameter is not set.<p></p><br>  ## Search period<p></p>  * For `range`, enter the query in the `range={from},{to}` format.<br> * `{from}` and `{to}` will be regarded as Unix time if they are integers and block numbers if they are in hexadecimal format.<br> * If the `{to}` value is empty, the current time or recent block number will be used.<br> * Transaction details can be retrieved for up to six (6) months at once (for both Unix time and block numbers).<p></p><br>  ## Preset<p></p>  A Preset contains EOA, FT, and NFT contract addresses, allowing users to easily and quickly retrieve transfer histories of a frequently requested set of accounts.<p></p>  * The `presets` query parameter is a required parameter.<br> * [Preset](https://console.klaytnapi.com/service/th/preset/list) must be pre-generated in the KAS Console.<br> * The preset ID can be checked in the KAS Console.<p></p><br>  ## Size<p></p>  * The `size` query parameter is optional (minimum = 1, maximum = 1000, default = 100).<br> * Submitting negative values result in errors.<br> * Submitting zero results in a query with `size=100`, which is the default value.<br> * Submitting values greater than 1000 result in queries with `size=1000`, which is the maximum value.<br>
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} presets (csv) Preset IDs to use in search, check Preset IDs in KSA Console
         * @param {Object} opts Optional parameters
         * @param {String} opts.kind (csv) Indicate the [“klay”, “ft”, or “nft”] type. All types will be searched if no type is specified.
         * @param {String} opts.range Search range (block number of Unix time)
         * @param {Number} opts.size Maximum number of items to retrieve (min=1, max=1000, default=100)
         * @param {String} opts.cursor Response offset
         * @param {TokenHistoryApi~getTransfersCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link PageableTransfers}
         */
        this.getTransfers = function(xChainId, presets, opts, callback) {
            opts = opts || {}
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getTransfers")
            }

            // verify the required parameter 'presets' is set
            if (presets === undefined || presets === null) {
                throw new Error("Missing the required parameter 'presets' when calling getTransfers")
            }

            const pathParams = {}
            const queryParams = {
                kind: opts.kind,
                range: opts.range,
                size: opts.size,
                cursor: opts.cursor,
                presets: presets,
            }
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = PageableTransfers

            return this.apiClient.callApi(
                '/v2/transfer',
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
         * Callback function to receive the result of the getTransfersByEoa operation.
         * @callback TokenHistoryApi~getTransfersByEoaCallback
         * @param {String} error Error message, if any.
         * @param {PageableTransfers} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getTransfersByEoa
         * Search for token transfer details of a specific EOA. This is functionally similar to `GET /v2/transfer`. However, if this EOA receives or transfers the token in the returned transfer object, `to` or `from` is the same with the EOA, respectively.<p></p>  Transfer details include KLAY (`KlayTransfer`), FT (`FtTransfer`), and NFT (`NftTransfer`) transfers. For the FT and NFT transfers, the KlayTransfer transfer details for executing the token transfer are included. The `value` of the `KlayTransfer` for executing the FT and NFT transfers can be 0. For more details, refer to `GET /v2/transfer`.<p></p>  ## Transaction Type<p></p>  * Set the `kind` parameter to search for transaction details regarding KLAY, FT, or NFT.<br> * Transaction details for all types will be included in the search response if the `kind` parameter is not set.<p></p><br>  ## Search period<p></p>  * For `range`, enter the query in the `range={from},{to}` format.<br> * `{from}` and `{to}` will be regarded as Unix time if they are integers and block numbers if they are in hexadecimal format.<br> * If the `{to}` value is empty, the current time or recent block number will be used.<br> * Transaction details can be retrieved for up to six (6) months at once (for both Unix time and block numbers).<p></p><br>  ## Size<p></p>  * The `size` query parameter is optional (minimum = 1, maximum = 1000, default = 100).<br> * Submitting negative values result in errors.<br> * Submitting zero results in a query with `size=100`, which is the default value.<br> * Submitting values greater than 1000 result in queries with `size=1000`, which is the maximum value.<br>
         * @param {String} xChainId Klaytn chain network ID (1001 or 8217)
         * @param {String} address EOA to search, the response only contains transfer details where each transfer detail's `from` or `to` is equal to `address`
         * @param {Object} opts Optional parameters
         * @param {String} opts.kind (csv) Indicate the [“klay”, “ft”, or “nft”] type. All types will be searched if no type is specified.
         * @param {String} opts.caFilter FT/NFT contract address to filter from the result. If set, the response only contains FT/NFT transfer details with the matching address specified in `ca-filter`.
         * @param {String} opts.range Search range (block number of Unix time)
         * @param {Number} opts.size Maximum number of items to retrieve (min=1, max=1000, default=100)
         * @param {String} opts.cursor Response offset
         * @param {TokenHistoryApi~getTransfersByEoaCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link PageableTransfers}
         */
        this.getTransfersByEoa = function(xChainId, address, opts, callback) {
            opts = opts || {}
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getTransfersByEoa")
            }

            // verify the required parameter 'address' is set
            if (address === undefined || address === null) {
                throw new Error("Missing the required parameter 'address' when calling getTransfersByEoa")
            }

            const pathParams = {
                address: address,
            }
            const queryParams = {
                kind: opts.kind,
                'ca-filter': opts.caFilter,
                range: opts.range,
                size: opts.size,
                cursor: opts.cursor,
            }
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = PageableTransfers

            return this.apiClient.callApi(
                '/v2/transfer/account/{address}',
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
         * Callback function to receive the result of the getTransfersByTxHash operation.
         * @callback TokenHistoryApi~getTransfersByTxHashCallback
         * @param {String} error Error message, if any.
         * @param {Transfers} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getTransfersByTxHash
         * Search for transfer details with a transaction hash. Transfer details include KLAY (`KlayTransfer`), FT (`FtTransfer`), and NFT (`NftTransfer`) transfers. For the FT and NFT transfers, the KlayTransfer transfer details for executing the token transfer are included. The `value` of the `KlayTransfer` for executing the FT and NFT transfers can be 0. For more details, refer to `GET /v2/transfer`.
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} transactionHash Transaction hash to search
         * @param {TokenHistoryApi~getTransfersByTxHashCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Transfers}
         */
        this.getTransfersByTxHash = function(xChainId, transactionHash, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getTransfersByTxHash")
            }

            // verify the required parameter 'transactionHash' is set
            if (transactionHash === undefined || transactionHash === null) {
                throw new Error("Missing the required parameter 'transactionHash' when calling getTransfersByTxHash")
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
            const returnType = Transfers

            return this.apiClient.callApi(
                '/v2/transfer/tx/{transaction-hash}',
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
    }

    return TokenHistoryApi
})
