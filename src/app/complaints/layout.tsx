import GoogleMapsProvider from '@/app/components/providers/GoogleMapsProvider'
import ComplaintsPage from './page'

export default function ComplaintsLayout() {
  return (
    <GoogleMapsProvider>
      <ComplaintsPage />
    </GoogleMapsProvider>
  )
}
