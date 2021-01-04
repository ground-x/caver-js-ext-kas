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
        define(['../../ApiClient'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(require('../../ApiClient'))
    } else {
        // Browser globals (root is window)
        if (!root.TokenHistoryApi) {
            root.TokenHistoryApi = {}
        }
        root.TokenHistoryApi.Nft = factory(root.TokenHistoryApi.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The Nft model module.
     * @class Nft
     * @version 1.0
     */

    /**
     * Constructs a new <code>Nft</code>.
     * @alias Nft
     * @class
     * @param owner {String} EOA of owner (20-byte)
     * @param previousOwner {String} EOA of previous owner (20-byte)
     * @param tokenId {String} Token ID (in hexadecimal)
     * @param tokenUri {String} Unique token URL
     * @param transactionHash {String} Latest transaction hash (32-byte)
     * @param createdAt {Number} Time of token's creation (timestamp)
     * @param updatedAt {Number} Time when token information was last changed (timestamp)
     */
    const Nft = function(owner, previousOwner, tokenId, tokenUri, transactionHash, createdAt, updatedAt) {
        this.owner = owner
        this.previousOwner = previousOwner
        this.tokenId = tokenId
        this.tokenUri = tokenUri
        this.transactionHash = transactionHash
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    /**
     * Constructs a <code>Nft</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {Nft} obj Optional instance to populate.
     * @return {Nft} The populated <code>Nft</code> instance.
     * @memberof Nft
     */
    Nft.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new Nft()
            if (data.hasOwnProperty('owner')) obj.owner = ApiClient.convertToType(data.owner, 'String')
            if (data.hasOwnProperty('previousOwner')) obj.previousOwner = ApiClient.convertToType(data.previousOwner, 'String')
            if (data.hasOwnProperty('tokenId')) obj.tokenId = ApiClient.convertToType(data.tokenId, 'String')
            if (data.hasOwnProperty('tokenUri')) obj.tokenUri = ApiClient.convertToType(data.tokenUri, 'String')
            if (data.hasOwnProperty('transactionHash')) obj.transactionHash = ApiClient.convertToType(data.transactionHash, 'String')
            if (data.hasOwnProperty('createdAt')) obj.createdAt = ApiClient.convertToType(data.createdAt, 'Number')
            if (data.hasOwnProperty('updatedAt')) obj.updatedAt = ApiClient.convertToType(data.updatedAt, 'Number')
        }
        return obj
    }

    /**
     * EOA of owner (20-byte)
     * @type {String}
     * @memberof Nft
     */
    Nft.prototype.owner = undefined

    /**
     * EOA of previous owner (20-byte)
     * @type {String}
     * @memberof Nft
     */
    Nft.prototype.previousOwner = undefined

    /**
     * Token ID (in hexadecimal)
     * @type {String}
     * @memberof Nft
     */
    Nft.prototype.tokenId = undefined

    /**
     * Unique token URL
     * @type {String}
     * @memberof Nft
     */
    Nft.prototype.tokenUri = undefined

    /**
     * Latest transaction hash (32-byte)
     * @type {String}
     * @memberof Nft
     */
    Nft.prototype.transactionHash = undefined

    /**
     * Time of token's creation (timestamp)
     * @type {Number}
     * @memberof Nft
     */
    Nft.prototype.createdAt = undefined

    /**
     * Time when token information was last changed (timestamp)
     * @type {Number}
     * @memberof Nft
     */
    Nft.prototype.updatedAt = undefined

    return Nft
})
