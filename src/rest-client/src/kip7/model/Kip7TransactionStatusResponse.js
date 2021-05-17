/*
 * KIP-7 API
 * # Introduction KIP-7 API is a RESTful API for managing KIP-7 contracts and tokens that follow the [KIP-7 Fungible Token Standard](https://kips.klaytn.com/KIPs/kip-7).   You can deploy contracts and send tokens using the default contract managing account (`deployer`) and an `alias`. And by using SDK like caver,  you can manage your contracts and tokens using [Wallet API](https://refs.klaytnapi.com/en/wallet/latest) for contracts created on the Klaytn Network.     # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |  | 1130050 | incorrect request; spender 1130107 | incorrect bookmark 1134410 | invalid address; to</br>invalid address; owner</br>invalid address; address 1134411 | invalid amount; amount |  ## 404: Not Found   | Code | Messages |  | --- | --- |  | 1134504 | contract not found 1134506 | deployer not found |   ## 409: Conflict   | Code | Messages |   | --- | --- |   | 1134900 | duplicate alias 1134902 | contract already paused 1134903 | contract already unpaused |
 *
 * OpenAPI spec version: 1.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.19
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
        if (!root.Kip7Api) {
            root.Kip7Api = {}
        }
        root.Kip7Api.Kip7TransactionStatusResponse = factory(root.Kip7Api.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The Kip7TransactionStatusResponse model module.
     * @class Kip7TransactionStatusResponse
     * @version 1.0
     */

    /**
     * Constructs a new <code>Kip7TransactionStatusResponse</code>.
     * @alias Kip7TransactionStatusResponse
     * @class
     * @param status {String} Transaction status(`Submitted`,`Pending`)
     * @param transactionHash {String} Transaction hash
     */
    const Kip7TransactionStatusResponse = function(status, transactionHash) {
        this.status = status
        this.transactionHash = transactionHash
    }

    /**
     * Constructs a <code>Kip7TransactionStatusResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {Kip7TransactionStatusResponse} obj Optional instance to populate.
     * @return {Kip7TransactionStatusResponse} The populated <code>Kip7TransactionStatusResponse</code> instance.
     * @memberof Kip7TransactionStatusResponse
     */
    Kip7TransactionStatusResponse.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new Kip7TransactionStatusResponse()
            if (data.hasOwnProperty('status')) obj.status = ApiClient.convertToType(data.status, 'String')
            if (data.hasOwnProperty('transactionHash')) obj.transactionHash = ApiClient.convertToType(data.transactionHash, 'String')
        }
        return obj
    }

    /**
     * Transaction status(`Submitted`,`Pending`)
     * @type {String}
     * @memberof Kip7TransactionStatusResponse
     */
    Kip7TransactionStatusResponse.prototype.status = undefined

    /**
     * Transaction hash
     * @type {String}
     * @memberof Kip7TransactionStatusResponse
     */
    Kip7TransactionStatusResponse.prototype.transactionHash = undefined

    return Kip7TransactionStatusResponse
})