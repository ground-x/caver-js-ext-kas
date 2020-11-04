/*
 * Wallet API
 * # Introduction Wallet API is used to create and manage Klaytn accounts and transfer transactions. If you create a Klaytn account with Wallet API, you do not need to manage private keys separately. Wallet API provides a secure wallet to keep your Klaytn account’s private keys for BApp. For more details on Wallet API, refer to our [tutorial](https://docs.klaytnapi.com/v/ko/tutorial).  Wallet API features an “Account” section for creating and managing Klaytn accounts and a “Transaction” section for transferring transactions. Wallet API creates, deletes, and monitors Klaytn accounts; updates multisig accounts; and manages the privates keys of all accounts registered to KAS.  In addition, Wallet API creates transactions and transfers them to Klaytn. They include transactions that are sent through the multisig accounts. A transaction will be automatically transferred to Klaytn if the threshold is met for the number of signatures. For more details on multisignatures, refer to [the followings](https://docs.klaytnapi.com/v/ko/tutorial).  Transactions include basic and fee delegation transactions. In particular, fee delegation transactions include global and user fee delegation transactions. In the global fee delegation transaction, Ground X’s KAS account first pays the transaction fee and charges the users later. Meanwhile, in the user fee delegation transaction, a user creates an account to pay for transaction fees when sending transactions.  Wallet API has the following functions and limitations.  | Version | Item | Description | | :--- | :--- | :--- | | 2.0 | Limitations | Support for Cypress (mainnet) and Baobab (testnet) (Service Chain not supported) | |  |  | Account management for external management keys not supported | |  |  | Multisignatures of RLP-encoded transactions not supported | |  | Account management  | Account creation, search, and deletion | |  |  | Multisignature account updates | |  | Transaction management | [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic) Transaction Creation and Transfer | |  |  | [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) Transaction Creation and Transfer | |  |  | RLP-encoded transaction \\([Legacy](https://ko.docs.klaytn.com/klaytn/design/transactions/basic#txtypelegacytransaction), [Basic](https://ko.docs.klaytn.com/klaytn/design/transactions/basic), [FeeDelegatedWithRatio](https://ko.docs.klaytn.com/klaytn/design/transactions/partial-fee-delegation) Transaction Creation and Transfer \\) | |  |  | Multisignature transaction management and transfer | |  | Administrator | Resource pool management (creation, pool search, deletion, and account search) |    # Error Codes  ## 400: Bad Request   | Code | Messages |   | --- | --- |   | 1061010 | data don't exist 1061510 | account has been already deleted or disabled 1061511 | account has been already deleted or enabled 1061512 | account is invalid to sign the transaction; 0xc9bFDDabf2c38396b097C8faBE9151955413995D</br>account is invalid to sign the transaction; 0x35Cc4921B17Dfa67a58B93c9F8918f823e58b77e 1061515 | the requested account must be a legacy account; if the account is multisig account, use `PUT /v2/tx/{fd|fd-user}/account` API for multisig transaction and /v2/multisig/_**_/_** APIs 1061607 | it has to start with '0x' and allows [0-9a-fA-F]; input</br>it has to start with '0x' and allows [0-9a-fA-F]; tx_id 1061608 | cannot be empty or zero value; to</br>cannot be empty or zero value; input 1061609 | it just allow Klaytn address form; to 1061615 | its value is out of range; size 1061616 | feeration must be between 1 and 99; feeRatio 1061903 | failed to decode account keys 1061905 | failed to get feepayer 1061912 | rlp value and request value are not same; feeRatio</br>rlp value and request value are not same; feePayer 1061914 | already submitted transaction. Confirm transaction hash; 0xb9612ec6ec39bfd3f2841daa7ab062fc94cf33f23503606c979b2f81e50b2cb1 1061917 | AccountKeyLegacy type is not supported in AccountKeyRoleBased type 1061918 | it just allow (Partial)FeeDelegation transaction type 1061919 | PartialFeeDelegation transaction must set fee ratio to non-zero value 1061920 | FeeDelegation transaction cannot set fee ratio, use PartialFeeDelegation transaction type 1061921 | it just allow Basic transaction type 1065000 | failed to retrieve a transaction from klaytn node 1065001 | failed to send a raw transaction to klaytn node; -32000::insufficient funds of the sender for value </br>failed to send a raw transaction to klaytn node; -32000::not a program account (e.g., an account having code and storage)</br>failed to send a raw transaction to klaytn node; -32000::nonce too low</br>failed to send a raw transaction to klaytn node; -32000::insufficient funds of the fee payer for gas * price 1065100 | failed to get an account from AMS</br>failed to get an account from AMS; account key corrupted. can not use this account 1065102 | account key corrupted. can not use this account |
 *
 * OpenAPI spec version: 1.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.17
 *
 * Do not edit the class manually.
 *
 */

