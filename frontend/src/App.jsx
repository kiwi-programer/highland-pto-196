import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { fetchPages, fetchSite } from './api/contentApi'

const defaultSite = {
  organizationName: 'Highland Elementary PTO',
  district: 'District 196',
  location: 'Apple Valley, MN',
  contactEmail: 'highland196pto@gmail.com',
  donateUrl: 'https://www.paypal.com',
  volunteerUrl: 'https://www.signupgenius.com/go/5080E4BADAF29AAFF2-55633779-highland#/',
  footerLinks: [
    { label: 'Admin Procedures', url: 'https://www.highland196pto.com/home/administrative-procedures' },
    { label: 'Meeting Minutes', url: 'https://www.highland196pto.com/home/minutes' }
  ],
  committeeContacts: [
    { slug: 'hospitality', name: 'Coral Karsky', email: 'ckarsky@gmail.com' },
    { slug: 'school-pride', name: 'Kaitlin Graff', email: 'kpgraff@gmail.com' },
    { slug: 'social-events', name: 'Kyle Thompson', email: 'kwthompson53@gmail.com' },
    { slug: 'fundraising', name: 'Nate Simms', email: 'nathan.s.simms@gmail.com' }
  ],
  boardMembers: [
    {
      name: 'Kim Wilson',
      role: 'President',
      initials: 'KW',
      bio: 'Former high school teacher, now works at Highland. Originally from New Zealand (2014). Mom to Ivy (3rd), Theo (8th), and Harry (6th).'
    },
    {
      name: 'Kyle Thompson',
      role: 'Vice President',
      initials: 'KT',
      bio: 'Organized the 2023 Color Run. Sits on a District 196 Council. Dad to a 3rd grader and a Kindergartener. Go Scotties!'
    },
    {
      name: 'Nate Simms',
      role: 'Treasurer',
      initials: 'NS',
      bio: 'Former Site Council Parent Leader. Serves on Superintendent Parent Leader Forum and Curriculum & Instruction Advisory Council.'
    },
    {
      name: 'Kaitlin Graff',
      role: 'Secretary',
      initials: 'KG',
      bio: 'Second term in this role. Mom to Ryland (8th), Braeden (5th), and Amelia (2nd). Thrilled to be part of this incredible community!'
    },
    {
      name: 'Coral Karsky',
      role: 'Communications',
      initials: 'CK',
      bio: 'Mom to three boys, two of whom attend Highland. Also volunteers as a substitute teacher and field trip chaperone!'
    }
  ]
}

const committeeCards = [
  {
    slug: 'hospitality',
    icon: '🍽️',
    title: 'Hospitality',
    description: 'Making Highland feel like a welcoming place through food and fellowship for staff and families.',
    activities: ['Assessment & Conference Meals', 'Kindergarten Program (April)', '1st Grade Donuts (April)', '5th Grade Graduation (June)', 'Last Day of School Events']
  },
  {
    slug: 'school-pride',
    icon: '🏅',
    title: 'School Pride',
    description: 'Creating pride, identity, and community within the Highland Scotties family.',
    activities: ['Picture Day', 'Fire Safety Week', 'Special Friends Day', 'Apparel Store', 'Book Fair']
  },
  {
    slug: 'social-events',
    icon: '🎉',
    title: 'Social Events',
    description: 'Building relationships with parents, the local community, and Highland staff through fun events.',
    activities: ['Restaurant Nights (Culver\'s, Mason Jar...)', 'Back to School Night', 'Highland Family Fun Night (Spring)']
  },
  {
    slug: 'fundraising',
    icon: '💰',
    title: 'Fundraising',
    description: 'Raising funds to support Highland Elementary students, teachers, and programs all year long.',
    activities: ['Donation Letters', 'Box Tops for Education', 'Mabel\'s Labels', 'Recurring Donations', 'Family Fun Night']
  }
]

const meetingDates = [
  { month: 'September', day: '11', info: 'First meeting of the school year' },
  { month: 'November', day: '13', info: 'Fall updates & planning' },
  { month: 'January', day: '15', info: 'Officer elections' },
  { month: 'March', day: '12', info: 'Spring event planning' },
  { month: 'May', day: '14', info: 'Year-end celebration' }
]

