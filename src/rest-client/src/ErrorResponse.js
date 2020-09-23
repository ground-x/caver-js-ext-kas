const _ = require('lodash')
const utils = require('caver-js').utils

class ErrorResponse {
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ErrorResponse()
            if (data.hasOwnProperty('code')) obj.code = data.code
            if (data.hasOwnProperty('message')) obj.message = data.message
        }
        return obj
    }

    constructor(code, message) {
        if (code !== undefined) this.code = code
        if (message !== undefined) this.message = message
    }

    get code() {
        return this._code
    }

    set code(code) {
        if (!_.isNumber(code) && !utils.isHex(code))
            throw new Error(`Invalid type of code: code should be number type or hex number string.`)
        this._code = utils.hexToNumber(code)
    }

    get message() {
        return this._message
    }

    set message(message) {
        if (!_.isString(message)) throw new Error(`Invalid type of message: message should be string type.`)
        this._message = message
    }
}

module.exports = ErrorResponse
