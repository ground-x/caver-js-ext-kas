const _ = require('lodash')
const CaverExtKAS = require('../../../../index')

const { url, chainId, accessKeyId, secretAccessKey } = require('../../../../test/testEnv').auths.kip17API

const caver = new CaverExtKAS()

caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

async function updateContractOptions() {
    const res = await caver.kas.kip17.updateContractOptions('0x562f65fe2d80c35a1261982c440d63d2cf801928', { enableGlobalFeePayer: true })
    console.log(res)
}

updateContractOptions()
