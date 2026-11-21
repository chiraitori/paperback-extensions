const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const FACTORIALS = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800]

const AES_SBOX = new Uint8Array([
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
])

const AES_INV_SBOX = new Uint8Array(256)
for (let i = 0; i < 256; i++) {
    AES_INV_SBOX[AES_SBOX[i] ?? 0] = i
}

const AES_RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]

const MD5_SHIFTS = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]

const MD5_K = new Uint32Array(64)
for (let i = 0; i < 64; i++) {
    MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0
}

export function base64ToBytes(b64: string): Uint8Array {
    const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '')
    const len = clean.length
    if (len % 4 !== 0) {
        throw new Error('Invalid base64 string')
    }
    let padding = 0
    if (len >= 2) {
        if (clean[len - 1] === '=') padding++
        if (clean[len - 2] === '=') padding++
    }
    const out = new Uint8Array((len / 4) * 3 - padding)
    const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let outIdx = 0
    for (let i = 0; i < len; i += 4) {
        const c0 = lookup.indexOf(clean[i] ?? '')
        const c1 = lookup.indexOf(clean[i + 1] ?? '')
        const c2 = clean[i + 2] === '=' ? 0 : lookup.indexOf(clean[i + 2] ?? '')
        const c3 = clean[i + 3] === '=' ? 0 : lookup.indexOf(clean[i + 3] ?? '')
        const triplet = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3
        out[outIdx++] = (triplet >>> 16) & 0xff
        if (clean[i + 2] !== '=') out[outIdx++] = (triplet >>> 8) & 0xff
        if (clean[i + 3] !== '=') out[outIdx++] = triplet & 0xff
    }
    return out
}

export function utf8BytesToString(bytes: Uint8Array): string {
    let result = ''
    let i = 0
    while (i < bytes.length) {
        const b1 = bytes[i++] ?? 0
        if (b1 < 0x80) {
            result += String.fromCharCode(b1)
        } else if (b1 >= 0xc0 && b1 < 0xe0) {
            const b2 = bytes[i++] ?? 0
            result += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f))
        } else if (b1 >= 0xe0 && b1 < 0xf0) {
            const b2 = bytes[i++] ?? 0
            const b3 = bytes[i++] ?? 0
            result += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f))
        } else {
            const b2 = bytes[i++] ?? 0
            const b3 = bytes[i++] ?? 0
            const b4 = bytes[i++] ?? 0
            let cp = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f)
            cp -= 0x10000
            result += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff))
        }
    }
    return result
}

function rotl(x: number, n: number): number {
    return ((x << n) | (x >>> (32 - n))) >>> 0
}

export function md5(data: Uint8Array): Uint8Array {
    const bitLen = data.length * 8
    const paddedLen = (((data.length + 8) >>> 6) + 1) * 64
    const padded = new Uint8Array(paddedLen)
    padded.set(data)
    padded[data.length] = 0x80
    const view = new DataView(padded.buffer)
    view.setUint32(paddedLen - 8, bitLen >>> 0, true)
    view.setUint32(paddedLen - 4, Math.floor(bitLen / 0x100000000) >>> 0, true)

    let a0 = 0x67452301
    let b0 = 0xefcdab89
    let c0 = 0x98badcfe
    let d0 = 0x10325476

    const m = new Uint32Array(16)
    for (let offset = 0; offset < paddedLen; offset += 64) {
        for (let j = 0; j < 16; j++) {
            m[j] = view.getUint32(offset + j * 4, true)
        }
        let a = a0
        let b = b0
        let c = c0
        let d = d0

        for (let i = 0; i < 64; i++) {
            let f: number
            let g: number
            if (i < 16) {
                f = (b & c) | (~b & d)
                g = i
            } else if (i < 32) {
                f = (d & b) | (~d & c)
                g = (5 * i + 1) % 16
            } else if (i < 48) {
                f = b ^ c ^ d
                g = (3 * i + 5) % 16
            } else {
                f = c ^ (b | ~d)
                g = (7 * i) % 16
            }

            const kVal = MD5_K[i] ?? 0
            const mVal = m[g] ?? 0
            const shift = MD5_SHIFTS[i] ?? 0
            const temp = d
            d = c
            c = b
            b = (b + rotl((a + f + kVal + mVal) >>> 0, shift)) >>> 0
            a = temp
        }

        a0 = (a0 + a) >>> 0
        b0 = (b0 + b) >>> 0
        c0 = (c0 + c) >>> 0
        d0 = (d0 + d) >>> 0
    }

    const digest = new Uint8Array(16)
    const outView = new DataView(digest.buffer)
    outView.setUint32(0, a0, true)
    outView.setUint32(4, b0, true)
    outView.setUint32(8, c0, true)
    outView.setUint32(12, d0, true)
    return digest
}

