const _ = require('lodash')
const CaverExtKAS = require('../../../../index')

const { url, chainId, accessKeyId, secretAccessKey } = require('../../../../test/testEnv').auths.kip17API

const caver = new CaverExtKAS()

caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

async function getContractOwner() {
    const res = await caver.kas.kip17.getContractOwner('jasmine2')
    console.log(res)
}

getContractOwner()
