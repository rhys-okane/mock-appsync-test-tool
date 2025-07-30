import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {App} from './app/App.tsx'
import {SocketIoProvider} from './app/providers/SocketIoProvider.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketIoProvider>
      <App />
    </SocketIoProvider>
  </StrictMode>,
)
