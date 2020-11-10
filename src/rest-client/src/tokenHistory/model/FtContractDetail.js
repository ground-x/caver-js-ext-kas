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
        define(['../../ApiClient', '../model/FtLink'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(require('../../ApiClient'), require('./FtLink'))
    } else {
        // Browser globals (root is window)
        if (!root.TokenHistoryApi) {
            root.TokenHistoryApi = {}
        }
        root.TokenHistoryApi.FtContractDetail = factory(root.TokenHistoryApi.ApiClient, root.TokenHistoryApi.FtLink)
    }
})(this, function(ApiClient, FtLink) {
    /**
     * The FtContractDetail model module.
     * @class FtContractDetail
     * @version 1.0
     */

    /**
     * Constructs a new <code>FtContractDetail</code>.
     * @alias FtContractDetail
     * @class
     * @param address {String} Contract address (20-byte)
     * @param decimals {Number} Number of token digits
     * @param name {String} Token name
     * @param symbol {String} Token symbol
     * @param status {String} Contract labeling status (completed, processing, failed, cancelled)
     * @param totalSupply {String} Total issue count (in hexadecimal)
     * @param createdAt {Number} Time of labeling (timestamp)
     * @param updatedAt {Number} Time when labeling information was last changed (timestamp)
     * @param deletedAt {Number} Time when labeling was deleted (timestamp); 0 if it was not removed
     * @param link {FtLink}
     * @param type {String} Contract type (KIP-7, KIP-17, ERC-20, ERC-721)
     * @memberof FtContractDetail
     */
    const FtContractDetail = function(address, decimals, name, symbol, status, totalSupply, createdAt, updatedAt, deletedAt, link, type) {
        this.address = address
        this.decimals = decimals
        this.name = name
        this.symbol = symbol
        this.status = status
        this.totalSupply = totalSupply
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
        this.link = link
        this.type = type
    }

    /**
     * Constructs a <code>FtContractDetail</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {FtContractDetail} obj Optional instance to populate.
     * @return {FtContractDetail} The populated <code>FtContractDetail</code> instance.
     * @memberof FtContractDetail
     */
    FtContractDetail.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new FtContractDetail()
            if (data.hasOwnProperty('address')) obj.address = ApiClient.convertToType(data.address, 'String')
            if (data.hasOwnProperty('decimals')) obj.decimals = ApiClient.convertToType(data.decimals, 'Number')
            if (data.hasOwnProperty('name')) obj.name = ApiClient.convertToType(data.name, 'String')
            if (data.hasOwnProperty('symbol')) obj.symbol = ApiClient.convertToType(data.symbol, 'String')
            if (data.hasOwnProperty('status')) obj.status = ApiClient.convertToType(data.status, 'String')
            if (data.hasOwnProperty('totalSupply')) obj.totalSupply = ApiClient.convertToType(data.totalSupply, 'String')
            if (data.hasOwnProperty('createdAt')) obj.createdAt = ApiClient.convertToType(data.createdAt, 'Number')
            if (data.hasOwnProperty('updatedAt')) obj.updatedAt = ApiClient.convertToType(data.updatedAt, 'Number')
            if (data.hasOwnProperty('deletedAt')) obj.deletedAt = ApiClient.convertToType(data.deletedAt, 'Number')
            if (data.hasOwnProperty('link')) obj.link = FtLink.constructFromObject(data.link)
            if (data.hasOwnProperty('type')) obj.type = ApiClient.convertToType(data.type, 'String')
        }
        return obj
    }

    /**
     * Contract address (20-byte)
     * @type {String}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.address = undefined

    /**
     * Number of token digits
     * @type {Number}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.decimals = undefined

    /**
     * Token name
     * @type {String}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.name = undefined

    /**
     * Token symbol
     * @type {String}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.symbol = undefined

    /**
     * Contract labeling status (completed, processing, failed, cancelled)
     * @type {String}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.status = undefined

    /**
     * Total issue count (in hexadecimal)
     * @type {String}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.totalSupply = undefined

    /**
     * Time of labeling (timestamp)
     * @type {Number}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.createdAt = undefined

    /**
     * Time when labeling information was last changed (timestamp)
     * @type {Number}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.updatedAt = undefined

    /**
     * Time when labeling was deleted (timestamp); 0 if it was not removed
     * @type {Number}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.deletedAt = undefined

    /**
     * @type {FtLink}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.link = undefined

    /**
     * Contract type (KIP-7, KIP-17, ERC-20, ERC-721)
     * @type {String}
     * @memberof FtContractDetail
     */
    FtContractDetail.prototype.type = undefined

    return FtContractDetail
})
