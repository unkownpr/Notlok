# Notlok - Flowglad Integration Guide

## Project Overview

**Notlok** is an AI-powered voice transcription desktop application built with **Tauri 2.0** (Rust backend) and **React 19** (TypeScript frontend). The app provides local speech-to-text transcription using Whisper models and integrates with an external PHP web API for AI-powered report generation and license management.

---

## 1. Framework & Language Detection

### Frontend Framework
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.4
- **UI Framework**: Custom CSS (no UI framework like TailwindCSS or Material-UI)
- **State Management**: React Hooks (useState, useEffect) - no external state management library

### Backend Framework
- **Framework**: Tauri 2.x (Rust-based desktop application framework)
- **Language**: Rust (edition 2021)
- **API Backend**: PHP 8+ with Fat-Free Framework (F3) for web API services

### Package Manager
- **Frontend**: npm (package-lock.json present)
- **Backend**: Cargo (Rust package manager)

### Dependency Files
- Frontend: `package.json` (root directory)
- Backend: `src-tauri/Cargo.toml`
- Web API: `php web api/composer.json`

---

## 2. File Structure & Paths

### Project Structure
```
notlok/
├── src/                           # React frontend source
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # React entry point
│   └── utils/
│       └── logger.ts              # Logging utility
├── src-tauri/                     # Rust backend
│   ├── src/
│   │   ├── lib.rs                 # Main Rust application logic
│   │   ├── audio_capture.rs      # Audio recording
│   │   └── transcription.rs      # Speech-to-text
│   ├── Cargo.toml                 # Rust dependencies
│   └── tauri.conf.json            # Tauri configuration
├── php web api/                   # PHP backend API
│   ├── index.php                  # API entry point
│   ├── app/Controllers/
│   │   ├── WebhookController.php # AI report proxy
│   │   └── VersionController.php # Version management
│   └── composer.json              # PHP dependencies
├── package.json                   # Node.js dependencies
├── vite.config.ts                 # Vite configuration
└── tsconfig.json                  # TypeScript configuration
```

### Key Paths (relative from project root)
- **Frontend Source**: `src/`
- **Main App Component**: `src/App.tsx`
- **Utility Functions**: `src/utils/`
- **Backend Source**: `src-tauri/src/`
- **API Routes**: `php web api/index.php` (routes defined here)
- **Controllers**: `php web api/app/Controllers/`
- **Build Output**: `dist/` (frontend), `src-tauri/target/` (backend)

---

## 3. Authentication System

### Authentication Overview
Notlok uses a **custom license-based authentication system** with LemonSqueezy for license validation. There is **no traditional user authentication** (no login/signup flow). Instead, users activate the app with a license key.

### License Validation Flow

#### Client-Side License Activation (React)

```typescript
// From: src/App.tsx (lines 622-691)

// License state
const [licenseKey, setLicenseKey] = useState("");
const [userEmail, setUserEmail] = useState("");
const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);

// License activation function
async function activateLicense() {
  if (!licenseKey.trim() || !userEmail.trim()) return;

  setIsActivating(true);
  setLicenseError("");

  try {
    const instanceName = await getComputerName();

    // Call LemonSqueezy API
    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        license_key: licenseKey.trim(),
        instance_name: instanceName,
      }),
    });

    const data = await response.json();

    if (data.activated) {
      // Validate store and product IDs
      if (data.meta.store_id !== 53624 || data.meta.product_id !== 699528) {
        setLicenseError(t.invalidLicense);
        return;
      }

      // Validate email
      if (data.meta.customer_email.toLowerCase() !== userEmail.trim().toLowerCase()) {
        setLicenseError(t.emailMismatch);
        return;
      }

      const info: LicenseInfo = {
        valid: true,
        key: data.license_key.key,
        status: data.license_key.status,
        customerEmail: data.meta.customer_email,
        activationUsage: data.license_key.activation_usage,
        activationLimit: data.license_key.activation_limit,
        expiresAt: data.license_key.expires_at,
      };

      setLicenseInfo(info);
      localStorage.setItem("notlok-license-key", licenseKey.trim());
      
      // Set premium license in Rust backend
      await invoke("set_premium_license", { licenseKey: licenseKey.trim() });
      setHasPremiumLicense(true);
      
      setActiveTab("main");
    } else {
      setLicenseError(data.error || t.activationFailed);
    }
  } catch (error) {
    setLicenseError(t.activationFailed);
    console.error("License activation error:", error);
  }

  setIsActivating(false);
}
```

#### Backend License Management (Rust)

