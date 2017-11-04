import React, {Component} from 'react'
import {connect} from 'react-redux'
import {autobind} from 'core-decorators'
import {FacebookLogin} from 'react-facebook-login-component'
import {GoogleLogin} from 'react-google-login-component';
import {login} from '../../services/auth'
import {setItem} from '../../services/storage'
import {setUserProfile} from '../../data/profile/profileActions'
import './login.scss'


class Login extends Component {
  redirect() {
    this.props.history.push('/');
  }

  @autobind
  responseFacebook(response) {
    login('fb', response.accessToken)
      .bimap(
        error => {
          console.log('Could not login via fb', error);
        },
        ({token, account}) => {
          setItem(ACCESS_TOKEN_KEY, token);
          setItem(USER_INFO, JSON.stringify(account));
          this.props.setUserProfile(account)
          this.redirect();
        }
      )
      .run();
  }

  componentClicked() { }

  @autobind
  responseGoogle(response) {
    if(response.error) {
      console.log(response.error);
    }

    login('google', response.accessToken)
      .bimap(
        error => {
          console.log('Could not login via google', error)
        },
        ({token, account}) => {
          setItem(ACCESS_TOKEN_KEY, token);
          setItem(USER_INFO, JSON.stringify(account));
          this.props.setUserProfile(account);
          this.redirect();
        }
      )
      .run();
  }

  render() {
    return  <section className='login-section page-center'>
      <FacebookLogin
        socialId={FB_CLIENT_ID}
        language='en_US'
        version='v2.5'
        xfbml={true}
        fields='name,email,picture'
        scope='public_profile,email'
        responseHandler={this.responseFacebook}
        buttonText='Login With Facebook' />
      <GoogleLogin 
        socialId={GOOGLE_CLIENT_ID}
        className='google-login'
        scope='email,profile,openid'
        fetchBasicProfile={false}
        responseHandler={this.responseGoogle}
        buttonText='Login With Google'/>
      {/* <GoogleLogin
        clientId={process.env.GOOGLE_CLIENT_ID}
        scope='openid email profile'
        buttonText='Login with Google'
        onSuccess={this.responseGoogle}
        onFailure={this.responseGoogle}/> */}
    </section>
  }
}

const mapStateToProps = state => ({
  userProfile: state.userProfile
})

const mapDispatchToProps = dispatch => ({
  setUserProfile: (dispatch) ['∘'] (setUserProfile)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
