import { useEffect, useRef, useState } from 'react'
import type { Ctx, Result } from './designs'
import type { Req, Res } from './analyse.worker'

export type Analysis<T> = { r: Result; tag: T; ms: number } | { error: string; tag: T }

/** Runs `analyse` off the main thread. Only the newest input is computed; stale ones are dropped. */
export const useAnalysis = <T>(input: { ctx: Ctx; tag: T } | null) => {
  const [out, setOut] = useState<Analysis<T> | null>(null)
  const s = useRef({ busy: false, next: null as { ctx: Ctx; tag: T } | null, id: 0, tags: new Map<number, T>(), pump: () => {} })

  useEffect(() => {
    const st = s.current
    const worker = new Worker(new URL('./analyse.worker.ts', import.meta.url), { type: 'module' })
    st.pump = () => {
      if (st.busy || !st.next) return
      const { ctx, tag } = st.next
      st.next = null
      st.busy = true
      st.tags.set(++st.id, tag)
      worker.postMessage({ id: st.id, ctx } satisfies Req)
    }
    worker.onmessage = (e: MessageEvent<Res>) => {
      const tag = st.tags.get(e.data.id) as T
      st.tags.delete(e.data.id)
      st.busy = false
      setOut('error' in e.data ? { error: e.data.error, tag } : { r: e.data.r, tag, ms: e.data.ms })
      st.pump()
    }
    st.pump()
    return () => {
      worker.terminate()
      st.busy = false
      st.pump = () => {}
    }
  }, [])

  useEffect(() => {
    if (!input) return
    s.current.next = input
    s.current.pump()
  }, [input])

  return out
}
