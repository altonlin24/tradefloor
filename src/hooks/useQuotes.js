import { useEffect, useState } from 'react'

const SYMBOLS = [
  { key: 'NQ',  symbol: 'QQQ',     name: 'Nasdaq 100' },
  { key: 'ES',  symbol: 'SPY',     name: 'S&P 500'    },
  { key: 'GC',  symbol: 'XAU/USD', name: 'Gold'       },
  { key: 'SI',  symbol: 'XAG/USD', name: 'Silver'     },
]

const API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY

export function useQuotes() {
  const [quotes, setQuotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchQuotes() {
    try {
      const symbolList = SYMBOLS.map(s => s.symbol).join(',')
      const url = `https://api.twelvedata.com/quote?symbol=${symbolList}&apikey=${API_KEY}`
      const res = await fetch(url)
      const data = await res.json()

      const result = {}
      SYMBOLS.forEach(({ key, symbol, name }) => {
        const d = data[symbol] ?? {}
        const price     = parseFloat(d?.close ?? d?.price)
        const prevClose = parseFloat(d?.previous_close)
        const change    = !isNaN(price) && !isNaN(prevClose) ? price - prevClose : null
        const changePct = change != null && prevClose ? (change / prevClose) * 100 : null
        result[key] = { key, name, price: isNaN(price) ? null : price, change, changePct: isNaN(changePct) ? null : changePct }
      })

      setQuotes(result)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
    const interval = setInterval(fetchQuotes, 60_000)
    return () => clearInterval(interval)
  }, [])

  return { quotes, loading, error, refetch: fetchQuotes }
}
