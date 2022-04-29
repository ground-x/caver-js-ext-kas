const _ = require('lodash')
const CaverExtKAS = require('../../../../index')

const { url, chainId, accessKeyId, secretAccessKey } = require('../../../../test/testEnv').auths.kip17API

const caver = new CaverExtKAS()

caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

async function approveAll() {
    // approve all
    const approve = await caver.kas.kip17.approveAll('addressOrAlias', 'from', 'to', 'tokenId', true)
    // deny all
    const deny = await caver.kas.kip17.approveAll('addressOrAlias', 'from', 'to', 'tokenId', false)
}

approveAll()
