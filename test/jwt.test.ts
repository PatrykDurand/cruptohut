import { describe, it } from 'node:test'
import * as assert from 'assert'
import { createToken, verifyToken } from '../src/backend/utils/jwt.utils'

describe('JWT creation and validation', () => {
    const token = createToken({ test: 'yes' }, 'SECRET')
    it('should return valid JWT', () => {
        assert.equal(verifyToken(token, 'SECRET').isValid, true)
    })
    it('should return object from JWT', () => {
        assert.equal(verifyToken(token, 'SECRET').content.test, 'yes')
    })
})
