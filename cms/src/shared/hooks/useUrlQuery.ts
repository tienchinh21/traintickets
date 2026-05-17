import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

type QueryValue = string | number | undefined

type UrlQueryConfig<T extends Record<string, QueryValue>> = {
  defaults: T
  keys?: Array<keyof T>
}

export function useUrlQuery<T extends Record<string, QueryValue>>(config: UrlQueryConfig<T>) {
  const { defaults, keys } = config
  const syncKeys = (keys ?? Object.keys(defaults)) as Array<keyof T>
  const [searchParams, setSearchParams] = useSearchParams()

  const query = useMemo(() => {
    const result = { ...defaults }
    for (const key of syncKeys) {
      const raw = searchParams.get(key as string)
      if (raw === null) continue

      const defaultValue = defaults[key]
      if (typeof defaultValue === 'number') {
        ;(result as Record<string, QueryValue>)[key as string] = Number(raw)
      } else {
        ;(result as Record<string, QueryValue>)[key as string] = raw
      }
    }
    return result as T
  }, [searchParams, defaults, syncKeys])

  const setQuery = useCallback(
    (next: T | ((prev: T) => T)) => {
      setSearchParams(
        (prevParams) => {
          const currentQuery = { ...defaults }
          for (const key of syncKeys) {
            const raw = prevParams.get(key as string)
            if (raw === null) continue
            const defaultValue = defaults[key]
            if (typeof defaultValue === 'number') {
              ;(currentQuery as Record<string, QueryValue>)[key as string] = Number(raw)
            } else {
              ;(currentQuery as Record<string, QueryValue>)[key as string] = raw
            }
          }

          const resolved = typeof next === 'function' ? (next as (prev: T) => T)(currentQuery as T) : next

          const params = new URLSearchParams()
          for (const key of syncKeys) {
            const value = resolved[key]
            const defaultValue = defaults[key]
            if (value !== undefined && value !== null && value !== '' && value !== defaultValue) {
              params.set(key as string, String(value))
            }
          }
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams, defaults, syncKeys],
  )

  const resetQuery = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  return { query, setQuery, resetQuery } as const
}
