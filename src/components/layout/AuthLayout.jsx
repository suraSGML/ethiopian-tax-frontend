import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d3349 0%, #1a5276 45%, #2e86c1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '500px', height: '500px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-180px', left: '-120px', width: '600px', height: '600px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '35%', left: '8%', width: '220px', height: '220px', background: 'rgba(255,255,255,0.025)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem', animation: 'fadeInUp 0.5s ease' }}>
          <div style={{
            width: '88px', height: '88px',
            background: 'rgba(255,255,255,0.13)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.4rem',
            fontSize: '2.8rem',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          }}>
            🇪🇹
          </div>
          <h1 style={{
            color: '#fff',
            fontSize: 'var(--text-2xl)',
            fontWeight: 900,
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em',
          }}>
            Ministry of Revenue
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'var(--text-base)' }}>
            Federal Democratic Republic of Ethiopia
          </p>
          <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 'var(--text-sm)', marginTop: '0.3rem' }}>
            Digital Tax Payment System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.75rem',
          boxShadow: '0 30px 70px rgba(0,0,0,0.28)',
          border: '1px solid rgba(255,255,255,0.35)',
          animation: 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <Outlet />
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.38)', fontSize: 'var(--text-sm)', marginTop: '1.75rem' }}>
          © {new Date().getFullYear()} Ethiopian Ministry of Revenue. All rights reserved.
        </p>
      </div>
    </div>
  );
}
