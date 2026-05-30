import Head from 'next/head'
import { useMemo, useState } from 'react'
import styles from '../styles/Home.module.css'

const starterRecipes = [
  {
    id: 1,
    title: 'Zitronen-Joghurt-Kuchen',
    source: 'Eigene Sammlung',
    url: 'https://beispiel.de/zitronenkuchen',
    servings: 10,
    panDiameter: 26,
    prepTime: 25,
    cookTime: 45,
    tags: ['Backen', 'Vegetarisch', 'Familie'],
    difficulty: 'Einfach',
    notes: 'Saftig, gut vorzubereiten und ideal zum Skalieren auf andere Springformen.',
    ingredients: [
      { amount: 250, unit: 'g', name: 'Joghurt' },
      { amount: 300, unit: 'g', name: 'Mehl' },
      { amount: 180, unit: 'g', name: 'Zucker' },
      { amount: 90, unit: 'ml', name: 'Sonnenblumenöl' },
      { amount: 3, unit: 'Stk.', name: 'Eier' },
      { amount: 1, unit: 'Pck.', name: 'Backpulver' },
      { amount: 1, unit: 'Stk.', name: 'Bio-Zitrone, Abrieb' },
    ],
    steps: [
      'Backofen auf 175 °C Ober-/Unterhitze vorheizen und Form auskleiden.',
      'Feuchte Zutaten verrühren, trockene Zutaten kurz unterheben.',
      'In die Form geben und goldbraun backen. Stäbchenprobe machen.',
    ],
  },
  {
    id: 2,
    title: 'Cremige Tomaten-Linsen-Pasta',
    source: 'Importiert',
    url: 'https://beispiel.de/linsen-pasta',
    servings: 4,
    panDiameter: null,
    prepTime: 15,
    cookTime: 25,
    tags: ['Meal Prep', 'Vegan', 'Proteinreich'],
    difficulty: 'Mittel',
    notes: 'Rote Linsen zerfallen zu einer samtigen Sauce und machen das Gericht sättigend.',
    ingredients: [
      { amount: 320, unit: 'g', name: 'Pasta' },
      { amount: 180, unit: 'g', name: 'rote Linsen' },
      { amount: 700, unit: 'ml', name: 'Passata' },
      { amount: 1, unit: 'EL', name: 'Olivenöl' },
      { amount: 2, unit: 'Stk.', name: 'Knoblauchzehen' },
      { amount: 1, unit: 'TL', name: 'geräuchertes Paprikapulver' },
    ],
    steps: [
      'Knoblauch in Olivenöl anschwitzen, Linsen und Gewürze zugeben.',
      'Passata und Wasser einrühren, bis die Linsen weich sind.',
      'Pasta kochen, mit Sauce mischen und abschmecken.',
    ],
  },
]

const unitConversions = {
  cup: { unit: 'ml', factor: 240 },
  cups: { unit: 'ml', factor: 240 },
  tbsp: { unit: 'ml', factor: 15 },
  tablespoon: { unit: 'ml', factor: 15 },
  tsp: { unit: 'ml', factor: 5 },
  teaspoon: { unit: 'ml', factor: 5 },
  oz: { unit: 'g', factor: 28.35 },
  lb: { unit: 'g', factor: 453.59 },
}

const qualityQuestions = [
  'Soll die App später echte URL-Inhalte serverseitig extrahieren dürfen, oder bevorzugst du Browser-Importe über Copy & Paste aus Datenschutzgründen?',
  'Welche Ernährungsvorgaben sind Standard: vegetarisch, vegan, glutenfrei, kalorienarm, proteinreich oder Allergene?',
  'Möchtest du Einkaufslisten, Vorratsabgleich und Wochenplanung direkt in Version 1 oder als nächsten Ausbauschritt?',
  'Welche Backformen nutzt du am häufigsten: rund, Kastenform, Blech oder Muffinblech?',
]

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return ''
  if (value < 10 && value % 1 !== 0) return value.toFixed(1).replace('.', ',')
  return Math.round(value).toLocaleString('de-DE')
}

