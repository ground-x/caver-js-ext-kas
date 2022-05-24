/**
 * Metadata API
 * # Introduction  The Metadata API helps BApp (Blockchain Application) developers to manage assets and metadata for their tokens.  Asset and metadata are used when you mint Klaytn's [KIP-17](https://kips.klaytn.com/KIPs/kip-17) Tokens (NFTs), [KIP-37](https://kips.klaytn.com/KIPs/kip-37) Tokens (MTs).  An asset refers to an image or a video file of an NFT or MT. When you mint an NFT or MT, you first have to upload the asset and include the returned asset URI in the metadata when minting the token. Metadata originally refers to \"data of data\". In the context of NFTs or MTs, it refers to the properties (name, description, image URL etc.) of the tokens. It is stored in JSON format.  Metadata API enables you to do the following actions: - upload assets - upload metadata - provide an externally accessible URI for the assets and metadata  # Error Code This section contains the errors that might occur when using Metadata API. KAS uses [HTTP status codes](https://developer.mozilla.org/en/docs/Web/HTTP/Status). Error code tables can be found [here](#tag/err-400).
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
const UploadAssetResponse = require('../model/UploadAssetResponse')
const UploadMetadataRequest = require('../model/UploadMetadataRequest')
const UploadMetadataResponse = require('../model/UploadMetadataResponse')

/**
 * DataUpload service.
 * @class DataUploadApi
 * @version 1.0
 */
class DataUploadApi {
    /**
     * Constructs a new DataUploadApi.
     * @alias DataUploadApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance
    }

    /**
     * Callback function to receive the result of the uploadAsset operation.
     * @callback DataUploadApi~uploadAssetCallback
     * @param {String} error Error message, if any.
     * @param {UploadAssetResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Upload Asset
     * Uploads an asset. Supported file types include jpg, png, and gif. After uploading the asset file, it returns a public URI to access the asset.
     * @param {Object} opts Optional parameters
     * @param {DataUploadApi~uploadAssetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link UploadAssetResponse}
     */
    uploadAsset(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = null

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {
            file: opts.file,
        }

        const authNames = ['basic']
        const contentTypes = ['multipart/form-data']
        const accepts = ['application/json']
        const returnType = UploadAssetResponse

        return this.apiClient.callApi(
            '/v1/metadata/asset',
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
     * Callback function to receive the result of the uploadMetadata operation.
     * @callback DataUploadApi~uploadMetadataCallback
     * @param {String} error Error message, if any.
     * @param {UploadMetadataResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Upload Metadata
     * Uploads metadata. After uploading the metadata, it returns an externally accessible public URI for that metadata.
     * @param {Object} opts Optional parameters
     * @param {DataUploadApi~uploadMetadataCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link UploadMetadataResponse}
     */
    uploadMetadata(xChainId, opts, callback) {
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
        const returnType = UploadMetadataResponse

        return this.apiClient.callApi(
            '/v1/metadata',
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
module.exports = DataUploadApi
