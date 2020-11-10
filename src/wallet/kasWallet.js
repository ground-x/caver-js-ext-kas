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
 * The class that manages KAS API services.
 * @class
 */
class KASWallet {
    /**
     * Creates an instance of KAS.
     * @constructor
     */
    constructor(walletAPI) {
        this.walletAPI = walletAPI
    }

    /**
     * generates keyrings in the keyringContainer with randomly generated key pairs.
     *
     * @param {number} numberOfKeyrings The number of keyrings to create.
     * @param {string} [entropy] A random string to increase entropy. If undefined, a random string will be generated using randomHex.
     * @return {Array.<string>}
     */
    async generate(numberOfKeyrings, entropy) {
        if (entropy) throw new Error(`KAS Wallet not support entropy`)

        const addresses = []
        for (let i = 0; i < numberOfKeyrings; ++i) {
            const account = await this.walletAPI.createAccount()
            addresses.push(account.address)
        }
        return addresses
    }

    /**
     * creates a keyring instance with given parameters and adds it to the keyringContainer.
     * KeyringContainer manages Keyring instance using Map <string:Keyring> which has address as key value.
     *
     * @param {string} address The address of the keyring.
     * @param {string|Array.<string>|Array.<Array.<string>>} key Private key string(s) to use in keyring. If different keys are used for each role, key must be defined as a two-dimensional array.
     * @return {Keyring}
     */
    async newKeyring(address, key) {
        throw new Error(`Not nsupported`)
    }

    /**
     * updates the keyring inside the keyringContainer.
     * Query the keyring to be updated from keyringContainer with the keyring's address,
     * and an error occurs when the keyring is not found in the keyringContainer.
     *
     * @param {Keyring} keyring The keyring with new key.
     * @return {Keyring}
     */
    async updateKeyring(keyring) {
        throw new Error(`Not nsupported`)
    }

    /**
     * Get the keyring in container corresponding to the address
     *
     * @param {string} address The address of keyring to query.
     * @return {Keyring}
     */
    async getKeyring(address) {
        const account = await this.walletAPI.getAccount(address)

        return account
    }

    /**
     * Get the keyring in container corresponding to the address
     *
     * @param {string} address The address of keyring to query.
     * @return {Keyring}
     */
    async isExisted(address) {
        try {
            await this.walletAPI.getAccount(address)
            return true
        } catch (e) {
            return false
        }
    }

    // /**
    //  * adds a keyring to the keyringContainer.
    //  *
    //  * @param {Keyring} keyring A keyring instance to add to keyringContainer.
    //  * @return {Keyring}
    //  */
    // async add(keyring) {
    //     if (this._addressKeyringMap.get(keyring.address.toLowerCase()) !== undefined)
    //         throw new Error(`Duplicate Account ${keyring.address}. Please use updateKeyring() instead.`)

    //     const keyringToAdd = keyring.copy()

    //     this._addressKeyringMap.set(keyringToAdd.address.toLowerCase(), keyringToAdd)

    //     return keyringToAdd
    // }

    // /**
    //  * deletes the keyring that associates with the given address from keyringContainer.
    //  *
    //  * @param {string} address An address of the keyring to be deleted in keyringContainer.
    //  * @return {boolean}
    //  */
    // async remove(address) {
    //     let keyringToRemove
    //     if (utils.isAddress(address)) {
    //         keyringToRemove = this.getKeyring(address)
    //     } else {
    //         throw new Error(`To remove the keyring, the first parameter should be an address string.`)
    //     }

    //     if (keyringToRemove === undefined) return false

    //     // deallocate keyring object created for keyringContainer
    //     keyringToRemove.keys = null
    //     this._addressKeyringMap.delete(keyringToRemove.address.toLowerCase())

    //     return true
    // }

    // /**
    //  * signs with data and returns the result object that includes `signature`, `message` and `messageHash`
    //  *
    //  * @param {string} address An address of keyring in keyringContainer.
    //  * @param {string} data The data string to sign.
    //  * @param {number} role A number indicating the role of the key. You can use `caver.wallet.keyring.role`.
    //  * @param {number} [index] An index of key to use for signing.
    //  * @return {object}
    //  */
    // async signMessage(address, data, role, index) {
    //     const keyring = this.getKeyring(address)
    //     if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
    //     return keyring.signMessage(data, role, index)
    // }

    /**
     * signs the transaction using one key and return the transactionHash
     *
     * @param {string} address An address of keyring in keyringContainer.
     * @param {Transaction} transaction A transaction object.
     * @param {number} [index] An index of key to use for signing. If index is undefined, all private keys in keyring will be used.
     * @param {function} [hasher] A function to return hash of transaction.
     * @return {Transaction}
     */
    async sign(address, transaction, index, hasher) {
        if (index !== undefined || hasher !== undefined) throw new Error(`index and hasher cannnot be defined`)

        transaction.from = transaction.from || address
        if (transaction.from.toLowerCase() !== address.toLowerCase()) throw new Error(`From addresses are not matched.`)

        const ret = await this.walletAPI.sign(transaction)
        console.log(`Result this.walletAPI.sign`)
        transaction.signatures = ret.signatures
        console.log(transaction)

        return transaction
    }

    // /**
    //  * signs the transaction as a fee payer using one key and return the transactionHash
    //  *
    //  * @param {string} address An address of keyring in keyringContainer.
    //  * @param {Transaction} transaction A transaction object. This should be `FEE_DELEGATED` type.
    //  * @param {number} [index] An index of key to use for signing. If index is undefined, all private keys in keyring will be used.
    //  * @param {function} [hasher] A function to return hash of transaction.
    //  * @return {Transaction}
    //  */
    // async signAsFeePayer(address, transaction, index, hasher) {
    //     const keyring = this.getKeyring(address)
    //     if (keyring === undefined) throw new Error(`Failed to find keyring from wallet with ${address}`)
    //     const signed = await transaction.signAsFeePayer(keyring, index, hasher)

    //     return signed
    // }
}

module.exports = KASWallet
