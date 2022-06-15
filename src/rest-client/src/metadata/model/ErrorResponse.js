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

/**
 * The ErrorResponse model module.
 * @class ErrorResponse
 * @version 1.0
 */
class ErrorResponse {
    /**
     * Constructs a new <code>ErrorResponse</code>.
     * @alias ErrorResponse
     * @class
     * @param code {Number} Error Code
     * @param message {String} Error Message
     * @param requestId {String} Request ID
     */

    constructor(code, message, requestId) {
        this.code = code
        this.message = message
        this.requestId = requestId
    }

    /**
     * Constructs a <code>ErrorResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {ErrorResponse} obj Optional instance to populate.
     * @return {ErrorResponse} The populated <code>ErrorResponse</code> instance.
     * @memberof ErrorResponse
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ErrorResponse()

            if (data.hasOwnProperty('code')) {
                obj.code = ApiClient.convertToType(data.code, 'Number')
            }
            if (data.hasOwnProperty('message')) {
                obj.message = ApiClient.convertToType(data.message, 'String')
            }
            if (data.hasOwnProperty('requestId')) {
                obj.requestId = ApiClient.convertToType(data.requestId, 'String')
            }
        }
        return obj
    }
}

/**
 * Error Code
 * @type {Number}
 * @memberof ErrorResponse
 */
ErrorResponse.prototype.code = undefined
/**
 * Error Message
 * @type {String}
 * @memberof ErrorResponse
 */
ErrorResponse.prototype.message = undefined
/**
 * Request ID
 * @type {String}
 * @memberof ErrorResponse
 */
ErrorResponse.prototype.requestId = undefined

module.exports = ErrorResponse