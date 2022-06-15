/**
 * KIP-37 API
 * ## Introduction The KIP-37 API helps Blockchain app (BApp) developers to easily deploy smart contracts and send tokens of the [KIP-37 Multi Token Standard](https://kips.klaytn.com/KIPs/kip-37).  You can use the default contract managing account (`deployer`) and `alias`.    You can also manage the contracts and tokens created on the klaytn network using the caver SDK, using contract address and the [Wallet API](https://refs.klaytnapi.com/ko/wallet/latest) account.    ## Fee Payer Options  KAS KIP-37 supports four scenarios for paying transactin fees:      **1. Using only KAS Global FeePayer Account**   Sends all transactions using the KAS global FeePayer Account.       ``` {     \"options\": {       \"enableGlobalFeePayer\": true     }     } ```    <br />    **2. Using User FeePayer account**   Sends all transactions using the KAS User FeePayer Account.      ``` {   \"options\": {     \"enableGlobalFeePayer\": false,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ```    <br />  **3. Using both KAS Global FeePayer Account + User FeePayer Account**   Uses User FeePayer Account as default. When the balance runs out, KAS Global FeePayer Account will be used.     ``` {   \"options\": {     \"enableGlobalFeePayer\": true,     \"userFeePayer\": {       \"krn\": \"krn:1001:wallet:20bab367-141b-439a-8b4c-ae8788b86316:feepayer-pool:default\",       \"address\": \"0xd6905b98E4Ba43a24E842d2b66c1410173791cab\"     }   } } ```    <br />  **4. Not using FeePayer Account**   Sends a transaction via normal means where the sender pays the transaction fee.       ``` {   \"options\": {     \"enableGlobalFeePayer\": false   } } ```
 *
 * OpenAPI spec version: 1.0
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

const ApiClient = require('../../../ApiClient')
const ApproveAllKip37ContractRequest = require('../../model/ApproveAllKip37ContractRequest')
const DeployKip37ContractRequest = require('../../model/DeployKip37ContractRequest')
const ErrorResponse = require('../../model/ErrorResponse')
const ImportKip37ContractRequest = require('../../model/ImportKip37ContractRequest')
const Kip37Contract = require('../../model/Kip37Contract')
const Kip37ContractDeleteResponse = require('../../model/Kip37ContractDeleteResponse')
const Kip37ContractListResponse = require('../../model/Kip37ContractListResponse')
const Kip37ContractOwnerResponse = require('../../model/Kip37ContractOwnerResponse')
const Kip37ContractTransferRequest = require('../../model/Kip37ContractTransferRequest')
const Kip37ContractTransferResponse = require('../../model/Kip37ContractTransferResponse')
const Kip37DeployResponse = require('../../model/Kip37DeployResponse')
const Kip37TransactionStatusResponse = require('../../model/Kip37TransactionStatusResponse')
const RenounceKIP37Request = require('../../model/RenounceKIP37Request')
const UpdateKip37ContractRequest = require('../../model/UpdateKip37ContractRequest')

/**
 * Kip37Contract service.
 * @class Kip37ContractApi
 * @version 1.0
 */
