/*
 * Copyright 2021 The caver-js-ext-kas Authors
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

const { expect } = require('../extendedChai')
const CaverExtKAS = require('../../index.js')

let caver
const { url, accessKeyId, secretAccessKey } = require('../testEnv').auths.nodeAPI
const { senderPrivateKey } = require('../testEnv')

let keyringContainer
let keyring

const chainId = 1001

before(() => {
    caver = new CaverExtKAS()
    caver.initNodeAPI(chainId, accessKeyId, secretAccessKey, false, url) // Use websocket

    keyringContainer = new caver.keyringContainer()
    keyring = keyringContainer.add(keyringContainer.keyring.createFromPrivateKey(senderPrivateKey))
})

describe('caver.contract with websocket provider', () => {
    it('CAVERJS-EXT-KAS-NODE-004: when event fires, data should be retrived through contract.once', async () => {
        const byteCode =
            '0x6080604052348015600f57600080fd5b5060e98061001e6000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063954ab4b2146044575b600080fd5b348015604f57600080fd5b5060566058565b005b7f90a042becc42ba1b13a5d545701bf5ceff20b24d9e5cc63b67f96ef814d80f0933604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a15600a165627a7a723058200ebb53e9d575350ceb2d92263b7d4920888706b5221f024e7bbc10e3dbb8e18d0029'
        const helloContractABI = [
            {
                constant: false,
                inputs: [],
                name: 'say',
                outputs: [],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        name: 'who',
                        type: 'address',
                    },
                ],
                name: 'callevent',
                type: 'event',
            },
        ]

        const c = caver.contract.create(helloContractABI)
        c.setWallet(keyringContainer)
        const contract = await c.deploy(
            {
                from: keyring.address,
                gas: 100000000,
                value: 0,
            },
            byteCode
        )
        let dataVariable
        contract.once('callevent', (error, data) => {
            expect(error).to.be.null
            dataVariable = data
        })

        const options = {
            from: keyring.address,
            gas: 30000,
        }

        await contract.methods.say().send(options)

        expect(dataVariable).not.to.null
        caver.currentProvider.connection.close()
    }).timeout(200000)

    it('CAVERJS-EXT-KAS-NODE-005: when initialize node api with websocket, check existence of the special characters in auth', async () => {
        const id = 'KASFAKEACCESSKEYID'
        const pwd = 'KASFAKESECRETACCESSKEY'

        const expectedError =
            'Invalid auth: To use the websocket provider, you must use an accessKey and seretAccessKey that do not contain special characters. Please obtain a new AccessKey through the KAS Console.'
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}=`, pwd, url) // =, -, _ will be allowed in credential
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}[`, pwd, url)
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}]`, pwd, url)
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}$`, pwd, url)
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}_`, pwd, url) // =, -, _ will be allowed in credential
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}-`, pwd, url) // =, -, _ will be allowed in credential
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}~`, pwd, url)
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}?`, pwd, url)
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}<`, pwd, url)
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}\\`, pwd, url)
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id}/`, pwd, url)
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, `${id} `, pwd, url)
        }).to.throw(expectedError)

        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}=`, url) // =, -, _ will be allowed in credential
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}[`, url)
        }).not.to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}]`, url)
        }).not.to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}$`, url)
        }).not.to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}_`, url) // =, -, _ will be allowed in credential
        }).not.to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}-`, url) // =, -, _ will be allowed in credential
        }).not.to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}~`, url)
        }).not.to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}?`, url)
        }).to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}<`, url)
        }).not.to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}\\`, url)
        }).not.to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd}/`, url)
        }).not.to.throw(expectedError)
        expect(() => {
            caver.initNodeAPIWithWebSocket(chainId, id, `${pwd} `, url)
        }).to.throw(expectedError)

        caver.currentProvider.connection.close()
    }).timeout(200000)
})
