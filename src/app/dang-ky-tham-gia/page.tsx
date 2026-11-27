import { getAllAppData } from '@/lib/repository';
import { RegisterFormClient } from '@/app/dang-ky-tham-gia/RegisterFormClient';

export default async function RegisterPage() {
  const data = await getAllAppData();
  return <RegisterFormClient teams={data.teams} projects={data.projects} />;
}
