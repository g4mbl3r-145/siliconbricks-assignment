import { analyse, type Ctx } from './designs'

export interface Req { id: number; ctx: Ctx }
export type Res = { id: number; r: ReturnType<typeof analyse>; ms: number } | { id: number; error: string }

self.onmessage = (e: MessageEvent<Req>) => {
  const t = performance.now()
  try {
    self.postMessage({ id: e.data.id, r: analyse(e.data.ctx), ms: performance.now() - t } satisfies Res)
  } catch (err) {
    self.postMessage({ id: e.data.id, error: String(err) } satisfies Res)
  }
}
