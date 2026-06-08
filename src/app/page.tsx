import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles auth redirect; this is fallback
  redirect('/login');
}