```rust
// From: src-tauri/src/lib.rs (lines 541-566)

#[tauri::command]
fn set_premium_license(state: State<'_, AppState>, license_key: String) -> Result<bool, String> {
    let is_valid = !license_key.trim().is_empty();
    
    if is_valid {
        let mut has_premium = state.has_premium_license.lock().map_err(|e| e.to_string())?;
        *has_premium = true;
        Ok(true)
    } else {
        Ok(false)
    }
}

#[tauri::command]
fn check_premium_license(state: State<'_, AppState>) -> Result<bool, String> {
    let has_premium = *state.has_premium_license.lock().map_err(|e| e.to_string())?;
    Ok(has_premium)
}

#[tauri::command]
fn remove_premium_license(state: State<'_, AppState>) -> Result<(), String> {
    let mut has_premium = state.has_premium_license.lock().map_err(|e| e.to_string())?;
    *has_premium = false;
    Ok(())
}
```

### "User" Object Structure

Since Notlok uses license-based authentication, the equivalent of a "user" object is the license information:

```typescript
// From: src/App.tsx (lines 335-343)
interface LicenseInfo {
  valid: boolean;
  key: string;
  status: string;
  customerEmail: string;
  activationUsage: number;
  activationLimit: number;
  expiresAt: string | null;
}
```

### Accessing License Information

**Client-Side (React):**
```typescript
// License state is managed in App.tsx
const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);

// Check if user has premium access
const [hasPremiumLicense, setHasPremiumLicense] = useState(false);

// Access license data
if (licenseInfo?.valid) {
  const customerEmail = licenseInfo.customerEmail;
  const licenseKey = licenseInfo.key;
}
```

**Backend (Rust):**
```rust
// Check premium status via Tauri command
let has_premium = await invoke<boolean>("check_premium_license");
```

### Session Persistence
- License key is stored in `localStorage` with key `"notlok-license-key"`
- On app startup, the license is validated against LemonSqueezy API
- Premium status is stored in Rust backend state (`AppState.has_premium_license`)

---

## 4. Customer Model (B2C vs B2B)

### Customer Type: **B2C (Business-to-Consumer)**

Notlok is a **B2C product** where customers are **individual users**, not organizations or teams.

### Customer ID Source

**Customer Identifier**: `licenseInfo.customerEmail`

The customer is identified by their **email address** associated with the license key.

```typescript
// From: src/App.tsx
interface LicenseInfo {
  valid: boolean;
  key: string;
  status: string;
  customerEmail: string;  // ← Primary customer identifier
  activationUsage: number;
  activationLimit: number;
  expiresAt: string | null;
}
```

### API Request Authentication

When making API requests to the PHP backend, the customer is identified by:
- `license_key`: The user's license key
- `email`: The customer's email address

```typescript
// From: src/App.tsx (lines 894-900)
const params = new URLSearchParams();
params.append('license_key', licenseInfo.key);
params.append('email', email);
params.append('prompt', fullPrompt);

const requestUrl = `https://notlok.app/api/webhook?${params.toString()}`;
```

### No Organization Concept

There are **no organizations, teams, or workspaces** in Notlok. Each license is tied to an individual user identified by their email.

---

## 5. Frontend Framework

### Framework Details
- **React Version**: 19.1.0
- **TypeScript**: ~5.8.3
- **State Management**: Built-in React Hooks (useState, useEffect, useCallback)
- **No Context Providers**: The app uses local component state only
- **No Router**: Single-page application with tab-based navigation

### Component Structure

The entire application is contained in a single component:

```typescript
// From: src/App.tsx (lines 372-2346)
function App() {
  // All state is managed within this component
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "license" | "history" | "aireport">("main");
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [hasPremiumLicense, setHasPremiumLicense] = useState(false);
  // ... more state
  
  return (
    <main className="container">
      {/* Tab navigation */}
      <div className="tabs">
        <button onClick={() => setActiveTab("main")}>Main</button>
        <button onClick={() => setActiveTab("license")}>License</button>
        {/* ... more tabs */}
      </div>
      
      {/* Conditional rendering based on activeTab */}
      {activeTab === "main" && <MainContent />}
      {activeTab === "license" && <LicenseContent />}
      {/* ... more content */}
    </main>
  );
}
```

### No Provider Pattern

Unlike typical React apps, Notlok does **not use Context Providers or state management libraries**. All state is local to the `App` component and passed down as needed.

### Application Entry Point

```typescript
// From: src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Accessing State on Client

Since there's no global state management, you would need to:
1. Add state to the `App` component
2. Pass it down to child components via props
3. Use Tauri's `invoke` function to communicate with Rust backend

Example of accessing backend data:

```typescript
// From: src/App.tsx
const has_premium = await invoke<boolean>("check_premium_license");
```

---

## 6. Route Handler Pattern

### API Routes (PHP Backend)

The PHP backend uses **Fat-Free Framework (F3)** for routing.

#### Route Definition

