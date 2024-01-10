import '@/styles/globals.css'
import '@/styles/friendlist.css'
import '@/styles/friends-page.css'
import '@/styles/map-page.css'
import '@/styles/map.css'
import '@/styles/navbarstyle.css'
import '@/styles/pages.css'
import '@/styles/timer.css'
import '@/styles/timerbutton.css'
import '@/styles/uifeatures.css'
import '@/styles/sessionform.css'

import store from '@/reducers'

import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '@/authConfig/authConfig';
import { Provider } from 'react-redux'

const msalInstance = new PublicClientApplication(msalConfig);

// Set an account on login or other method
msalInstance.addEventCallback((event) => {
  if (
      (event.eventType === EventType.LOGIN_SUCCESS ||
          event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
          event.eventType === EventType.SSO_SILENT_SUCCESS) &&
      event.payload.account
  ) {
      msalInstance.setActiveAccount(event.payload.account);

      // If it's a new account add them into the database
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.idTokenClaims.newUser) {
          fetch('https://api.studywhere.ca/api/newuser', {
              method: 'POST',
              headers: {'Authorization': 'Bearer ' + event.payload.accessToken}
          }).catch((error) => {
              console.log(error)
          })
      }   
  }
});

export default function App({ Component, pageProps }) {

  return (
    <Provider store={store}>
      <MsalProvider instance={msalInstance}>
        <Component {...pageProps} />
      </MsalProvider>
    </Provider>
  )
}
