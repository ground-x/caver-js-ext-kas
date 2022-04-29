const _ = require('lodash')
const CaverExtKAS = require('../../../../index')

const { url, chainId, accessKeyId, secretAccessKey } = require('../../../../test/testEnv').auths.kip17API

const caver = new CaverExtKAS()

caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

async function mintToken() {
    const to = '0x9EaF20b40E0f1ced5dbba6f5Cfb0D3E12B0534f4'
    const id = '0x13'
    const uri = 'https://metastore.kip17.com/0xbe02aba/0x1'

    const res = await caver.kas.kip17.mint('0x9a4af95723b972ec6953187cb39b7167e216cbdd', to, id, uri)
    console.log(res)
}

mintToken()
