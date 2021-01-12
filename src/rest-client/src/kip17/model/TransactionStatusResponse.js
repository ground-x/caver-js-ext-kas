/*
 * KIP-17 API Docs-EN
 *   # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |   | 1100050 | incorrect request 1100101 | data don't exist 1100251 | its value is out of range; size 1104401 | failed to get an account |   ## 404: Not Found   | Code | Messages |   | --- | --- |   | 1104404 | Token not found |   ## 409: Conflict   | Code | Messages |   | --- | --- |   | 1104400 | Duplicate alias - test |
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
        if (!root.Kip17ApiDocsEn) {
            root.Kip17ApiDocsEn = {}
        }
        root.Kip17ApiDocsEn.TransactionStatusResponse = factory(root.Kip17ApiDocsEn.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The TransactionStatusResponse model module.
     * @class TransactionStatusResponse
     * @version 1.0
     */

    /**
     * Constructs a new <code>TransactionStatusResponse</code>.
     * @alias TransactionStatusResponse
     * @class
     * @param status {String} Transaction status
     * @param transactionHash {String} Hash of the transaction
     */
    const TransactionStatusResponse = function(status, transactionHash) {
        this.status = status
        this.transactionHash = transactionHash
    }

    /**
     * Constructs a <code>TransactionStatusResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {TransactionStatusResponse} obj Optional instance to populate.
     * @return {TransactionStatusResponse} The populated <code>TransactionStatusResponse</code> instance.
     * @memberof TransactionStatusResponse
     */
    TransactionStatusResponse.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new TransactionStatusResponse()
            if (data.hasOwnProperty('status')) obj.status = ApiClient.convertToType(data.status, 'String')
            if (data.hasOwnProperty('transactionHash')) obj.transactionHash = ApiClient.convertToType(data.transactionHash, 'String')
        }
        return obj
    }

    /**
     * Transaction status
     * @type {String}
     * @memberof TransactionStatusResponse
     */
    TransactionStatusResponse.prototype.status = undefined

    /**
     * Hash of the transaction
     * @type {String}
     * @memberof TransactionStatusResponse
     */
    TransactionStatusResponse.prototype.transactionHash = undefined

    return TransactionStatusResponse
})
