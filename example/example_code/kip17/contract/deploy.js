const _ = require('lodash')
const CaverExtKAS = require('../../../../index')

const { url, chainId, accessKeyId, secretAccessKey } = require('../../../../test/testEnv').auths.kip17API

const caver = new CaverExtKAS()

const name = 'Jasmine'
const symbol = 'JAS'
const alias = 'jasmine'
const owner = '0xa809284C83b901eD106Aba4Ccda14628Af128e14'

caver.initKIP17API(chainId, accessKeyId, secretAccessKey, url)
caver.kas.kip17.deploy(name, symbol, alias, owner)
