import React, { Component } from 'react'
import { connect } from 'react-redux'
import t from 'lib/web/LocaleStrings'

import Input from 'react-toolbox/lib/input'

import { checkUsername } from './Username.middleware'
import { changeUsernameValue, error, clearError } from './Username.action'
import { changeSignupPage } from '../Signup/Signup.action'

import styles from './Username.mobileStyle.scss'

class Username extends Component {
  _handleSubmit = () => {
    if (this.props.username.length < 3) {
      return this.props.dispatch(
        error('Username must be at least 3 characters')
      )
    }
    if (this.props.username.length >= 3) {
      return this.props.dispatch(
        checkUsername(
          this.props.username,
          (errorMessage) => {
            if (errorMessage) {
              return this.props.dispatch(error(errorMessage))
            }
            if (!errorMessage) {
              this.props.dispatch(clearError())
              return this.props.dispatch(changeSignupPage('pin'))
            }
          }
        )
      )
    }
  }
  _handleBack = () => {
    if (this.props.loader.loading === false) {
      this.props.router.goBack()
    }
  }

  _handleOnChangeText = (username) => {
    this.props.dispatch(
      changeUsernameValue(username)
    )
  }

  _handleKeyEnter = (e) => {
    if (e.nativeEvent.charCode === 13) {
      return this._handleSubmit()
    }
  }
  _renderButtonRows = () => {
    if (!this.props.loader.loading) {
      return (
        <div className={styles.rowButtonsHorizontalMobile}>
          <button className={styles.primaryMobile} onClick={this._handleSubmit}>Next</button>
          <button className={styles.secondaryMobile} onClick={this._handleBack}>Back</button>
        </div>
      )
    }
    if (this.props.loader.loading) {
      return (
        <div className={styles.rowButtonsHorizontalMobile}>
          <button className={styles.primaryLoadMobile}><div className={styles.loader} /></button>
          <button className={styles.secondaryLoadMobile}>Back</button>
        </div>
      )
    }
  }
  render () {
    return (
      <div onKeyPress={this._handleKeyEnter.bind(this)} className={styles.container}>
        <p className={styles.header}>{t('fragment_setup_username_label')}</p>
        <Input
          autoFocus
          type='text'
          name='username'
          onChange={this._handleOnChangeText}
          onKeyPress={this._handleKeyEnter.bind(this)}
          value={this.props.username}
          label={t('fragment_landing_username_hint')}
          className={styles.input}
          error={this.props.error}
        />
        <ul className={styles.list}>
          <li><p className={styles.bullet}>This is not your email or real name.</p></li>
          <li><p className={styles.bullet}>This is the username to login into your account on this and other devices.</p></li>
          <li><p className={styles.bullet}>Your username and password are known only to you and never stored unencrypted.</p></li>
        </ul>
        {this._renderButtonRows()}
      </div>
    )
  }
}

export default connect(state => ({
  username: state.username.username,
  error: state.username.error,
  loader: state.loader
}))(Username)
