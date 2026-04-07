import { timingSafeEqual } from "node:crypto";
import type { Context } from "hono";

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

export const verifyToken = (
  challenge: Uint8Array,
  token: Uint8Array,
): boolean => {
  if (token.length === challenge.length && timingSafeEqual(challenge, token)) {
    return true;
  }

  return false;
};

export const createTokenAuthenticator =
  () =>
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
