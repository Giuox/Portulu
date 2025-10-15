export function b2cAuthorizeUrl(): string {
  const tenant = process.env.NEXT_PUBLIC_B2C_TENANT as string;
  const policy = process.env.NEXT_PUBLIC_B2C_SIGNIN_POLICY as string;
  const clientId = process.env.NEXT_PUBLIC_B2C_CLIENT_ID as string;
  const redirectUri = process.env.NEXT_PUBLIC_B2C_REDIRECT_URI as string;
  const scope = encodeURIComponent(`openid ${clientId}`);
  const nonce = Math.random().toString(36).slice(2);
  const state = '/';
  return `https://${tenant}.b2clogin.com/${tenant}.onmicrosoft.com/${policy}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=id_token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_mode=query&nonce=${nonce}&state=${encodeURIComponent(state)}`;
}

