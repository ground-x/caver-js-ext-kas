/**
 * KIP-17 API
 *   # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |   | 1100050 | incorrect request 1100101 | data don't exist 1100251 | its value is out of range; size 1104401 | failed to get an account |   ## 404: Not Found   | Code | Messages |   | --- | --- |   | 1104404 | Token not found |   ## 409: Conflict   | Code | Messages |   | --- | --- |   | 1104400 | Duplicate alias - test |
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
 * The Kip17ContractListResponseItem model module.
 * @class Kip17ContractListResponseItem
 * @version 1.0
 */
class Kip17ContractListResponseItem {
    /**
     * Constructs a new <code>Kip17ContractListResponseItem</code>.
     * @alias Kip17ContractListResponseItem
     * @class
     * @param address {String} Contract address
     * @param alias {String} Contract alias
     * @param name {String} Token name
     * @param symbol {String} Token symbol
     */

    constructor(address, alias, name, symbol) {
        this.address = address
        this.alias = alias
        this.name = name
        this.symbol = symbol
    }

    /**
     * Constructs a <code>Kip17ContractListResponseItem</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {Kip17ContractListResponseItem} obj Optional instance to populate.
     * @return {Kip17ContractListResponseItem} The populated <code>Kip17ContractListResponseItem</code> instance.
     * @memberof Kip17ContractListResponseItem
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new Kip17ContractListResponseItem()

            if (data.hasOwnProperty('address')) {
                obj.address = ApiClient.convertToType(data.address, 'String')
            }
            if (data.hasOwnProperty('alias')) {
                obj.alias = ApiClient.convertToType(data.alias, 'String')
            }
            if (data.hasOwnProperty('name')) {
                obj.name = ApiClient.convertToType(data.name, 'String')
            }
            if (data.hasOwnProperty('symbol')) {
                obj.symbol = ApiClient.convertToType(data.symbol, 'String')
            }
        }
        return obj
    }
}

/**
 * Contract address
 * @type {String}
 * @memberof Kip17ContractListResponseItem
 */
Kip17ContractListResponseItem.prototype.address = undefined
/**
 * Contract alias
 * @type {String}
 * @memberof Kip17ContractListResponseItem
 */
Kip17ContractListResponseItem.prototype.alias = undefined
/**
 * Token name
 * @type {String}
 * @memberof Kip17ContractListResponseItem
 */
Kip17ContractListResponseItem.prototype.name = undefined
/**
 * Token symbol
 * @type {String}
 * @memberof Kip17ContractListResponseItem
 */
Kip17ContractListResponseItem.prototype.symbol = undefined

module.exports = Kip17ContractListResponseItem
