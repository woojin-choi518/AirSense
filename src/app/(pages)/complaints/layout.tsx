import { ReactNode } from 'react'

import GoogleMapsProvider from '@/components/providers/GoogleMapsProvider'

export default function ComplaintsLayout({ children }: { children: ReactNode }) {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>
}
