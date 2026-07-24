import type { IrisInput, IrisOutput, TrainConfig, TrainResult } from './types'

const BASE = ''

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export function predict(input: IrisInput): Promise<IrisOutput> {
  return post<IrisOutput>('/predict', input)
}

export function trainModel(config: TrainConfig): Promise<TrainResult> {
  return post<TrainResult>('/train', config)
}
