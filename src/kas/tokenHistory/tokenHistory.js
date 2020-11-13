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
     * @param {string} tokenId Token id to be searched.
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
     * @param {string} tokenId Token id to be searched.
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
}

module.exports = TokenHistory
