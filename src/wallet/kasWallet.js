/*
 * Copyright 2020 The caver-js-ext-kas Authors
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The wallet class that uses the KAS Wallet API.
 * @class
 */
class KASWallet {
    /**
     * Creates a wallet instance that uses the KAS Wallet API. <br>
     * This will be used in `caver.wallet` with CaverExtKAS.
     *
     * @constructor
     * @param {Wallet} walletAPI - An instance of KAS Wallet api to use.
     */
    constructor(walletAPI) {
        this.walletAPI = walletAPI
    }

    /**
     * Generates accounts in the KAS wallet api service with randomly generated key pairs.
     *
     * @param {number} numberOfAccounts The number of accounts to create.
     * @return {Array.<string>}
     */
    async generate(numberOfAccounts) {
        const addresses = []
        for (let i = 0; i < numberOfAccounts; ++i) {
            const account = await this.walletAPI.createAccount()
            addresses.push(account.address)
        }
        return addresses
    }

    /**
     * Get the account in KAS Wallet API Service corresponding to the address
     *
     * @param {string} address The address of account to query.
     * @return {AccountCountByAccountID}
     */
    async getAccount(address) {
        const account = await this.walletAPI.getAccount(address)

        return account
    }

    /**
     * Returns whether the account corresponding to the address exists
     *
     * @param {string} address The address of account to check existence.
     * @return {boolean}
     */
    async isExisted(address) {
        try {
            await this.walletAPI.getAccount(address)
            return true
        } catch (e) {
            if (e.code === 1061010) return false
            throw e
        }
    }

    /**
     * Deletes the account that associates with the given address from KAS Wallet API service.
     *
     * @param {string} address An address of the account to be deleted in KAS Wallet API service.
     * @return {boolean}
     */
    async remove(address) {
        const deleted = await this.walletAPI.deleteAccount(address)
        return deleted.status === 'deleted'
    }

    /**
     * Signs the transaction using one key and return the transactionHash
     *
     * @param {string} address An address of account in KAS Wallet API Service.
     * @param {AbstractTransaction} transaction A transaction object of caver-js. See [Klaytn Docs - Transaction](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction) for details.
     * @return {AbstractTransaction}
     * @see {@link https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction#class|Transaction}
     */
    async sign(address, transaction) {
        // Check from address
        transaction.from = transaction.from && transaction.from !== '0x' ? transaction.from : address
        if (transaction.from.toLowerCase() !== address.toLowerCase()) throw new Error(`From addresses are not matched.`)

        // Check accountKey in Klaytn network
        const accountKey = await transaction.constructor._klaytnCall.getAccountKey(transaction.from)
        const keyType =
            accountKey.keyType === 5
                ? transaction.type.includes('AccountUpdate')
                    ? accountKey.key[1].keyType
                    : accountKey.key[0].keyType
                : accountKey.keyType
        if (keyType > 3) {
            throw new Error(`Not supported: Using multiple keys in an account is currently not supported.`)
        }

        // Fill optional values
        await transaction.fillTransaction()

        // This is for appending original signatures to signed transaction
        let signed
        const existingSigs = transaction.signatures
        transaction.signatures = []

        const requestObject = { rlp: transaction.getRLPEncoding(), submit: false }

        if (!transaction.type.includes('TxTypeFeeDelegated')) {
            signed = await this.walletAPI.requestRawTransaction(requestObject)
        } else {
            signed = await this.walletAPI.requestFDRawTransactionPaidByGlobalFeePayer(requestObject)
        }
        transaction.signatures = signed.signatures
        transaction.appendSignatures(existingSigs)

        return transaction
    }

    /**
     * Signs the transaction as a fee payer using one key and return the transactionHash
     *
     * @param {string} address An address of account in KAS Wallet API Service.
     * @param {AbstractFeeDelegatedTransaction} transaction A fee delegated transaction object of caver-js. See [Klaytn Docs - Fee Delegation Transaction](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction/fee-delegation) and https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction/partial-fee-delegation for details.
     * @return {AbstractFeeDelegatedTransaction}
     * @see {@link https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction#class|Transaction}
     */
    async signAsFeePayer(address, transaction) {
        // Check feePayer address
        transaction.feePayer = transaction.feePayer && transaction.feePayer !== '0x' ? transaction.feePayer : address
        if (transaction.feePayer.toLowerCase() !== address.toLowerCase()) throw new Error(`feePayer addresses are not matched.`)

        // Check transaction type
        if (!transaction.type.includes('TxTypeFeeDelegated')) {
            throw new Error(`Invalid transaction type: Only feeDelegated transactions can use 'caver.wallet.signAsFeePayer'.`)
        }

        // Check accountKey in Klaytn network
        const accountKey = await transaction.constructor._klaytnCall.getAccountKey(transaction.feePayer)
        const keyType = accountKey.keyType === 5 ? accountKey.key[2].keyType : accountKey.keyType
        if (keyType > 3) {
            throw new Error(`Not supported: Using multiple keys in an account is currently not supported.`)
        }

        // Fill optional values
        await transaction.fillTransaction()

        // This is for appending original feePayerSignatures to signed transaction
        const existingSigs = transaction.feePayerSignatures
        transaction.feePayerSignatures = []
        const requestObject = { rlp: transaction.getRLPEncoding(), feePayer: transaction.feePayer, submit: false }
        const ret = await this.walletAPI.requestFDRawTransactionPaidByUser(requestObject)

        // Call static decode method to get feePayerSignatures from RLP-encoded string.
        const { feePayerSignatures } = transaction.constructor.decode(ret.rlp)
        transaction.feePayerSignatures = feePayerSignatures
        transaction.appendFeePayerSignatures(existingSigs)

        return transaction
    }
}

module.exports = KASWallet
