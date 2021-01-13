/*
 * KIP-17 API
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
        if (!root.Kip17Api) {
            root.Kip17Api = {}
        }
        root.Kip17Api.ApproveAllKip17Request = factory(root.Kip17Api.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The ApproveAllKip17Request model module.
     * @class ApproveAllKip17Request
     * @version 1.0
     */

    /**
     * Constructs a new <code>ApproveAllKip17Request</code>.
     * @alias ApproveAllKip17Request
     * @class
     * @param from {String} Owner EOA address
     * @param to {String} EOA address receiving the approval
     */
    const ApproveAllKip17Request = function(from, to) {
        this.from = from
        this.to = to
    }

    /**
     * Constructs a <code>ApproveAllKip17Request</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {ApproveAllKip17Request} obj Optional instance to populate.
     * @return {ApproveAllKip17Request} The populated <code>ApproveAllKip17Request</code> instance.
     * @memberof ApproveAllKip17Request
     */
    ApproveAllKip17Request.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new ApproveAllKip17Request()
            if (data.hasOwnProperty('from')) obj.from = ApiClient.convertToType(data.from, 'String')
            if (data.hasOwnProperty('to')) obj.to = ApiClient.convertToType(data.to, 'String')
        }
        return obj
    }

    /**
     * Owner EOA address
     * @type {String}
     * @memberof ApproveAllKip17Request
     */
    ApproveAllKip17Request.prototype.from = undefined

    /**
     * EOA address receiving the approval
     * @type {String}
     * @memberof ApproveAllKip17Request
     */
    ApproveAllKip17Request.prototype.to = undefined

    return ApproveAllKip17Request
})