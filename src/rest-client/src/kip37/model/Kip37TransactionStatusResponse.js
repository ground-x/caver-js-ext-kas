/**
 * KIP-37 API
 * ## Introduction The KIP-37 API helps Blockchain app (BApp) developers to easily deploy smart contracts and send tokens of the [KIP-37 Multi Token Standard](https://kips.klaytn.com/KIPs/kip-37).  You can use the default contract managing account (`deployer`) and `alias`.    You can also manage the contracts and tokens created on the klaytn network using the caver SDK, using contract address and the [Wallet API](https://refs.klaytnapi.com/ko/wallet/latest) account.    ## Fee Payer Options  KAS KIP-37 supports four scenarios for paying transactin fees:      **1. Using only KAS Global FeePayer Account**   Sends all transactions using the KAS global FeePayer Account.       ``` {     \"options\": {       \"enableGlobalFeePayer\": true     }     } ```    <br />    **2. Using User FeePayer account**   Sends all transactions using the KAS User FeePayer Account.      ``` {   \"options\": {     \"enableGlobalFeePayer\": false,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ```    <br />  **3. Using both KAS Global FeePayer Account + User FeePayer Account**   Uses User FeePayer Account as default. When the balance runs out, KAS Global FeePayer Account will be used.     ``` {   \"options\": {     \"enableGlobalFeePayer\": true,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ```    <br />  **4. Not using FeePayer Account**   Sends a transaction via normal means where the sender pays the transaction fee.       ``` {   \"options\": {     \"enableGlobalFeePayer\": false   } } ```
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
 * The Kip37TransactionStatusResponse model module.
 * @class Kip37TransactionStatusResponse
 * @version 1.0
 */
class Kip37TransactionStatusResponse {
    /**
     * Constructs a new <code>Kip37TransactionStatusResponse</code>.
     * @alias Kip37TransactionStatusResponse
     * @class
     * @param status {String} Transaction status (`Submitted`, `Pending`)
     */

    constructor(status) {
        this.status = status
    }

    /**
     * Constructs a <code>Kip37TransactionStatusResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {Kip37TransactionStatusResponse} obj Optional instance to populate.
     * @return {Kip37TransactionStatusResponse} The populated <code>Kip37TransactionStatusResponse</code> instance.
     * @memberof Kip37TransactionStatusResponse
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new Kip37TransactionStatusResponse()

            if (data.hasOwnProperty('status')) {
                obj.status = ApiClient.convertToType(data.status, 'String')
            }
            if (data.hasOwnProperty('transactionHash')) {
                obj.transactionHash = ApiClient.convertToType(data.transactionHash, 'String')
            }
            if (data.hasOwnProperty('transactionId')) {
                obj.transactionId = ApiClient.convertToType(data.transactionId, 'String')
            }
        }
        return obj
    }
}

/**
 * Transaction status (`Submitted`, `Pending`)
 * @type {String}
 * @memberof Kip37TransactionStatusResponse
 */
Kip37TransactionStatusResponse.prototype.status = undefined
/**
 * Transaction hash
 * @type {String}
 * @memberof Kip37TransactionStatusResponse
 */
Kip37TransactionStatusResponse.prototype.transactionHash = undefined
/**
 * Multisig Transaction ID
 * @type {String}
 * @memberof Kip37TransactionStatusResponse
 */
Kip37TransactionStatusResponse.prototype.transactionId = undefined

module.exports = Kip37TransactionStatusResponse
