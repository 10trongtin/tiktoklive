'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInAction } from '@/app/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await signInAction(identifier, password);
      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        router.push(res.redirectTo);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background:
          'linear-gradient(155deg, #0d2242 0%, #10294f 60%, #1b3a68 100%)',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 430, padding: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div className="brand-logo">P</div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 17,
                color: 'var(--navy)',
                letterSpacing: '0.03em',
              }}
            >
              PICITY <span style={{ color: 'var(--gold)' }}>LÊN LIVE</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Hệ thống theo dõi livestream TikTok đội kinh doanh Picity
            </div>
          </div>
        </div>

        <h1
          className="page-h1"
          style={{ fontSize: 25, marginBottom: 6 }}
        >
          Đăng nhập
        </h1>
        <p className="page-desc" style={{ marginBottom: 20 }}>
          Dành cho Quản trị viên, Cấp điều hành và Streamer đã được duyệt
        </p>

        {errorMsg && (
          <div
            className="note"
            style={{
              background: 'var(--red-bg)',
              borderLeftColor: 'var(--red)',
              color: 'var(--red)',
              marginBottom: 16,
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-id">
              Email công việc hoặc Số điện thoại
            </label>
            <input
              id="login-id"
              type="text"
              className="input"
              placeholder="admin@picity.com.vn hoặc 09xx..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-pw">
              Mật khẩu
            </label>
            <input
              id="login-pw"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? 'Đang kiểm tra…' : 'Đăng nhập'}
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: 13.5,
          }}
        >
          Sale mới chưa đăng ký tài khoản TikTok?{' '}
          <Link
            href="/dang-ky-tham-gia"
            style={{
              color: 'var(--gold)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Đăng ký tham gia →
          </Link>
        </div>
      </div>
    </div>
  );
}
