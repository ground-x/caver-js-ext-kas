const _ = require('lodash')
const CaverExtKAS = require('../../../../index')

const { url, chainId, accessKeyId, secretAccessKey } = require('../../../../test/testEnv').auths.kip17API

const caver = new CaverExtKAS()

caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)

async function burn() {
    const res = await caver.kas.kip17.burn('jasmine-alias', '0xDc277E2D89b92336A4ee80be3c7142443FDaDE47', 1)
    console.log(res)
}

burn()
