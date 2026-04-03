# Highland PTO - Mobile API Integration Guide

This document provides documentation on how a future mobile app (iOS, Android, React Native, or Flutter) can securely communicate with the Highland PTO Platform backend.

---

## 1. Network Security & Transport

### Require HTTPS (TLS)
To prevent man-in-the-middle (MITM) attacks and packet sniffing, **all** API calls from the mobile application must be made over HTTPS (`https://`). Never use `http://` in production. 

### Certificate Pinning (Optional but Recommended)
For high-security setups, the mobile application should implement **Certificate Pinning** (or Public Key Pinning). This ensures the app only trusts the specific SSL certificate running on your API server, rejecting malicious certificates that might be installed on a public WiFi network.

---

## 2. Authentication & Authorization

To keep the API secure from abuse, we recommend implementing the following security layers before the mobile application goes live:

### A. Mobile App Verification (API Keys)
To ensure that only your official mobile app can read data (like the public pages, upcoming meetings, etc.), implement a static `x-api-key`. 

**How it works on the mobile side:**
Include the key in the headers of every request.
```http
GET /api/pages HTTP/1.1
Host: api.highland196pto.com
x-api-key: your-secure-mobile-client-key-here
```

### B. Admin & Write Access (Bearer Tokens / JWT)
Any endpoint that alters data (`POST`, `PUT`, `DELETE` pages) must be protected by a secure authorization layer. Mobile apps should obtain a short-lived token (JSON Web Token) after an admin user logs in.

**How it works on the mobile side:**
Pass the token in the `Authorization` header.
```http
PUT /api/pages/meetings HTTP/1.1
Host: api.highland196pto.com
Authorization: Bearer <JWT_TOKEN_HERE>
```

---

## 3. Endpoints Map

### Content Endpoints

| Method | Endpoint | Use Case | Required Security |
|--------|----------|----------|-------------------|
| **GET** | `/api/pages` | Fetch all site pages & app content to render in-app lists. | `x-api-key` |
| **GET** | `/api/pages/:slug` | Fetch details for a specific page (e.g. `/api/pages/fun-run`). | `x-api-key` |
| **POST** | `/api/pages` | *(Admin Only)* Create a completely new informational page. | `Authorization: Bearer` |
| **PUT** | `/api/pages/:slug` | *(Admin Only)* Edit the contents, title, or summary of a page. | `Authorization: Bearer` |

---

## 4. Example Mobile Integrations

Here are examples of how the mobile application should securely handle requests to the backend.

### React Native / Expo (JavaScript)
```javascript
const API_BASE_URL = 'https://api.highland196pto.com/api';
const API_KEY = 'your_mobile_api_key_from_env';

// Securely fetching pages
async function fetchPages() {
  try {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY, // Static App Verification
      }
    });
    const data = await response.json();
    return data.pages;
  } catch (error) {
    console.error("Failed to fetch pages securely:", error);
  }
}

// Securely Updating a Page (Admin)
async function updateAdminPage(slug, pageData, userJwtToken) {
  const response = await fetch(`${API_BASE_URL}/pages/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userJwtToken}` // Bearer Token
    },
    body: JSON.stringify(pageData)
  });
  return await response.json();
}
```

### Swift (iOS / URLSession)
```swift
func fetchPages() {
    guard let url = URL(string: "https://api.highland196pto.com/api/pages") else { return }
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    
    // Secure App Key Header
    request.setValue("your-secure-mobile-client-key-here", forHTTPHeaderField: "x-api-key")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("Client error: \(error.localizedDescription)")
            return
        }
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            print("Server error")
            return
        }
        // parse data...
    }.resume()
}
```

### Kotlin (Android / Retrofit)
```kotlin
interface HighlandPtoApi {
    @Headers("Content-Type: application/json")
    @GET("api/pages")
    suspend fun getPages(
        @Header("x-api-key") apiKey: String = Config.API_KEY
    ): Response<PagesResponse>

    @PUT("api/pages/{slug}")
    suspend fun updatePage(
        @Header("Authorization") token: String, // format: "Bearer <jwt>"
        @Path("slug") slug: String,
        @Body pageData: PageUpdateData
    ): Response<PageResponse>
}
```

## 6. Recommended Mobile UI & Interface Design

To maintain a consistent experience between the Highland PTO website and the future mobile app, the mobile development team should follow these UI/UX guidelines:

### A. Theming & Branding
- **Color Palette:** 
  - Primary Red: `#cc1a1a` (Use for main buttons, important links, and active states)
  - Bright Red: `#ff4444` (Use for hover/pressed states and highlights)
  - Deep Black: `#111111` (Use for text and dark headers)
  - Cream/Off-White: `#f9f5f5` (Use for app background to reduce eye strain)
- **Typography:**
  - Headers: Serif font (e.g., *Playfair Display* or equivalent iOS/Android default serif) for a traditional, academic feel.
  - Body Text: Clean sans-serif font (e.g., *DM Sans*, *San Francisco*, or *Roboto*).

### B. Core App Navigation (Bottom Tab Bar)
The app should use a persistent bottom tab bar for easy, one-handed navigation. Recommended tabs:
1. **🏠 Home:** A feed of the latest updates, quick links, and a welcome banner.
2. **📅 Events/Meetings:** A list of upcoming dates pulled from the `/meetings` and `/fun-run` pages.
3. **🤝 Committees:** A directory of ways to get involved based on the `/committees` API data.
4. **⚙️ Admin / More:** (Hidden or gated by login) Access to the page editor and settings.

### C. Content Presentation
When rendering the data from the `/api/pages` endpoints (`title`, `summary`, and `content`):

- **Page Headers:** Use the `title` as a large, bold `H1` at the top of the screen.
- **Summaries:** Place the `summary` string right below the title in slightly larger, muted text (e.g., gray italic) to act as a subtitle.
- **Body Content:** Render the `content` string with standard paragraph spacing. If line breaks (`\n`) are present in the JSON, they must be converted into distinct vertical spaces or UI Paragraph blocks so it doesn't look like a wall of text.
- **Cards & Data:** When listing things like "Committees" or "Meetings", wrap them in white `Card` components with rounded corners (`8px` or `12px` radius) and a subtle drop shadow to make them pop off the cream background.

## 5. Avoiding Common Mobile Pitfalls

1. **Never Hardcode JWTs or Secrets:** Only store the `x-api-key`. User admin tokens (JWTs) should be generated at login and stored securely in the device's keychain (iOS `Keychain`, Android `EncryptedSharedPreferences`).
2. **CORS:** Unlike web browsers, mobile app runtimes (like Swift, Kotlin, React Native) do not strictly enforce CORS. You do not need to configure complex CORS logic strictly for the mobile apps to work, but you DO need proper Authentication tokens.
3. **Payload optimization:** Mobile networks can be slow. Ensure the API continues compressing responses (e.g. gzip) to ensure fast load times for parents opening the app.