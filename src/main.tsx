if (import.meta.env.DEV) {
    await import('preact/debug');
}
import { render } from 'preact'
import { App } from './app.tsx'

render(<App />, document.getElementById('app')!)
