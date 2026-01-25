import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function BackofficePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  if (!token) {
    redirect('/backoffice/login');
  }

  // Redirect authenticated users to dashboard home
  // The (dashboard) route group layout will handle the sidebar
  redirect('/backoffice/home');
}
