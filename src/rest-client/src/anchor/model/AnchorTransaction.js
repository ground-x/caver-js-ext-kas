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
        define(['../../ApiClient'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(require('../../ApiClient'))
    } else {
        // Browser globals (root is window)
        if (!root.AnchorApi) {
            root.AnchorApi = {}
        }
        root.AnchorApi.AnchorTransaction = factory(root.AnchorApi.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The AnchorTransaction model module.
     * @class AnchorTransaction
     * @version 1.0
     */

    /**
     * Constructs a new <code>AnchorTransaction</code>.
     * 앵커링 트랜잭션 정보
     * @alias AnchorTransaction
     * @class
     * @param createdAt {Number} 앵커링 트랜잭션 생성 시간
     * @param payloadId {String} 페이로드 ID
     * @param transactionHash {String} 앵커링 트랜잭션의 트랜잭션 해시
     */
    const AnchorTransaction = function(createdAt, payloadId, transactionHash) {
        this.createdAt = createdAt
        this.payloadId = payloadId
        this.transactionHash = transactionHash
    }

    /**
     * Constructs a <code>AnchorTransaction</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {AnchorTransaction} obj Optional instance to populate.
     * @return {AnchorTransaction} The populated <code>AnchorTransaction</code> instance.
* @memberof AnchorTransaction
     */
    AnchorTransaction.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new AnchorTransaction()
            if (data.hasOwnProperty('createdAt')) obj.createdAt = ApiClient.convertToType(data.createdAt, 'Number')
            if (data.hasOwnProperty('payloadId')) obj.payloadId = ApiClient.convertToType(data.payloadId, 'String')
            if (data.hasOwnProperty('transactionHash')) obj.transactionHash = ApiClient.convertToType(data.transactionHash, 'String')
        }
        return obj
    }

    /**
     * 앵커링 트랜잭션 생성 시간
     * @member {Number} createdAt
* @memberof AnchorTransaction
     */
    AnchorTransaction.prototype.createdAt = undefined

    /**
     * 페이로드 ID
     * @member {String} payloadId
* @memberof AnchorTransaction
     */
    AnchorTransaction.prototype.payloadId = undefined

    /**
     * 앵커링 트랜잭션의 트랜잭션 해시
     * @member {String} transactionHash
* @memberof AnchorTransaction
     */
    AnchorTransaction.prototype.transactionHash = undefined

    return AnchorTransaction
})
