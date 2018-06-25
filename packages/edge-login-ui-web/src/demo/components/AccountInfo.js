// @flow

import type { EdgeUiAccount, EdgeUiCurrencyWallet } from 'edge-login-ui-web'
import React from 'react'
import ReactJson from 'react-json-view'
import QRCode from 'qrcode.react'

function WalletInfo (props: { currencyWallet: EdgeUiCurrencyWallet | void }) {
  const { currencyWallet } = props
  if (!currencyWallet) return null

  function doSpend () {
    const addressInput: any = document.getElementById('address')
    const amountInput: any = document.getElementById('amount')
    if (!addressInput || !amountInput) return

    currencyWallet.simpleSpend(addressInput.value, amountInput.value)
  }

  return (
    <div>
      <p>Address: {currencyWallet.address}</p>
      <QRCode value={currencyWallet.address} />
      <p>ETH balance: {currencyWallet.balances['ETH']} </p>
      <h2>Spend</h2>
      <p>
        <label>Address:</label>
        <input id="address" type="text" />
      </p>
      <p>
        <label>Amount:</label>
        <input id="amount" type="text" />
      </p>
      <button onClick={doSpend}>Send</button>
    </div>
  )
}

export function AccountInfo (props: { account: EdgeUiAccount }) {
  const { account } = props
  const walletInfo = account.getFirstWalletInfo('wallet:ethereum')
  if (!walletInfo) return <p>No private key</p>

  return (
    <div>
      <h1>Edge Account</h1>
      <p>You are logged in as &quot;{account.username}&quot;.</p>
      <h2>App Wallet</h2>
      <p>Private key: {walletInfo.keys.ethereumKey}</p>
      <WalletInfo currencyWallet={account.currencyWallets[walletInfo.id]} />
      <h2>All Wallet Infos</h2>
      <ReactJson
        collapsed={2}
        displayDataTypes={false}
        displayObjectSize={false}
        name="walletInfos"
        src={account.walletInfos}
      />
    </div>
  )
}