```php
// From: php web api/index.php (lines 56-131)

// Fat-Free Framework route definitions
$f3 = \Base::instance();

// Homepage
$f3->route('GET /', function($f3) {
    // Serve HTML or JSON response
});

// AI Webhook Proxy (Primary payment-related endpoint)
$f3->route('POST /api/webhook', function($f3) {
    header('Content-Type: application/json');
    $controller = new \App\Controllers\WebhookController();
    $controller->process($f3);
});

// License Check
$f3->route('GET /api/check/@license_key', function($f3) {
    header('Content-Type: application/json');
    $controller = new \App\Controllers\ApiController();
    $controller->checkLicense($f3);
});

// Usage Info
$f3->route('GET /api/usage/@license_key/@email', function($f3) {
    header('Content-Type: application/json');
    $controller = new \App\Controllers\ApiController();
    $controller->getUsage($f3);
});

// Version Info (Public)
$f3->route('GET /api/version', function($f3) {
    $controller = new \App\Controllers\VersionController();
    $controller->getVersion($f3);
});

// Run the application
$f3->run();
```

#### Complete API Route Handler Example

**Webhook Controller (AI Report Generation with Usage Tracking)**

```php
// From: php web api/app/Controllers/WebhookController.php (lines 1-399)

<?php

namespace App\Controllers;

use App\Security\RateLimiter;
use App\Security\RequestValidator;
use App\Security\AuditLog;

class WebhookController
{
    /**
     * Process webhook requests (AI report generation)
     * This is the main endpoint that tracks usage and enforces limits
     */
    public function process($f3)
    {
        $db = $f3->get('DB');
        
        // Initialize security components
        $auditLog = new AuditLog($db);
        $rateLimiter = new RateLimiter($db);
        
        // Rate limiting - IP-based (60 requests per minute)
        $ipLimit = $rateLimiter->checkIP(60, 60);
        
        if (!$ipLimit['allowed']) {
            $auditLog->logRateLimitExceeded('ip_' . $_SERVER['REMOTE_ADDR']);
            
            http_response_code(429);
            header('X-RateLimit-Remaining: 0');
            header('X-RateLimit-Reset: ' . $ipLimit['reset_at']);
            header('Retry-After: ' . $ipLimit['retry_after']);
            echo json_encode([
                'status' => 'error',
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $ipLimit['retry_after'] . ' seconds'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Get and sanitize query parameters
        $licenseKey = RequestValidator::sanitize($f3->get('GET.license_key'), 'license_key');
        $email = RequestValidator::sanitize($f3->get('GET.email'), 'email');
        $prompt = RequestValidator::sanitize($f3->get('GET.prompt'), 'string');
        
        // Validation
        if (empty($licenseKey) || empty($email)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'license_key and email parameters are required'
            ]);
            return;
        }
        
        // Format validation
        if (!RequestValidator::validateLicenseKey($licenseKey)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid license_key format'
            ]);
            return;
        }
        
        if (!RequestValidator::validateEmail($email)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid email format'
            ]);
            return;
        }
        
        // License-based rate limiting (10 requests per minute)
        $licenseLimit = $rateLimiter->checkLicense($licenseKey, 10, 60);
        
        if (!$licenseLimit['allowed']) {
            http_response_code(429);
            echo json_encode([
                'status' => 'error',
                'message' => 'Too many requests. Please wait.',
                'retry_after' => $licenseLimit['retry_after'] . ' seconds'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        // Check license in database
        $license = $db->exec(
            'SELECT l.*, p.request_limit, p.name as package_name 
             FROM licenses l 
             JOIN packages p ON l.package_id = p.id 
             WHERE l.license_key = ? AND l.email = ? AND l.status = "active"',
            [$licenseKey, $email]
        );
        
        // Auto-create license if not exists
        if (empty($license)) {
            $firstPackage = $db->exec('SELECT id FROM packages ORDER BY request_limit ASC LIMIT 1');
            
            if (empty($firstPackage)) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'No packages defined in system'
                ]);
                return;
            }
            
            // Create license automatically
            $db->exec(
                'INSERT INTO licenses (license_key, email, package_id, status) VALUES (?, ?, ?, "active")',
                [$licenseKey, $email, $firstPackage[0]['id']]
            );
            
            // Fetch newly created license
            $license = $db->exec(
                'SELECT l.*, p.request_limit, p.name as package_name 
                 FROM licenses l 
                 JOIN packages p ON l.package_id = p.id 
                 WHERE l.license_key = ? AND l.email = ?',
                [$licenseKey, $email]
            );
        }
        
        $license = $license[0];
        
        // Check request count in last 30 days
        $requestCount = $db->exec(
            'SELECT COUNT(*) as count 
             FROM api_requests 
             WHERE license_key = ? AND email = ? 
             AND request_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
            [$licenseKey, $email]
        );
        
        $currentRequests = (int)$requestCount[0]['count'];
        
        // Enforce monthly limit
        if ($currentRequests >= $license['request_limit']) {
            http_response_code(429);
            echo json_encode([
                'status' => 'error',
                'message' => 'Monthly request limit reached',
                'limit' => $license['request_limit'],
                'used' => $currentRequests,
                'package' => $license['package_name']
            ]);
            return;
        }
        
        // Save request to database
        $db->exec(
            'INSERT INTO api_requests (license_key, email, prompt, ip_address, request_date) 
             VALUES (?, ?, ?, ?, NOW())',
            [
                $licenseKey,
                $email,
                $prompt,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown'
            ]
        );
        
        $lastRequestId = $db->lastInsertId();
        
        // Forward request to AI webhook
        $webhookUrl = WEBHOOK_URL;
        
        $ch = curl_init();
        $queryString = http_build_query([
            'license_key' => $licenseKey,
            'prompt' => $prompt,
            'email' => $email
        ]);
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $webhookUrl . '?' . $queryString,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_TIMEOUT => 1800,  // 30 minutes
            CURLOPT_FOLLOWLOCATION => true,
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        // Save response to database
        $db->exec(
            'UPDATE api_requests 
             SET response_status = ?, 
                 response_data = ?,
                 response_success = ?
             WHERE id = ?',
            [
                $httpCode, 
                $response,
                1,
                $lastRequestId
            ]
        );
        
        // Calculate usage
        $usedRequests = $currentRequests + 1;
        $remainingRequests = $license['request_limit'] - $usedRequests;
        $usagePercentage = round(($usedRequests / $license['request_limit']) * 100, 2);
        
        // Return response with usage info
        $responseArray = json_decode($response, true);
        
        $finalResponse = [
            'success' => true,
            'data' => $responseArray,
            'usage' => [
                'used' => $usedRequests,
                'limit' => $license['request_limit'],
                'remaining' => $remainingRequests,
                'percentage' => $usagePercentage,
                'package' => $license['package_name'],
                'reset_date' => date('Y-m-d', strtotime('+30 days', strtotime($license['created_at'])))
            ]
        ];
        
        echo json_encode($finalResponse, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}
```

