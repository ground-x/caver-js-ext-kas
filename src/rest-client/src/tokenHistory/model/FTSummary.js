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
        root.TokenHistoryApi.FTSummary = factory(root.TokenHistoryApi.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The FTSummary model module.
     * @class FTSummary
     * @version 1.0
     */

    /**
     * Constructs a new <code>FTSummary</code>.
     * @alias FTSummary
     * @class
     * @param address {String} Contract address (20-byte)
     * @param owner {String} EOA address (20-byte)
     * @param balance {String} Token balance (hex)
     * @param formattedValue {String} Converted value using the decimals
     * @param decimals {Number} FT decimals
     * @param name {String} FT name
     * @param symbol {String} FT symbol
     * @param totalSupply {String} FT total supply (hex)
     * @param updatedAt {Number} UNIX timestamp of when the token information last changed
     */
    const FTSummary = function(address, owner, balance, formattedValue, decimals, name, symbol, totalSupply, updatedAt) {
        this.address = address
        this.owner = owner
        this.balance = balance
        this.formattedValue = formattedValue
        this.decimals = decimals
        this.name = name
        this.symbol = symbol
        this.totalSupply = totalSupply
        this.updatedAt = updatedAt
    }

    /**
     * Constructs a <code>FTSummary</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {FTSummary} obj Optional instance to populate.
     * @return {FTSummary} The populated <code>FTSummary</code> instance.
     * @memberof FTSummary
     */
    FTSummary.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new FTSummary()
            if (data.hasOwnProperty('address')) obj.address = ApiClient.convertToType(data.address, 'String')
            if (data.hasOwnProperty('owner')) obj.owner = ApiClient.convertToType(data.owner, 'String')
            if (data.hasOwnProperty('balance')) obj.balance = ApiClient.convertToType(data.balance, 'String')
            if (data.hasOwnProperty('formattedValue')) obj.formattedValue = ApiClient.convertToType(data.formattedValue, 'String')
            if (data.hasOwnProperty('decimals')) obj.decimals = ApiClient.convertToType(data.decimals, 'Number')
            if (data.hasOwnProperty('name')) obj.name = ApiClient.convertToType(data.name, 'String')
            if (data.hasOwnProperty('symbol')) obj.symbol = ApiClient.convertToType(data.symbol, 'String')
            if (data.hasOwnProperty('totalSupply')) obj.totalSupply = ApiClient.convertToType(data.totalSupply, 'String')
            if (data.hasOwnProperty('updatedAt')) obj.updatedAt = ApiClient.convertToType(data.updatedAt, 'Number')
        }
        return obj
    }

    /**
     * Contract address (20-byte)
     * @type {String}
     * @memberof FTSummary
     */
    FTSummary.prototype.address = undefined

    /**
     * EOA address (20-byte)
     * @type {String}
     * @memberof FTSummary
     */
    FTSummary.prototype.owner = undefined

    /**
     * Token balance (hex)
     * @type {String}
     * @memberof FTSummary
     */
    FTSummary.prototype.balance = undefined

    /**
     * Converted value using the decimals
     * @type {String}
     * @memberof FTSummary
     */
    FTSummary.prototype.formattedValue = undefined

    /**
     * FT decimals
     * @type {Number}
     * @memberof FTSummary
     */
    FTSummary.prototype.decimals = undefined

    /**
     * FT name
     * @type {String}
     * @memberof FTSummary
     */
    FTSummary.prototype.name = undefined

    /**
     * FT symbol
     * @type {String}
     * @memberof FTSummary
     */
    FTSummary.prototype.symbol = undefined

    /**
     * FT total supply (hex)
     * @type {String}
     * @memberof FTSummary
     */
    FTSummary.prototype.totalSupply = undefined

    /**
     * UNIX timestamp of when the token information last changed
     * @type {Number}
     * @memberof FTSummary
     */
    FTSummary.prototype.updatedAt = undefined

    return FTSummary
})
