import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData } from '@/lib/repository';
import {
  formatRelativeDateTime,
  makeAvatarInitials,
  maskPhoneMiddle,
} from '@/lib/formatters';
import {
  RegistrationApproveClient,
  RegistrationRowItem,
} from '@/app/duyet-dang-ky/RegistrationApproveClient';

export default async function RegistrationApprovePage() {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const data = await getAllAppData();
  const now = new Date();
  const teamMap = new Map(data.teams.map((t) => [t.id, t.name]));
  const projectMap = new Map(data.projects.map((p) => [p.id, p.name]));

  // Hiện các đăng ký đang chờ duyệt ở đầu (giữ đúng luồng CN-09)
  const pendingRows: RegistrationRowItem[] = data.registrations
    .filter((r) => r.status === 'cho_duyet')
    .map((r) => ({
      id: r.id,
      fullName: r.fullName,
      avatarInitials: makeAvatarInitials(r.fullName),
      maskedPhone: maskPhoneMiddle(r.phoneZalo),
      tiktokUsername: r.tiktokUsername,
      teamName: teamMap.get(r.teamId) ?? '—',
      projectName: projectMap.get(r.projectId) ?? '—',
      submittedLabel: formatRelativeDateTime(r.submittedAt, now),
      status: r.status,
    }));

  return <RegistrationApproveClient rows={pendingRows} />;
}
