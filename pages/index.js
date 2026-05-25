import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [view, setView] = useState('cards') // 'cards' or 'list'

  return (
    <div className={styles.container}>
      <Head>
        <title>Rezepte App</title>
        <meta name="description" content="Moderne Rezepte-Bibliothek" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Rezepte App</h1>
        <div className={styles.viewToggle}>
          <button onClick={() => setView('cards')} className={view === 'cards' ? styles.active : ''}>
            Kartenansicht
          </button>
          <button onClick={() => setView('list')} className={view === 'list' ? styles.active : ''}>
            Listenansicht
          </button>
        </div>
        <div className={styles.content}>
          {view === 'cards' ? <p>Kartenansicht wird hier angezeigt.</p> : <p>Listenansicht wird hier angezeigt.</p>}
        </div>
      </main>
    </div>
  )
}