class Kip37ContractApi {
    /**
     * Constructs a new Kip37ContractApi.
     * @alias Kip37ContractApi
     * @class
     * @param {ApiClient} [apiClient] Optional API client implementation to use,
     * default to {@link ApiClient#instance} if unspecified.
     */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance
    }

    /**
     * Callback function to receive the result of the approveAll operation.
     * @callback Kip37ContractApi~approveAllCallback
     * @param {String} error Error message, if any.
     * @param {Kip37TransactionStatusResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Approve/Deny Token Transfer
     * Grants approval to a third party to send tokens from a certain smart contract. To revoke the approval, set \&quot;approved\&quot; to &#x60;false&#x60; in the body.  ##### From The account that sends the transactions.  You can omit the KRN if the &#x60;owner&#x60; address is managed by KIP-37 or Wallet Service &#x60;account-pool&#x60;.&lt;br /&gt; Otherwise you have to provide the KRN object in the header (&#x60;x-krn: krn:{chain-id}:wallet:{account-id}:account-pool:{pool name}&#x60;).
     * @param {Object} opts Optional parameters
     * @param {Kip37ContractApi~approveAllCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37TransactionStatusResponse}
     */
    approveAll(contractAddressOrAlias, xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip37TransactionStatusResponse

        return this.apiClient.callApi(
            '/v2/contract/{contract-address-or-alias}/approveall',
            'POST',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the deployContract operation.
     * @callback Kip37ContractApi~deployContractCallback
     * @param {String} error Error message, if any.
     * @param {Kip37DeployResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deploy Contract
     * Deploys a new KIP-37 contract with the given parameters.  &lt;br/&gt; To see how to deploy a KIP-37 contract, please refer to [KIP-37 Tutorial](https://docs.klaytnapi.com/tutorial/kip37-api).   ##### Options With &#x60;options&#x60; you can set the transaction fee payment method. You can find more details in [Fee Payer Options](#section/Fee-Payer-Options).
     * @param {Object} opts Optional parameters
     * @param {Kip37ContractApi~deployContractCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37DeployResponse}
     */
    deployContract(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip37DeployResponse

        return this.apiClient.callApi(
            '/v2/contract',
            'POST',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the getContract operation.
     * @callback Kip37ContractApi~getContractCallback
     * @param {String} error Error message, if any.
     * @param {Kip37Contract} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get Contract
     * Returns the information of a KIP-37 contract. Use the &#x60;alias&#x60; or contract address to specify the contract.
     * @param {Kip37ContractApi~getContractCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37Contract}
     */
    getContract(contractAddressOrAlias, xChainId, callback) {
        const postBody = null

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = Kip37Contract

        return this.apiClient.callApi(
            '/v2/contract/{contract-address-or-alias}',
            'GET',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the importContract operation.
     * @callback Kip37ContractApi~importContractCallback
     * @param {String} error Error message, if any.
     * @param {Kip37Contract} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Import Contract
     * Imports a KIP-37 contract deployed without KAS to manage and use it. But in order to execute the functions such as those for minting, pausing, resuming tokens, you need a KAS account. To know more about the account and more, please refer to [KIP-37 Standard](http://kips.klaytn.com/KIPs/kip-37).&lt;br/&gt;   ##### Options With &#x60;options&#x60; you can set the transaction fee payment method. You can find more details in [Fee Payer Options](#section/Fee-Payer-Options).
     * @param {Object} opts Optional parameters
     * @param {Kip37ContractApi~importContractCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37Contract}
     */
    importContract(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {}
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip37Contract

        return this.apiClient.callApi(
            '/v2/contract/import',
            'POST',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the listContractsInDeployerPool operation.
     * @callback Kip37ContractApi~listContractsInDeployerPoolCallback
     * @param {String} error Error message, if any.
     * @param {Kip37ContractListResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get Contract List
     * Returns a list of all KIP-37 contracts deployed by a specified user. Contracts will be displayed in order of the requested creation time. &lt;br/&gt;&lt;br/&gt; The &#x60;status&#x60; field in the response means the following: - &#x60;init&#x60;: The initial state before sending the transaction - &#x60;submitted&#x60;: The transaction for contract deployment has been sent - &#x60;deployed&#x60;: Contract has been deployed - &#x60;imported&#x60;: Contract list has been imported - &#x60;failed&#x60: Deploy Contract transaction failed
     * @param {Object} opts Optional parameters
     * @param {Kip37ContractApi~listContractsInDeployerPoolCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37ContractListResponse}
     */
    listContractsInDeployerPool(xChainId, opts, callback) {
        opts = opts || {}
        const postBody = null

        const pathParams = {}
        const queryParams = {
            size: opts.size,
            cursor: opts.cursor,
            status: opts.status,
        }
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = Kip37ContractListResponse

        return this.apiClient.callApi(
            '/v2/contract',
            'GET',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the owner operation.
     * @callback Kip37ContractApi~ownerCallback
     * @param {String} error Error message, if any.
     * @param {Kip37ContractOwnerResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get Contract Owner
     * Returns the owner of a specified KIP-37 contract. You can use either the contract alias or contract address.
     * @param {Kip37ContractApi~ownerCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37ContractOwnerResponse}
     */
    owner(xChainId, contractAddressOrAlias, callback) {
        const postBody = null

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = []
        const accepts = ['application/json']
        const returnType = Kip37ContractOwnerResponse

        return this.apiClient.callApi(
            '/v2/contract/{contract-address-or-alias}/owner',
            'GET',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the pauseContract operation.
     * @callback Kip37ContractApi~pauseContractCallback
     * @param {String} error Error message, if any.
     * @param {Kip37TransactionStatusResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Pause KIP-37 Contract
     * Pauses all operations for a specified contract, such as minting, transfering tokens.&lt;br /&gt; You can resume using [/v2/{contract-address-or-alias/unpause](#operation/UnpauseContract).    ##### Sender The Account that sends the transaction.  If the &#x60;sender&#x60; account belongs to a default &#x60;account-pool&#x60; for either KIP-37 or Wallet, you can omit the KRN.&lt;br /&gt;&lt;br /&gt; Otherwise you have to provide the KRN data (&#x60;x-krn: krn:{chain-id}:wallet:{account-id}:account-pool:{pool name}&#x60;) in the header.
     * @param {Object} opts Optional parameters
     * @param {Kip37ContractApi~pauseContractCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37TransactionStatusResponse}
     */
    pauseContract(contractAddressOrAlias, xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip37TransactionStatusResponse

        return this.apiClient.callApi(
            '/v2/contract/{contract-address-or-alias}/pause',
            'POST',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the putContract operation.
     * @callback Kip37ContractApi~putContractCallback
     * @param {String} error Error message, if any.
     * @param {Kip37Contract} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Edit KIP-37 Contract Information
     * Edits the information of a contract. &lt;br/&gt;  ##### Options   Options for paying the transaction fee. For more details, please refer to [Fee Payer Options](#section/Fee-Payer-Options).
     * @param {Object} opts Optional parameters
     * @param {Kip37ContractApi~putContractCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37Contract}
     */
    putContract(contractAddressOrAlias, xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip37Contract

        return this.apiClient.callApi(
            '/v2/contract/{contract-address-or-alias}',
            'PUT',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the renounceContract operation.
     * @callback Kip37ContractApi~renounceContractCallback
     * @param {String} error Error message, if any.
     * @param {Kip37ContractDeleteResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Renounce Contract Ownership
     * Renounces the ownership of a specified KIP-37 contract. You can use either the contract alias or contract address.
     * @param {Object} opts Optional parameters
     * @param {Kip37ContractApi~renounceContractCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37ContractDeleteResponse}
     */
    renounceContract(xChainId, contractAddressOrAlias, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip37ContractDeleteResponse

        return this.apiClient.callApi(
            '/v2/contract/{contract-address-or-alias}/owner',
            'DELETE',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the transferOwnership operation.
     * @callback Kip37ContractApi~transferOwnershipCallback
     * @param {String} error Error message, if any.
     * @param {Kip37ContractTransferResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Transfer Contract Ownership
     * Transfers the ownership of the contract. You can access the contract to be transferred using either the contract alias or contract address.
     * @param {Object} opts Optional parameters
     * @param {Kip37ContractApi~transferOwnershipCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37ContractTransferResponse}
     */
    transferOwnership(xChainId, contractAddressOrAlias, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip37ContractTransferResponse

        return this.apiClient.callApi(
            '/v2/contract/{contract-address-or-alias}/owner/transfer',
            'PUT',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
    /**
     * Callback function to receive the result of the unpauseContract operation.
     * @callback Kip37ContractApi~unpauseContractCallback
     * @param {String} error Error message, if any.
     * @param {Kip37TransactionStatusResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Resume KIP-37 Contract
     * Resumes the operations for a paused contract.  ##### Sender The account for sending the transaction.  If the &#x60;sender&#x60; account belongs to a default &#x60;account-pool&#x60; for either KIP-37 or Wallet, you can omit the KRN.&lt;br /&gt; Otherwise you have to provide the KRN data (&#x60;x-krn: krn:{chain-id}:wallet:{account-id}:account-pool:{pool name}&#x60;) in the header.
     * @param {Object} opts Optional parameters
     * @param {Kip37ContractApi~unpauseContractCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Kip37TransactionStatusResponse}
     */
    unpauseContract(contractAddressOrAlias, xChainId, opts, callback) {
        opts = opts || {}
        const postBody = opts.body

        const pathParams = {
            'contract-address-or-alias': contractAddressOrAlias,
        }
        const queryParams = {}
        const headerParams = {
            'x-chain-id': xChainId,
        }
        const formParams = {}

        const authNames = ['basic']
        const contentTypes = ['application/json']
        const accepts = ['application/json']
        const returnType = Kip37TransactionStatusResponse

        return this.apiClient.callApi(
            '/v2/contract/{contract-address-or-alias}/unpause',
            'POST',
            pathParams,
            queryParams,
            headerParams,
            formParams,
            postBody,
            authNames,
            contentTypes,
            accepts,
            returnType,
            callback
        )
    }
}
module.exports = Kip37ContractApi
