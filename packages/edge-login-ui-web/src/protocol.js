// @flow

import type {
  EdgeUserInfos,
  EdgeWalletInfos,
  EthererumTransaction
} from './edge-types.js'

// We need this until post-robot ships with its own types:
export type PostRobotEvent<Data> = {
  data: Data,
  origin: string,
  source: Object
}

// wallets ------------------------------------------------------------------

export type CurrencyWalletProxy = {
  address: string,
  balances: {
    [currencyCode: string]: string // native amount
  }
}

export type CurrencyWalletProxies = { [walletId: string]: CurrencyWalletProxy }

// to client ----------------------------------------------------------------

/** The current window was closed. */
export type ClientClose = {
  type: 'close'
}

/** Something went wrong. */
export type ClientError = {
  type: 'error',
  payload: Error
}

/** The user logged in. */
export type ClientLogin = {
  type: 'login',
  payload: {
    accountId: string,
    localUsers: EdgeUserInfos,
    username: string,
    walletInfos: EdgeWalletInfos,
    currencyWallets: CurrencyWalletProxies
  }
}

/** The user added, removed, or edited their wallet list. */
export type ClientWalletListChanged = {
  type: 'wallet-list-changed',
  payload: {
    accountId: string,
    walletInfos: EdgeWalletInfos,
    currencyWallets: CurrencyWalletProxies
  }
}

export type ClientMessage =
  | ClientClose
  | ClientError
  | ClientLogin
  | ClientWalletListChanged

// to frame -----------------------------------------------------------------

export type FrameLogout = {
  type: 'logout',
  payload: {
    accountId: string
  }
}

export type FrameOpenLoginWindow = {
  type: 'open-login-window'
}

export type FrameOpenManageWindow = {
  type: 'open-manage-window',
  payload: {
    accountId: string
  }
}

export type FrameMessage =
  | FrameLogout
  | FrameOpenLoginWindow
  | FrameOpenManageWindow

// connection ---------------------------------------------------------------

export type ClientDispatch = (message: ClientMessage) => mixed

/** The client sends this to connect to the iframe. */
export type ConnectionMessage = {
  apiKey: string,
  appId: string,
  hideKeys: boolean,
  pluginNames?: Array<string>,
  vendorName?: string,
  vendorImageUrl?: string,

  clientDispatch: ClientDispatch
}

export type FrameCreateCurrencyWallet = (
  accountId: string,
  type: string
) => Promise<{ walletId: string, walletInfos: EdgeWalletInfos }>

export type FrameCreateWallet = (
  accountId: string,
  type: string,
  keys: {}
) => Promise<{ walletId: string, walletInfos: EdgeWalletInfos }>

export type FrameSignEthereumTransaction = (
  accountId: string,
  walletId: string,
  transaction: EthererumTransaction
) => Promise<string>

export type FrameDispatch = (message: FrameMessage) => mixed

export type ConnectionReply = {
  localUsers: EdgeUserInfos,

  createCurrencyWallet: FrameCreateCurrencyWallet,
  createWallet: FrameCreateWallet,
  frameDispatch: FrameDispatch,
  signEthereumTransaction: FrameSignEthereumTransaction
}
