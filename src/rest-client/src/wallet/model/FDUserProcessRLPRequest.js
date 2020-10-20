/*
 * Wallet API
 * # Introduction Wallet API는 클레이튼 계정을 만들어 관리하고 트랜잭션을 전송하는 API입니다. Wallet API로 Klaytn 계정을 만들면 여러분은 개인키를 따로 관리할 필요가 없습니다. Wallet API는 BApp을 위해 Klaytn 계정 개인키를 안전하게 보관하는 지갑을 제공합니다. Wallet API 사용에 관한 자세한 내용은 [튜토리얼](https://docs.klaytnapi.com/v/ko/tutorial)을 확인하십시오.  Wallet API는 크게 Klaytn 계정을 만들고 관리하는 Account 파트와 여러 종류의 트랜잭션을 전송하는 Transaction 파트로 나뉩니다.  Wallet API는 Klaytn 계정을 생성, 삭제, 모니터링하고 계정을 다중 서명 계정(Multisig 계정)으로 업데이트하며 KAS에 등록된 모든 계정의 개인키를 관리합니다.  또 Wallet API는 트랜잭션을 만들어 Klaytn에 전송합니다. 이 트랜잭션에는 다중 서명 계정이 보내는 트랜잭션도 포함됩니다. 다중 서명 시 임계값\\(Threshold\\)을 만족하면 트랜잭션은 Klaytn에 자동으로 전송됩니다. 다중 서명에 관한 자세한 내용은 [다음](https://docs.klaytnapi.com/v/ko/tutorial)을 확인하십시오.  트랜잭션은 크게 기본 트랜잭션과 수수료 대납 트랜잭션으로 나뉩니다. 수수료 대납 트랜잭션은 크게 글로벌 수수료 대납 트랜잭션과 사용자 수수료 대납 트랜잭션으로 나뉩니다. 글로벌 수수료 대납 트랜잭션은 Ground X의 KAS 계정에서 트랜잭션 수수료를 일단 대납해주고 나중에 여러분에게 이 수수료를 청구하는 방식입니다. 사용자 수수료 대납 트랜잭션은 여러분이 직접 트랜잭션 수수료를 대납하는 계정을 만들고, 트랜잭션을 보낼 때 이 대납 계정이 트랜잭션 수수료를 납부하도록 하는 방식입니다.  Wallet API는 아래와 같은 기능 및 제약사항을 갖고 있습니다.  | Version | Item | Description | | :--- | :--- | :--- | | 2.0 | 제약사항 | Cypress(Mainnet), Baobab(Testnet) 지원\\(Service Chain 미지원\\) | |  |  | 외부 관리키에 대한 계정 관리 미지원 | |  |  | RLP 인코딩된 트랜잭션의 다중 서명 미지원 | |  | 계정관리 | 계정 생성, 조회, 삭제 | |  |  | 다중 서명 계정 업데이트 | |  | 트랜잭션 관리 | [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic) 트랜잭션 생성 및 전송 | |  |  | [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) 트랜잭션 생성 및 전송 | |  |  | RLP 인코딩된 트랜잭션\\([Legacy](https://ko.docs.klaytn.com/klaytn/design/transactions/basic#txtypelegacytransaction), [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic), [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation)\\) 생성 및 전송 | |  |  | 다중 서명 트랜잭션 관리 및 전송 | |  | 관리자 | 리소스 풀 관리\\(생성, 풀 조회, 삭제, 계정 조회\\) |    # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |   | 1061010 | data don't exist 1061510 | account has been already deleted or disabled 1061511 | account has been already deleted or enabled 1061512 | account is invalid to sign the transaction; 0xc9bFDDabf2c38396b097C8faBE9151955413995D</br>account is invalid to sign the transaction; 0x35Cc4921B17Dfa67a58B93c9F8918f823e58b77e 1061515 | the requested account must be a legacy account; if the account is multisig account, use `PUT /v2/tx/{fd|fd-user}/account` API for multisig transaction and /v2/multisig/_**_/_** APIs 1061607 | it has to start with '0x' and allows [0-9a-fA-F]; input</br>it has to start with '0x' and allows [0-9a-fA-F]; transaction-id 1061608 | cannot be empty or zero value; to</br>cannot be empty or zero value; input 1061609 | it just allow Klaytn address form; to 1061903 | failed to decode account keys 1061905 | failed to get feepayer 1061912 | rlp value and request value are not same; feeRatio</br>rlp value and request value are not same; feePayer 1061914 | already submitted transaction. Confirm transaction hash; 0xb9612ec6ec39bfd3f2841daa7ab062fc94cf33f23503606c979b2f81e50b2cb1 1061917 | AccountKeyLegacy type is not supported in AccountKeyRoleBased type 1061918 | it just allow (Partial)FeeDelegation transaction type 1061919 | PartialFeeDelegation transaction must set fee ratio to non-zero value 1061920 | FeeDelegation transaction cannot set fee ratio, use PartialFeeDelegation transaction type 1061921 | it just allow Basic transaction type 1065000 | failed to retrieve a transaction from klaytn node 1065001 | failed to send a raw transaction to klaytn node; -32000::insufficient funds of the sender for value </br>failed to send a raw transaction to klaytn node; -32000::not a program account (e.g., an account having code and storage)</br>failed to send a raw transaction to klaytn node; -32000::nonce too low</br>failed to send a raw transaction to klaytn node; -32000::insufficient funds of the fee payer for gas * price 1065100 | failed to get an account from AMS</br>failed to get an account from AMS; account key corrupted. can not use this account 1065102 | account key corrupted. can not use this account 1616 | feeration must be between 1 and 99; feeRatio 1918 | it just allow (Partial)FeeDelegation transaction type |
 *
 * OpenAPI spec version: 1.0
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
        define(['../../ApiClient'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(require('../../ApiClient'))
    } else {
        // Browser globals (root is window)
        if (!root.WalletApi) {
            root.WalletApi = {}
        }
        root.WalletApi.FDUserProcessRLPRequest = factory(root.WalletApi.ApiClient)
    }
})(this, function(ApiClient) {
    /**
     * The FDUserProcessRLPRequest model module.
     * @module FDUserProcessRLPRequest
     * @version 1.0
     */

    /**
     * Constructs a new <code>FDUserProcessRLPRequest</code>.
     * rlp 이용 유저 대납 트랜잭션 요청 스키마
     * @alias FDUserProcessRLPRequest
     * @class
     * @param rlp {String} RLP 값으로 Klaytn RLP 포맷인 SigRLP 또는 TxHashRLP을 받으며, (partial) fee delegation 트랜잭션 타입만 허용함.
     * @param feePayer {String} 유저 트랜잭션 수수료를 대납할 계정 주소
     */
    const FDUserProcessRLPRequest = function(rlp, feePayer) {
        this.rlp = rlp
        this.feePayer = feePayer
    }

    /**
     * Constructs a <code>FDUserProcessRLPRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {FDUserProcessRLPRequest} obj Optional instance to populate.
     * @return {FDUserProcessRLPRequest} The populated <code>FDUserProcessRLPRequest</code> instance.
     */
    FDUserProcessRLPRequest.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new FDUserProcessRLPRequest()
            if (data.hasOwnProperty('rlp')) obj.rlp = ApiClient.convertToType(data.rlp, 'String')
            if (data.hasOwnProperty('feePayer')) obj.feePayer = ApiClient.convertToType(data.feePayer, 'String')
            if (data.hasOwnProperty('feeRatio')) obj.feeRatio = ApiClient.convertToType(data.feeRatio, 'Number')
            if (data.hasOwnProperty('submit')) obj.submit = ApiClient.convertToType(data.submit, 'Boolean')
        }
        return obj
    }

    /**
     * RLP 값으로 Klaytn RLP 포맷인 SigRLP 또는 TxHashRLP을 받으며, (partial) fee delegation 트랜잭션 타입만 허용함.
     * @member {String} rlp
     */
    FDUserProcessRLPRequest.prototype.rlp = undefined

    /**
     * 유저 트랜잭션 수수료를 대납할 계정 주소
     * @member {String} feePayer
     */
    FDUserProcessRLPRequest.prototype.feePayer = undefined

    /**
     * 전체 트랜잭션 수수료에서 수수료 대납자가 대납할 수수료의 비율
     * @member {Number} feeRatio
     */
    FDUserProcessRLPRequest.prototype.feeRatio = undefined

    /**
     * 해당 트랜잭션을 Klaytn에 전송할지 여부
     * @member {Boolean} submit
     */
    FDUserProcessRLPRequest.prototype.submit = undefined

    return FDUserProcessRLPRequest
})
