// @flow
/* eslint-disable no-use-before-define */

import type { EdgeWalletInfo } from 'edge-core-js'

import type {
  EdgeUserInfos,
  EdgeWalletInfos,
  EthererumTransaction
} from '../edge-types.js'

// Re-exports:
export type { EdgeWalletInfo } from 'edge-core-js'
export { makeEdgeUiContext } from './client-context.js'

// context ------------------------------------------------------------

export type EdgeUiContextCallbacks = {
  +onError?: (e: Error) => mixed
}

export type EdgeUiContextOptions = {
  apiKey: string,
  appId: string,
  assetsPath?: string,
  callbacks?: EdgeUiContextCallbacks,
  hideKeys?: boolean,
  frameTimeout?: number,
  pluginNames?: Array<string>,
  vendorImageUrl?: string,
  vendorName?: string
}

export type EdgeLoginWindowOptions = {
  +onLogin?: (account: EdgeUiAccount) => mixed,
  +onClose?: () => mixed
}

export type EdgeUiContext = {
  dispose(): mixed,

  localUsers: EdgeUserInfos,
  openLoginWindow(opts: EdgeLoginWindowOptions): Promise<mixed>
}

// account ------------------------------------------------------------

export type EdgeManageWindowOptions = {
  +onClose?: () => mixed
}

export type EdgeUiAccount = {
  appId: string,
  username: string,

  // Lifetime:
  logout(): void,

  // Account credentials:
  openManageWindow(opts?: EdgeManageWindowOptions): Promise<mixed>,

  // All wallet infos:
  walletInfos: EdgeWalletInfos,
  createWallet(type: string, keys: {}): Promise<string>,
  getFirstWalletInfo(type: string): EdgeWalletInfo | null,

  // Currency wallets:
  currencyWallets: EdgeUiCurrencyWallets,
  createCurrencyWallet(type: string): Promise<mixed>,

  // Temporary solution for Ethereum apps, pending proper wallet API:
  signEthereumTransaction(
    walletId: string,
    transaction: EthererumTransaction
  ): Promise<string>
}

// wallets ------------------------------------------------------------

export type EdgeUiCurrencyWallets = { [walletId: string]: EdgeUiCurrencyWallet }

export type EdgeUiCurrencyWallet = {
  address: string,
  balances: {
    [currencyCode: string]: string
  }
}
