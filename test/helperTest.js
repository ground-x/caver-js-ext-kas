/*
 * Copyright 2020 The caver-js-ext-kas Authors
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

const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const helper = require('../src/utils/helper')

describe('Test helper functions', () => {
    context('helper.formatDate', () => {
        it('CAVERJS-EXT-KAS-ETC-001: should return valid Date with yy-mm-dd string', () => {
            const dateString = '2020-08-01'
            const formatted = helper.formatDate(dateString)
            const exepcted = new Date('2020-08-01 00:00:00')
            expect(formatted.getTime()).to.equal(exepcted.getTime())
        })

        it('CAVERJS-EXT-KAS-ETC-002: should return valid Date with yy-mm-dd hh:mm string', () => {
            const dateString = '2020-08-01 00:00'
            const formatted = helper.formatDate(dateString)
            const exepcted = new Date('2020-08-01 00:00:00')
            expect(formatted.getTime()).to.equal(exepcted.getTime())
        })

        it('CAVERJS-EXT-KAS-ETC-003: should return valid Date with yy-mm-dd hh:mm:ss string', () => {
            const dateString = '2020-08-01 00:00:00'
            const formatted = helper.formatDate(dateString)
            const exepcted = new Date('2020-08-01 00:00:00')
            expect(formatted.getTime()).to.equal(exepcted.getTime())
        })

        it('CAVERJS-EXT-KAS-ETC-004: should return valid Date with yy-mm-dd hh:mm:ss:SSS string', () => {
            const dateString = '2020-08-01 00:00:00:000'
            const formatted = helper.formatDate(dateString)
            const exepcted = new Date('2020-08-01 00:00:00')
            expect(formatted.getTime()).to.equal(exepcted.getTime())
        })

        it('CAVERJS-EXT-KAS-ETC-005: should return valid Date with millisecond unit timestamp', () => {
            const timestamp = 1596207600000
            const formatted = helper.formatDate(timestamp)
            expect(formatted.getTime()).to.equal(1596207600000)
        })

        it('CAVERJS-EXT-KAS-ETC-006: should return valid Date with second unit timestamp', () => {
            const timestamp = 1596207600
            const formatted = helper.formatDate(timestamp)
            expect(formatted.getTime()).to.equal(1596207600000)
        })

        it('CAVERJS-EXT-KAS-ETC-007: should throw error with invalid date', () => {
            let invalidDate = '2020-08-01 00'
            const expectedError = `Invalid date format. You should use a timestamp or date string (i.e. 'yy-mm-dd', 'yy-mm-dd hh:mm', 'yy-mm-dd hh:mm:ss', or 'yy-mm-dd hh:mm:ss:sss')`
            expect(() => helper.formatDate(invalidDate)).to.throw(expectedError)

            invalidDate = '08-01'
            expect(() => helper.formatDate(invalidDate)).to.throw(expectedError)
        })
    })

    context('helper.formatObjectKeyWithoutUnderscore', () => {
        it('CAVERJS-EXT-KAS-ETC-008: return object with underscore prexied', () => {
            const test = {
                _threshold: 4,
                _weightedKeys: [
                    {
                        _weight: 3,
                        _publicKey:
                            '0x046d87c660a30eff8b28d90f97c611ed27d0c85d47fdd9185584c54b6347c1218e9a1e00b9c3f0d75adbeeafbca67c7caaa1a2c899864ce10e51c7f466469c1261',
                    },
                    {
                        _weight: 1,
                        _publicKey:
                            '0x04c40482ec234279eed13734293dba10974dcbf1c24264afffb5bd35eb40773af5595f3df5c9f7f6bf10e7b981526188545b5be5eb5a0be3b8c722c34ead6f0c00',
                    },
                ],
            }

            const formatted = helper.formatObjectKeyWithoutUnderscore(test)
            expect(formatted.threshold).to.equal(test._threshold)
            expect(formatted.weightedKeys).not.to.be.undefined
            expect(formatted.weightedKeys[0].weight).to.equal(test._weightedKeys[0]._weight)
            expect(formatted.weightedKeys[0].publicKey).to.equal(test._weightedKeys[0]._publicKey)
            expect(formatted.weightedKeys[1].weight).to.equal(test._weightedKeys[1]._weight)
            expect(formatted.weightedKeys[1].publicKey).to.equal(test._weightedKeys[1]._publicKey)
        })
    })
})
