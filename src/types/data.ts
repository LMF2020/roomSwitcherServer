export interface ServerInfo {
  ipAddr: string;
  expireDate: string;
}

export interface ClientInfo {
  clientId: string;
  clientAddr: string;
}

export interface AuthResult {
  status: boolean;
  reason: string;
}
