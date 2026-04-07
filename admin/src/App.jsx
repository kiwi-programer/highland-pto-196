import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth0 } from './auth/auth0Shim.jsx'
import {
  createPage,
  createUser,
  deleteUser,
  fetchPages,
  fetchSite,
  fetchUsers,
  updatePage,
  updateSite
} from './api/contentApi'

const emptySite = {
  organizationName: 'Highland Elementary PTO',
  district: 'District 196',
  location: 'Apple Valley, MN',
  contactEmail: 'highland196pto@gmail.com',
  donateUrl: 'https://www.paypal.com',
  volunteerUrl: 'https://www.signupgenius.com/go/5080E4BADAF29AAFF2-55633779-highland#/',
  footerLinks: [],
  committeeContacts: [],
  boardMembers: []
}

function cloneSite(site) {
  return {
    organizationName: site.organizationName || '',
    district: site.district || '',
    location: site.location || '',
    contactEmail: site.contactEmail || '',
    donateUrl: site.donateUrl || '',
    volunteerUrl: site.volunteerUrl || '',
    footerLinks: Array.isArray(site.footerLinks) ? site.footerLinks : [],
    committeeContacts: Array.isArray(site.committeeContacts) ? site.committeeContacts : [],
    boardMembers: Array.isArray(site.boardMembers) ? site.boardMembers : []
  }
}

function updateListItem(list, index, key, value) {
  return list.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
}

