import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data dianggap fresh selama 5 menit
      gcTime: 10 * 60 * 1000, // Data disimpan di cache selama 10 menit
      refetchOnWindowFocus: false, // Mencegah loading ulang saat pindah tab browser
      retry: 1, // Hanya retry 1 kali jika gagal
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