#### JSON Response Pattern

All API responses follow this format:

```json
{
  "status": "success",
  "data": { /* response data */ }
}
```

Or for errors:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Tauri Commands (Rust Backend)

Tauri uses a **command pattern** where frontend calls backend functions via `invoke`:

```rust
// From: src-tauri/src/lib.rs (lines 140-143)
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
```

**Calling from Frontend:**

```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke<string>("greet", { name: "World" });
```

---

## 7. Validation & Error Handling Patterns

### Validation Library

**None** - The application does not use a dedicated validation library like Zod, Yup, or Joi.

### Validation Pattern (PHP Backend)

The PHP backend uses a custom `RequestValidator` class:

```php
// From: php web api/app/Controllers/WebhookController.php (lines 42-83)

// Sanitize inputs
$licenseKey = RequestValidator::sanitize($f3->get('GET.license_key'), 'license_key');
$email = RequestValidator::sanitize($f3->get('GET.email'), 'email');
$prompt = RequestValidator::sanitize($f3->get('GET.prompt'), 'string');

// Validate required fields
if (empty($licenseKey) || empty($email)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'license_key and email parameters are required'
    ]);
    return;
}

// Format validation
if (!RequestValidator::validateLicenseKey($licenseKey)) {
    $auditLog->logSuspiciousActivity('invalid_license_format', [
        'license_key' => substr($licenseKey, 0, 8) . '***',
        'user_email' => $email
    ]);
    
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid license_key format'
    ]);
    return;
}

if (!RequestValidator::validateEmail($email)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid email format'
    ]);
    return;
}
```

### Error Handling Pattern (Frontend)

```typescript
// From: src/App.tsx (lines 809-1005)

async function generateAIReport() {
  if (!transcript.trim()) {
    setReportError(t.noTranscript);
    return;
  }

  setIsGenerating(true);
  setReportError("");
  setAiReport("");

  try {
    if (aiProvider === "gemini") {
      // Gemini API call
      if (!geminiApiKey.trim()) {
        setReportError(t.enterGeminiKey);
        setIsGenerating(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": geminiApiKey.trim(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: fullPrompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const report = data.candidates[0].content.parts[0].text;
        setAiReport(report);
      } else {
        setReportError(data.error?.message || t.reportError);
      }
    } else {
      // Notlok AI
      if (!licenseInfo?.key) {
        const errorMsg = uiLanguage === 'tr' 
          ? 'Lisans bilgisi bulunamadı. Lütfen License sekmesinden lisansınızı aktive edin.' 
          : 'License information not found. Please activate your license from License tab.';
        setReportError(errorMsg);
        setIsGenerating(false);
        return;
      }

      const response = await fetch(requestUrl, {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMsg = uiLanguage === 'tr'
          ? `API Hatası (${response.status}): ${errorText || response.statusText}`
          : `API Error (${response.status}): ${errorText || response.statusText}`;
        setReportError(errorMsg);
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      
      // Parse response...
      setAiReport(data.response);
    }
  } catch (error) {
    logger.error("AI report error:", error);
    const errorMsg = uiLanguage === 'tr'
      ? `Bağlantı hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      : `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    setReportError(errorMsg);
  }

  setIsGenerating(false);
}
```

