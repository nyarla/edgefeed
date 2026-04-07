import { timingSafeEqual } from "node:crypto";
import type { Context } from "hono";
import type { Authenticator } from "./Authentication";

export type TokenAuthBindings = {
  /**
   * The access token.
   */
  EDGEFEED_TOKEN_AUTH_TOKEN: string;
};

const textEncoder = new TextEncoder();
const decode = (src: string): Uint8Array => {
  return textEncoder.encode(src);
};

/**
 * The verifier token stirng.
 *
 * @param {Uint8Array} challenge - the challenge token.
 * @param {Uint8Array} token - the valid token.
 * @returns {boolean} the result of verify token. if this value is true that means verity is scceed, or false is verify failed.
 **/
export const verifyToken = (
  challenge: Uint8Array,
  token: Uint8Array,
): boolean => {
  if (token.length === challenge.length && timingSafeEqual(challenge, token)) {
    return true;
  }

  return false;
};

/**
 * The function of instantiate token authorizatior implementation.
 *
 * @returns {Authenticator} the authorizatior implementation for token auth.
 */
export const createTokenAuthenticator =
  (): Authenticator =>
  async (c: Context): Promise<boolean> => {
    const length = c.env.EDGEFEED_TOKEN_AUTH_TOKEN.length;
    const challenge = decode(
      (new URL(c.req.url).searchParams.get("token") ?? "")
        .padEnd(length, "0")
        .substring(0, length),
    );
    const token = decode(c.env.EDGEFEED_TOKEN_AUTH_TOKEN.substring(0, length));
    return verifyToken(challenge, token);
  };
