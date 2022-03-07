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

const lodash = require('lodash')
const { ACCOUNT_KEY_TAG } = require('caver-js/packages/caver-account/src/accountKey/accountKeyHelper')
const { KEY_ROLE } = require('caver-js/packages/caver-wallet/src/keyring/keyringHelper')
const utils = require('caver-js').utils

/**
 * The wallet class that uses the KAS Wallet API.
 * @class
 */
class KASWallet {
    /**
     * Creates a wallet instance that uses the KAS Wallet API. <br>
     * This will be used in `caver.wallet` with CaverExtKAS.
     *
     * @example
     * caver.wallet // `caver.wallet` is the KASWallet instance.
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
     * @example
     * const result = await caver.wallet.generate() // Create one account
     * const result = await caver.wallet.generate(3)
     *
     * @param {number} numberOfAccounts The number of accounts to create.
     * @return {Array.<string>}
     */
    async generate(numberOfAccounts = 1) {
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
     * @example
     * const result = await caver.wallet.getAccount('0x3ee2ef77ad56ade0b86fcc3bccc7f278f9983549')
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
     * @example
     * const result = await caver.wallet.isExisted('0x3ee2ef77ad56ade0b86fcc3bccc7f278f9983549')
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
     * @example
     * const result = await caver.wallet.remove('0x3ee2ef77ad56ade0b86fcc3bccc7f278f9983549')
     *
     * @param {string} address An address of the account to be deleted in KAS Wallet API service.
     * @return {boolean}
     */
    async remove(address) {
        const deleted = await this.walletAPI.deleteAccount(address)
        return deleted.status === 'deleted'
    }

    /**
     * Deactivates account in KAS Wallet API Service
     *
     * @example
     * const result = await caver.wallet.disableAccount('0x3ee2ef77ad56ade0b86fcc3bccc7f278f9983549')
     *
     * @param {string} address The address of Klaytn account to disable from KAS Wallet API service.
     * @return {AccountSummary}
     */
    async disableAccount(address) {
        return this.walletAPI.disableAccount(address)
    }

    /**
     * Activates account in KAS Wallet API Service
     *
     * @example
     * const result = await caver.wallet.enableAccount('0x3ee2ef77ad56ade0b86fcc3bccc7f278f9983549')
     *
     * @param {string} address The address of Klaytn account to enable from KAS Wallet API service.
     * @return {AccountSummary}
     */
    async enableAccount(address) {
        return this.walletAPI.enableAccount(address)
    }

    /**
     * Signs the transaction using one key and return the signed transaction
     *
     * @example
     * const from = '0x3ee2ef77ad56ade0b86fcc3bccc7f278f9983549'
     * const tx = new caver.transaction.valueTransfer({
     *     from,
     *     to: '0x5ad2ee923fb1bf71b570d8be15b86b1ae0a7e7f3',
     *     value: 1,
     *     gas: 750000,
     * })
     * const result = await caver.wallet.sign(from, tx)
     *
     * @param {string} address An address of account in KAS Wallet API Service.
     * @param {AbstractTransaction} transaction A transaction object of caver-js. See [Klaytn Docs - Transaction](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction) for details.
     * @return {AbstractTransaction}
     * @see {@link https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction#class|Transaction}
     */
    async sign(address, transaction) {
        // Check from address
        transaction.from =
            transaction.from && transaction.from !== '0x' && transaction.from !== '0x0000000000000000000000000000000000000000'
                ? transaction.from
                : address
        if (transaction.from.toLowerCase() !== address.toLowerCase()) throw new Error(`From addresses are not matched.`)

        // Check accountKey in Klaytn network
        const accountKey = await transaction.constructor._klaytnCall.getAccountKey(transaction.from)
        // If accountKey is null, there is no need to execute the following logic.
        if (accountKey) {
            const keyType =
                accountKey.keyType === Number(ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG)
                    ? transaction.type.includes('AccountUpdate')
                        ? accountKey.key[KEY_ROLE.roleAccountUpdateKey].keyType
                        : accountKey.key[KEY_ROLE.roleTransactionKey].keyType
                    : accountKey.keyType
            if (keyType > 3) {
                throw new Error(`Not supported: Using multiple keys in an account is currently not supported.`)
            }
        }

        // This is for appending original signatures to signed transaction
        let signed

        if (transaction.type.includes('Legacy') && !utils.isEmptySig(transaction.signatures)) {
            throw new Error(`Legacy transactions cannot contain multiple signatures.`)
        }

        const { requestObject, existingSigs } = await makeObjectForRawTxRequest(address, transaction, false)

        if (!transaction.type.includes('TxTypeFeeDelegated')) {
            signed = await this.walletAPI.requestRawTransaction(requestObject)
        } else {
            signed = await this.walletAPI.requestFDRawTransactionPaidByGlobalFeePayer(requestObject)
        }
        transaction.signatures = signed.signatures
        if (!utils.isEmptySig(existingSigs)) transaction.appendSignatures(existingSigs)

        return transaction
    }

    /**
     * Signs the transaction as a fee payer using one key and return the signed transaction
     *
     * @example
     * const tx = new caver.transaction.feeDelegatedValueTransfer({
     *     from: '0x3ee2ef77ad56ade0b86fcc3bccc7f278f9983549',
     *     to: '0x5ad2ee923fb1bf71b570d8be15b86b1ae0a7e7f3',
     *     value: 1,
     *     gas: 750000,
     * })
     * const feePayer = '0x3b1522890efa7322591baa3ff126de79b9c6d009'
     * const result = await caver.wallet.signAsFeePayer(feePayer, tx)
     *
     * @param {string} address An address of account in KAS Wallet API Service.
     * @param {AbstractFeeDelegatedTransaction} transaction A fee delegated transaction object of caver-js. See [Klaytn Docs - Fee Delegation Transaction](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction/fee-delegation) and https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction/partial-fee-delegation for details.
     * @return {AbstractFeeDelegatedTransaction}
     * @see {@link https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction#class|Transaction}
     */
    async signAsFeePayer(address, transaction) {
        // If address is undefined, sign the transaction with a global fee payer in KAS Wallet API Serivce
        if (!address || address === '0x' || address === '0x0000000000000000000000000000000000000000')
            return this.signAsGlobalFeePayer(transaction)

        // Check feePayer address
        transaction.feePayer =
            transaction.feePayer && transaction.feePayer !== '0x' && transaction.feePayer !== '0x0000000000000000000000000000000000000000'
                ? transaction.feePayer
                : address
        if (transaction.feePayer.toLowerCase() !== address.toLowerCase()) throw new Error(`feePayer addresses are not matched.`)

        // Check accountKey in Klaytn network
        const accountKey = await transaction.constructor._klaytnCall.getAccountKey(transaction.feePayer)
        // If accountKey is null, there is no need to execute the following logic.
        if (accountKey) {
            const keyType =
                accountKey.keyType === Number(ACCOUNT_KEY_TAG.ACCOUNT_KEY_ROLE_BASED_TAG)
                    ? accountKey.key[KEY_ROLE.roleFeePayerKey].keyType
                    : accountKey.keyType
            if (keyType > 3) {
                throw new Error(`Not supported: Using multiple keys in an account is currently not supported.`)
            }
        }

        const { requestObject, existingSigs } = await makeObjectForRawTxRequest(address, transaction, true)
        const ret = await this.walletAPI.requestFDRawTransactionPaidByUser(requestObject)

        // Call static decode method to get feePayerSignatures from RLP-encoded string.
        const { feePayerSignatures } = transaction.constructor.decode(ret.rlp)
        transaction.feePayerSignatures = feePayerSignatures
        transaction.appendFeePayerSignatures(existingSigs)

        return transaction
    }

    /**
     * Signs the transaction with the global fee payer using one key and return the signed transactionHash
     *
     * @example
     * const tx = new caver.transaction.feeDelegatedValueTransfer({
     *     from: '0x3ee2ef77ad56ade0b86fcc3bccc7f278f9983549',
     *     to: '0x5ad2ee923fb1bf71b570d8be15b86b1ae0a7e7f3',
     *     value: 1,
     *     gas: 750000,
     * })
     * const result = await caver.wallet.signAsGlobalFeePayer(tx)
     *
     * @param {AbstractFeeDelegatedTransaction} transaction A fee delegated transaction object of caver-js. See [Klaytn Docs - Fee Delegation Transaction](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction/fee-delegation) and [Klaytn Docs - Partial Fee Delegation Transaction](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction/partial-fee-delegation) for details.
     * @return {AbstractFeeDelegatedTransaction}
     * @see {@link https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction#class|Transaction}
     */
    async signAsGlobalFeePayer(transaction) {
        if (!lodash.isObject(transaction)) {
            throw new Error(`Invalid parameter type: signAsGlobalFeePayer(tx) takes transaction as a only parameter.`)
        }

        let existingFeePayer
        if (transaction.feePayer && transaction.feePayer !== '0x' && transaction.feePayer !== '0x0000000000000000000000000000000000000000')
            existingFeePayer = transaction.feePayer

        const { requestObject, existingSigs } = await makeObjectForRawTxRequest(undefined, transaction, true)

        const ret = await this.walletAPI.requestFDRawTransactionPaidByGlobalFeePayer(requestObject)

        // Call static decode method to get feePayerSignatures from RLP-encoded string.
        const { feePayer, feePayerSignatures } = transaction.constructor.decode(ret.rlp)
        if (existingFeePayer && existingFeePayer.toLowerCase() !== feePayer.toLowerCase()) {
            throw new Error(
                `Invalid fee payer: The address of the fee payer defined in the transaction does not match the address of the global fee payer. To sign with a global fee payer, you must define the global fee payer's address in the feePayer field, or the feePayer field must not be defined.`
            )
        }
        transaction.feePayer = feePayer
        transaction.feePayerSignatures = feePayerSignatures
        transaction.appendFeePayerSignatures(existingSigs)

        return transaction
    }
}

async function makeObjectForRawTxRequest(address, tx, isFeePayerSign) {
    // Check transaction type
    if (isFeePayerSign && !tx.type.includes('TxTypeFeeDelegated')) {
        throw new Error(`Invalid transaction type: Only feeDelegated transactions can use 'caver.wallet.signAsGlobalFeePayer'.`)
    }

    let existingSigs = isFeePayerSign ? tx.feePayerSignatures : tx.signatures
    if (isFeePayerSign) {
        existingSigs = tx.feePayerSignatures
        tx.feePayerSignatures = []
    } else {
        existingSigs = tx.signatures
        tx.signatures = []
    }

    // Fill optional values
    await tx.fillTransaction()

    const requestObject = { rlp: tx.getRLPEncoding(), submit: false }
    if (isFeePayerSign && tx.feePayer && tx.feePayer !== '0x' && tx.feePayer !== '0x0000000000000000000000000000000000000000')
        requestObject.feePayer = tx.feePayer
    if (tx.feeRatio) requestObject.feeRatio = utils.hexToNumber(tx.feeRatio)
    if (tx.type.includes('Legacy')) requestObject.from = address

    return { requestObject, existingSigs }
}

module.exports = KASWallet