const eventPills = [
  ['📚', 'Book Fair', 'School Pride'],
  ['🍝', 'Restaurant Nights', 'Social Events'],
  ['🎭', 'Back to School Night', 'Social Events'],
  ['🌟', 'Family Fun Night', 'Social Events'],
  ['🍩', '1st Grade Donuts', 'Hospitality'],
  ['👨‍👩‍👧', 'Special Friends Day', 'School Pride'],
  ['🎓', '5th Grade Graduation', 'Hospitality'],
  ['🔥', 'Fire Safety Week', 'School Pride'],
  ['🍀', 'Kindergarten Program', 'Hospitality'],
  ['🏆', 'Box Tops for Education', 'Fundraising'],
  ['🏷️', "Mabel's Labels", 'Fundraising'],
  ['🍽️', 'Conference Meals', 'Hospitality']
]

function getParagraphs(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function resolveTemplate(text, site) {
  return String(text || '')
    .replaceAll('{{contactEmail}}', site.contactEmail)
    .replaceAll('{{organizationName}}', site.organizationName)
    .replaceAll('{{district}}', site.district)
    .replaceAll('{{location}}', site.location)
    .replaceAll('{{donateUrl}}', site.donateUrl)
    .replaceAll('{{volunteerUrl}}', site.volunteerUrl)
}

function SiteNav({ pages, site }) {
  const sorted = [...pages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'

  return (
    <nav>
      <a href="#top" className="nav-brand">
        <div className="nav-badge">HL</div>
        <div className="nav-title">
          {site.organizationName}
          <span>{site.district} · {site.location}</span>
        </div>
      </a>
      <ul className="nav-links">
        {sorted.map((page) => (
          <li key={page.slug}>
            <Link to={`/${page.slug}`}>{page.navLabel || page.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function HomePage({ pages, site }) {
  const homePage = pages?.find((item) => item.slug === 'home')
  const title = homePage?.title || 'Where Community Meets Classroom'
  const summary = homePage?.summary || 'The Highland Elementary PTO connects families, staff, and neighbors to create an exceptional learning experience for every student at Highland Elementary.'
  const contentParagraphs = getParagraphs(resolveTemplate(homePage?.content || "The Highland PTO was started in the Fall of 2022 when Highland Elementary transitioned from a Site Council to a more inclusive PTO model - opening the door for greater parent and guardian participation than ever before.\n\nThe PTO's mission is to facilitate the betterment of Highland families, staff, and students.", site))
  const committeeContacts = site.committeeContacts || defaultSite.committeeContacts
  const boardMembers = site.boardMembers || defaultSite.boardMembers
  const footerLinks = site.footerLinks || defaultSite.footerLinks

  return (
    <>
      <SiteNav pages={pages} site={site} />

      <header className="hero" id="top">
        <div className="hero-inner">
          <div className="hero-eyebrow">🎓 Go Scotties! - Est. 2022</div>
          <h1>{title}</h1>
          <p className="hero-sub">{summary}</p>
          <div className="hero-actions">
            <a href="#committees" className="btn-primary">Get Involved</a>
            <a href="#about" className="btn-ghost">Learn More</a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat"><div className="stat-num">2022</div><div className="stat-lbl">Founded</div></div>
          <div className="stat"><div className="stat-num">4</div><div className="stat-lbl">Committees</div></div>
          <div className="stat"><div className="stat-num">5</div><div className="stat-lbl">Meetings / Year</div></div>
        </div>
      </header>

      <div className="mission-band" id="about">
        <div className="mission-inner">
          <div className="mission-text">
            <span className="section-label">Our Purpose</span>
            <h2>Driven by Vision,<br />Guided by Mission</h2>
            {contentParagraphs.map((text, idx) => <p key={idx}>{text}</p>)}
            <ul className="mission-pillars">
              <li>Creating an open, welcoming and supportive learning environment</li>
              <li>Fostering pride in the school and Scottie community</li>
              <li>Developing and strengthening the community of advocates</li>
              <li>Offering talent and financial assistance where needed</li>
            </ul>
          </div>
          <div className="vision-card">
            <div className="vision-label">PTO Vision</div>
            <p>The primary vision of the Highland PTO is to involve families and community members to enhance the students&apos; education. The PTO serves as a communication liaison between the school and the family/guardian community, and as a fundraising organization for the school.</p>
          </div>
        </div>
      </div>

      <div className="section meetings-section" id="meetings">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '.5rem' }}><span className="section-label">Stay Engaged</span></div>
          <h2 style={{ textAlign: 'center' }}>2025-2026 Meeting Dates</h2>
          <p className="lead" style={{ textAlign: 'center', margin: '0 auto' }}>Join us for monthly PTO meetings - all parents, guardians, and community members are welcome!</p>
          <div className="meetings-grid">
            <div className="meeting-dates">
              {meetingDates.map((meeting) => (
                <div className="meeting-date-card" key={`${meeting.month}-${meeting.day}`}>
                  <div>
                    <div className="mdate-month">{meeting.month}</div>
                    <div className="mdate-day">{meeting.day}</div>
                  </div>
                  <div className="mdate-info">{meeting.info}</div>
                </div>
              ))}
            </div>
            <div className="meeting-meta">
              <h3>📍 Meeting Details</h3>
              <div className="meta-item"><span className="meta-icon">🕕</span><span>6:00 PM - 7:30 PM</span></div>
              <div className="meta-item"><span className="meta-icon">📚</span><span>{site.organizationName}, {site.location} ({site.district})</span></div>
              <div className="meta-item"><span className="meta-icon">🎉</span><span>All parents, guardians, staff, and community members welcome - no RSVP needed!</span></div>
              <div className="meta-item"><span className="meta-icon">✉️</span><span>Questions? Email <strong>{site.contactEmail}</strong></span></div>
              <br />
              <a href={`mailto:${site.contactEmail}`} className="btn-primary" style={{ fontSize: '.82rem' }}>Contact Us</a>
            </div>
          </div>
        </div>
      </div>

      <div className="section committees-section" id="committees">
        <div className="container">
          <span className="section-label">Get Involved</span>
          <h2>Our Committees</h2>
          <p className="lead">Whether you want to be involved in a big way or a small way, we have a spot for you. Join a committee, attend an event, or volunteer at one of our activities.</p>
          <div className="committees-grid">
            {committeeCards.map((committee) => {
              const contact = committeeContacts.find((item) => item.slug === committee.slug)
              return (
                <div className="committee-card" key={committee.slug}>
                  <div className="committee-icon">{committee.icon}</div>
                  <h3>{committee.title}</h3>
                  <p>{committee.description}</p>
                  <ul className="committee-activities">
                    {committee.activities.map((activity) => <li key={activity}>{activity}</li>)}
                  </ul>
                  {contact ? (
                    <div className="committee-contact">Contact: <a href={`mailto:${contact.email}`}>{contact.name}</a></div>
                  ) : null}
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: '2.5rem', background: 'var(--white)', borderRadius: '12px', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <strong style={{ color: 'var(--black)' }}>Want to help but not sure where to start?</strong><br />
              <span style={{ color: 'var(--text-soft)', fontSize: '.9rem' }}>Email us to be added to the volunteer list and get notified when help is needed at events.</span>
            </div>
            <a href={`mailto:${site.contactEmail}`} className="btn-primary" style={{ flexShrink: 0, fontSize: '.82rem' }}>Join the List</a>
          </div>
        </div>
      </div>

      <div className="section team-section" id="team">
        <div className="container">
          <span className="section-label">Leadership</span>
          <h2>Meet the Executive Board</h2>
          <p className="lead">Your 2025-2026 Highland PTO officers - dedicated parents committed to making Highland the best it can be.</p>
          <div className="team-grid">
            {boardMembers.map((member) => (
              <div className="team-card" key={`${member.role}-${member.name}`}>
                <div className="team-avatar">{member.initials}</div>
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
                <div className="team-bio">{member.bio}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '2rem', color: 'var(--text-soft)', fontSize: '.9rem' }}>
            Interested in running for an officer position? Elections are held in <strong>January</strong> and each position serves a 2-year term.
            <a href={`mailto:${site.contactEmail}`} style={{ color: 'var(--red)' }}> Email us for details.</a>
          </p>
        </div>
      </div>

      <div className="funrun-section" id="funrun">
        <div className="funrun-inner">
          <div>
            <span className="section-label">Annual Event</span>
            <h2>2025 Fun Run</h2>
            <p className="lead">Our biggest event of the year! The Highland Fun Run brings together students, families, and staff for a day of running, laughing, and raising funds for our school.</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href={site.volunteerUrl} target="_blank" rel="noreferrer" className="btn-primary">Volunteer Sign-Up</a>
              <a href={`mailto:${site.contactEmail}`} className="btn-ghost">Get Updates</a>
            </div>
          </div>
          <div className="funrun-cards">
            <div className="funrun-card"><h4>🏃 Fun Run</h4><p>Stay tuned for all the details as they come together. Go Scotties! Volunteer opportunities are already open - many hands make this event a success.</p></div>
            <div className="funrun-card"><h4>🎁 Silent Auction</h4><p>A $10,000 auction with every item starting at just $1! Bigger and better than ever - don&apos;t miss out when it goes live!</p></div>
            <div className="funrun-card"><h4>🎟️ Ticket Presale</h4><p>Save time by preordering your Fun Run tickets! Available in bundles of 10 or 20, ready for Will Call pickup on the night of the event.</p></div>
          </div>
        </div>
      </div>

      <div className="section events-section" id="events">
        <div className="container">
          <span className="section-label">Throughout the Year</span>
          <h2>PTO Events &amp; Activities</h2>
          <p className="lead">From restaurant nights to the Book Fair - there&apos;s always something happening at Highland!</p>
          <div className="events-grid">
            {eventPills.map(([emoji, name, category]) => (
              <div className="event-pill" key={name}>
                <span className="event-emoji">{emoji}</span>
                <div>
                  <div className="event-name">{name}</div>
                  <div className="event-cat">{category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cta-section" id="contact">
        <h2>Ready to Make a Difference?</h2>
        <p>Every volunteer hour, every donation, and every word of encouragement helps us build a better Highland Elementary for every student, every day.</p>
        <div className="cta-actions">
          <a href={site.donateUrl} target="_blank" rel="noreferrer" className="btn-primary">Donate to Highland PTO</a>
          <a href={`mailto:${site.contactEmail}`} className="btn-email">✉ {site.contactEmail}</a>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <div>
            <strong style={{ color: 'rgba(255,255,255,.7)' }}>{site.organizationName}</strong> · {site.district} · {site.location}<br />
            © 2025 Highland PTO. Content managed by the PTO.
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
            {footerLinks.map((link) => (
              <a key={link.label} href={link.url} target={link.url.startsWith('http') ? '_blank' : undefined} rel={link.url.startsWith('http') ? 'noreferrer' : undefined}>
                {link.label}
              </a>
            ))}
            <a href={`mailto:${site.contactEmail}`}>Email PTO</a>
          </div>
        </div>
      </footer>
    </>
  )
}

function PageView({ pages, site, isLoading }) {
  const { slug } = useParams()
  const page = pages.find((item) => item.slug === slug)

  if (!page) {
    if (isLoading) {
      return <HomePage pages={pages} site={site} />
    }

    return <Navigate to="/home" replace />
  }

  const footerLinks = site.footerLinks || defaultSite.footerLinks

  return (
    <>
      <SiteNav pages={pages} site={site} />
      <main className="page-wrap">
        <div className="container">
          <span className="section-label">{page.navLabel || 'Page'}</span>
          <h2>{page.title}</h2>
          {page.summary ? <p className="lead">{page.summary}</p> : null}
          {getParagraphs(resolveTemplate(page.content, site)).map((line, index) => (
            <p key={`${page.slug}-${index}`} className="page-paragraph">
              {line}
            </p>
          ))}
        </div>
      </main>
      <footer>
        <div className="footer-inner">
          <div>
            <strong style={{ color: 'rgba(255,255,255,.7)' }}>{site.organizationName}</strong> · {site.district} · {site.location}<br />
            © 2025 Highland PTO.
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
            {footerLinks.map((link) => (
              <a key={link.label} href={link.url} target={link.url.startsWith('http') ? '_blank' : undefined} rel={link.url.startsWith('http') ? 'noreferrer' : undefined}>
                {link.label}
              </a>
            ))}
            <a href={`mailto:${site.contactEmail}`}>Email PTO</a>
          </div>
        </div>
      </footer>
    </>
  )
}

function App() {
  const [pages, setPages] = useState([])
  const [site, setSite] = useState(defaultSite)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadContent = useCallback(async () => {
    setLoading(true)
    setError('')

    const [pagesResult, siteResult] = await Promise.allSettled([fetchPages(), fetchSite()])

    if (pagesResult.status !== 'fulfilled') {
      setError(`Pages request failed: ${pagesResult.reason?.message || 'Unable to load site content.'}`)
      setLoading(false)
      return
    }

    setPages(pagesResult.value.pages)

    if (siteResult.status === 'fulfilled') {
      setSite(siteResult.value.site || defaultSite)
    } else {
      console.error('[frontend] Site request failed, using defaults.', siteResult.reason)
      setSite(defaultSite)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  return (
    <>
      {loading ? <p className="status-text">Loading latest content...</p> : null}
      {error ? <p className="status-text error">{error}</p> : null}

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage pages={pages} site={site} />} />
        <Route path="/:slug" element={<PageView pages={pages} site={site} isLoading={loading} />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  )
}

export default App