;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../../ApiClient', '../model/EventLog', '../model/FeePayerSignaturesObj', '../model/Signature'], factory)
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS-like environments that support module.exports, like Node.
        module.exports = factory(
            require('../../ApiClient'),
            require('./EventLog'),
            require('./FeePayerSignaturesObj'),
            require('./Signature')
        )
    } else {
        // Browser globals (root is window)
        if (!root.WalletApi) {
            root.WalletApi = {}
        }
        root.WalletApi.TransactionReceipt = factory(
            root.WalletApi.ApiClient,
            root.WalletApi.EventLog,
            root.WalletApi.FeePayerSignaturesObj,
            root.WalletApi.Signature
        )
    }
})(this, function(ApiClient, EventLog, FeePayerSignaturesObj, Signature) {
    /**
     * The TransactionReceipt model module.
     * @class TransactionReceipt
     * @version 1.0
     */

    /**
     * Constructs a new <code>TransactionReceipt</code>.
     * Transaction receipt
     * @alias TransactionReceipt
     * @class
     * @param contractAddress {String} Contract address. It has a null value if it is not for a contract release.
     */
    const TransactionReceipt = function(contractAddress) {
        this.contractAddress = contractAddress
    }

    /**
     * Constructs a <code>TransactionReceipt</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {TransactionReceipt} obj Optional instance to populate.
     * @return {TransactionReceipt} The populated <code>TransactionReceipt</code> instance.
     * @memberof TransactionReceipt
     */
    TransactionReceipt.constructFromObject = function(data, obj) {
        if (data) {
            obj = obj || new TransactionReceipt()
            if (data.hasOwnProperty('blockHash')) obj.blockHash = ApiClient.convertToType(data.blockHash, 'String')
            if (data.hasOwnProperty('blockNumber')) obj.blockNumber = ApiClient.convertToType(data.blockNumber, 'String')
            if (data.hasOwnProperty('from')) obj.from = ApiClient.convertToType(data.from, 'String')
            if (data.hasOwnProperty('gas')) obj.gas = ApiClient.convertToType(data.gas, 'String')
            if (data.hasOwnProperty('gasPrice')) obj.gasPrice = ApiClient.convertToType(data.gasPrice, 'String')
            if (data.hasOwnProperty('gasUsed')) obj.gasUsed = ApiClient.convertToType(data.gasUsed, 'String')
            if (data.hasOwnProperty('hash')) obj.hash = ApiClient.convertToType(data.hash, 'String')
            if (data.hasOwnProperty('input')) obj.input = ApiClient.convertToType(data.input, 'String')
            if (data.hasOwnProperty('logs')) obj.logs = ApiClient.convertToType(data.logs, [EventLog])
            if (data.hasOwnProperty('logsBloom')) obj.logsBloom = ApiClient.convertToType(data.logsBloom, 'String')
            if (data.hasOwnProperty('nonce')) obj.nonce = ApiClient.convertToType(data.nonce, 'String')
            if (data.hasOwnProperty('senderTxHash')) obj.senderTxHash = ApiClient.convertToType(data.senderTxHash, 'String')
            if (data.hasOwnProperty('signatures')) obj.signatures = ApiClient.convertToType(data.signatures, [Signature])
            if (data.hasOwnProperty('status')) obj.status = ApiClient.convertToType(data.status, 'String')
            if (data.hasOwnProperty('to')) obj.to = ApiClient.convertToType(data.to, 'String')
            if (data.hasOwnProperty('transactionHash')) obj.transactionHash = ApiClient.convertToType(data.transactionHash, 'String')
            if (data.hasOwnProperty('transactionIndex')) obj.transactionIndex = ApiClient.convertToType(data.transactionIndex, 'String')
            if (data.hasOwnProperty('type')) obj.type = ApiClient.convertToType(data.type, 'String')
            if (data.hasOwnProperty('typeInt')) obj.typeInt = ApiClient.convertToType(data.typeInt, 'Number')
            if (data.hasOwnProperty('value')) obj.value = ApiClient.convertToType(data.value, 'String')
            if (data.hasOwnProperty('contractAddress')) obj.contractAddress = ApiClient.convertToType(data.contractAddress, 'String')
            if (data.hasOwnProperty('codeFormat')) obj.codeFormat = ApiClient.convertToType(data.codeFormat, 'String')
            if (data.hasOwnProperty('feePayer')) obj.feePayer = ApiClient.convertToType(data.feePayer, 'String')
            if (data.hasOwnProperty('feePayerSignatures'))
                obj.feePayerSignatures = ApiClient.convertToType(data.feePayerSignatures, [FeePayerSignaturesObj])
            if (data.hasOwnProperty('humanReadable')) obj.humanReadable = ApiClient.convertToType(data.humanReadable, 'Boolean')
        }
        return obj
    }

    /**
     * Hash value of the block where the transaction is located
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.blockHash = undefined

    /**
     * No. of the block where the transaction is located
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.blockNumber = undefined

    /**
     * Klaytn account address that sent a transaction
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.from = undefined

    /**
     * Max. transaction fee (gas) for sending the transaction
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.gas = undefined

    /**
     * Transaction fee (gas) for sending the transaction
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.gasPrice = undefined

    /**
     * Transaction fee (gas) for sending the transaction
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.gasUsed = undefined

    /**
     * Transaction data hash
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.hash = undefined

    /**
     * Data attached to and used for executing the outgoing transaction
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
     * Bloom filter for finding related logs quickly
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.logsBloom = undefined

    /**
     * No. of current user’s previous transactions
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.nonce = undefined

    /**
     * Hash value of a transaction with no fee delegation account and signature value
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
     * Transaction status. The status is “Pending” if the transaction is still in txpool, “Committed” if the transaction is successful, and “CommitError” if the transaction failed.
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.status = undefined

    /**
     * Klaytn account address to receive KLAY or contract address
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.to = undefined

    /**
     * Transaction hash value
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.transactionHash = undefined

    /**
     * Order of transactions in the block where they are located
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.transactionIndex = undefined

    /**
     * Character value of transaction type
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.type = undefined

    /**
     * Numeric value of transaction type
     * @type {Number}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.typeInt = undefined

    /**
     * KLAY converted into PEB unit
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.value = undefined

    /**
     * Contract address. It has a null value if it is not for a contract release.
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.contractAddress = undefined

    /**
     * Code format of smart contract
     * @type {String}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.codeFormat = undefined

    /**
     * Account address for fee delegation of transaction fee
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
     * Wheter to be `humanReadable` of the account
     * @type {Boolean}
     * @memberof TransactionReceipt
     */
    TransactionReceipt.prototype.humanReadable = undefined

    return TransactionReceipt
})