function RepeatableEditor({ title, description, items, onChange, fields, createItem }) {
  const rows = items || []

  return (
    <section className="subpanel">
      <div className="panel-head compact">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        <button type="button" className="text-button" onClick={() => onChange([...rows, createItem()])}>
          Add item
        </button>
      </div>

      <div className="repeatable-list">
        {rows.map((item, index) => (
          <article className="repeatable-card" key={`${title}-${index}`}>
            <div className="repeatable-card-head">
              <strong>Item {index + 1}</strong>
              <button
                type="button"
                className="text-button danger"
                onClick={() => onChange(rows.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            </div>

            <div className="repeatable-grid">
              {fields.map((field) => (
                <label key={field.key}>
                  {field.label}
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={field.rows || 3}
                      value={item[field.key] || ''}
                      onChange={(event) => onChange(updateListItem(rows, index, field.key, event.target.value))}
                    />
                  ) : (
                    <input
                      value={item[field.key] || ''}
                      onChange={(event) => onChange(updateListItem(rows, index, field.key, event.target.value))}
                    />
                  )}
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function EditorChrome({ authEnabled, user, onLogout, children }) {
  const location = useLocation()

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="eyebrow">Protected admin area</p>
          <h1>Highland PTO Admin</h1>
          <p className="subtitle">
            {authEnabled ? `Signed in as ${user?.email || user?.name || 'admin'}` : 'Auth dormant - editing without login for now.'}
          </p>
        </div>
        {authEnabled ? (
          <button type="button" className="ghost-button" onClick={() => onLogout()}>
            Sign out
          </button>
        ) : null}
      </header>

      <nav className="admin-tabs">
        <Link className={location.pathname.startsWith('/settings') ? 'active' : ''} to="/settings">
          Site Settings
        </Link>
        <Link className={location.pathname.startsWith('/pages') || location.pathname === '/' ? 'active' : ''} to="/pages">
          Page Content
        </Link>
        {authEnabled ? (
          <Link className={location.pathname.startsWith('/users') ? 'active' : ''} to="/users">
            User Access
          </Link>
        ) : null}
      </nav>

      {children}
    </div>
  )
}

function PagesEditorPage({ pages, onCreatePage, onUpdatePage, status, loading }) {
  const defaultSlug = pages[0]?.slug || ''
  const [mode, setMode] = useState('edit')
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug)
  const [draftBySlug, setDraftBySlug] = useState({})
  const [createForm, setCreateForm] = useState({
    title: '',
    navLabel: '',
    summary: '',
    content: '',
    order: pages.length + 1
  })

  useEffect(() => {
    setSelectedSlug((currentSlug) => currentSlug || defaultSlug)
  }, [defaultSlug])

  const resolvedSlug = mode === 'edit' ? (selectedSlug || defaultSlug) : ''
  const selectedPage = pages.find((item) => item.slug === resolvedSlug)
  const editForm = selectedPage
    ? (draftBySlug[resolvedSlug] || {
        title: selectedPage.title,
        navLabel: selectedPage.navLabel,
        summary: selectedPage.summary,
        content: selectedPage.content,
        order: selectedPage.order
      })
    : null

  async function handleCreate(event) {
    event.preventDefault()
    const created = await onCreatePage(createForm)
    setCreateForm({ title: '', navLabel: '', summary: '', content: '', order: pages.length + 2 })
    setMode('edit')
    setSelectedSlug(created.page.slug)
  }

  async function handleUpdate(event) {
    event.preventDefault()
    if (!resolvedSlug || !editForm) {
      return
    }

    await onUpdatePage(resolvedSlug, editForm)
    setDraftBySlug((prev) => {
      const next = { ...prev }
      delete next[resolvedSlug]
      return next
    })
  }

  return (
    <div className="status-stack">
      <div className="status-row">
        {status ? <div className={`status-pill ${status.type}`}>{status.text}</div> : null}
        {loading ? <div className="status-pill info">Loading content...</div> : null}
      </div>

      <div className="admin-grid">
        <aside className="sidebar">
          <section className="panel">
            <div className="panel-head">
              <h2>Pages</h2>
              <button type="button" className="text-button" onClick={() => setMode('create')}>Add page</button>
            </div>
            <div className="page-list">
              {pages.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  className={`page-item ${mode === 'edit' && selectedSlug === page.slug ? 'active' : ''}`}
                  onClick={() => {
                    setMode('edit')
                    setSelectedSlug(page.slug)
                  }}
                >
                  <strong>{page.navLabel || page.title}</strong>
                  <span>{page.slug}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main className="editor-column">
          {mode === 'create' ? (
            <section className="panel editor-panel">
              <div className="panel-head">
                <div>
                  <h2>Create page</h2>
                  <p>New content appears immediately on the public site after save.</p>
                </div>
              </div>
              <form onSubmit={handleCreate} className="panel-form">
                <label>
                  Page title
                  <input required value={createForm.title} onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))} />
                </label>
                <label>
                  Navigation label
                  <input required value={createForm.navLabel} onChange={(event) => setCreateForm((prev) => ({ ...prev, navLabel: event.target.value }))} />
                </label>
                <label>
                  Summary
                  <textarea required rows={2} value={createForm.summary} onChange={(event) => setCreateForm((prev) => ({ ...prev, summary: event.target.value }))} />
                </label>
                <label>
                  Body content
                  <textarea required rows={12} value={createForm.content} onChange={(event) => setCreateForm((prev) => ({ ...prev, content: event.target.value }))} />
                </label>
                <label>
                  Sort order
                  <input type="number" value={createForm.order} onChange={(event) => setCreateForm((prev) => ({ ...prev, order: Number(event.target.value) }))} />
                </label>
                <div className="button-row">
                  <button type="submit" className="primary-button">Create page</button>
                  <button type="button" className="ghost-button" onClick={() => setMode('edit')}>Cancel</button>
                </div>
              </form>
            </section>
          ) : editForm ? (
            <section className="panel editor-panel">
              <div className="panel-head">
                <div>
                  <h2>Edit {selectedPage.title}</h2>
                  <p>Use this panel to update page copy without redeploying the public site.</p>
                </div>
              </div>
              <form onSubmit={handleUpdate} className="panel-form">
                <label>
                  Page title
                  <input required value={editForm.title} onChange={(event) => setDraftBySlug((prev) => ({ ...prev, [resolvedSlug]: { ...editForm, title: event.target.value } }))} />
                </label>
                <label>
                  Navigation label
                  <input required value={editForm.navLabel} onChange={(event) => setDraftBySlug((prev) => ({ ...prev, [resolvedSlug]: { ...editForm, navLabel: event.target.value } }))} />
                </label>
                <label>
                  Summary
                  <textarea required rows={2} value={editForm.summary} onChange={(event) => setDraftBySlug((prev) => ({ ...prev, [resolvedSlug]: { ...editForm, summary: event.target.value } }))} />
                </label>
                <label>
                  Body content
                  <textarea required rows={12} value={editForm.content} onChange={(event) => setDraftBySlug((prev) => ({ ...prev, [resolvedSlug]: { ...editForm, content: event.target.value } }))} />
                </label>
                <label>
                  Sort order
                  <input type="number" value={editForm.order} onChange={(event) => setDraftBySlug((prev) => ({ ...prev, [resolvedSlug]: { ...editForm, order: Number(event.target.value) } }))} />
                </label>
                <div className="button-row">
                  <button type="submit" className="primary-button">Save changes</button>
                  {draftBySlug[resolvedSlug] ? (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        setDraftBySlug((prev) => {
                          const next = { ...prev }
                          delete next[resolvedSlug]
                          return next
                        })
                      }}
                    >
                      Undo changes
                    </button>
                  ) : null}
                </div>
              </form>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}

function SiteSettingsPage({ site, onSaveSite, status, loading }) {
  const [siteForm, setSiteForm] = useState(cloneSite(site))

  useEffect(() => {
    setSiteForm(cloneSite(site))
  }, [site])

  async function handleSubmit(event) {
    event.preventDefault()
    await onSaveSite(cloneSite(siteForm))
  }

  return (
    <div className="status-stack">
      <div className="status-row">
        {status ? <div className={`status-pill ${status.type}`}>{status.text}</div> : null}
        {loading ? <div className="status-pill info">Loading content...</div> : null}
      </div>

      <section className="panel editor-panel">
        <div className="panel-head">
          <div>
            <h2>Site Settings</h2>
            <p>Change shared PTO details here. These values flow into the public site automatically.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="panel-form">
          <div className="form-grid two-up">
            <label>
              Organization Name
              <input value={siteForm.organizationName} onChange={(event) => setSiteForm((prev) => ({ ...prev, organizationName: event.target.value }))} />
            </label>
            <label>
              District
              <input value={siteForm.district} onChange={(event) => setSiteForm((prev) => ({ ...prev, district: event.target.value }))} />
            </label>
          </div>

          <div className="form-grid two-up">
            <label>
              Location
              <input value={siteForm.location} onChange={(event) => setSiteForm((prev) => ({ ...prev, location: event.target.value }))} />
            </label>
            <label>
              Contact Email
              <input value={siteForm.contactEmail} onChange={(event) => setSiteForm((prev) => ({ ...prev, contactEmail: event.target.value }))} />
            </label>
          </div>

          <div className="form-grid two-up">
            <label>
              Donate URL
              <input value={siteForm.donateUrl} onChange={(event) => setSiteForm((prev) => ({ ...prev, donateUrl: event.target.value }))} />
            </label>
            <label>
              Volunteer URL
              <input value={siteForm.volunteerUrl} onChange={(event) => setSiteForm((prev) => ({ ...prev, volunteerUrl: event.target.value }))} />
            </label>
          </div>

          <RepeatableEditor
            title="Footer Links"
            description="These links appear in the site footer."
            items={siteForm.footerLinks}
            onChange={(items) => setSiteForm((prev) => ({ ...prev, footerLinks: items }))}
            createItem={() => ({ label: '', url: '' })}
            fields={[
              { key: 'label', label: 'Label' },
              { key: 'url', label: 'URL' }
            ]}
          />

          <RepeatableEditor
            title="Committee Contacts"
            description="Each committee card on the public site uses one contact record."
            items={siteForm.committeeContacts}
            onChange={(items) => setSiteForm((prev) => ({ ...prev, committeeContacts: items }))}
            createItem={() => ({ slug: '', name: '', email: '' })}
            fields={[
              { key: 'slug', label: 'Committee Slug' },
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' }
            ]}
          />

          <RepeatableEditor
            title="Board Members"
            description="Update the leadership cards without editing raw JSON."
            items={siteForm.boardMembers}
            onChange={(items) => setSiteForm((prev) => ({ ...prev, boardMembers: items }))}
            createItem={() => ({ name: '', role: '', initials: '', bio: '' })}
            fields={[
              { key: 'name', label: 'Name' },
              { key: 'role', label: 'Role' },
              { key: 'initials', label: 'Initials' },
              { key: 'bio', label: 'Bio', type: 'textarea', rows: 4 }
            ]}
          />

          <div className="button-row">
            <button type="submit" className="primary-button">Save site settings</button>
            <button type="button" className="ghost-button" onClick={() => setSiteForm(cloneSite(emptySite))}>
              Reset template
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function UserAccessPage({ users, status, loading, onCreateUser, onRemoveUser }) {
  const [form, setForm] = useState({ email: '', name: '', password: '' })

  async function handleCreate(event) {
    event.preventDefault()
    await onCreateUser(form)
    setForm({ email: '', name: '', password: '' })
  }

  const sortedUsers = [...users].sort((a, b) => (a.email || '').localeCompare(b.email || ''))

  return (
    <div className="status-stack">
      <div className="status-row">
        {status ? <div className={`status-pill ${status.type}`}>{status.text}</div> : null}
        {loading ? <div className="status-pill info">Loading users...</div> : null}
      </div>

      <div className="admin-grid single-column">
        <section className="panel editor-panel">
          <div className="panel-head">
            <div>
              <h2>Add User</h2>
              <p>Create login credentials for PTO staff. This replaces public self-signup.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="panel-form">
            <div className="form-grid two-up">
              <label>
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label>
                Name (optional)
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
            </div>

            <label>
              Temporary password
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </label>

            <div className="button-row">
              <button type="submit" className="primary-button">Add user</button>
            </div>
          </form>
        </section>

        <section className="panel editor-panel">
          <div className="panel-head">
            <div>
              <h2>Current Users</h2>
              <p>Remove access instantly when needed.</p>
            </div>
          </div>

          <div className="page-list">
            {sortedUsers.map((managedUser) => (
              <article className="user-item" key={managedUser.user_id}>
                <div>
                  <strong>{managedUser.email || managedUser.name || managedUser.user_id}</strong>
                  <span>{managedUser.name || 'No display name'}</span>
                </div>
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() => onRemoveUser(managedUser.user_id)}
                >
                  Remove
                </button>
              </article>
            ))}

            {!sortedUsers.length ? (
              <p className="panel-note">No users found for the configured Auth0 database connection.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default function App({ authEnabled = false }) {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user, getAccessTokenSilently } = useAuth0()
  const [pages, setPages] = useState([])
  const [site, setSite] = useState(emptySite)
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      if (authEnabled && !isAuthenticated) {
        return
      }

      setLoading(true)
      try {
        const accessToken = authEnabled ? await getAccessTokenSilently() : ''
        if (cancelled) {
          return
        }

        setToken(accessToken)
        const [pagesResult, siteResult, usersResult] = await Promise.allSettled([
          fetchPages(accessToken),
          fetchSite(accessToken),
          authEnabled ? fetchUsers(accessToken) : Promise.resolve({ users: [] })
        ])

        if (cancelled) {
          return
        }

        if (pagesResult.status !== 'fulfilled') {
          throw new Error(`Pages request failed: ${pagesResult.reason?.message || 'Unknown error'}`)
        }

        setPages(pagesResult.value.pages)

        if (siteResult.status === 'fulfilled') {
          setSite(cloneSite(siteResult.value.site || emptySite))
        } else {
          console.error('[admin] Site request failed, using defaults.', siteResult.reason)
          setSite(cloneSite(emptySite))
          setStatus({
            type: 'error',
            text: `Site request failed: ${siteResult.reason?.message || 'Unknown error'}`
          })
        }

        if (usersResult.status === 'fulfilled') {
          setUsers(Array.isArray(usersResult.value.users) ? usersResult.value.users : [])
        } else {
          console.error('[admin] Users request failed.', usersResult.reason)
          setStatus({
            type: 'error',
            text: `Users request failed: ${usersResult.reason?.message || 'Unknown error'}`
          })
        }
      } catch (error) {
        if (!cancelled) {
          setStatus({ type: 'error', text: error.message })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [authEnabled, getAccessTokenSilently, isAuthenticated])

  async function saveSite(nextSite) {
    try {
      setStatus({ type: 'info', text: 'Saving site settings...' })
      const result = await updateSite(nextSite, token)
      setSite(cloneSite(result.site))
      setStatus({ type: 'success', text: 'Site settings saved.' })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    }
  }

  async function savePage(slug, page) {
    try {
      setStatus({ type: 'info', text: 'Saving page...' })
      const result = await updatePage(slug, page, token)
      setPages((current) => current.map((item) => (item.slug === slug ? result.page : item)))
      setStatus({ type: 'success', text: 'Page saved.' })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    }
  }

  async function createNewPage(page) {
    try {
      setStatus({ type: 'info', text: 'Creating page...' })
      const result = await createPage(page, token)
      setPages((current) => [...current, result.page])
      setStatus({ type: 'success', text: 'Page created.' })
      return result
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
      throw error
    }
  }

  async function createManagedUser(nextUser) {
    try {
      setStatus({ type: 'info', text: 'Adding user...' })
      const result = await createUser(nextUser, token)
      setUsers((current) => [...current, result.user])
      setStatus({ type: 'success', text: 'User added.' })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    }
  }

  async function removeManagedUser(userId) {
    try {
      setStatus({ type: 'info', text: 'Removing user...' })
      await deleteUser(userId, token)
      setUsers((current) => current.filter((item) => item.user_id !== userId))
      setStatus({ type: 'success', text: 'User removed.' })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    }
  }

  if (authEnabled && isLoading) {
    return <div className="login-screen"><div className="login-card">Loading session...</div></div>
  }

  if (authEnabled && !isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <p className="eyebrow">Private workspace</p>
          <h1>Highland PTO Admin</h1>
          <p>Sign in with Auth0 to edit pages and shared site settings.</p>
          <button type="button" className="primary-button" onClick={() => loginWithRedirect()}>
            Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <EditorChrome
      authEnabled={authEnabled}
      user={user}
      onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/pages" replace />} />
        <Route
          path="/pages"
          element={<PagesEditorPage pages={pages} onCreatePage={createNewPage} onUpdatePage={savePage} status={status} loading={loading} />}
        />
        <Route
          path="/settings"
          element={<SiteSettingsPage site={site} onSaveSite={saveSite} status={status} loading={loading} />}
        />
        {authEnabled ? (
          <Route
            path="/users"
            element={(
              <UserAccessPage
                users={users}
                status={status}
                loading={loading}
                onCreateUser={createManagedUser}
                onRemoveUser={removeManagedUser}
              />
            )}
          />
        ) : null}
        <Route path="*" element={<Navigate to="/pages" replace />} />
      </Routes>
    </EditorChrome>
  )
}