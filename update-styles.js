const fs = require('fs');
let css = fs.readFileSync('frontend/src/index.css', 'utf8');

const newAdminCss = `
/* Dynamic pages */
.page-wrap {
  padding: 110px 2.5rem 4rem;
}

.page-paragraph {
  margin-top: .9rem;
  color: var(--text-soft);
  line-height: 1.75;
  font-size: 1rem;
}

/* NEW USER FRIENDLY ADMIN */
.admin-page-bg {
  background: #f4f6f8;
  min-height: 100vh;
  padding-top: 68px; /* offset nav */
  padding-bottom: 3rem;
}

.admin-dashboard {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-header h1 {
  font-family: 'DM Sans', sans-serif;
  font-size: 2rem;
  margin-bottom: 0.2rem;
  color: var(--black);
}

.admin-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.btn-exit {
  background: white;
  border: 1px solid #d1d5db;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  color: #374151;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-exit:hover {
  background: #f9fafb;
  color: var(--black);
  border-color: #9ca3af;
}

.admin-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
  align-items: start;
}

/* Sidebar */
.admin-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 100px;
}

.sidebar-section h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.page-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.page-list-item {
  width: 100%;
  text-align: left;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.page-list-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.page-list-item.active {
  background: white;
  border-color: var(--red);
  box-shadow: 0 0 0 2px rgba(204,26,26,.15);
  color: var(--black);
}

.page-list-item.add-new {
  background: transparent;
  border: 2px dashed #d1d5db;
  color: #4b5563;
  justify-content: center;
  box-shadow: none;
}

.page-list-item.add-new:hover {
  background: rgba(255,255,255,0.5);
  border-color: var(--red);
  color: var(--red);
}

.page-list-item.add-new.active {
  border-style: solid;
  border-color: var(--red);
  color: var(--red);
  background: white;
}

/* Form Panel */
.admin-form-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 2.5rem;
  border-top: 4px solid var(--red);
}

.form-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.flex-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.form-header h2 {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.4rem;
  margin-bottom: 0.4rem;
  color: var(--black);
}

.form-header p {
  color: #6b7280;
  font-size: 0.95rem;
}

.view-live {
  background: #f3f4f6;
  color: #374151;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.view-live:hover {
  background: white;
  color: var(--black);
  border-color: #d1d5db;
}

/* Fields */
.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-name {
  font-weight: 600;
  color: #374151;
  font-size: .95rem;
}

.field-hint {
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 400;
}

.admin-form-panel input,
.admin-form-panel textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  color: #111827;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fdfdfd;
}

.admin-form-panel input:focus,
.admin-form-panel textarea:focus {
  outline: none;
  border-color: var(--red);
  box-shadow: 0 0 0 3px rgba(204,26,26,.1);
  background: white;
}

.admin-form-panel textarea {
  resize: vertical;
  line-height: 1.6;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-save {
  background: var(--red);
  color: white;
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  box-shadow: 0 2px 4px rgba(204,26,26,.2);
}

.btn-save:hover {
  background: var(--red-bright);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(204,26,26,.3);
}

.btn-discard {
  background: transparent;
  color: #4b5563;
  border: 1px solid #d1d5db;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-discard:hover {
  background: #f3f4f6;
  color: #111827;
}

/* Toast */
.admin-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  color: white;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  animation: slideDownToast 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-toast.success { background: #10b981; }
.admin-toast.error { background: #ef4444; }
.admin-toast.info { background: #3b82f6; }

@keyframes slideDownToast {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
`;

const startIndex = css.indexOf('/* ADMIN */');
const endIndex = css.indexOf('/* RESPONSIVE */');

if (startIndex !== -1 && endIndex !== -1) {
  css = css.substring(0, startIndex) + '/* ADMIN */\n' + newAdminCss + '\n' + css.substring(endIndex);
  fs.writeFileSync('frontend/src/index.css', css);
  console.log('done');
} else {
  console.log('failed to replace');
}
