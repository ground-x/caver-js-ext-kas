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

const _ = require('lodash')
const utils = require('caver-js').utils

const { TokenApi, TokenContractApi, TokenHistoryApi, TokenOwnershipApi } = require('../../rest-client/src')
const TokenHistoryQueryOptions = require('./tokenHistoryQueryOptions')

const NOT_INIT_API_ERR_MSG = `TokenHistory API is not initialized. Use 'caver.initTokenHistoryAPI' function to initialize TokenHistory API.`

/**
 * A warpping class that connects TokenHistory API.
 * @class
 */
class TokenHistory {
    /**
     * Creates an instance of token history api.
     * @constructor
     * @param {ApiClient} client - The Api client to use to connect with KAS.
     * @param {AccessOptions} accessOptions - An instance of AccessOptions including `chainId`, `accessKeyId` and `secretAccessKey`.
     */
    constructor(client, accessOptions) {
        this.accessOptions = accessOptions

        this.apiInstances = {}

        if (client) {
            this.apiInstances = {
                token: new TokenApi(client),
                tokenContract: new TokenContractApi(client),
                tokenHistory: new TokenHistoryApi(client),
                tokenOwnership: new TokenOwnershipApi(client),
            }
        }
    }

    /**
     * @type {string}
     */
    get auth() {
        return this.accessOptions.auth
    }

    /**
     * @type {string}
     */
    get accessKeyId() {
        return this.accessOptions.accessKeyId
    }

    /**
     * @type {string}
     */
    get secretAccessKey() {
        return this.accessOptions.secretAccessKey
    }

    /**
     * @type {string}
     */
    get chainId() {
        return this.accessOptions.chainId
    }

    /**
     * @type {AccessOptions}
     */
    get accessOptions() {
        return this._accessOptions
    }

    set accessOptions(accessOptions) {
        this._accessOptions = accessOptions
    }

    /**
     * @type {object}
     */
    get apiInstances() {
        return this._apiInstances
    }

    set apiInstances(apiInstances) {
        this._apiInstances = apiInstances
    }

    /**
     * @type {object}
     */
    get client() {
        return this.apiInstances.token.apiClient
    }

    set client(client) {
        this.apiInstances = {
            token: new TokenApi(client),
            tokenContract: new TokenContractApi(client),
            tokenHistory: new TokenHistoryApi(client),
            tokenOwnership: new TokenOwnershipApi(client),
        }
    }

    /**
     * @type {TokenApi}
     */
    get tokenApi() {
        return this.apiInstances.token
    }

    /**
     * @type {TokenContractApi}
     */
    get tokenContractApi() {
        return this.apiInstances.tokenContract
    }

    /**
     * @type {TokenHistoryApi}
     */
    get tokenHistoryApi() {
        return this.apiInstances.tokenHistory
    }

    /**
     * @type {TokenOwnershipApi}
     */
    get tokenOwnershipApi() {
        return this.apiInstances.tokenOwnership
    }

