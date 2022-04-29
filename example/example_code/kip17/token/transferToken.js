const _ = require('lodash')
const CaverExtKAS = require('../../../../index')

const { url, chainId, accessKeyId, secretAccessKey } = require('../../../../test/testEnv').auths.kip17API

const caver = new CaverExtKAS()

caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

async function transferToken() {
    const res = await caver.kas.kip17.transfer(
        '0x9a4af95723b972ec6953187cb39b7167e216cbdd',
        '0xa809284C83b901eD106Aba4Ccda14628Af128e14',
        '0xa809284C83b901eD106Aba4Ccda14628Af128e14',
        '0x9a4af95723b972ec6953187cb39b7167e216cbdd',
        '0x3'
    )
    console.log(res)
}

transferToken()
