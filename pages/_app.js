import '../styles/globals.css'
import { FirebaseProvider } from '../context/FirebaseContext'

function MyApp({ Component, pageProps }) {
  return (
    <FirebaseProvider>
      <Component {...pageProps} />
    </FirebaseProvider>
  )
}

export default MyApp
