/*
 * Token History API
 * # Introduction  Token History API allows users to search for information and transfer records on KLAY, FT (KIP-7, Labeled ERC-20), and NFT (KIP-17, Labeled ERC-721) tokens. You can use Token History API to check the records of a specific EOA transferring KLAY, retrieve NFT information, or other purposes.  For more details on Token History API, refer to our [tutorial](https://klaytn.com).  For any questions regarding this document or KAS, visit [the developer forum](https://forum.klaytn.com/).
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
        define(['../../ApiClient', '../model/ErrorResponse', '../model/PageableAccountFT'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(require('../../ApiClient'), require('../model/ErrorResponse'), require('../model/PageableAccountFT'))
    } else {
        // Browser globals (root is window)
        if (!root.TokenHistoryApi) {
            root.TokenHistoryApi = {}
        }
        root.TokenHistoryApi.AccountApi = factory(
            root.TokenHistoryApi.ApiClient,
            root.TokenHistoryApi.ErrorResponse,
            root.TokenHistoryApi.PageableAccountFT
        )
    }
})(this, function(ApiClient, ErrorResponse, PageableAccountFT) {
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
         * Callback function to receive the result of the getFtSummaryByEoaAddress operation.
         * @callback AccountApi~getFtSummaryByEoaAddressCallback
         * @param {String} error Error message, if any.
         * @param {PageableAccountFT} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getFtSummaryByEoaAddress
         * Lists all fungible tokens owned by the queried EOA address.<p></p>  ## Ca Filters<p></p>  * Filter contracts by specifying contract addresses to include in `ca-filters`.<br> * Separate addresses by comma e.g., `?ca-filters=0x...,0x...`.<p></p><br>  ## Size<p></p>  * The `size` query parameter is optional (minimum = 1, maximum = 1000, default = 100).<br> * Submitting negative values result in errors.<br> * Submitting zero results in a query with `size=100`, which is the default value.<br> * Submitting values greater than 1000 result in queries with `size=1000`, which is the maximum value.<br>
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} address
         * @param {Object} opts Optional parameters
         * @param {Number} opts.size Number of items to return (min=1, max=1000, default=100)
         * @param {String} opts.cursor Offset for the next batch of items
         * @param {String} opts.caFilters (csv) Contract addresses to filter, separated by comma (0x..,0xa...)
         * @param {AccountApi~getFtSummaryByEoaAddressCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link PageableAccountFT}
         */
        this.getFtSummaryByEoaAddress = function(xChainId, address, opts, callback) {
            opts = opts || {}
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getFtSummaryByEoaAddress")
            }

            // verify the required parameter 'address' is set
            if (address === undefined || address === null) {
                throw new Error("Missing the required parameter 'address' when calling getFtSummaryByEoaAddress")
            }

            const pathParams = {
                address: address,
            }
            const queryParams = {
                size: opts.size,
                cursor: opts.cursor,
                'ca-filters': opts.caFilters,
            }
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = PageableAccountFT

            return this.apiClient.callApi(
                '/v2/account/token/{address}/ft',
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

    return AccountApi
})