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

/**
 * The NftOwnershipChange model module.
 * @class NftOwnershipChange
 * @version 1.0
 */
class NftOwnershipChange {
    /**
     * Constructs a new <code>NftOwnershipChange</code>.
     * @alias NftOwnershipChange
     * @class
     * @param from {String} Sender (previous owner) EOA (20-byte)
     * @param to {String} Receiver (current owner) EOA (20-byte)
     * @param timestamp {Number} Change of NFT ownership (timestamp)
     */

    constructor(from, to, timestamp) {
        this.from = from
        this.to = to
        this.timestamp = timestamp
    }

    /**
     * Constructs a <code>NftOwnershipChange</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {NftOwnershipChange} obj Optional instance to populate.
     * @return {NftOwnershipChange} The populated <code>NftOwnershipChange</code> instance.
     * @memberof NftOwnershipChange
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new NftOwnershipChange()

            if (data.hasOwnProperty('from')) {
                obj.from = ApiClient.convertToType(data.from, 'String')
            }
            if (data.hasOwnProperty('to')) {
                obj.to = ApiClient.convertToType(data.to, 'String')
            }
            if (data.hasOwnProperty('timestamp')) {
                obj.timestamp = ApiClient.convertToType(data.timestamp, 'Number')
            }
        }
        return obj
    }
}

/**
 * Sender (previous owner) EOA (20-byte)
 * @type {String}
 * @memberof NftOwnershipChange
 */
NftOwnershipChange.prototype.from = undefined
/**
 * Receiver (current owner) EOA (20-byte)
 * @type {String}
 * @memberof NftOwnershipChange
 */
NftOwnershipChange.prototype.to = undefined
/**
 * Change of NFT ownership (timestamp)
 * @type {Number}
 * @memberof NftOwnershipChange
 */
NftOwnershipChange.prototype.timestamp = undefined

module.exports = NftOwnershipChange
