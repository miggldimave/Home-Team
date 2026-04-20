'use client'
import { useEffect } from 'react'

export function DeploymentGuard({ id }: { id: string }) {
  useEffect(() => {
    const prev = sessionStorage.getItem('_deploy_id')
    if (prev && prev !== id) {
      sessionStorage.setItem('_deploy_id', id)
      window.location.reload()
    } else {
      sessionStorage.setItem('_deploy_id', id)
    }
  }, [id])
  return null
}