function xtime(a: number): number {
    return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff
}

function gfMul(a: number, b: number): number {
    let res = 0
    let x = a
    let y = b
    for (let i = 0; i < 8; i++) {
        if (y & 1) res ^= x
        x = xtime(x)
        y >>>= 1
    }
    return res
}

function expandAes256Key(key: Uint8Array): Uint8Array {
    const rk = new Uint8Array(240)
    rk.set(key.subarray(0, 32))
    let bytesGenerated = 32
    let rconIdx = 0
    const temp = new Uint8Array(4)

    while (bytesGenerated < 240) {
        for (let i = 0; i < 4; i++) {
            temp[i] = rk[bytesGenerated - 4 + i] ?? 0
        }
        if (bytesGenerated % 32 === 0) {
            const t0 = temp[0] ?? 0
            temp[0] = AES_SBOX[temp[1] ?? 0] ?? 0
            temp[1] = AES_SBOX[temp[2] ?? 0] ?? 0
            temp[2] = AES_SBOX[temp[3] ?? 0] ?? 0
            temp[3] = AES_SBOX[t0] ?? 0
            temp[0] = (temp[0] ?? 0) ^ (AES_RCON[rconIdx++] ?? 0)
        } else if (bytesGenerated % 32 === 16) {
            for (let i = 0; i < 4; i++) {
                temp[i] = AES_SBOX[temp[i] ?? 0] ?? 0
            }
        }
        for (let i = 0; i < 4; i++) {
            rk[bytesGenerated] = (rk[bytesGenerated - 32] ?? 0) ^ (temp[i] ?? 0)
            bytesGenerated++
        }
    }
    return rk
}

function addRoundKey(state: Uint8Array, rk: Uint8Array, round: number): void {
    const offset = round * 16
    for (let i = 0; i < 16; i++) {
        state[i] = (state[i] ?? 0) ^ (rk[offset + i] ?? 0)
    }
}

function invSubBytes(state: Uint8Array): void {
    for (let i = 0; i < 16; i++) {
        state[i] = AES_INV_SBOX[state[i] ?? 0] ?? 0
    }
}

function invShiftRows(state: Uint8Array): void {
    let t = state[13] ?? 0
    state[13] = state[9] ?? 0
    state[9] = state[5] ?? 0
    state[5] = state[1] ?? 0
    state[1] = t

    const t2a = state[2] ?? 0
    const t2b = state[6] ?? 0
    state[2] = state[10] ?? 0
    state[6] = state[14] ?? 0
    state[10] = t2a
    state[14] = t2b

    t = state[3] ?? 0
    state[3] = state[7] ?? 0
    state[7] = state[11] ?? 0
    state[11] = state[15] ?? 0
    state[15] = t
}

function invMixColumns(state: Uint8Array): void {
    for (let c = 0; c < 4; c++) {
        const i = c * 4
        const s0 = state[i] ?? 0
        const s1 = state[i + 1] ?? 0
        const s2 = state[i + 2] ?? 0
        const s3 = state[i + 3] ?? 0
        state[i] = gfMul(s0, 14) ^ gfMul(s1, 11) ^ gfMul(s2, 13) ^ gfMul(s3, 9)
        state[i + 1] = gfMul(s0, 9) ^ gfMul(s1, 14) ^ gfMul(s2, 11) ^ gfMul(s3, 13)
        state[i + 2] = gfMul(s0, 13) ^ gfMul(s1, 9) ^ gfMul(s2, 14) ^ gfMul(s3, 11)
        state[i + 3] = gfMul(s0, 11) ^ gfMul(s1, 13) ^ gfMul(s2, 9) ^ gfMul(s3, 14)
    }
}

