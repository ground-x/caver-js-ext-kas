/**
 * Wallet API
 * # Introduction Wallet API is an API for creating and managing Klaytn accounts as well as sending transactions. If you create your Klaytn account using Wallet API, you don't have to manage your private key yourself. Wallet API provides a wallet for safe storage of your Klaytn account private keys that you would need to use BApps. For more details on how to use Wallet API, please refer to this [tutorial](https://docs.klaytnapi.com/v/en/tutorial).  Wallet API can be divided into the Account part, which creates and manages Klaytn accounts, and the Transaction part, which sends different kinds of transactions.  Wallet API creates, deletes and monitors Klaytn accounts and updates the accounts to multisig, and manages all private keys for all accounts registered on KAS.  Wallet API can also create transaction to send it to Klaytn. These include transactions sent from multisig accounts. In case of muiltisig accounts, a transaction will automatically be sent to Klaytn once \\(Threshold\\) is met. For more detail, please refer to this [tutorial](https://docs.klaytnapi.com/v/en/tutorial).  There are mainly two types of transactions: basic transactions and fee delegation transactions. Fee delegation transactions include Global Fee Delegation transaction and user fee deletation transaction. With the Global Fee Delegation transaction scheme, the transaction fee will initially be paid by GroundX and then be charged to you at a later date. With the User Fee Delegation transaction scheme, you create an account that pays the transaction fees on behalf of the users when a transaction.  The functionalities and limits of Wallet API are shown below:  | Version | Item | Description | | :--- | :--- | :--- | | 2.0 | Limits | Supports Cypress(Mainnet), Baobab(Testnet) \\ Doesn't support (Service Chain \\) | |  |  | Doesn't support account management for external custodial keys | |  |  | Doesn't support multisig for RLP encoded transactions | |  | Account management | Create, retrieve and delete account | |  |  | Multisig account update | |  | Managing transaction | [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic) creating and sending transaction | |  |  | [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) creating and sending transaction | |  |  | RLP encoded transaction\\([Legacy](https://ko.docs.klaytn.com/klaytn/design/transactions/basic#txtypelegacytransaction), [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic), [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation)\\) creating and sending | |  |  | Managing and sending multisig transactions | |  | Administrator | Manage resource pool\\(create, query pool, delete, retrieve account \\) |    # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |   | 1061010 | data don't exist</br>data don't exist; krn:1001:wallet:68ec0e4b-0f61-4e6f-ae35-be865ab23187:account-pool:default:0x9b2f4d85d7f7abb14db229b5a81f1bdca0aa24c8ff0c4c100b3f25098b7a6152 1061510 | account has been already deleted or disabled 1061511 | account has been already deleted or enabled 1061512 | account is invalid to sign the transaction; 0x18925BDD724614bF13Bd5d53a74adFd228903796</br>account is invalid to sign the transaction; 0x6d06e7cA9F26d6D30B3b4Dff6084E74C51908fef 1061515 | the requested account must be a legacy account; if the account is multisig account, use `PUT /v2/tx/{fd|fd-user}/account` API for multisig transaction and /v2/multisig/_**_/_** APIs 1061607 | it has to start with '0x' and allows [0-9a-fA-F]; input</br>it has to start with '0x' and allows [0-9a-fA-F]; transaction-id 1061608 | cannot be empty or zero value; to</br>cannot be empty or zero value; keyId</br>cannot be empty or zero value; address 1061609 | it just allow Klaytn address form; to 1061615 | its value is out of range; size 1061616 | fee ratio must be between 1 and 99; feeRatio 1061903 | failed to decode account keys; runtime error: slice bounds out of range [:64] with length 4 1061905 | failed to get feepayer 1061912 | rlp value and request value are not same; feeRatio</br>rlp value and request value are not same; feePayer 1061914 | already submitted transaction. Confirm transaction hash; 0x6f2e9235a48a86c3a7912b4237f83e760609c7ca609bbccbf648c8617a3a980c</br>already submitted transaction. Confirm transaction hash; 0xfb1fae863da42bcefdde3d572404bf5fcb89c1809e9253d5fff7c07a4bb5210f 1061917 | AccountKeyLegacy type is not supported in AccountKeyRoleBased type 1061918 | it just allow (Partial)FeeDelegation transaction type 1061919 | PartialFeeDelegation transaction must set fee ratio to non-zero value 1061920 | FeeDelegation transaction cannot set fee ratio, use PartialFeeDelegation transaction type 1061921 | it just allow Basic transaction type 1065000 | failed to retrieve a transaction from klaytn node 1065001 | failed to send a raw transaction to klaytn node; -32000::insufficient funds of the sender for value </br>failed to send a raw transaction to klaytn node; -32000::not a program account (e.g., an account having code and storage)</br>failed to send a raw transaction to klaytn node; -32000::nonce too low</br>failed to send a raw transaction to klaytn node; -32000::insufficient funds of the fee payer for gas * price 1065100 | failed to get an account</br>failed to get an account; data don't exist</br>failed to get an account; account key corrupted. can not use this account 1065102 | account key corrupted. can not use this account |
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
 * The FDCancelTransactionRequest model module.
 * @class FDCancelTransactionRequest
 * @version 1.0
 */