const formatIngredient = (ingredient, factor, useMetric) => {
  const conversion = useMetric ? unitConversions[ingredient.unit?.toLowerCase()] : null
  const baseAmount = conversion ? ingredient.amount * conversion.factor : ingredient.amount
  const unit = conversion ? conversion.unit : ingredient.unit
  return `${formatNumber(baseAmount * factor)} ${unit} ${ingredient.name}`
}

const calculatePanFactor = (sourceDiameter, targetDiameter) => {
  if (!sourceDiameter || !targetDiameter) return 1
  return Math.pow(targetDiameter / sourceDiameter, 2)
}

const createImportedRecipe = (url) => {
  const readableHost = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]

  return {
    id: Date.now(),
    title: `Import von ${readableHost || 'URL'}`,
    source: 'URL-Import',
    url,
    servings: 4,
    panDiameter: 24,
    prepTime: 20,
    cookTime: 35,
    tags: ['Neu', 'Zu prüfen'],
    difficulty: 'Automatisch erkannt',
    notes:
      'Import-Platzhalter: Die Oberfläche ist vorbereitet für einen serverseitigen Parser, der strukturierte Rezeptdaten, Mengen und Schritte aus der URL extrahiert.',
    ingredients: [
      { amount: 2, unit: 'cups', name: 'Basiszutat aus Originalrezept' },
      { amount: 1, unit: 'tbsp', name: 'Öl oder Butter' },
      { amount: 0.5, unit: 'tsp', name: 'Salz' },
      { amount: 4, unit: 'Stk.', name: 'Hauptkomponente' },
    ],
    steps: [
      'Originalrezept importieren und erkannte Zutaten prüfen.',
      'Zielportionen, metrische Einheiten und Backform einstellen.',
      'Automatische Anpassung speichern oder manuell verfeinern.',
    ],
  }
}

