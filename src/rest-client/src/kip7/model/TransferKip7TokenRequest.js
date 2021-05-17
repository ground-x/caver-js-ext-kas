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
        root.Kip7Api.TransferKip7TokenRequest = factory(root.Kip7Api.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The TransferKip7TokenRequest model module.
     * @class TransferKip7TokenRequest
     * @version 1.0
     */

    /**
     * Constructs a new <code>TransferKip7TokenRequest</code>.
     * @alias TransferKip7TokenRequest
     * @class
     * @param to {String} Klaytn account address to receive tokens
     * @param amount {String} The amount of tokens to transfer (in hexadecimal)
     */
    const TransferKip7TokenRequest = function(to, amount) {
        this.to = to
        this.amount = amount
    }

    /**
     * Constructs a <code>TransferKip7TokenRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {TransferKip7TokenRequest} obj Optional instance to populate.
     * @return {TransferKip7TokenRequest} The populated <code>TransferKip7TokenRequest</code> instance.
     * @memberof TransferKip7TokenRequest
     */
    TransferKip7TokenRequest.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new TransferKip7TokenRequest()
            if (data.hasOwnProperty('from')) obj.from = ApiClient.convertToType(data.from, 'String')
            if (data.hasOwnProperty('to')) obj.to = ApiClient.convertToType(data.to, 'String')
            if (data.hasOwnProperty('amount')) obj.amount = ApiClient.convertToType(data.amount, 'String')
        }
        return obj
    }

    /**
     * Klaytn account address to send tokens. The default value is the contract deployer account.
     * @type {String}
     * @memberof TransferKip7TokenRequest
     */
    TransferKip7TokenRequest.prototype.from = undefined

    /**
     * Klaytn account address to receive tokens
     * @type {String}
     * @memberof TransferKip7TokenRequest
     */
    TransferKip7TokenRequest.prototype.to = undefined

    /**
     * The amount of tokens to transfer (in hexadecimal)
     * @type {String}
     * @memberof TransferKip7TokenRequest
     */
    TransferKip7TokenRequest.prototype.amount = undefined

    return TransferKip7TokenRequest
})