### Error Response Format

**PHP API:**
```json
{
  "status": "error",
  "message": "Error description"
}
```

**HTTP Status Codes Used:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

---

## 8. Type System

### TypeScript (Frontend)

The project uses **TypeScript** with strict type checking:

```typescript
// From: tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "jsx": "react-jsx"
  }
}
```

**Type Examples:**

```typescript
// From: src/App.tsx (lines 304-367)

type Language = "tr" | "en";
type Theme = "light" | "dark" | "system";
type AIProvider = "notlok" | "gemini";
type PromptTemplate = "meetingNotes" | "meetingSummary" | "actionItems" | "decisionLog" | "custom";

interface ModelInfo {
  id: string;
  name: string;
  size: string;
  quality: string;
  url: string;
}

interface DownloadProgress {
  model_id: string;
  progress: number;
  downloaded: number;
  total: number;
}

interface PermissionStatus {
  screen_recording: boolean;
  microphone: string; // "granted", "denied", "not_determined"
}

interface AudioDevice {
  id: string;
  name: string;
  is_default: boolean;
}

interface LicenseInfo {
  valid: boolean;
  key: string;
  status: string;
  customerEmail: string;
  activationUsage: number;
  activationLimit: number;
  expiresAt: string | null;
}

interface RecordingHistory {
  id: string;
  date: string;
  transcript: string;
  aiReport: string;
  model: string;
  language: string;
}

interface UpdateInfo {
  status: string;
  user_version: string;
  current_version: string;
  minimum_version: string;
  is_up_to_date: boolean;
  is_supported: boolean;
  update_available: boolean;
  update_required: boolean;
  force_update: boolean;
  update_message?: string;
  download_url?: string;
  changelog?: string;
}
```

### Rust (Backend)

Rust has a strong static type system:

```rust
// From: src-tauri/src/lib.rs (lines 11-48)

#[derive(Clone, Serialize)]
pub struct AudioStats {
    pub average: f32,
    pub peak: f32,
    pub silence: f32,
}

#[derive(Clone, Serialize)]
pub struct PermissionStatus {
    pub screen_recording: bool,
    pub microphone: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub size: String,
    pub quality: String,
    pub url: String,
}

#[derive(Clone, Serialize)]
pub struct DownloadProgress {
    pub model_id: String,
    pub progress: f64,
    pub downloaded: u64,
    pub total: u64,
}

pub struct AppState {
    recorder: AudioRecorder,
    transcriber: Mutex<Option<TranscriberModel>>,
    current_model: Mutex<Option<String>>,
    language: Mutex<String>,
    recording_start_time: Mutex<Option<std::time::Instant>>,
    has_premium_license: Mutex<bool>,
}
```

---

## 9. Helper Function Patterns

### Location

Utility/helper functions are located in:
- `src/utils/logger.ts` (logging utility)
- Inline functions within `src/App.tsx`

### Helper Function Examples

#### Logger Utility

```typescript
// From: src/utils/logger.ts (complete file)

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};
```

#### Version Comparison Helper

```typescript
// From: src/App.tsx (lines 1121-1135)

// Helper function to compare semantic versions
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.replace('v', '').split('.').map(Number);
  const parts2 = v2.replace('v', '').split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
}
```

#### Computer Name Helper

```typescript
// From: src/App.tsx (lines 606-620)

async function getComputerName(): Promise<string> {
  try {
    // Try to get hostname via Tauri
    const hostname = await invoke<string>("get_hostname");
    return hostname;
  } catch {
    // Fallback to a generated ID
    let id = localStorage.getItem("notlok-instance-id");
    if (!id) {
      id = `notlok-${Date.now()}-${Math.random().toString36).substr(2, 9)}`;
      localStorage.setItem("notlok-instance-id", id);
    }
    return id;
  }
}
```

### Code Organization Style

- **Single File**: Most helper functions are defined inline within `App.tsx`
- **Naming Convention**: camelCase for functions (e.g., `getComputerName`, `compareVersions`)
- **Async Functions**: Use `async/await` pattern
- **Error Handling**: Try-catch blocks with fallbacks
- **Early Returns**: Used for validation and error cases

---

## 10. Provider Composition Pattern

### No Provider Pattern

Notlok **does not use Context Providers or state management libraries**. All state is managed locally within the main `App` component.

### State Management

```typescript
// From: src/App.tsx (lines 372-471)

function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "license" | "history" | "aireport">("main");
  
  // UI state
  const [uiLanguage, setUiLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("notlok-ui-language");
    return (saved as Language) || "en";
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("notlok-theme");
    return (saved as Theme) || "system";
  });
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("ready");
  
  // License state
  const [licenseKey, setLicenseKey] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [hasPremiumLicense, setHasPremiumLicense] = useState(false);
  
  // AI state
  const [aiProvider, setAiProvider] = useState<AIProvider>(() => {
    const saved = localStorage.getItem("notlok-ai-provider");
    return (saved as AIProvider) || "notlok";
  });
  const [aiReport, setAiReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // ... more state declarations
  
  return (
    <main className="container">
      {/* Component JSX */}
    </main>
  );
}
```

