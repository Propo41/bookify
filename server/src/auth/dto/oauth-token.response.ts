export interface OAuthTokenResponse {
  tokens?: {
    access_token?: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    expiry_date?: number;
    id_token?: string;
  };
}
