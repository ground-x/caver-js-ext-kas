/**
 * Resource API
 * # Introduction Resource API allows you to query the resources in the pools on KAS.
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
const ResourceListResponse = require('../model/ResourceListResponse')

/**
 * ResourceList service.
 * @class ResourceListApi
 * @version 1.0
 */
class ResourceListApi {
    /**
     * Constructs a new ResourceListApi.
     * @alias ResourceListApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance
    }

    /**
     * Callback function to receive the result of the getResources operation.
     * @callback ResourceListApi~getResourcesCallback
     * @param {String} error Error message, if any.
     * @param {ResourceListResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Query resource list
     * Returns a list of user resources
     * @param {Object} opts Optional parameters
     * @param {ResourceListApi~getResourcesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link ResourceListResponse}
     */
    getResources(xChainId, accountId, opts, callback) {
        opts = opts || {}
        const postBody = null

        const pathParams = {
            'account-id': accountId,
        }
        const queryParams = {
            'from-timestamp': opts.fromTimestamp,
            'to-timestamp': opts.toTimestamp,
            size: opts.size,
            'resource-type': opts.resourceType,
            'service-id': opts.serviceId,
            cursor: opts.cursor,
        }
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = ResourceListResponse

        return this.apiClient.callApi(
            '/v1/resource/account/{account-id}',
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
module.exports = ResourceListApi
