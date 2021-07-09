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
const EventLog = require('./EventLog')
const FeePayerSignaturesObj = require('./FeePayerSignaturesObj')
const Signature = require('./Signature')

/**
 * The TransactionReceipt model module.
 * @class TransactionReceipt
 * @version 1.0
 */
class TransactionReceipt {
    /**
     * Constructs a new <code>TransactionReceipt</code>.
     * Transaction receipt
     * @alias TransactionReceipt
     * @class
     * @param to {String} Klaytn account address or Contract address to receive KLAY
     */

    constructor(to) {
        this.to = to
    }

    /**
     * Constructs a <code>TransactionReceipt</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {TransactionReceipt} obj Optional instance to populate.
     * @return {TransactionReceipt} The populated <code>TransactionReceipt</code> instance.
     * @memberof TransactionReceipt
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new TransactionReceipt()

            if (data.hasOwnProperty('blockHash')) {
                obj.blockHash = ApiClient.convertToType(data.blockHash, 'String')
            }
            if (data.hasOwnProperty('blockNumber')) {
                obj.blockNumber = ApiClient.convertToType(data.blockNumber, 'String')
            }
            if (data.hasOwnProperty('codeFormat')) {
                obj.codeFormat = ApiClient.convertToType(data.codeFormat, 'String')
            }
            if (data.hasOwnProperty('contractAddress')) {
                obj.contractAddress = ApiClient.convertToType(data.contractAddress, 'String')
            }
            if (data.hasOwnProperty('feePayer')) {
                obj.feePayer = ApiClient.convertToType(data.feePayer, 'String')
            }
            if (data.hasOwnProperty('feePayerSignatures')) {
                obj.feePayerSignatures = ApiClient.convertToType(data.feePayerSignatures, [FeePayerSignaturesObj])
            }
            if (data.hasOwnProperty('from')) {
                obj.from = ApiClient.convertToType(data.from, 'String')
            }
            if (data.hasOwnProperty('gas')) {
                obj.gas = ApiClient.convertToType(data.gas, 'String')
            }
            if (data.hasOwnProperty('gasPrice')) {
                obj.gasPrice = ApiClient.convertToType(data.gasPrice, 'String')
            }
            if (data.hasOwnProperty('gasUsed')) {
                obj.gasUsed = ApiClient.convertToType(data.gasUsed, 'String')
            }
            if (data.hasOwnProperty('hash')) {
                obj.hash = ApiClient.convertToType(data.hash, 'String')
            }
            if (data.hasOwnProperty('humanReadable')) {
                obj.humanReadable = ApiClient.convertToType(data.humanReadable, 'Boolean')
            }
            if (data.hasOwnProperty('input')) {
                obj.input = ApiClient.convertToType(data.input, 'String')
            }
            if (data.hasOwnProperty('logs')) {
                obj.logs = ApiClient.convertToType(data.logs, [EventLog])
            }
            if (data.hasOwnProperty('logsBloom')) {
                obj.logsBloom = ApiClient.convertToType(data.logsBloom, 'String')
            }
            if (data.hasOwnProperty('nonce')) {
                obj.nonce = ApiClient.convertToType(data.nonce, 'String')
            }
            if (data.hasOwnProperty('senderTxHash')) {
                obj.senderTxHash = ApiClient.convertToType(data.senderTxHash, 'String')
            }
            if (data.hasOwnProperty('signatures')) {
                obj.signatures = ApiClient.convertToType(data.signatures, [Signature])
            }
            if (data.hasOwnProperty('status')) {
                obj.status = ApiClient.convertToType(data.status, 'String')
            }
            if (data.hasOwnProperty('transactionHash')) {
                obj.transactionHash = ApiClient.convertToType(data.transactionHash, 'String')
            }
            if (data.hasOwnProperty('transactionIndex')) {
                obj.transactionIndex = ApiClient.convertToType(data.transactionIndex, 'String')
            }
            if (data.hasOwnProperty('type')) {
                obj.type = ApiClient.convertToType(data.type, 'String')
            }
            if (data.hasOwnProperty('typeInt')) {
                obj.typeInt = ApiClient.convertToType(data.typeInt, 'Number')
            }
            if (data.hasOwnProperty('value')) {
                obj.value = ApiClient.convertToType(data.value, 'String')
            }
            if (data.hasOwnProperty('to')) {
                obj.to = ApiClient.convertToType(data.to, 'String')
            }
        }
        return obj
    }
}

/**
 * Hash value of the block with the transaction.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.blockHash = undefined
/**
 * Number of the block with the transaction.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.blockNumber = undefined
/**
 * Code format of the smart contract
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.codeFormat = undefined
/**
 * Contract address. Has `null` if it's not contract deployment.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.contractAddress = undefined
/**
 * Account address to pay transaction fee on behalf.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.feePayer = undefined
/**
 * @type {Array.<FeePayerSignaturesObj>}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.feePayerSignatures = undefined
/**
 * Klaytn account address that sent the transaction
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.from = undefined
/**
 * Maximum gas fee set to be used for sending the transaction.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.gas = undefined
/**
 * Maximum gas fee set to be used for sending the transaction.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.gasPrice = undefined
/**
 * Gas fee used for sending the transaction.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.gasUsed = undefined
/**
 * Transaction data hash.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.hash = undefined
/**
 * Shows whether the account address is`humanReadable`.
 * @type {Boolean}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.humanReadable = undefined
/**
 * Data that is sent along with the transaction and is used for execution.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.input = undefined
/**
 * @type {Array.<EventLog>}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.logs = undefined
/**
 * Bloom filter to search the log more quickly.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.logsBloom = undefined
/**
 * Number of transactions sent by the sender of the current transaction.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.nonce = undefined
/**
 * Transaction hash value without Fee Delegation account address and signature
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.senderTxHash = undefined
/**
 * @type {Array.<Signature>}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.signatures = undefined
/**
 * Status of the transaction. If the transaction is still in the txpool, it returns `Pending`. A successful transaction returns `Committed`, and failed transaction returns `CommitError`.
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.status = undefined
/**
 * Transaction hash
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.transactionHash = undefined
/**
 * Order of the transaction within the block that contains it
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.transactionIndex = undefined
/**
 * Characters that represents the transaction type
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.type = undefined
/**
 * Integer that represents the transaction type
 * @type {Number}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.typeInt = undefined
/**
 * KLAY converted into PEB
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.value = undefined
/**
 * Klaytn account address or Contract address to receive KLAY
 * @type {String}
 * @memberof TransactionReceipt
 */
TransactionReceipt.prototype.to = undefined

module.exports = TransactionReceipt