export default function Home() {
  const [recipes, setRecipes] = useState(starterRecipes)
  const [selectedId, setSelectedId] = useState(starterRecipes[0].id)
  const [view, setView] = useState('cards')
  const [targetServings, setTargetServings] = useState(6)
  const [targetPan, setTargetPan] = useState(20)
  const [metric, setMetric] = useState(true)
  const [url, setUrl] = useState('')
  const [manualRecipe, setManualRecipe] = useState({ title: '', servings: 4, ingredients: '', steps: '' })

  const selectedRecipe = recipes.find((recipe) => recipe.id === selectedId) || recipes[0]
  const servingFactor = targetServings / selectedRecipe.servings
  const panFactor = calculatePanFactor(selectedRecipe.panDiameter, targetPan)
  const totalFactor = servingFactor * panFactor

  const adaptationInsights = useMemo(() => {
    const insights = [
      `Portionen: ${selectedRecipe.servings} → ${targetServings} (${formatNumber(servingFactor)}×)`,
    ]

    if (selectedRecipe.panDiameter) {
      insights.push(
        `Backform: Ø ${selectedRecipe.panDiameter} cm → Ø ${targetPan} cm (${formatNumber(panFactor)}× Fläche)`,
      )
    }

    if (metric) insights.push('US-Maße werden automatisch in ml/g umgerechnet')
    if (totalFactor > 1.35) insights.push('Hinweis: Garzeit eher verlängern und früher per Sicht-/Stäbchenprobe prüfen')
    if (totalFactor < 0.75) insights.push('Hinweis: Kleinere Mengen garen schneller — Timer konservativ setzen')

    return insights
  }, [metric, panFactor, selectedRecipe, servingFactor, targetPan, targetServings, totalFactor])

  const handleImport = (event) => {
    event.preventDefault()
    if (!url.trim()) return
    const recipe = createImportedRecipe(url.trim())
    setRecipes((current) => [recipe, ...current])
    setSelectedId(recipe.id)
    setUrl('')
    setView('cards')
  }

  const handleManualSave = (event) => {
    event.preventDefault()
    if (!manualRecipe.title.trim()) return

    const recipe = {
      id: Date.now(),
      title: manualRecipe.title.trim(),
      source: 'Eigenes Rezept',
      url: '',
      servings: Number(manualRecipe.servings) || 4,
      panDiameter: null,
      prepTime: 10,
      cookTime: 20,
      tags: ['Eigene Kreation'],
      difficulty: 'Nach Gefühl',
      notes: 'Manuell angelegtes Rezept. Zutaten und Schritte können später detailliert strukturiert werden.',
      ingredients: manualRecipe.ingredients
        .split('\n')
        .filter(Boolean)
        .map((line) => ({ amount: 1, unit: '×', name: line.trim() })),
      steps: manualRecipe.steps.split('\n').filter(Boolean),
    }

    setRecipes((current) => [recipe, ...current])
    setSelectedId(recipe.id)
    setManualRecipe({ title: '', servings: 4, ingredients: '', steps: '' })
  }

  return (
    <div className={styles.pageShell}>
      <Head>
        <title>RezeptPilot · Smarte Rezeptverwaltung</title>
        <meta
          name="description"
          content="Sammle Rezepte aus URLs, passe Portionen, metrische Einheiten und Backformen intelligent an und speichere eigene Rezepte."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.hero}>
        <nav className={styles.navbar} aria-label="Hauptnavigation">
          <div className={styles.logoMark}>RP</div>
          <a href="#import">Import</a>
          <a href="#anpassen">Anpassen</a>
          <a href="#neu">Eigenes Rezept</a>
        </nav>

        <div className={styles.heroGrid}>
          <section className={styles.heroCopy}>
            <p className={styles.eyebrow}>Desktop & Mobile · intelligent skalierbar</p>
            <h1>Deine moderne Rezeptzentrale für perfekte Mengen, Formen und Einheiten.</h1>
            <p>
              Sammle Rezepte per URL, vereinheitliche sie ins metrische System und passe Portionen oder
              Backformgrößen in Sekunden an — mit einer ruhigen, ästhetischen Oberfläche für Küche und Planung.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#import">Rezept importieren</a>
              <a className={styles.secondaryAction} href="#neu">Eigenes Rezept anlegen</a>
            </div>
          </section>

          <aside className={styles.phonePreview} aria-label="Mobile Rezeptvorschau">
            <div className={styles.phoneHeader}></div>
            <p className={styles.miniLabel}>Heute kochen</p>
            <h2>{selectedRecipe.title}</h2>
            <div className={styles.metricRow}>
              <span>{targetServings} Portionen</span>
              <span>{selectedRecipe.prepTime + selectedRecipe.cookTime} Min.</span>
            </div>
            <div className={styles.progressCard}>
              <strong>Intelligente Anpassung</strong>
              <small>{formatNumber(totalFactor)}× Gesamtfaktor aktiv</small>
            </div>
          </aside>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.panelGrid} id="import">
          <form className={styles.glassPanel} onSubmit={handleImport}>
            <span className={styles.sectionKicker}>URL sammeln</span>
            <h2>Rezepte von überall sichern</h2>
            <p>
              Füge eine Rezept-URL ein. Die App legt sofort einen strukturierten Datensatz an und ist bereit für
              einen echten Extraktionsservice für Zutaten, Schritte und Metadaten.
            </p>
            <label htmlFor="recipeUrl">Rezept-URL</label>
            <div className={styles.inputGroup}>
              <input
                id="recipeUrl"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <button type="submit">Import vorbereiten</button>
            </div>
          </form>

          <section className={styles.glassPanel}>
            <span className={styles.sectionKicker}>Bibliothek</span>
            <div className={styles.libraryHeader}>
              <h2>{recipes.length} Rezepte</h2>
              <div className={styles.segmentedControl}>
                <button type="button" className={view === 'cards' ? styles.activeSegment : ''} onClick={() => setView('cards')}>
                  Karten
                </button>
                <button type="button" className={view === 'list' ? styles.activeSegment : ''} onClick={() => setView('list')}>
                  Liste
                </button>
              </div>
            </div>
            <div className={view === 'cards' ? styles.recipeCards : styles.recipeList}>
              {recipes.map((recipe) => (
                <button
                  type="button"
                  key={recipe.id}
                  className={`${styles.recipeCard} ${recipe.id === selectedRecipe.id ? styles.selectedCard : ''}`}
                  onClick={() => setSelectedId(recipe.id)}
                >
                  <span>{recipe.source}</span>
                  <strong>{recipe.title}</strong>
                  <small>{recipe.tags.join(' · ')}</small>
                </button>
              ))}
            </div>
          </section>
        </section>

        <section className={styles.workspace} id="anpassen">
          <aside className={styles.controlsPanel}>
            <span className={styles.sectionKicker}>Vorgaben</span>
            <h2>Automatisch anpassen</h2>
            <label htmlFor="servings">Zielportionen: {targetServings}</label>
            <input
              id="servings"
              type="range"
              min="1"
              max="16"
              value={targetServings}
              onChange={(event) => setTargetServings(Number(event.target.value))}
            />
            <label htmlFor="pan">Backform Ø: {targetPan} cm</label>
            <input
              id="pan"
              type="range"
              min="16"
              max="32"
              value={targetPan}
              onChange={(event) => setTargetPan(Number(event.target.value))}
            />
            <label className={styles.toggleRow}>
              <input type="checkbox" checked={metric} onChange={(event) => setMetric(event.target.checked)} />
              Metrisches System erzwingen
            </label>
            <div className={styles.insightList}>
              {adaptationInsights.map((insight) => (
                <p key={insight}>{insight}</p>
              ))}
            </div>
          </aside>

          <article className={styles.recipeDetail}>
            <div className={styles.detailHeader}>
              <div>
                <span className={styles.sectionKicker}>{selectedRecipe.difficulty}</span>
                <h2>{selectedRecipe.title}</h2>
                <p>{selectedRecipe.notes}</p>
              </div>
              <div className={styles.timeBadge}>
                <strong>{selectedRecipe.prepTime + selectedRecipe.cookTime}</strong>
                <span>Min.</span>
              </div>
            </div>

            <div className={styles.detailGrid}>
              <section>
                <h3>Angepasste Zutaten</h3>
                <ul className={styles.ingredientList}>
                  {selectedRecipe.ingredients.map((ingredient) => (
                    <li key={`${ingredient.name}-${ingredient.unit}`}>
                      {formatIngredient(ingredient, totalFactor, metric)}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3>Schritte</h3>
                <ol className={styles.stepList}>
                  {selectedRecipe.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>
            </div>
          </article>
        </section>

        <section className={styles.bottomGrid} id="neu">
          <form className={styles.manualForm} onSubmit={handleManualSave}>
            <span className={styles.sectionKicker}>Eigene Rezepte</span>
            <h2>Rezept schnell erfassen</h2>
            <input
              aria-label="Rezepttitel"
              placeholder="Titel, z. B. Omas Apfelkuchen"
              value={manualRecipe.title}
              onChange={(event) => setManualRecipe((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              aria-label="Portionen"
              type="number"
              min="1"
              value={manualRecipe.servings}
              onChange={(event) => setManualRecipe((current) => ({ ...current, servings: event.target.value }))}
            />
            <textarea
              aria-label="Zutaten"
              placeholder="Zutaten — eine pro Zeile"
              value={manualRecipe.ingredients}
              onChange={(event) => setManualRecipe((current) => ({ ...current, ingredients: event.target.value }))}
            />
            <textarea
              aria-label="Zubereitung"
              placeholder="Schritte — einer pro Zeile"
              value={manualRecipe.steps}
              onChange={(event) => setManualRecipe((current) => ({ ...current, steps: event.target.value }))}
            />
            <button type="submit">Eigenes Rezept speichern</button>
          </form>

          <section className={styles.questionPanel}>
            <span className={styles.sectionKicker}>Meine Fragen an dich</span>
            <h2>Damit ich Version 2 noch perfekter baue</h2>
            <ul>
              {qualityQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </section>
        </section>
      </main>
    </div>
  )
}
