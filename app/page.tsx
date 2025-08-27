import { redirect } from 'next/navigation'

export default function HomePage() {
  // Simply redirect to sign-in page - let middleware handle auth checks
  redirect('/auth/signin')
}
