declare module "jsonwebtoken" {
  export interface SignOptions {
    expiresIn?: string | number
  }

  export type VerifyOptions = Record<string, unknown>

  export interface JwtPayload {
    [key: string]: unknown
  }

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string,
    options?: SignOptions
  ): string

  export function verify<T = JwtPayload>(
    token: string,
    secretOrPublicKey: string,
    options?: VerifyOptions
  ): T

  const jwt: {
    sign: typeof sign
    verify: typeof verify
  }

  export default jwt
}