    /**
     * Gets token transfer history list. <br>
     * GET /v2/transfer
     *
     * @param {Array.<number>} presets Preset IDs to be used for search, Preset ID can be checked in KAS Console.
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `kind`, `range`, `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableTransfers}
     */
    getTransferHistory(presets, queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (!_.isArray(presets)) presets = [presets]
        for (const p of presets) {
            if (!_.isNumber(p)) throw new Error(`Invalid type of presets: presets should be number or number array type.`)
        }

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['kind', 'range', 'size', 'cursor']))
            throw new Error(`Invalid query options: 'kind', 'range', 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenHistoryApi.getTransfers(this.chainId, presets.toString(), queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Token transaction history inquiry with transaction hash. <br>
     * GET /v2/transfer/tx/{transaction-hash}
     *
     * @param {string} transactionHash Transaction hash to search transfer history.
     * @param {Function} [callback] The callback function to call.
     * @return {Transfers}
     */
    getTransferHistoryByTxHash(transactionHash, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.tokenHistoryApi.getTransfersByTxHash(this.chainId, transactionHash, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Search token transfer history of a specific EOA. <br>
     * GET /v2/transfer/account/{address}
     *
     * @param {string} address The EOA address used to search for token transfer history.
     *                         The from or to in the search result matches the suggested address value.
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `kind`, `caFilter`, `range`, `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableTransfers}
     */
    getTransferHistoryByAccount(address, queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['kind', 'caFilter', 'range', 'size', 'cursor']))
            throw new Error(`Invalid query options: 'kind', 'caFilter', 'range', 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenHistoryApi.getTransfersByEoa(this.chainId, address, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieve information of all labeled FT contracts. <br>
     * GET /v2/contract/ft
     *
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `status`, `type`, `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableFtContractDetails}
     */
    getFTContractList(queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['status', 'type', 'size', 'cursor']))
            throw new Error(`Invalid query options: 'status', 'type', 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenContractApi.getListofFtContracts(this.chainId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves the information of the FT contract labeled with the address of the FT contract. <br>
     * GET /v2/contract/ft/{ft-address}
     *
     * @param {string} ftAddress Address of the FT contract for which information is to be retrieved.
     * @param {Function} [callback] The callback function to call.
     * @return {FtContractDetail}
     */
    getFTContract(ftAddress, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.tokenContractApi.getFtContractDetail(this.chainId, ftAddress, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieve information of all labeled NFT contracts. <br>
     * GET /v2/contract/nft
     *
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `status`, `type`, `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableNftContractDetails}
     */
    getNFTContractList(queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['status', 'type', 'size', 'cursor']))
            throw new Error(`Invalid query options: 'status', 'type', 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenContractApi.getListOfNftContracts(this.chainId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves the information of the NFT contract labeled with the address of the NFT contract. <br>
     * GET /v2/contract/nft/{nftAddress}
     *
     * @param {string} nftAddress Address of the NFT contract for which information is to be retrieved.
     * @param {Function} [callback] The callback function to call.
     * @return {NftContractDetail}
     */
    getNFTContract(nftAddress, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.tokenContractApi.getNftContractDetail(this.chainId, nftAddress, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves information of all NFTs issued by a specific NFT contract. <br>
     * GET /v2/contract/nft/{nft-address}/token
     *
     * @param {string} nftAddress NFT contract address for which you want to search all issued NFTs.
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableNfts}
     */
    getNFTList(nftAddress, queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenApi.getNftsByContractAddress(this.chainId, nftAddress, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Among the NFTs issued from the NFT contract address,
     * the information of the NFT owned by the EOA address received as a parameter is retrieved. <br>
     * GET /v2/contract/nft/{nft-address}/owner/{owner-address}
     *
     * @param {string} nftAddress Address of the NFT contract to be searched.
     * @param {string} ownerAddress Address of the EOA to be searched.
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableNfts}
     */
    getNFTListByOwner(nftAddress, ownerAddress, queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenApi.getNftsByOwnerAddress(this.chainId, nftAddress, ownerAddress, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieve information of a specific NFT. <br>
     * GET /v2/contract/nft/{nft-address}/token/{token-id}
     *
     * @param {string} nftAddress Address of the NFT contract to be searched.
     * @param {string|number} tokenId Token id to be searched.
     * @param {Function} [callback] The callback function to call.
     * @return {Nft}
     */
    getNFT(nftAddress, tokenId, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.tokenApi.getNftById(this.chainId, nftAddress, utils.toHex(tokenId), (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieve the record of ownership changes for a specific NFT. <br>
     * GET /v2/contract/nft/{nft-address}/token/{token-id}/history
     *
     * @param {string} nftAddress Address of the NFT contract to be searched.
     * @param {string|number} tokenId Token id to be searched.
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableNftOwnershipChanges}
     */
    getNFTOwnershipHistory(nftAddress, tokenId, queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenOwnershipApi.getListOfNftOwnershipChanges(
                this.chainId,
                nftAddress,
                utils.toHex(tokenId),
                queryOptions,
                (err, data, response) => {
                    if (err) {
                        reject(err)
                    }
                    if (callback) callback(err, data, response)
                    resolve(data)
                }
            )
        })
    }

    /**
     * Retrieve information of all labeled MT contracts. <br>
     * GET /v2/contract/mt
     * @example
     * // without query parameter
     * const ret = await caver.kas.tokenHistory.getMTContractList()
     *
     * // with query parameter
     * const ret = await caver.kas.tokenHistory.getMTContractList({
     *      status: caver.kas.tokenHistory.queryOptions.status.COMPLETED,
     *      size: 1,
     *      type: caver.kas.tokenHistory.queryOptions.type.KIP37,
     *      cursor: 'eyJjc...',
     *  })
     *
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `status`, `type`, `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableFtContractDetails}
     */
    getMTContractList(queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['status', 'type', 'size', 'cursor']))
            throw new Error(`Invalid query options: 'status', 'type', 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenContractApi.getListOfMtContracts(this.chainId, queryOptions, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Retrieves a labeled MT contract information. <br>
     * GET /v2/contract/mt/{mt-address}
     * @example
     * const ret = await caver.kas.tokenHistory.getMTContract('0x219f6f9a47ced24c0451dd80ff97d6feca4533c0')
     *
     * @param {string} mtAddress Address of the MT contract for which information is to be retrieved.
     * @param {Function} [callback] The callback function to call.
     * @return {MtContractDetail}
     */
    getMTContract(mtAddress, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)

        return new Promise((resolve, reject) => {
            this.tokenContractApi.getMtContractDetail(this.chainId, mtAddress, (err, data, response) => {
                if (err) {
                    reject(err)
                }
                if (callback) callback(err, data, response)
                resolve(data)
            })
        })
    }

    /**
     * Lists all tokens of a MT contract that are owned by the queried EOA address. <br>
     * GET /v2/contract/mt/{mt-address}/owner/{owner-address}
     * @example
     * const mtContractAddress = '0x219f6f9a47ced24c0451dd80ff97d6feca4533c0'
     * const owner = '0xb8bb4b109f18eb6f292757aaec623200f1a41369'
     *
     * // without query parameter
     * const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContractAddress, owner)
     *
     * // with query parameter
     * const ret = await caver.kas.tokenHistory.getMTListByOwner(mtContractAddress, owner, { size: 1, cursor: 'eyJjc...' })
     *
     * @param {string} mtAddress Address of the MT contract to be searched.
     * @param {string} ownerAddress Address of the account.
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableMtTokensWithBalance}
     */
    getMTListByOwner(mtAddress, ownerAddress, queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(mtAddress)) throw new Error(`Invalid mt contract address: ${mtAddress}`)
        if (!utils.isAddress(ownerAddress)) throw new Error(`Invalid account address: ${ownerAddress}`)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenApi.getMtTokensByContractAddressAndOwnerAddress(
                this.chainId,
                mtAddress,
                ownerAddress,
                queryOptions,
                (err, data, response) => {
                    if (err) {
                        reject(err)
                    }
                    if (callback) callback(err, data, response)
                    resolve(data)
                }
            )
        })
    }

    /**
     * Retrieves a specific MT information. <br>
     * GET /v2/contract/mt/{mt-address}/owner/{owner-address}/token/{token-id}
     * @example
     * const mtContractAddress = '0x219f6f9a47ced24c0451dd80ff97d6feca4533c0'
     * const owner = '0xb8bb4b109f18eb6f292757aaec623200f1a41369'
     *
     * // with token id in hex
     * const ret = await caver.kas.tokenHistory.getMT(mtContractAddress, owner, '0x0')
     *
     * // with token id in number
     * const ret = await caver.kas.tokenHistory.getMT(mtContractAddress, owner, 0)
     *
     * @param {string} mtAddress Address of the MT contract to be searched.
     * @param {string} ownerAddress Address of the account.
     * @param {string|number} tokenId Token id to be searched.
     * @param {Function} [callback] The callback function to call.
     * @return {MtToken}
     */
    getMT(mtAddress, ownerAddress, tokenId, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(mtAddress)) throw new Error(`Invalid mt contract address: ${mtAddress}`)
        if (!utils.isAddress(ownerAddress)) throw new Error(`Invalid account address: ${ownerAddress}`)

        return new Promise((resolve, reject) => {
            this.tokenApi.getMtTokensByContractAddressAndOwnerAddressAndTokenId(
                this.chainId,
                mtAddress,
                ownerAddress,
                utils.toHex(tokenId),
                (err, data, response) => {
                    if (err) {
                        reject(err)
                    }
                    if (callback) callback(err, data, response)
                    resolve(data)
                }
            )
        })
    }

    /**
     * Lists all EOA addresses who own the queried MT. <br>
     * GET /v2/contract/mt/{mt-address}/token/{token-id}
     * @example
     * const mtContractAddress = '0x219f6f9a47ced24c0451dd80ff97d6feca4533c0'
     *
     * // with query parameter and token id in hex
     * const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContractAddress, '0x0')
     *
     * // without query parameter and with token id in number
     * const ret = await caver.kas.tokenHistory.getMTOwnerListByTokenId(mtContractAddress, 0, { size: 1, cursor: 'eyJjc...' })
     *
     * @param {string} mtAddress Address of the MT contract to be searched.
     * @param {string|number} tokenId Token id to be searched.
     * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `size`, and `cursor`.
     * @param {Function} [callback] The callback function to call.
     * @return {PageableMtTokens}
     */
    getMTOwnerListByTokenId(mtAddress, tokenId, queryOptions, callback) {
        if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)
        if (!utils.isAddress(mtAddress)) throw new Error(`Invalid mt contract address: ${mtAddress}`)

        if (_.isFunction(queryOptions)) {
            callback = queryOptions
            queryOptions = {}
        }

        queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
        if (!queryOptions.isValidOptions(['size', 'cursor'])) throw new Error(`Invalid query options: 'size', and 'cursor' can be used.`)

        return new Promise((resolve, reject) => {
            this.tokenApi.getMtTokensByContractAddressAndTokenId(
                this.chainId,
                mtAddress,
                utils.toHex(tokenId),
                queryOptions,
                (err, data, response) => {
                    if (err) {
                        reject(err)
                    }
                    if (callback) callback(err, data, response)
                    resolve(data)
                }
            )
        })
    }

    // /**
    //  * Lists all fungible tokens owned by the queried EOA address. <br>
    //  * GET /v2/account/token/{address}/ft
    //  * @example
    //  * const address = '0x5e47b195eeb11d72f5e1d27aebb6d341f1a9bedb'
    //  *
    //  * // with query parameter
    //  * const ret = await caver.kas.tokenHistory.getFTSummaryByAddress(address)
    //  *
    //  * // without query parameter
    //  * const ret = await caver.kas.tokenHistory.getFTSummaryByAddress(address, {
    //  *      size: 1,
    //  *      cursor: 'eyJjc...',
    //  *      caFilters: [ '0x639bb15d5c012820bef8dd038254271e8597b3cf', '0x54b3fde37c5604007f0e50913e990a039d19b6af' ],
    //  * })
    //  *
    //  * @param {string} address The address of the account to search the owned FT.
    //  * @param {TokenHistoryQueryOptions} [queryOptions] Filters required when retrieving data. `caFilters`, `size`, and `cursor`.
    //  * @param {Function} [callback] The callback function to call.
    //  * @return {PageableAccountFT}
    //  */
    // getFTSummaryByAddress(address, queryOptions, callback) {
    //     if (!this.accessOptions || !this.tokenApi) throw new Error(NOT_INIT_API_ERR_MSG)
    //     if (_.isFunction(queryOptions)) {
    //         callback = queryOptions
    //         queryOptions = {}
    //     }

    //     queryOptions = TokenHistoryQueryOptions.constructFromObject(queryOptions || {})
    //     if (!queryOptions.isValidOptions(['caFilters', 'size', 'cursor']))
    //         throw new Error(`Invalid query options: 'caFilters', 'size', and 'cursor' can be used.`)

    //     return new Promise((resolve, reject) => {
    //         this.tokenOwnershipApi.getFtSummaryByEoaAddress(this.chainId, address, queryOptions, (err, data, response) => {
    //             if (err) {
    //                 reject(err)
    //             }
    //             if (callback) callback(err, data, response)
    //             resolve(data)
    //         })
    //     })
    // }
}

module.exports = TokenHistory
