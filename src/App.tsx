import ParticleCanvas from './components/ParticleCanvas'
import { I18nProvider } from './i18n'

function App() {
  return (
    <I18nProvider>
      <ParticleCanvas />
    </I18nProvider>
  )
}

export default App
