// @flow

import type { EdgeAccount } from 'edge-core-js'

import type { FrameMessage } from '../protocol.js'
import { getLocalUsers, getWalletInfos } from './frame-selectors.js'
import type { FrameState } from './frame-state.js'
import { updateView } from './View.js'

/**
 * Updates the state when the host window sends a message.
 */
export function frameDispatch (state: FrameState, message: FrameMessage) {
  switch (message.type) {
    case 'logout': {
      const { accountId } = message.payload
      if (!state.accounts[accountId]) throw new Error('Invalid accountId')

      state.accounts[accountId].logout()
      delete state.accounts[accountId]
      return
    }

    case 'open-login-window': {
      state.page = 'login'
      state.pageAccount = null
      updateView(state)
      return
    }

    case 'open-manage-window': {
      const { accountId } = message.payload
      if (!state.accounts[accountId]) throw new Error('Invalid accountId')

      state.page = 'account'
      state.pageAccount = state.accounts[accountId]
      updateView(state)
      return
    }
  }

  throw new Error('Unknown frame message')
}

/**
 * Updates the state when the user tries to close the popup.
 */
export function handleClose (state: FrameState) {
  state.page = ''
  updateView(state)
  return state.clientDispatch({ type: 'close' })
}

/**
 * Updates the state when the login component encounters an error.
 */
export function handleError (state: FrameState, e: Error) {
  state.clientDispatch({ type: 'error', payload: e })
}

/**
 * Updates the state when the user logs in.
 */
export async function handleLogin (state: FrameState, account: EdgeAccount) {
  const accountId = `account${state.nextAccountId++}`
  state.accounts[accountId] = account
  const username = account.username
  const localUsers = await getLocalUsers(state)
  const walletInfos = getWalletInfos(state, accountId)

  return state.clientDispatch({
    type: 'login',
    payload: { accountId, username, localUsers, walletInfos }
  })
}
