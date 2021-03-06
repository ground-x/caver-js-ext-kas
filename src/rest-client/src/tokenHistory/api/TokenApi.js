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
        define([
            '../../ApiClient',
            '../model/ErrorResponse',
            '../model/MtToken',
            '../model/Nft',
            '../model/PageableMtTokens',
            '../model/PageableMtTokensWithBalance',
            '../model/PageableMts',
            '../model/PageableNfts',
        ], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(
            require('../../ApiClient'),
            require('../model/ErrorResponse'),
            require('../model/MtToken'),
            require('../model/Nft'),
            require('../model/PageableMtTokens'),
            require('../model/PageableMtTokensWithBalance'),
            require('../model/PageableMts'),
            require('../model/PageableNfts')
        )
    } else {
        // Browser globals (root is window)
        if (!root.TokenHistoryApi) {
            root.TokenHistoryApi = {}
        }
        root.TokenHistoryApi.TokenApi = factory(
            root.TokenHistoryApi.ApiClient,
            root.TokenHistoryApi.ErrorResponse,
            root.TokenHistoryApi.MtToken,
            root.TokenHistoryApi.Nft,
            root.TokenHistoryApi.PageableMtTokens,
            root.TokenHistoryApi.PageableMtTokensWithBalance,
            root.TokenHistoryApi.PageableMts,
            root.TokenHistoryApi.PageableNfts
        )
    }
})(this, function(ApiClient, ErrorResponse, MtToken, Nft, PageableMtTokens, PageableMtTokensWithBalance, PageableMts, PageableNfts) {
    /**
     * Token service.
     * @class TokenApi
     * @version 1.0
     */

    /**
     * Constructs a new TokenApi.
     * @alias TokenApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    const TokenApi = function(apiClient) {
        this.apiClient = apiClient || ApiClient.instance

        /**
         * Callback function to receive the result of the getMtTokensByContractAddressAndOwnerAddress operation.
         * @callback TokenApi~getMtTokensByContractAddressAndOwnerAddressCallback
         * @param {String} error Error message, if any.
         * @param {PageableMtTokensWithBalance} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getMtTokensByContractAddressAndOwnerAddress
         * Lists all tokens of a MT contract that are owned by the queried EOA address.<p></p>  ## Size<p></p>  * The `size` query parameter is optional (minimum = 1, maximum = 1000, default = 100).<br> * Submitting negative values result in errors.<br> * Submitting zero results in a query with `size=100`, which is the default value.<br> * Submitting values greater than 1000 result in queries with `size=1000`, which is the maximum value.<br>
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} mtAddress MT contract address to look up
         * @param {String} ownerAddress EOA address
         * @param {Object} opts Optional parameters
         * @param {String} opts.cursor Offset for the next batch of items
         * @param {Number} opts.size Number of items to return (min=1, max=1000, default=100)
         * @param {TokenApi~getMtTokensByContractAddressAndOwnerAddressCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link PageableMtTokensWithBalance}
         */
        this.getMtTokensByContractAddressAndOwnerAddress = function(xChainId, mtAddress, ownerAddress, opts, callback) {
            opts = opts || {}
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getMtTokensByContractAddressAndOwnerAddress")
            }

            // verify the required parameter 'mtAddress' is set
            if (mtAddress === undefined || mtAddress === null) {
                throw new Error("Missing the required parameter 'mtAddress' when calling getMtTokensByContractAddressAndOwnerAddress")
            }

            // verify the required parameter 'ownerAddress' is set
            if (ownerAddress === undefined || ownerAddress === null) {
                throw new Error("Missing the required parameter 'ownerAddress' when calling getMtTokensByContractAddressAndOwnerAddress")
            }

            const pathParams = {
                'mt-address': mtAddress,
                'owner-address': ownerAddress,
            }
            const queryParams = {
                cursor: opts.cursor,
                size: opts.size,
            }
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = PageableMtTokensWithBalance

            return this.apiClient.callApi(
                '/v2/contract/mt/{mt-address}/owner/{owner-address}',
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
         * Callback function to receive the result of the getMtTokensByContractAddressAndOwnerAddressAndTokenId operation.
         * @callback TokenApi~getMtTokensByContractAddressAndOwnerAddressAndTokenIdCallback
         * @param {String} error Error message, if any.
         * @param {MtToken} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getMtTokensByContractAddressAndOwnerAddressAndTokenId
         * Retrieves a specific MT information.
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} mtAddress MT contract address to look up
         * @param {String} ownerAddress Owner address
         * @param {String} tokenId MT ID (hex)
         * @param {TokenApi~getMtTokensByContractAddressAndOwnerAddressAndTokenIdCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link MtToken}
         */
        this.getMtTokensByContractAddressAndOwnerAddressAndTokenId = function(xChainId, mtAddress, ownerAddress, tokenId, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error(
                    "Missing the required parameter 'xChainId' when calling getMtTokensByContractAddressAndOwnerAddressAndTokenId"
                )
            }

            // verify the required parameter 'mtAddress' is set
            if (mtAddress === undefined || mtAddress === null) {
                throw new Error(
                    "Missing the required parameter 'mtAddress' when calling getMtTokensByContractAddressAndOwnerAddressAndTokenId"
                )
            }

            // verify the required parameter 'ownerAddress' is set
            if (ownerAddress === undefined || ownerAddress === null) {
                throw new Error(
                    "Missing the required parameter 'ownerAddress' when calling getMtTokensByContractAddressAndOwnerAddressAndTokenId"
                )
            }

            // verify the required parameter 'tokenId' is set
            if (tokenId === undefined || tokenId === null) {
                throw new Error(
                    "Missing the required parameter 'tokenId' when calling getMtTokensByContractAddressAndOwnerAddressAndTokenId"
                )
            }

            const pathParams = {
                'mt-address': mtAddress,
                'owner-address': ownerAddress,
                'token-id': tokenId,
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
            const returnType = MtToken

            return this.apiClient.callApi(
                '/v2/contract/mt/{mt-address}/owner/{owner-address}/token/{token-id}',
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
         * Callback function to receive the result of the getMtTokensByContractAddressAndTokenId operation.
         * @callback TokenApi~getMtTokensByContractAddressAndTokenIdCallback
         * @param {String} error Error message, if any.
         * @param {PageableMtTokens} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getMtTokensByContractAddressAndTokenId
         * Lists all EOA addresses who own the queried MT.<p></p>  ## Size<p></p>  * The `size` query parameter is optional (minimum = 1, maximum = 1000, default = 100).<br> * Submitting negative values result in errors.<br> * Submitting zero results in a query with `size=100`, which is the default value.<br> * Submitting values greater than 1000 result in queries with `size=1000`, which is the maximum value.<br>
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} mtAddress MT contract address to look up
         * @param {String} tokenId MT ID (hex)
         * @param {Object} opts Optional parameters
         * @param {String} opts.cursor Offset for the next batch of items
         * @param {Number} opts.size Number of items to return (min=1, max=1000, default=100)
         * @param {TokenApi~getMtTokensByContractAddressAndTokenIdCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link PageableMtTokens}
         */
        this.getMtTokensByContractAddressAndTokenId = function(xChainId, mtAddress, tokenId, opts, callback) {
            opts = opts || {}
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getMtTokensByContractAddressAndTokenId")
            }

            // verify the required parameter 'mtAddress' is set
            if (mtAddress === undefined || mtAddress === null) {
                throw new Error("Missing the required parameter 'mtAddress' when calling getMtTokensByContractAddressAndTokenId")
            }

            // verify the required parameter 'tokenId' is set
            if (tokenId === undefined || tokenId === null) {
                throw new Error("Missing the required parameter 'tokenId' when calling getMtTokensByContractAddressAndTokenId")
            }

            const pathParams = {
                'mt-address': mtAddress,
                'token-id': tokenId,
            }
            const queryParams = {
                cursor: opts.cursor,
                size: opts.size,
            }
            const collectionQueryParams = {}
            const headerParams = {
                'x-chain-id': xChainId,
            }
            const formParams = {}

            const authNames = ['auth']
            const contentTypes = ['application/json']
            const accepts = ['application/json']
            const returnType = PageableMtTokens

            return this.apiClient.callApi(
                '/v2/contract/mt/{mt-address}/token/{token-id}',
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
         * Callback function to receive the result of the getMtsByContractAddress operation.
         * @callback TokenApi~getMtsByContractAddressCallback
         * @param {String} error Error message, if any.
         * @param {PageableMts} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getMtsByContractAddress
         * Lists all tokens minted from the queried MT contract.<p></p>  ## Size<p></p>  * The `size` query parameter is optional (minimum = 1, maximum = 1000, default = 100).<br> * Submitting negative values result in errors.<br> * Submitting zero results in a query with `size=100`, which is the default value.<br> * Submitting values greater than 1000 result in queries with `size=1000`, which is the maximum value.<br>
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} mtAddress MT contract address to look up
         * @param {Object} opts Optional parameters
         * @param {Number} opts.size Number of items to return (min=1, max=1000, default=100)
         * @param {String} opts.cursor Offset for the next batch of items
         * @param {TokenApi~getMtsByContractAddressCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link PageableMts}
         */
        this.getMtsByContractAddress = function(xChainId, mtAddress, opts, callback) {
            opts = opts || {}
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getMtsByContractAddress")
            }

            // verify the required parameter 'mtAddress' is set
            if (mtAddress === undefined || mtAddress === null) {
                throw new Error("Missing the required parameter 'mtAddress' when calling getMtsByContractAddress")
            }

            const pathParams = {
                'mt-address': mtAddress,
            }
            const queryParams = {
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
            const returnType = PageableMts

            return this.apiClient.callApi(
                '/v2/contract/mt/{mt-address}/token',
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
         * Callback function to receive the result of the getNftById operation.
         * @callback TokenApi~getNftByIdCallback
         * @param {String} error Error message, if any.
         * @param {Nft} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getNftById
         * Retrieve information for a specific NFT.
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} nftAddress NFT contract address
         * @param {String} tokenId NFT ID (HEX)
         * @param {TokenApi~getNftByIdCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link Nft}
         */
        this.getNftById = function(xChainId, nftAddress, tokenId, callback) {
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getNftById")
            }

            // verify the required parameter 'nftAddress' is set
            if (nftAddress === undefined || nftAddress === null) {
                throw new Error("Missing the required parameter 'nftAddress' when calling getNftById")
            }

            // verify the required parameter 'tokenId' is set
            if (tokenId === undefined || tokenId === null) {
                throw new Error("Missing the required parameter 'tokenId' when calling getNftById")
            }

            const pathParams = {
                'nft-address': nftAddress,
                'token-id': tokenId,
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
            const returnType = Nft

            return this.apiClient.callApi(
                '/v2/contract/nft/{nft-address}/token/{token-id}',
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
         * Callback function to receive the result of the getNftsByContractAddress operation.
         * @callback TokenApi~getNftsByContractAddressCallback
         * @param {String} error Error message, if any.
         * @param {PageableNfts} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getNftsByContractAddress
         * Specify an NFT contract to retrieve the information for all NFTs issued by the contract.<p></p>  ## Size<p></p>  * The `size` query parameter is optional (minimum = 1, maximum = 1000, default = 100).<br> * Submitting negative values result in errors.<br> * Submitting zero results in a query with `size=100`, which is the default value.<br> * Submitting values greater than 1000 result in queries with `size=1000`, which is the maximum value.<br>
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} nftAddress NFT contract address
         * @param {Object} opts Optional parameters
         * @param {Number} opts.size Maxium number of items to return (min=1, max=1000, default=100)
         * @param {String} opts.cursor Response offset
         * @param {TokenApi~getNftsByContractAddressCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link PageableNfts}
         */
        this.getNftsByContractAddress = function(xChainId, nftAddress, opts, callback) {
            opts = opts || {}
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getNftsByContractAddress")
            }

            // verify the required parameter 'nftAddress' is set
            if (nftAddress === undefined || nftAddress === null) {
                throw new Error("Missing the required parameter 'nftAddress' when calling getNftsByContractAddress")
            }

            const pathParams = {
                'nft-address': nftAddress,
            }
            const queryParams = {
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
            const returnType = PageableNfts

            return this.apiClient.callApi(
                '/v2/contract/nft/{nft-address}/token',
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
         * Callback function to receive the result of the getNftsByOwnerAddress operation.
         * @callback TokenApi~getNftsByOwnerAddressCallback
         * @param {String} error Error message, if any.
         * @param {PageableNfts} data The data returned by the service call.
         * @param {String} response The complete HTTP response.
         */

        /**
         * getNftsByOwnerAddress
         * Specify the NFT contract and EOA to retrieve the information of the NFTs which the EOA currently owns and were issued by the NFT contract.<p></p>  ## Size<p></p>  * The `size` query parameter is optional (minimum = 1, maximum = 1000, default = 100).<br> * Submitting negative values result in errors.<br> * Submitting zero results in a query with `size=100`, which is the default value.<br> * Submitting values greater than 1000 result in queries with `size=1000`, which is the maximum value.<br>
         * @param {String} xChainId Klaytn network chain ID (1001 or 8217)
         * @param {String} nftAddress NFT contract address
         * @param {String} ownerAddress EOA address
         * @param {Object} opts Optional parameters
         * @param {Number} opts.size Maximum number of items to return (min=1, max=1000, default=100)
         * @param {String} opts.cursor Response offset
         * @param {TokenApi~getNftsByOwnerAddressCallback} callback The callback function, accepting three arguments: error, data, response
         * data is of type: {@link PageableNfts}
         */
        this.getNftsByOwnerAddress = function(xChainId, nftAddress, ownerAddress, opts, callback) {
            opts = opts || {}
            const postBody = null

            // verify the required parameter 'xChainId' is set
            if (xChainId === undefined || xChainId === null) {
                throw new Error("Missing the required parameter 'xChainId' when calling getNftsByOwnerAddress")
            }

            // verify the required parameter 'nftAddress' is set
            if (nftAddress === undefined || nftAddress === null) {
                throw new Error("Missing the required parameter 'nftAddress' when calling getNftsByOwnerAddress")
            }

            // verify the required parameter 'ownerAddress' is set
            if (ownerAddress === undefined || ownerAddress === null) {
                throw new Error("Missing the required parameter 'ownerAddress' when calling getNftsByOwnerAddress")
            }

            const pathParams = {
                'nft-address': nftAddress,
                'owner-address': ownerAddress,
            }
            const queryParams = {
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
            const returnType = PageableNfts

            return this.apiClient.callApi(
                '/v2/contract/nft/{nft-address}/owner/{owner-address}',
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

    return TokenApi
})