### Root Layout

```typescript
// From: src/main.tsx (complete file)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**There are no providers to mount.**

---

## 11. Environment Variables

### Environment File

The application uses **Vite's built-in environment variable system**. Environment variables would be defined in:
- `.env` (local environment)
- `.env.production` (production environment)

### Accessing Environment Variables

**Frontend (Vite):**
```typescript
// From: src/utils/logger.ts
const isDevelopment = import.meta.env.DEV;
```

**Backend (Rust):**
Environment variables can be accessed using Rust's `std::env` module, but the application does not currently use any environment variables in the Rust code.

### Configuration

The PHP backend uses a config file:

```php
// From: php web api/index.php (lines 18-25)

// Config loading
if (file_exists('config/config.php')) {
    require_once 'config/config.php';
} else {
    // Config doesn't exist, redirect to install
    header('Location: install.php');
    exit;
}
```

Constants like `WEBHOOK_URL`, `DB_HOST`, `DB_USER`, `DB_PASS` are defined in `config/config.php` (not included in repository for security).

---

## 12. Existing Billing Code

### Current Billing Implementation

Notlok has a **custom license-based billing system** with usage tracking. The system is integrated with:
- **LemonSqueezy** for license activation
- **Custom PHP backend** for usage metering and limits

### License Validation Code Location

**Frontend**: `src/App.tsx` (lines 622-753)
**Backend (Rust)**: `src-tauri/src/lib.rs` (lines 541-566)
**API Backend**: `php web api/app/Controllers/WebhookController.php`

### Usage Meter References

#### "AI Report Requests" Usage Meter

The primary usage meter tracks AI report generation requests:

**Location**: `php web api/app/Controllers/WebhookController.php`

```php
// Check request count in last 30 days (lines 169-177)
$requestCount = $db->exec(
    'SELECT COUNT(*) as count 
     FROM api_requests 
     WHERE license_key = ? AND email = ? 
     AND request_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
    [$licenseKey, $email]
);

$currentRequests = (int)$requestCount[0]['count'];

// Enforce monthly limit (lines 179-190)
if ($currentRequests >= $license['request_limit']) {
    http_response_code(429);
    echo json_encode([
        'status' => 'error',
        'message' => 'Monthly request limit reached',
        'limit' => $license['request_limit'],
        'used' => $currentRequests,
        'package' => $license['package_name']
    ]);
    return;
}
```

**Usage Display (Frontend)**:

```typescript
// From: src/App.tsx (lines 1840-1875)

{aiUsage && aiProvider === "notlok" && (
  <div className="settings-panel ai-usage-panel">
    <h3>{t.aiUsageTitle}</h3>
    <div className="ai-usage-info">
      <div className="usage-stat">
        <span className="usage-label">{t.aiUsageUsed}:</span>
        <span className="usage-value">{aiUsage.used}</span>
      </div>
      <div className="usage-stat">
        <span className="usage-label">{t.aiUsageRemaining}:</span>
        <span className="usage-value">{aiUsage.remaining}</span>
      </div>
      <div className="usage-stat">
        <span className="usage-label">{t.aiUsageLimit}:</span>
        <span className="usage-value">{aiUsage.limit}</span>
      </div>
      <div className="usage-stat">
        <span className="usage-label">{t.aiUsagePackage}:</span>
        <span className="usage-value">{aiUsage.package}</span>
      </div>
      <div className="usage-stat">
        <span className="usage-label">{t.aiUsageResetDate}:</span>
        <span className="usage-value">{aiUsage.reset_date}</span>
      </div>
      <div className="usage-progress-bar">
        <div 
          className="usage-progress-fill"
          style={{ width: `${aiUsage.percentage}%` }}
        />
      </div>
      <div className="usage-percentage">
        {aiUsage.percentage.toFixed(1)}% used
      </div>
    </div>
  </div>
)}
```

#### "Recording Duration" (Free Tier Limit)

Free users are limited to 60 seconds of recording per session:

**Location**: `src-tauri/src/lib.rs`

```rust
// From: src-tauri/src/lib.rs (lines 371-389)

#[tauri::command]
fn check_recording_limit(state: State<'_, AppState>) -> Result<bool, String> {
    // Check if user has premium license
    let has_premium = *state.has_premium_license.lock().map_err(|e| e.to_string())?;
    
    if has_premium {
        return Ok(false); // No limit for premium users
    }
    
    // Free users: 60 seconds limit
    let start_time = state.recording_start_time.lock().map_err(|e| e.to_string())?;
    
    if let Some(start) = *start_time {
        let duration = start.elapsed().as_secs_f64();
        Ok(duration >= 60.0) // true if limit reached
    } else {
        Ok(false)
    }
}
```

**Usage in Frontend**:

```typescript
// From: src/App.tsx (lines 1318-1348)

