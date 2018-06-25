// @flow

import 'edge-login-ui-react/lib/styles.css'

import type { EdgeAccount, EdgeAccountOptions } from 'edge-core-js'
import { AccountScreen, LoginScreen } from 'edge-login-ui-react'
import React, { Component } from 'react'
import { render } from 'react-dom'

import {
  handleClose,
  handleError,
  handleLogin,
  handleWalletInfosChanged
} from './frame-actions.js'
import type { FrameState } from './frame-state.js'

type ViewProps = {
  state: FrameState
}

/**
 * The top-level React component in the frame.
 * Shows the appropriate scene based on the current state.
 */
class View extends Component<ViewProps> {
  onClose = () => handleClose(this.props.state)
  onError = (e: Error) => handleError(this.props.state, e)
  onLogin = (account: EdgeAccount) => handleLogin(this.props.state, account)

  render () {
    const { state } = this.props

    if (state.page === 'login') {
      const accountId = `account${state.nextAccountId}` // OMG HACK!
      const accountOptions: EdgeAccountOptions = {
        callbacks: {
          onKeyListChanged: () => {
            handleWalletInfosChanged(state, accountId)
          },

          onBalanceChanged: walletId => {
            handleWalletInfosChanged(state, accountId)
          }
        }
      }

      return (
        <LoginScreen
          accountOptions={accountOptions}
          context={state.context}
          onClose={this.onClose}
          onError={this.onError}
          onLogin={this.onLogin}
          vendorImageUrl={state.vendorImageUrl}
          vendorName={state.vendorName}
        />
      )
    }

    if (state.page === 'account' && state.pageAccount) {
      return (
        <AccountScreen
          account={state.pageAccount}
          context={state.context}
          onClose={this.onClose}
          onError={this.onError}
          vendorImageUrl={state.vendorImageUrl}
          vendorName={state.vendorName}
        />
      )
    }

    return null
  }
}

/**
 * Refresh the HTML in response to state changes.
 */
export function updateView (state: FrameState) {
  const root = document.getElementById('app')
  if (root) render(<View state={state} />, root)
}
