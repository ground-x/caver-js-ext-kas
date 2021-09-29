/**
 * KIP-17 API
 * # Introduction The KIP-17 API helps BApp (Blockchain Application) developers to manage contracts and tokens created in accordance with the [KIP-17](https://docs.klaytnapi.com/v/en/api#kip-17-api) standard, which is Klaytn's technical speficication for Non-Fungible Tokens.  The functionality of the multiple endpoints enables you to do the following actions: - deploy smart contracts - manage the entire life cycle of an NFT from minting, to sending and burning - get contract or token data - authorize a third party to execute token transfers - view token ownership history  For more details on KAS, please refer to [KAS Docs](https://docs.klaytnapi.com/). If you have any questions or comments, please leave them in the [Klaytn Developers Forum](http://forum.klaytn.com).    **alias**  When a method of the KIP-17 API requires a contract address, you can use the contract **alias**. You can give the contract an alias when deploying, and use it in place of the complicated address.  # Fee Payer Options KAS KIP-17 supports four ways to pay the transaction fees.<br />  **1. Only using KAS Global FeePayer Account** <br /> Sends all transactions using KAS Global FeePayer Account. ``` {     \"options\": {       \"enableGlobalFeePayer\": true     } } ``` <br />  **2. Using User FeePayer Account** <br /> Sends all transactions using User FeePayer Account. ``` {   \"options\": {     \"enableGlobalFeePayer\": false,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ``` <br />  **3. Using both KAS Global FeePayer Account + User FeePayer Account** <br /> Sends transactions using User FeePayer Account by default, and switches to the KAS Global FeePayer Account when balances are insufficient. ``` {   \"options\": {     \"enableGlobalFeePayer\": true,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ``` <br />  **4. Not using FeePayer Account** <br /> Sends transactions the default way, paying the transaction fee from the user's account. ``` {   \"options\": {     \"enableGlobalFeePayer\": false   } } ``` <br />  # Error Code This section contains the errors that might occur when using the KIP-17 API. KAS uses HTTP status codes. More details can be found in this [link](https://developer.mozilla.org/en/docs/Web/HTTP/Status).
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
const Kip17FeePayerOption = require('./Kip17FeePayerOption')

/**
 * The Kip17ContractInfoResponse model module.
 * @class Kip17ContractInfoResponse
 * @version 1.0
 */
class Kip17ContractInfoResponse {
    /**
     * Constructs a new <code>Kip17ContractInfoResponse</code>.
     * @alias Kip17ContractInfoResponse
     * @class
     * @param address {String} The contract address.
     * @param alias {String} The contract alias.
     * @param name {String} The token name.
     * @param symbol {String} The token symbol.
     */

    constructor(address, alias, name, symbol) {
        this.address = address
        this.alias = alias
        this.name = name
        this.symbol = symbol
    }

    /**
     * Constructs a <code>Kip17ContractInfoResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {Kip17ContractInfoResponse} obj Optional instance to populate.
     * @return {Kip17ContractInfoResponse} The populated <code>Kip17ContractInfoResponse</code> instance.
     * @memberof Kip17ContractInfoResponse
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new Kip17ContractInfoResponse()

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
            if (data.hasOwnProperty('options')) {
                obj.options = Kip17FeePayerOption.constructFromObject(data.options)
            }
        }
        return obj
    }
}

/**
 * The contract address.
 * @type {String}
 * @memberof Kip17ContractInfoResponse
 */
Kip17ContractInfoResponse.prototype.address = undefined
/**
 * The contract alias.
 * @type {String}
 * @memberof Kip17ContractInfoResponse
 */
Kip17ContractInfoResponse.prototype.alias = undefined
/**
 * The token name.
 * @type {String}
 * @memberof Kip17ContractInfoResponse
 */
Kip17ContractInfoResponse.prototype.name = undefined
/**
 * The token symbol.
 * @type {String}
 * @memberof Kip17ContractInfoResponse
 */
Kip17ContractInfoResponse.prototype.symbol = undefined
/**
 * @type {Kip17FeePayerOption}
 * @memberof Kip17ContractInfoResponse
 */
Kip17ContractInfoResponse.prototype.options = undefined

module.exports = Kip17ContractInfoResponse
