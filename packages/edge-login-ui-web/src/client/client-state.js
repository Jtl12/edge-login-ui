// @flow

import postRobot from 'post-robot'

import { version } from '../../package.json'
import type { EdgeUserInfos, EdgeWalletInfos } from '../edge-types.js'
import type {
  ClientMessage,
  ConnectionMessage,
  ConnectionReply,
  CurrencyWalletProxies,
  FrameCreateCurrencyWallet,
  FrameCreateWallet,
  FrameMessage,
  FrameSignEthereumTransaction,
  PostRobotEvent
} from '../protocol.js'
import { makeAccountApi } from './client-account.js'
import { hideFrame, makeFrame } from './iframe.js'
import type { EdgeUiAccount, EdgeUiContextOptions } from './index.js'

/**
 * The state we store per-account.
 */
export type AccountState = {
  username: string,
  walletInfos: EdgeWalletInfos,
  currencyWallets: CurrencyWalletProxies
}

/**
 * The state the client stores.
 */
export type ClientState = {
  accounts: { [accountId: string]: AccountState },
  appId: string,
  frame: HTMLIFrameElement,
  localUsers: EdgeUserInfos,

  // Client callbacks:
  onClose: ?() => mixed,
  onError: (e: Error) => mixed,
  onLogin: ?(account: EdgeUiAccount) => mixed,

  // Frame callbacks:
  createCurrencyWallet: FrameCreateCurrencyWallet,
  createWallet: FrameCreateWallet,
  frameDispatch: (message: FrameMessage) => Promise<mixed>,
  signEthereumTransaction: FrameSignEthereumTransaction
}

/**
 * Handles incoming messages from the frame.
 */
function clientDispatch (state: ClientState, message: ClientMessage) {
  switch (message.type) {
    case 'error': {
      state.onError(message.payload)
      return
    }

    case 'close': {
      hideFrame(state.frame)
      if (state.onClose) state.onClose()
      return
    }

    case 'login': {
      const {
        accountId,
        localUsers,
        username,
        currencyWallets,
        walletInfos
      } = message.payload
      state.accounts[accountId] = { username, currencyWallets, walletInfos }
      state.localUsers = localUsers
      const account = makeAccountApi(state, accountId)

      if (state.onLogin) state.onLogin(account)
      return
    }

    case 'wallet-list-changed': {
      const { accountId, currencyWallets, walletInfos } = message.payload
      if (!state.accounts[accountId]) {
        console.warn(`Unknown account id ${accountId}`)
        return
      }
      state.accounts[accountId].walletInfos = walletInfos
      state.accounts[accountId].currencyWallets = currencyWallets
      return
    }
  }

  throw new Error('Unknown client message')
}

function onErrorNop (e: Error) {
  console.error(e)
}

/**
 * Creates the initial client state object.
 */
export function makeClientState (
  opts: EdgeUiContextOptions
): Promise<ClientState> {
  const {
    apiKey,
    appId,
    assetsPath = `https://developer.airbitz.co/iframe/v${version}/`,
    callbacks = {},
    hideKeys = false,
    frameTimeout = 15000,
    pluginNames,
    vendorImageUrl,
    vendorName
  } = opts
  const { onError = onErrorNop } = callbacks

  // eslint-disable-next-line prefer-const
  let state: ClientState
  const message: ConnectionMessage = {
    apiKey,
    appId,
    hideKeys,
    pluginNames,
    vendorName,
    vendorImageUrl,
    clientDispatch: message => clientDispatch(state, message)
  }

  // Set up the frame:
  const frame = makeFrame(assetsPath)
  return postRobot
    .send(frame, 'connect', message, { timeout: frameTimeout })
    .then((reply: PostRobotEvent<ConnectionReply>) => {
      const frameDispatch: any = reply.data.frameDispatch
      state = {
        accounts: {},
        appId,
        createCurrencyWallet: reply.data.createCurrencyWallet,
        createWallet: reply.data.createWallet,
        signEthereumTransaction: reply.data.signEthereumTransaction,
        frame,
        frameDispatch,
        localUsers: reply.data.localUsers,
        onClose: void 0,
        onError,
        onLogin: void 0
      }
      return state
    })
}
