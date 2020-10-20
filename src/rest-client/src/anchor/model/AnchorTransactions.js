/*
 * Anchor API
 * # Introduction 이 문서는 KAS\\(Klaytn API Service\\)의 Anchor API를 소개하는 문서입니다. Anchor API는 서비스 체인 데이터의 신뢰성을 보장하기 위해 데이터 신뢰성을 증명할 수 있는 메타데이터를 Klaytn 메인 체인에 전송하는 기능을 제공합니다.  자세한 사용 예시는 [튜토리얼](링크)를 확인하십시오.    # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |   | 1071010 | data don't exist 1071615 | its value is out of range; size 1072100 | same payload ID or payload was already anchored 1072101 | all configured accounts have insufficient funds |
 *
 * OpenAPI spec version: 1.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.16
 *
 * Do not edit the class manually.
 *
 */

;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../../ApiClient', '../model/AnchorTransaction'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(require('../../ApiClient'), require('./AnchorTransaction'))
    } else {
        // Browser globals (root is window)
        if (!root.AnchorApi) {
            root.AnchorApi = {}
        }
        root.AnchorApi.AnchorTransactions = factory(root.AnchorApi.ApiClient, root.AnchorApi.AnchorTransaction)
    }
})(this, function(ApiClient, AnchorTransaction) {
    /**
     * The AnchorTransactions model module.
     * @module AnchorTransactions
     * @version 1.0
     */

    /**
     * Constructs a new <code>AnchorTransactions</code>.
     * 앵커링 트랜잭션 목록
     * @alias AnchorTransactions
     * @class
     * @param cursor {String} 마지막 검색 위치를 나타내는 커서 정보
     */
    const AnchorTransactions = function(cursor) {
        this.cursor = cursor
    }

    /**
     * Constructs a <code>AnchorTransactions</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {AnchorTransactions} obj Optional instance to populate.
     * @return {AnchorTransactions} The populated <code>AnchorTransactions</code> instance.
     */
    AnchorTransactions.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new AnchorTransactions()
            if (data.hasOwnProperty('cursor')) obj.cursor = ApiClient.convertToType(data.cursor, 'String')
            if (data.hasOwnProperty('items')) obj.items = ApiClient.convertToType(data.items, [AnchorTransaction])
        }
        return obj
    }

    /**
     * 마지막 검색 위치를 나타내는 커서 정보
     * @member {String} cursor
     */
    AnchorTransactions.prototype.cursor = undefined

    /**
     * @member {Array.<AnchorTransaction>} items
     */
    AnchorTransactions.prototype.items = undefined

    return AnchorTransactions
})
