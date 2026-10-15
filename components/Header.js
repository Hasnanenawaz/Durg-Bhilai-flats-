import { getCurrentUser } from '@/lib/auth';
import Navbar from './Navbar';

export default async function Header() {
  const u = await getCurrentUser();
  const user = u ? { name: u.name, mode: u.active_mode, isAdmin: u.is_admin, isHost: u.is_host } : null;
  return <Navbar user={user} />;
}
