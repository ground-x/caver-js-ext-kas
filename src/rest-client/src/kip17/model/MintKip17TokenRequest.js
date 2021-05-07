/*
 * KIP-17 API
 * undefined # Error Codes ## 400: Bad Request  | Code | Messages |   | --- | --- |   | 1100050 | incorrect request 1100101 | data don't exist 1100251 | its value is out of range; size 1104401 | failed to get an account |  ## 404: Not Found  | Code | Messages |   | --- | --- |   | 1104404 | Token not found |  ## 409: Conflict  | Code | Messages |   | --- | --- |   | 1104400 | Duplicate alias - test |
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
        if (!root.Kip17Api) {
            root.Kip17Api = {}
        }
        root.Kip17Api.MintKip17TokenRequest = factory(root.Kip17Api.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The MintKip17TokenRequest model module.
     * @class MintKip17TokenRequest
     * @version 1.0
     */

    /**
     * Constructs a new <code>MintKip17TokenRequest</code>.
     * @alias MintKip17TokenRequest
     * @class
     * @param to {String} Recipient EOA for newly minted token
     * @param id {String} Token ID for newly minted token; cannot be duplicated with exiting IDs
     * @param uri {String} Token URI for newly minted token
     */
    const MintKip17TokenRequest = function(to, id, uri) {
        this.to = to
        this.id = id
        this.uri = uri
    }

    /**
     * Constructs a <code>MintKip17TokenRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {MintKip17TokenRequest} obj Optional instance to populate.
     * @return {MintKip17TokenRequest} The populated <code>MintKip17TokenRequest</code> instance.
     * @memberof MintKip17TokenRequest
     */
    MintKip17TokenRequest.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new MintKip17TokenRequest()
            if (data.hasOwnProperty('to')) obj.to = ApiClient.convertToType(data.to, 'String')
            if (data.hasOwnProperty('id')) obj.id = ApiClient.convertToType(data.id, 'String')
            if (data.hasOwnProperty('uri')) obj.uri = ApiClient.convertToType(data.uri, 'String')
        }
        return obj
    }

    /**
     * Recipient EOA for newly minted token
     * @type {String}
     * @memberof MintKip17TokenRequest
     */
    MintKip17TokenRequest.prototype.to = undefined

    /**
     * Token ID for newly minted token; cannot be duplicated with exiting IDs
     * @type {String}
     * @memberof MintKip17TokenRequest
     */
    MintKip17TokenRequest.prototype.id = undefined

    /**
     * Token URI for newly minted token
     * @type {String}
     * @memberof MintKip17TokenRequest
     */
    MintKip17TokenRequest.prototype.uri = undefined

    return MintKip17TokenRequest
})
