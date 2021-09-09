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
const Mt = require('./Mt')

/**
 * The PageableMts model module.
 * @class PageableMts
 * @version 1.0
 */
class PageableMts {
    /**
     * Constructs a new <code>PageableMts</code>.
     * @alias PageableMts
     * @class
     * @param items {Array.<Mt>}
     * @param cursor {String} Next page cursor
     */

    constructor(items, cursor) {
        this.items = items
        this.cursor = cursor
    }

    /**
     * Constructs a <code>PageableMts</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {PageableMts} obj Optional instance to populate.
     * @return {PageableMts} The populated <code>PageableMts</code> instance.
     * @memberof PageableMts
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new PageableMts()

            if (data.hasOwnProperty('items')) {
                obj.items = ApiClient.convertToType(data.items, [Mt])
            }
            if (data.hasOwnProperty('cursor')) {
                obj.cursor = ApiClient.convertToType(data.cursor, 'String')
            }
        }
        return obj
    }
}

/**
 * @type {Array.<Mt>}
 * @memberof PageableMts
 */
PageableMts.prototype.items = undefined
/**
 * Next page cursor
 * @type {String}
 * @memberof PageableMts
 */
PageableMts.prototype.cursor = undefined

module.exports = PageableMts
