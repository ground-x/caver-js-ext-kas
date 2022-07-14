/**
 * KIP-37 API
 * # Introduction The KIP-37 API helps BApp (Blockchain Application) developers to manage contracts and tokens created in accordance with the [KIP-37](https://kips.klaytn.com/KIPs/kip-37) standard, which is Klaytn's technical speficication for Multi Tokens. The functionality of the multiple endpoints enables you to do the following actions: - deploy smart contracts - manage the entire life cycle of an MT from minting, to sending and burning - get contract or token data - authorize a third party to execute token transfers - view token ownership history  When you deployed a contract using SDKs such as caver, you can manage your contracts and tokens using the contract address and a [Wallet API](https://refs.klaytnapi.com/en/wallet/latest) account.   For more details on KAS, please refer to [KAS Docs](https://docs.klaytnapi.com/). If you have any questions or comments, please leave them in the [KAS Developers Forum](https://support.klaytnapi.com/hc/en/community/topics).    **alias**  When a method of the KIP-37 API requires a contract address, you can use the contract **alias**. You can give the contract an alias when deploying a contract, and use it in place of the complicated address.  **deployer**  When you create a contract, you will be assigned one `deployer` address per Credential, which is the account address used for managing contracts. In KIP-37 API, this address is used in many different token-related operations. You can find the `deployer` address with [KIP37Deployer](#operation/GetDefaultDeployer).  ## New Features and Compatibility with v1  KIP-37 v2 newly supports Ownable interface. Using this, you can designate a contract owner when deploying a contract. Features renouncing or transferring ownership by the contract owner and querying a specific contract owner are also available. The contracts deployed with KIP-37 v1 are inaccessible to use the collection-editing feature on [OpenSea](https://opensea.io/), while the owner of contracts deployed with v2 can set and edit collections.  All features except ownership-related API are the same as v1 and compatible with the contracts deployed with KIP-37 v1. However, we recommend using only v2 APIs for the contracts deployed with KIP-37 v2.  # Fee Payer Options  KAS KIP-37 supports four scenarios for paying transaction fees: <br />      **1. Using only KAS Global FeePayer Account** <br /> Sends all transactions using the KAS global FeePayer Account.     ``` {     \"options\": {       \"enableGlobalFeePayer\": true     }     } ```   <br />    **2. Using User FeePayer account** <br /> Sends all transactions using the KAS User FeePayer Account.     ``` {   \"options\": {     \"enableGlobalFeePayer\": false,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ```   <br />  **3. Using both KAS Global FeePayer Account + User FeePayer Account** <br />  Uses User FeePayer Account as default. When the balance runs out, KAS Global FeePayer Account will be used.   ``` {   \"options\": {     \"enableGlobalFeePayer\": true,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ```    <br />  **4. Not using FeePayer Account**   Sends a transaction via normal means where the sender pays the transaction fee.     ``` {   \"options\": {     \"enableGlobalFeePayer\": false   } } ``` <br />  # Authorization A common error titled `Unauthorized` occurs regardless of API type if you have authorization issues.  **401: Unauthorized**    | Code | Message | Description |   |  --- | --- | --- |   | 1010009 | invalid credential | The credential you entered is invalid.
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
 * The Kip37ContractTransferResponse model module.
 * @class Kip37ContractTransferResponse
 * @version 1.0
 */
class Kip37ContractTransferResponse {
    /**
     * Constructs a new <code>Kip37ContractTransferResponse</code>.
     * @alias Kip37ContractTransferResponse
     * @class
     * @param status {String} Transaction status (`Submitted`, `Pending`)
     */

    constructor(status) {
        this.status = status
    }

    /**
     * Constructs a <code>Kip37ContractTransferResponse</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {Kip37ContractTransferResponse} obj Optional instance to populate.
     * @return {Kip37ContractTransferResponse} The populated <code>Kip37ContractTransferResponse</code> instance.
     * @memberof Kip37ContractTransferResponse
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new Kip37ContractTransferResponse()

            if (data.hasOwnProperty('status')) {
                obj.status = ApiClient.convertToType(data.status, 'String')
            }
            if (data.hasOwnProperty('transactionHash')) {
                obj.transactionHash = ApiClient.convertToType(data.transactionHash, 'String')
            }
        }
        return obj
    }
}

/**
 * Transaction status (`Submitted`, `Pending`)
 * @type {String}
 * @memberof Kip37ContractTransferResponse
 */
Kip37ContractTransferResponse.prototype.status = undefined
/**
 * Transaction Hash
 * @type {String}
 * @memberof Kip37ContractTransferResponse
 */
Kip37ContractTransferResponse.prototype.transactionHash = undefined

module.exports = Kip37ContractTransferResponse