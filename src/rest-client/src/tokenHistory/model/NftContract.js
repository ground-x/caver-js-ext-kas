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
        root.TokenHistoryApi.NftContract = factory(root.TokenHistoryApi.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The NftContract model module.
     * @class NftContract
     * @version 1.0
     */

    /**
     * Constructs a new <code>NftContract</code>.
     * @alias NftContract
     * @class
     * @param address {String} Contract address (20-byte)
     * @param name {String} Token name
     * @param symbol {String} Token symbol
     */
    const NftContract = function(address, name, symbol) {
        this.address = address
        this.name = name
        this.symbol = symbol
    }

    /**
     * Constructs a <code>NftContract</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {NftContract} obj Optional instance to populate.
     * @return {NftContract} The populated <code>NftContract</code> instance.
     * @memberof NftContract
     */
    NftContract.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new NftContract()
            if (data.hasOwnProperty('address')) obj.address = ApiClient.convertToType(data.address, 'String')
            if (data.hasOwnProperty('name')) obj.name = ApiClient.convertToType(data.name, 'String')
            if (data.hasOwnProperty('symbol')) obj.symbol = ApiClient.convertToType(data.symbol, 'String')
            if (data.hasOwnProperty('status')) obj.status = ApiClient.convertToType(data.status, 'String')
        }
        return obj
    }

    /**
     * Contract address (20-byte)
     * @type {String}
     * @memberof NftContract
     */
    NftContract.prototype.address = undefined

    /**
     * Token name
     * @type {String}
     * @memberof NftContract
     */
    NftContract.prototype.name = undefined

    /**
     * Token symbol
     * @type {String}
     * @memberof NftContract
     */
    NftContract.prototype.symbol = undefined

    /**
     * Contract labeling status (completed, processing, failed, cancelled)
     * @type {String}
     * @memberof NftContract
     */
    NftContract.prototype.status = undefined

    return NftContract
})