export function aes256CbcDecrypt(ciphertext: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
    if (ciphertext.length === 0 || ciphertext.length % 16 !== 0) {
        throw new Error('Invalid AES ciphertext length')
    }
    const rk = expandAes256Key(key)
    const out = new Uint8Array(ciphertext.length)
    const state = new Uint8Array(16)
    let prev = iv

    for (let offset = 0; offset < ciphertext.length; offset += 16) {
        const block = ciphertext.subarray(offset, offset + 16)
        state.set(block)
        addRoundKey(state, rk, 14)
        for (let round = 13; round >= 1; round--) {
            invShiftRows(state)
            invSubBytes(state)
            addRoundKey(state, rk, round)
            invMixColumns(state)
        }
        invShiftRows(state)
        invSubBytes(state)
        addRoundKey(state, rk, 0)

        for (let i = 0; i < 16; i++) {
            out[offset + i] = (state[i] ?? 0) ^ (prev[i] ?? 0)
        }
        prev = block
    }

    const pad = out[out.length - 1] ?? 0
    if (pad < 1 || pad > 16) {
        throw new Error('Invalid PKCS#7 padding')
    }
    for (let i = out.length - pad; i < out.length; i++) {
        if (out[i] !== pad) {
            throw new Error('Invalid PKCS#7 padding')
        }
    }
    return out.subarray(0, out.length - pad)
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array {
    let total = 0
    for (const c of chunks) total += c.length
    const res = new Uint8Array(total)
    let offset = 0
    for (const c of chunks) {
        res.set(c, offset)
        offset += c.length
    }
    return res
}

export function decryptOpenSslAes(base64Data: string, passphrase: string): string {
    const raw = base64ToBytes(base64Data)
    if (raw.length < 16) {
        throw new Error('Encrypted payload too short')
    }
    // Check OpenSSL "Salted__" header (8 bytes)
    const prefix = 'Salted__'
    for (let i = 0; i < 8; i++) {
        if (raw[i] !== prefix.charCodeAt(i)) {
            throw new Error('Missing OpenSSL Salted__ header')
        }
    }

    const salt = raw.subarray(8, 16)
    const ciphertext = raw.subarray(16)
    const passBytes = new Uint8Array(passphrase.length)
    for (let i = 0; i < passphrase.length; i++) {
        passBytes[i] = passphrase.charCodeAt(i) & 0xff
    }

    const d1 = md5(concatBytes(passBytes, salt))
    const d2 = md5(concatBytes(d1, passBytes, salt))
    const d3 = md5(concatBytes(d2, passBytes, salt))
    const key = concatBytes(d1, d2)
    const iv = d3

    const plainBytes = aes256CbcDecrypt(ciphertext, key, iv)
    return utf8BytesToString(plainBytes)
}

export function decodeScrambleKey(rawKey: string): number[] {
    const sliced = rawKey.slice(4)
    if (!/^H[1-9A-HJ-NP-Za-km-z]+$/.test(sliced)) {
        throw new Error(`Invalid scramble key: ${rawKey}`)
    }
    const body = sliced.slice(1, -1)
    const checksum = sliced.slice(-1)
    let n = 0
    for (const ch of body) {
        const idx = BASE58_ALPHABET.indexOf(ch)
        if (idx < 0) {
            throw new Error(`Invalid base58 character in key: ${ch}`)
        }
        n = n * 58 + idx
    }
    if (BASE58_ALPHABET[n % 58] !== checksum) {
        throw new Error('Scramble key checksum mismatch')
    }

    const pool = Array.from({ length: 10 }, (_v, idx) => idx)
    const order: number[] = []
    let rem = n
    for (let a = 9; a >= 0; a--) {
        const fact = FACTORIALS[a] ?? 1
        const idx = Math.floor(rem / fact)
        rem = rem % fact
        const picked = pool.splice(idx, 1)[0]
        if (picked === undefined) {
            throw new Error('Scramble permutation index out of bounds')
        }
        order.push(picked)
    }
    return order
}