async function startRecording() {
  try {
    await invoke("start_recording");
    setIsRecording(true);
    setStatus("recording");
    setRecordingStartTime(Date.now());
    setRecordingDuration(0);
    
    // Start timer to track recording duration
    const timerInterval = setInterval(async () => {
      try {
        const duration = await invoke<number>("get_recording_duration");
        setRecordingDuration(duration);
        
        // Check if limit reached for free users
        if (!hasPremiumLicense && duration >= 60) {
          clearInterval(timerInterval);
          await stopRecording();
          setActiveTab("license");
        }
      } catch (error) {
        console.error("Error getting recording duration:", error);
      }
    }, 100);
    
    // Store interval ID to clear on stop
    (window as any).recordingTimerInterval = timerInterval;
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error}`);
  }
}
```

### Feature Toggle References

**Premium Features** are gated by the `hasPremiumLicense` state:

```typescript
// From: src/App.tsx (lines 1548-1575)

// AI Report Tab
<button
  className={`tab ${activeTab === "aireport" ? "active" : ""} ${!hasPremiumLicense ? "premium-locked" : ""}`}
  onClick={() => {
    if (hasPremiumLicense) {
      setActiveTab("aireport");
    } else {
      setActiveTab("license");
    }
  }}
  title={!hasPremiumLicense ? t.premiumOnly : ""}
>
  {t.aiReportTab} {!hasPremiumLicense && "🔒"}
</button>

// History Tab
<button
  className={`tab ${activeTab === "history" ? "active" : ""} ${!hasPremiumLicense ? "premium-locked" : ""}`}
  onClick={() => {
    if (hasPremiumLicense) {
      setActiveTab("history");
      setSelectedHistoryItem(null);
    } else {
      setActiveTab("license");
    }
  }}
  title={!hasPremiumLicense ? t.premiumOnly : ""}
>
  {t.history} {!hasPremiumLicense && "🔒"}
</button>
```

**Feature Slugs**:
- `unlimited_recording` - No 60-second limit
- `ai_reports` - Access to AI report generation
- `recording_history` - Access to past recordings
- `auto_updates` - Automatic version updates

### Product/Price References

The application uses LemonSqueezy's product system:

```typescript
// From: src/App.tsx (lines 369-370)
const EXPECTED_STORE_ID = 53624;
const EXPECTED_PRODUCT_ID = 699528;
```

These IDs are validated during license activation to ensure the license key belongs to the correct product.

---

## 13. Component Locations

### Pricing Page/Component

**Does not exist** - The application does not have a built-in pricing page. Users purchase licenses externally via:
- Website: `https://notlok.app`

Pricing is managed outside the desktop application.

### Navbar/Account Menu Component

**Does not exist** - The application uses a simple tab-based navigation without a traditional navbar or account menu.

**Tab Navigation** (closest equivalent):

```typescript
// From: src/App.tsx (lines 1541-1587)

<div className="tabs">
  <button
    className={`tab ${activeTab === "main" ? "active" : ""}`}
    onClick={() => setActiveTab("main")}
  >
    {t.main}
  </button>
  <button
    className={`tab ${activeTab === "aireport" ? "active" : ""} ${!hasPremiumLicense ? "premium-locked" : ""}`}
    onClick={() => {
      if (hasPremiumLicense) {
        setActiveTab("aireport");
      } else {
        setActiveTab("license");
      }
    }}
    title={!hasPremiumLicense ? t.premiumOnly : ""}
  >
    {t.aiReportTab} {!hasPremiumLicense && "🔒"}
  </button>
  <button
    className={`tab ${activeTab === "history" ? "active" : ""} ${!hasPremiumLicense ? "premium-locked" : ""}`}
    onClick={() => {
      if (hasPremiumLicense) {
        setActiveTab("history");
        setSelectedHistoryItem(null);
      } else {
        setActiveTab("license");
      }
    }}
    title={!hasPremiumLicense ? t.premiumOnly : ""}
  >
    {t.history} {!hasPremiumLicense && "🔒"}
  </button>
  <button
    className={`tab ${activeTab === "license" ? "active" : ""}`}
    onClick={() => setActiveTab("license")}
  >
    {t.license}
  </button>
  <button
    className={`tab ${activeTab === "settings" ? "active" : ""}`}
    onClick={() => setActiveTab("settings")}
  >
    {t.settings}
  </button>
</div>
```

### Main Dashboard/Home Page Component

**Location**: `src/App.tsx`

The main content area when `activeTab === "main"`:

```typescript
// From: src/App.tsx (lines 1589-1756)

{activeTab === "main" && (
  <>
    <div className="settings-panel">
      <div className="setting-group">
        <label>{t.model}:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isDownloading || isRecording}
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} - {model.size} ({model.quality})
            </option>
          ))}
        </select>
        <button onClick={handleDownloadModel} disabled={isDownloading || isRecording} className="btn secondary">
          {isDownloading ? `${t.downloading}... ${downloadProgress?.toFixed(0)}%` : t.download}
        </button>
        <button onClick={handleLoadModel} disabled={isDownloading || isRecording} className="btn secondary">
          {t.load}
        </button>
      </div>
      
      {currentModel && !isModelLoading && (
        <div className="current-model">
          {t.activeModel}: <strong>{currentModel}</strong>
        </div>
      )}
    </div>

    <div className="controls">
      {!isRecording && !isStopping ? (
        <button
          onClick={startRecording}
          className="btn start"
          disabled={!currentModel || status === "processing"}
        >
          {!currentModel ? t.loadModelFirst : status === "processing" ? t.processing : t.startRecording}
        </button>
      ) : (
        <button onClick={stopRecording} className="btn stop" disabled={isStopping}>
          {isStopping ? t.stoppingRecording : t.stopRecording}
        </button>
      )}
      
      {/* Recording Timer (Free Tier Countdown) */}
      {isRecording && !hasPremiumLicense && (
        <div className="recording-timer">
          <span className="timer-label">{t.recordingTimeLeft}:</span>
          <span className={`timer-value ${recordingDuration >= 50 ? 'timer-warning' : ''}`}>
            {Math.max(0, 60 - Math.floor(recordingDuration))}s
          </span>
        </div>
      )}
      
      {isRecording && hasPremiumLicense && (
        <div className="recording-timer premium">
          <span className="timer-label">⏱️ {Math.floor(recordingDuration / 60)}:{String(Math.floor(recordingDuration % 60)).padStart(2, '0')}</span>
          <span className="timer-hint premium">✨ {t.unlimitedRecording}</span>
        </div>
      )}
    </div>

    <div className="status-bar">
      {t.status}: {getStatusText(status)}
    </div>

    <div className="transcript-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ margin: 0 }}>{t.transcript}</h2>
        {transcript.trim() && (
          <button
            onClick={() => {
              setActiveTab('aireport');
            }}
            className="btn secondary"
          >
            🤖 {uiLanguage === 'tr' ? 'AI Rapor Oluştur' : 'Generate AI Report'}
          </button>
        )}
      </div>
      <textarea
        readOnly
        value={transcript}
        placeholder={t.transcriptPlaceholder}
      />
    </div>
  </>
)}
```

---

## Summary: Key Information for Flowglad Integration

### Customer Identification
- **Customer ID**: `licenseInfo.customerEmail` (email address)
- **B2C Model**: Individual users, not organizations

### Billing Endpoints

**Primary Usage Tracking Endpoint**: `POST https://notlok.app/api/webhook`
- Tracks AI report generation requests
- Enforces monthly usage limits
- Returns usage information with each response

**Request Parameters**:
```typescript
{
  license_key: string;  // LemonSqueezy license key
  email: string;        // Customer email
  prompt: string;       // AI prompt (request data)
}
```

**Response Format**:
```json
{
  "success": true,
  "data": { /* AI response */ },
  "usage": {
    "used": 5,
    "limit": 50,
    "remaining": 45,
    "percentage": 10.0,
    "package": "Basic Package",
    "reset_date": "2025-01-26"
  }
}
```

### Feature Gates

**Premium Features** (require valid license):
1. Unlimited recording duration (free: 60 seconds)
2. AI report generation
3. Recording history access
4. Automatic updates

**Free Features**:
1. Up to 60 seconds recording per session
2. Multi-language transcription
3. Audio device selection
4. Theme customization

### Integration Points

To integrate Flowglad payments:

1. **Replace LemonSqueezy activation** with Flowglad license validation
2. **Track usage meters** for:
   - `ai_report_requests` (currently tracked in `api_requests` table)
   - `recording_seconds` (currently tracked in Rust backend)
3. **Add billing portal link** in License tab
4. **Implement subscription management** endpoints
5. **Add webhook handlers** for subscription events

### Database Schema (Current)

```sql
-- Licenses table
CREATE TABLE licenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  license_key VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  package_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- Packages table (usage tiers)
CREATE TABLE packages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  request_limit INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Requests (usage tracking)
CREATE TABLE api_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  license_key VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  prompt TEXT,
  ip_address VARCHAR(45),
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_status INT,
  response_data LONGTEXT,
  response_success BOOLEAN
);
```

---

## Contact & Links

- **Website**: https://notlok.app
- **Developer**: ssilistre.dev
- **License System**: LemonSqueezy
- **Store ID**: 53624
- **Product ID**: 699528

---

*This document was generated for Flowglad integration purposes on November 26, 2025.*

