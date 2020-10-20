/*
 * Token History API
 * # Introduction  Token History API는 KLAY, FT (KIP-7, Labeled ERC-20), NFT (KIP-17, Labeled ERC-721) 토큰 정보, 이들 토큰을 주고받은 기록을 조회하는 기능을 제공합니다. 여러분은 특정 EOA가 KLAY를 주고받은 기록을 확인하거나 EOA가 가지고 있는 NFT 정보를 불러오는 등 Token History API를 다양하게 활용할 수 있습니다.   Token History API 사용에 관한 자세한 내용은 [튜토리얼](https://klaytn.com)을 확인하십시오.   이 문서 혹은 KAS에 관한 문의는 [개발자 포럼](https://forum.klaytn.com/)을 방문해 도움을 받으십시오
 *
 * OpenAPI spec version: 0.7.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.15
 *
 * Do not edit the class manually.
 *
 */

;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../../ApiClient', '../model/NftContract', '../model/Transaction'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(require('../../ApiClient'), require('./NftContract'), require('./Transaction'))
    } else {
        // Browser globals (root is window)
        if (!root.TokenHistoryApi) {
            root.TokenHistoryApi = {}
        }
        root.TokenHistoryApi.NftTransfer = factory(
            root.TokenHistoryApi.ApiClient,
            root.TokenHistoryApi.NftContract,
            root.TokenHistoryApi.Transaction
        )
    }
})(this, function(ApiClient, NftContract, Transaction) {
    /**
     * The NftTransfer model module.
     * @class NftTransfer
     * @version 0.7.0
     */

    /**
     * Constructs a new <code>NftTransfer</code>.
     * @alias NftTransfer
     * @class
     * @param contract {NftContract}
     * @param from {String} 보낸 사람 EOA (20-byte)
     * @param to {String} 받은 사람 EOA (20-byte)
     * @param transaction {Transaction}
     * @param transferType {String} 거래내역 유형
     * @param tokenId {String} 토큰 식별자 (16진수)
     */
    const NftTransfer = function(contract, from, to, transaction, transferType, tokenId) {
        this.contract = contract
        this.from = from
        this.to = to
        this.transaction = transaction
        this.transferType = transferType
        this.tokenId = tokenId
    }

    /**
     * Constructs a <code>NftTransfer</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {NftTransfer} obj Optional instance to populate.
     * @return {NftTransfer} The populated <code>NftTransfer</code> instance.
* @memberof NftTransfer
     */
    NftTransfer.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new NftTransfer()
            if (data.hasOwnProperty('contract')) obj.contract = NftContract.constructFromObject(data.contract)
            if (data.hasOwnProperty('from')) obj.from = ApiClient.convertToType(data.from, 'String')
            if (data.hasOwnProperty('to')) obj.to = ApiClient.convertToType(data.to, 'String')
            if (data.hasOwnProperty('transaction')) obj.transaction = Transaction.constructFromObject(data.transaction)
            if (data.hasOwnProperty('transferType')) obj.transferType = ApiClient.convertToType(data.transferType, 'String')
            if (data.hasOwnProperty('tokenId')) obj.tokenId = ApiClient.convertToType(data.tokenId, 'String')
        }
        return obj
    }

    /**
     * @member {NftContract} contract
* @memberof NftTransfer
     */
    NftTransfer.prototype.contract = undefined

    /**
     * 보낸 사람 EOA (20-byte)
     * @member {String} from
* @memberof NftTransfer
     */
    NftTransfer.prototype.from = undefined

    /**
     * 받은 사람 EOA (20-byte)
     * @member {String} to
* @memberof NftTransfer
     */
    NftTransfer.prototype.to = undefined

    /**
     * @member {Transaction} transaction
* @memberof NftTransfer
     */
    NftTransfer.prototype.transaction = undefined

    /**
     * 거래내역 유형
     * @member {String} transferType
* @memberof NftTransfer
     */
    NftTransfer.prototype.transferType = undefined

    /**
     * 토큰 식별자 (16진수)
     * @member {String} tokenId
* @memberof NftTransfer
     */
    NftTransfer.prototype.tokenId = undefined

    return NftTransfer
})
