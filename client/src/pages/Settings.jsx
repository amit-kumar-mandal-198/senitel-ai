export default function Settings() {
  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Settings</h1>
          <p className="dash-page-subtitle">Organization, users, integrations, security</p>
        </div>
      </div>
      <div style={{ display: 'grid', gap: '24px', marginTop: '24px' }}>
        {/* Organization */}
        <div className="dash-card">
          <div className="dash-card-header"><h2 className="dash-card-title">Organization</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="dash-field">
              <label className="dash-label">Organization Name</label>
              <input className="dash-input" defaultValue="District 4 Emergency Management" readOnly />
            </div>
            <div className="dash-field">
              <label className="dash-label">Plan Tier</label>
              <input className="dash-input" defaultValue="Professional ($499/mo)" readOnly style={{ color: 'var(--text-accent)' }} />
            </div>
            <div className="dash-field">
              <label className="dash-label">Region</label>
              <input className="dash-input" defaultValue="AP-South-1 (Mumbai)" readOnly />
            </div>
            <div className="dash-field">
              <label className="dash-label">Timezone</label>
              <input className="dash-input" defaultValue="Asia/Kolkata (IST)" readOnly />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="dash-card">
          <div className="dash-card-header"><h2 className="dash-card-title">Security</h2></div>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Multi-Factor Authentication (MFA)', status: 'Enabled', color: '#10B981', desc: 'TOTP + WebAuthn required for alert dispatch and admin operations' },
              { label: 'SSO / SAML 2.0', status: 'Configured', color: '#10B981', desc: 'Azure AD integration active via Keycloak' },
              { label: 'SCIM Provisioning', status: 'Active', color: '#10B981', desc: 'Auto user lifecycle management from Azure AD' },
              { label: 'API Key Rotation', status: 'Next: May 15', color: '#F59E0B', desc: 'SHA-256 hashed keys with 90-day rotation policy' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{item.desc}</div>
                </div>
                <span style={{ color: item.color, fontWeight: 600, fontSize: '13px', padding: '4px 12px', borderRadius: '99px', background: `${item.color}15` }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="dash-card">
          <div className="dash-card-header"><h2 className="dash-card-title">Compliance</h2></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
            {[
              { name: 'SOC 2 Type II', status: 'Active' },
              { name: 'HIPAA', status: 'Active' },
              { name: 'GDPR', status: 'Active' },
              { name: 'NDMA', status: 'Active' },
              { name: 'TRAI DLT', status: 'Active' },
              { name: 'TCPA', status: 'Active' },
              { name: 'FedRAMP', status: 'Pending' },
              { name: 'ISO 27001', status: 'Pending' },
              { name: 'PCI DSS', status: 'Phase 3' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: c.status === 'Active' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${c.status === 'Active' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: c.status === 'Active' ? '#10B981' : '#F59E0B', fontSize: '12px' }}>{c.status === 'Active' ? '✓' : '◐'}</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
