// @flow

import type {
  EdgeAccount,
  EdgeContext,
  EdgeContextOptions,
  EdgeCorePluginFactory
} from 'edge-core-js'
import { makeContext } from 'edge-core-js'
import postRobot from 'post-robot'
import { base16 } from 'rfc4648'

import type { EthererumTransaction } from '../edge-types.js'
import type {
  ClientDispatch,
  ConnectionMessage,
  ConnectionReply,
  FrameMessage,
  PostRobotEvent
} from '../protocol.js'
import { frameDispatch } from './frame-actions.js'
import {
  getLocalUsers,
  getWalletInfos,
  signEthereumTransaction,
  simpleSpend
} from './frame-selectors.js'
import { updateView } from './View.js'

/**
 * Hacking around incorrect environment detection in the core.
 */
function makeEdgeContext (opts: EdgeContextOptions) {
  return Promise.resolve(makeContext(opts))
}

/**
 * The state the client stores.
 */
export type FrameState = {
  accounts: { [accountId: string]: EdgeAccount },
  context: EdgeContext,
  hideKeys: boolean,
  nextAccountId: number,
  page: '' | 'login' | 'account',
  pageAccount: EdgeAccount | null,
  vendorImageUrl: string,
  vendorName: string,

  // Frame callbacks:
  clientDispatch: ClientDispatch
}

/**
 * Creates the initial frame state object.
 */
async function makeFrameState (opts: ConnectionMessage): Promise<FrameState> {
  const {
    apiKey,
    appId,
    hideKeys,
    pluginNames = [],
    vendorName = '',
    vendorImageUrl = '',
    clientDispatch
  } = opts

  // Load plugins:
  const plugins: Array<EdgeCorePluginFactory> = []
  for (const pluginName of pluginNames) {
    if (pluginName === 'ethereum') {
      const module = await import('edge-currency-ethereum')
      plugins.push(module.ethereumCurrencyPluginFactory)
    }
  }

  // Create the context:
  const context = await makeEdgeContext({ apiKey, appId, plugins })

  return {
    accounts: {},
    context,
    hideKeys,
    nextAccountId: 0,
    page: '',
    pageAccount: null,
    vendorImageUrl,
    vendorName,

    clientDispatch
  }
}

export function awaitConnection () {
  return postRobot.on(
    'connect',
    async (
      event: PostRobotEvent<ConnectionMessage>
    ): Promise<ConnectionReply> => {
      const state = await makeFrameState(event.data)
      updateView(state)
      const localUsers = await getLocalUsers(state)

      return {
        localUsers,

        createCurrencyWallet (accountId: string, type: string) {
          // Hack in basic Ethereum support for Augur:
          if (type === 'wallet:ethereum') {
            return state.accounts[accountId]
              .createWallet(type, {
                ethereumKey: base16.stringify(state.context.io.random(32))
              })
              .then(walletId => {
                const walletInfos = getWalletInfos(state, accountId)
                return { walletId, walletInfos }
              })
          }

          return state.accounts[accountId]
            .createCurrencyWallet(type, {})
            .then(currencyWallet => {
              const walletInfos = getWalletInfos(state, accountId)
              return { walletId: currencyWallet.id, walletInfos }
            })
        },

        createWallet (accountId: string, type: string, keys: {}) {
          return state.accounts[accountId]
            .createWallet(type, keys)
            .then(walletId => {
              const walletInfos = getWalletInfos(state, accountId)
              return { walletId, walletInfos }
            })
        },

        frameDispatch (message: FrameMessage) {
          return frameDispatch(state, message)
        },

        signEthereumTransaction (
          accountId: string,
          walletId: string,
          transaction: EthererumTransaction
        ): Promise<string> {
          return Promise.resolve(
            signEthereumTransaction(state, accountId, walletId, transaction)
          )
        },

        simpleSpend (
          accountId: string,
          walletId: string,
          address: string,
          amount: string
        ) {
          return simpleSpend(state, accountId, walletId, address, amount)
        }
      }
    }
  )
}