class FDCancelTransactionRequest {
    /**
     * Constructs a new <code>FDCancelTransactionRequest</code>.
     * Cancel Fee Delegation transaction request schema
     * @alias FDCancelTransactionRequest
     * @class
     * @param from {String} Klaytn transaction address to send transaction
     */

    constructor(from) {
        this.from = from
    }

    /**
     * Constructs a <code>FDCancelTransactionRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {FDCancelTransactionRequest} obj Optional instance to populate.
     * @return {FDCancelTransactionRequest} The populated <code>FDCancelTransactionRequest</code> instance.
     * @memberof FDCancelTransactionRequest
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new FDCancelTransactionRequest()

            if (data.hasOwnProperty('from')) {
                obj.from = ApiClient.convertToType(data.from, 'String')
            }
            if (data.hasOwnProperty('nonce')) {
                obj.nonce = ApiClient.convertToType(data.nonce, 'Number')
            }
            if (data.hasOwnProperty('gas')) {
                obj.gas = ApiClient.convertToType(data.gas, 'Number')
            }
            if (data.hasOwnProperty('submit')) {
                obj.submit = ApiClient.convertToType(data.submit, 'Boolean')
            }
            if (data.hasOwnProperty('transactionHash')) {
                obj.transactionHash = ApiClient.convertToType(data.transactionHash, 'String')
            }
            if (data.hasOwnProperty('feeRatio')) {
                obj.feeRatio = ApiClient.convertToType(data.feeRatio, 'Number')
            }
        }
        return obj
    }
}

/**
 * Klaytn transaction address to send transaction
 * @type {String}
 * @memberof FDCancelTransactionRequest
 */
FDCancelTransactionRequest.prototype.from = undefined
/**
 * Unique identifier for the transactions being sent (By entering 0, the nonce will be automatically determined)
 * @type {Number}
 * @memberof FDCancelTransactionRequest
 */
FDCancelTransactionRequest.prototype.nonce = undefined
/**
 * Maximum gas fee to be used for sending the transaction (By entering 0, it will be set to default value))
 * @type {Number}
 * @memberof FDCancelTransactionRequest
 * @default 100000
 */
FDCancelTransactionRequest.prototype.gas = 100000
/**
 * Shows whether to send the transaction to Klaytn
 * @type {Boolean}
 * @memberof FDCancelTransactionRequest
 */
FDCancelTransactionRequest.prototype.submit = undefined
/**
 * Transaction hash value
 * @type {String}
 * @memberof FDCancelTransactionRequest
 */
FDCancelTransactionRequest.prototype.transactionHash = undefined
/**
 * @type {Number}
 * @memberof FDCancelTransactionRequest
 */
FDCancelTransactionRequest.prototype.feeRatio = undefined

module.exports = FDCancelTransactionRequest
