const _ = require('lodash')
const CaverExtKAS = require('../../../../index')

const { url, chainId, accessKeyId, secretAccessKey } = require('../../../../test/testEnv').auths.kip17API

const caver = new CaverExtKAS()

caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

async function transferOwnership() {
    const contractAddress = '0x9a4af95723b972ec6953187cb39b7167e216cbdd'
    const owner = '0x0097690c36280b1e448722764e1f9524ec6b2db5'
    const sender = '0xa809284C83b901eD106Aba4Ccda14628Af128e14'

    const res = await caver.kas.kip17.transferOwnership(contractAddress, owner, sender)
    console.log(res)
}

transferOwnership()
