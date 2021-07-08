/**
 * Token History API
 * # Introduction  Token History API allows you to query the transaction history of KLAY, FTs (KIP-7 and Labelled ERC-20), NFTs (KIP-17 and Labelled ERC-721), and MTs (KIP-37 and Labelled ERC-1155). You can track KLAY's transaction history or retrieve NFT-related data of a certain EOA.   For more details on using Token History API, please refer to the [Tutorial](https://docs.klaytnapi.com/tutorial).   For any inquiries on this document or KAS in general, please visit [Developer Forum](https://forum.klaytn.com/).
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
const FtContractDetail = require('../model/FtContractDetail')
const MtContractDetail = require('../model/MtContractDetail')
const NftContractDetail = require('../model/NftContractDetail')
const PageableFtContractDetails = require('../model/PageableFtContractDetails')
const PageableMtContractDetails = require('../model/PageableMtContractDetails')
const PageableNftContractDetails = require('../model/PageableNftContractDetails')

/**
 * TokenContract service.
 * @class TokenContractApi
 * @version 1.0
 */
class TokenContractApi {
    /**
     * Constructs a new TokenContractApi.
     * @alias TokenContractApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance
    }

    /**
     * Callback function to receive the result of the getFtContractDetail operation.
     * @callback TokenContractApi~getFtContractDetailCallback
     * @param {String} error Error message, if any.
     * @param {FtContractDetail} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get data of a certain FT contract
     * Fetch the FT contract information of a given address
     * @param {TokenContractApi~getFtContractDetailCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link FtContractDetail}
     */
    getFtContractDetail(xChainId, ftAddress, callback) {
        const postBody = null

        const pathParams = {
            'ft-address': ftAddress,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = FtContractDetail

        return this.apiClient.callApi(
            '/v2/contract/ft/{ft-address}',
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
     * Callback function to receive the result of the getListOfMtContracts operation.
     * @callback TokenContractApi~getListOfMtContractsCallback
     * @param {String} error Error message, if any.
     * @param {PageableMtContractDetails} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Query list of MT contract data
     * Fetch data of labelled MTs for all contracts.&lt;p&gt;&lt;/p&gt;  ## Size&lt;p&gt;&lt;/p&gt;  * The query parameter &#x60;size&#x60; is optional. (Min &#x3D; 1, Max &#x3D; 1000, Default &#x3D; 100)&lt;br&gt; * Returns an error when given a negative number&lt;br&gt; * Uses default (&#x60;size&#x3D;100&#x60;) when given a 0&lt;br&gt; * Uses the maximum value (&#x60;size&#x3D;1000&#x60;) when given a value higher than 1000&lt;br&gt;
     * @param {Object} opts Optional parameters
     * @param {TokenContractApi~getListOfMtContractsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link PageableMtContractDetails}
     */
    getListOfMtContracts(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = null

        const pathParams = {}
        const queryParams = {
            status: opts.status,
            type: opts.type,
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
        const returnType = PageableMtContractDetails

        return this.apiClient.callApi(
            '/v2/contract/mt',
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
     * Callback function to receive the result of the getListOfNftContracts operation.
     * @callback TokenContractApi~getListOfNftContractsCallback
     * @param {String} error Error message, if any.
     * @param {PageableNftContractDetails} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Query list of all NFT contract data
     * Fetch data of all labelled NFT contracts.&lt;p&gt;&lt;/p&gt;  ## Size&lt;p&gt;&lt;/p&gt;  * The query parameter &#x60;size&#x60; is optional. (Min &#x3D; 1, Max &#x3D; 1000, Default &#x3D; 100)&lt;br&gt; * Returns an error when given a negative number&lt;br&gt; * Uses default (&#x60;size&#x3D;100&#x60;) when given a 0&lt;br&gt; * Uses the maximum value (&#x60;size&#x3D;1000&#x60;) when given a value higher than 1000&lt;br&gt;
     * @param {Object} opts Optional parameters
     * @param {TokenContractApi~getListOfNftContractsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link PageableNftContractDetails}
     */
    getListOfNftContracts(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = null

        const pathParams = {}
        const queryParams = {
            status: opts.status,
            type: opts.type,
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
        const returnType = PageableNftContractDetails

        return this.apiClient.callApi(
            '/v2/contract/nft',
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
     * Callback function to receive the result of the getListofFtContracts operation.
     * @callback TokenContractApi~getListofFtContractsCallback
     * @param {String} error Error message, if any.
     * @param {PageableFtContractDetails} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Query all FT contract data
     * Fetch data of all labelled FT contracts.&lt;p&gt;&lt;/p&gt;  ## Size&lt;p&gt;&lt;/p&gt;  * The query parameter &#x60;size&#x60; is optional. (Min &#x3D; 1, Max &#x3D; 1000, Default &#x3D; 100)&lt;br&gt; * Returns an error when given a negative number&lt;br&gt; * Uses default (&#x60;size&#x3D;100&#x60;) when given a 0&lt;br&gt; * Uses the maximum value (&#x60;size&#x3D;1000&#x60;) when given a value higher than 1000&lt;br&gt;
     * @param {Object} opts Optional parameters
     * @param {TokenContractApi~getListofFtContractsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link PageableFtContractDetails}
     */
    getListofFtContracts(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = null

        const pathParams = {}
        const queryParams = {
            status: opts.status,
            type: opts.type,
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
        const returnType = PageableFtContractDetails

        return this.apiClient.callApi(
            '/v2/contract/ft',
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
     * Callback function to receive the result of the getMtContractDetail operation.
     * @callback TokenContractApi~getMtContractDetailCallback
     * @param {String} error Error message, if any.
     * @param {MtContractDetail} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get data of a certain MT contract
     * Fetch data of labelled MTs for a certain contract.
     * @param {TokenContractApi~getMtContractDetailCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link MtContractDetail}
     */
    getMtContractDetail(xChainId, mtAddress, callback) {
        const postBody = null

        const pathParams = {
            'mt-address': mtAddress,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = MtContractDetail

        return this.apiClient.callApi(
            '/v2/contract/mt/{mt-address}',
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
     * Callback function to receive the result of the getNftContractDetail operation.
     * @callback TokenContractApi~getNftContractDetailCallback
     * @param {String} error Error message, if any.
     * @param {NftContractDetail} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get data of certain NFT contracts
     * Fetch data of labelled NFTs for a certain contract.
     * @param {TokenContractApi~getNftContractDetailCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link NftContractDetail}
     */
    getNftContractDetail(xChainId, nftAddress, callback) {
        const postBody = null

        const pathParams = {
            'nft-address': nftAddress,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = NftContractDetail

        return this.apiClient.callApi(
            '/v2/contract/nft/{nft-address}',
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
}
module.exports = TokenContractApi
