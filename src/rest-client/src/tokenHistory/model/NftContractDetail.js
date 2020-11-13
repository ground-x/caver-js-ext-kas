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
        define(['../../ApiClient'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(require('../../ApiClient'))
    } else {
        // Browser globals (root is window)
        if (!root.TokenHistoryApi) {
            root.TokenHistoryApi = {}
        }
        root.TokenHistoryApi.NftContractDetail = factory(root.TokenHistoryApi.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The NftContractDetail model module.
     * @class NftContractDetail
     * @version 1.0
     */

    /**
     * Constructs a new <code>NftContractDetail</code>.
     * @alias NftContractDetail
     * @class
     * @param address {String} Contract address (20-byte)
     * @param name {String} Contract name
     * @param symbol {String} Contract symbol
     * @param totalSupply {String} Total issue count (in hexadecimal)
     * @param createdAt {Number} Time of labeling (timestamp)
     * @param updatedAt {Number} Time when labeling information was last changed (timestamp)
     * @param deletedAt {Number} Time when labeling was deleted (timestamp); 0 if it was not removed
     * @param type {String} Contract type (KIP-7, KIP-17, ERC-20, ERC-721)
     * @memberof NftContractDetail
     * @param status {String} Contract labeling status (completed, processing, failed, cancelled)
     */
    const NftContractDetail = function(address, name, symbol, totalSupply, createdAt, updatedAt, deletedAt, type, status) {
        this.address = address
        this.name = name
        this.symbol = symbol
        this.totalSupply = totalSupply
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
        this.type = type
        this.status = status
    }

    /**
     * Constructs a <code>NftContractDetail</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {NftContractDetail} obj Optional instance to populate.
     * @return {NftContractDetail} The populated <code>NftContractDetail</code> instance.
     * @memberof NftContractDetail
     */
    NftContractDetail.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new NftContractDetail()
            if (data.hasOwnProperty('address')) obj.address = ApiClient.convertToType(data.address, 'String')
            if (data.hasOwnProperty('name')) obj.name = ApiClient.convertToType(data.name, 'String')
            if (data.hasOwnProperty('symbol')) obj.symbol = ApiClient.convertToType(data.symbol, 'String')
            if (data.hasOwnProperty('totalSupply')) obj.totalSupply = ApiClient.convertToType(data.totalSupply, 'String')
            if (data.hasOwnProperty('createdAt')) obj.createdAt = ApiClient.convertToType(data.createdAt, 'Number')
            if (data.hasOwnProperty('updatedAt')) obj.updatedAt = ApiClient.convertToType(data.updatedAt, 'Number')
            if (data.hasOwnProperty('deletedAt')) obj.deletedAt = ApiClient.convertToType(data.deletedAt, 'Number')
            if (data.hasOwnProperty('type')) obj.type = ApiClient.convertToType(data.type, 'String')
            if (data.hasOwnProperty('status')) obj.status = ApiClient.convertToType(data.status, 'String')
        }
        return obj
    }

    /**
     * Contract address (20-byte)
     * @type {String}
     * @memberof NftContractDetail
     */
    NftContractDetail.prototype.address = undefined

    /**
     * Contract name
     * @type {String}
     * @memberof NftContractDetail
     */
    NftContractDetail.prototype.name = undefined

    /**
     * Contract symbol
     * @type {String}
     * @memberof NftContractDetail
     */
    NftContractDetail.prototype.symbol = undefined

    /**
     * Total issue count (in hexadecimal)
     * @type {String}
     * @memberof NftContractDetail
     */
    NftContractDetail.prototype.totalSupply = undefined

    /**
     * Time of labeling (timestamp)
     * @type {Number}
     * @memberof NftContractDetail
     */
    NftContractDetail.prototype.createdAt = undefined

    /**
     * Time when labeling information was last changed (timestamp)
     * @type {Number}
     * @memberof NftContractDetail
     */
    NftContractDetail.prototype.updatedAt = undefined

    /**
     * Time when labeling was deleted (timestamp); 0 if it was not removed
     * @type {Number}
     * @memberof NftContractDetail
     */
    NftContractDetail.prototype.deletedAt = undefined

    /**
     * Contract type (KIP-7, KIP-17, ERC-20, ERC-721)
     * @type {String}
     * @memberof NftContractDetail
     */
    NftContractDetail.prototype.type = undefined

    /**
     * Contract labeling status (completed, processing, failed, cancelled)
     * @type {String}
     * @memberof NftContractDetail
     */
    NftContractDetail.prototype.status = undefined

    return NftContractDetail
})
