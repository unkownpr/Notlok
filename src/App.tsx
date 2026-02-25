import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getVersion } from "@tauri-apps/api/app";
import "./App.css";
import { logger } from "./utils/logger";

// Translations
const translations = {
  tr: {
    title: "Notlok",
    main: "Ana Sayfa",
    settings: "Ayarlar",
    permissions: "İzinler",
    screenRecording: "Ekran Kaydı",
    microphone: "Mikrofon",
    granted: "Verildi",
    denied: "Verilmedi",
    notDetermined: "Belirlenmedi",
    requestPermission: "İzin İste",
    openSettings: "Ayarlar",
    refresh: "Yenile",
    model: "Model",
    download: "İndir",
    downloading: "İndiriliyor",
    load: "Yükle",
    language: "Dil",
    turkish: "Türkçe",
    english: "English",
    auto: "Otomatik",
    activeModel: "Aktif Model",
    startRecording: "Kayda Başla",
    stopRecording: "Kaydı Durdur",
    loadModelFirst: "Önce Model Yükleyin",
    status: "Durum",
    transcript: "Transkript",
    transcriptPlaceholder: "Transkript burada görünecek...",
    uiLanguage: "Arayüz Dili",
    transcriptionLanguage: "Transkripsiyon Dili",
    modelDownloaded: "İndirildi",
    ready: "Hazır",
    recording: "Kayıt yapılıyor...",
    stopped: "Durduruldu",
    processing: "İşleniyor...",
    stoppingRecording: "Kayıt durduruluyor ve transkript oluşturuluyor...",
    audioDevices: "Ses Cihazları",
    inputDevice: "Mikrofon",
    outputDevice: "Sistem Sesi",
    selectDevice: "Cihaz Seç",
    defaultDevice: "Varsayılan",
    refreshDevices: "Yenile",
    version: "Sürüm",
    checkForUpdates: "Güncellemeleri Kontrol Et",
    updateAvailable: "Güncelleme Mevcut!",
    updateRequired: "Güncelleme Gerekli!",
    currentVersion: "Mevcut Sürüm",
    latestVersion: "En Son Sürüm",
    downloadUpdate: "Güncellemeyi İndir",
    upToDate: "Uygulamanız güncel!",
    updateChecking: "Güncelleme kontrol ediliyor...",
    updateCheckFailed: "Güncelleme kontrolü başarısız",
    forceUpdateMessage: "Bu sürüm artık desteklenmiyor. Lütfen güncelleyin.",
    theme: "Tema",
    light: "Açık",
    dark: "Koyu",
    system: "Sistem",
    aiReport: "AI Rapor",
    generateReport: "Rapor Oluştur",
    generating: "Oluşturuluyor...",
    aiProvider: "AI Sağlayıcı",
    openrouterAI: "OpenRouter AI",
    geminiAI: "Gemini AI",
    geminiApiKey: "Gemini API Key",
    enterGeminiKey: "Gemini API anahtarınızı girin",
    openrouterApiKey: "OpenRouter API Anahtarı",
    enterOpenRouterKey: "OpenRouter API anahtarınızı girin",
    selectModel: "Model Seç",
    fetchingModels: "Modeller yükleniyor...",
    noModelsFound: "Model bulunamadı",
    enterKeyFirst: "Önce API anahtarı girin",
    customPrompt: "Özel Prompt",
    defaultPrompt: "Bu toplantı transkriptini analiz et ve önemli noktaları, kararları ve aksiyonları özetle:",
    reportResult: "Rapor Sonucu",
    noTranscript: "Rapor oluşturmak için önce kayıt yapın",
    reportError: "Rapor oluşturulurken hata oluştu",
    copyReport: "Kopyala",
    copied: "Kopyalandı!",
    history: "Geçmiş",
    aiReportTab: "AI Rapor",
    promptTemplate: "Prompt Şablonu",
    customPromptOption: "Özel Prompt",
    meetingNotes: "Toplantı Notları",
    meetingSummary: "Toplantı Özeti",
    actionItems: "Aksiyon Maddeleri",
    decisionLog: "Karar Günlüğü",
    meetingNotesPrompt: "Bu toplantı transkriptinden detaylı toplantı notları oluştur. Katılımcıları, tartışılan konuları, önemli noktaları ve sonuçları madde madde listele. Türkçe yaz.",
    meetingSummaryPrompt: "Bu toplantı transkriptini analiz et ve kısa bir yönetici özeti hazırla. Ana konuları, alınan kararları ve sonraki adımları 2-3 paragrafta özetle. Türkçe yaz.",
    actionItemsPrompt: "Bu toplantı transkriptinden tüm aksiyon maddelerini çıkar. Her madde için sorumlu kişiyi (varsa), görevi ve son tarihi (varsa) belirt. Öncelik sırasına göre listele. Türkçe yaz.",
    decisionLogPrompt: "Bu toplantı transkriptinden alınan tüm kararları tespit et. Her karar için bağlamı, kararın kendisini, gerekçesini ve etkisini açıkla. Türkçe yaz.",
    noHistory: "Henüz kayıt yok",
    deleteRecord: "Sil",
    viewRecord: "Görüntüle",
    backToList: "Listeye Dön",
    recordDate: "Tarih",
    recordDuration: "Süre",
    clearHistory: "Geçmişi Temizle",
    confirmClear: "Tüm geçmişi silmek istediğinizden emin misiniz?",
    loading: "Hazırlanıyor...",
    loadingModel: "Model yükleniyor...",
    modelLoading: "yükleniyor...",
    modelLoaded: "Model yüklendi:",
    error: "Hata:",
  },
  en: {
    title: "Notlok",
    main: "Main",
    settings: "Settings",
    permissions: "Permissions",
    screenRecording: "Screen Recording",
    microphone: "Microphone",
    granted: "Granted",
    denied: "Denied",
    notDetermined: "Not Determined",
    requestPermission: "Request",
    openSettings: "Settings",
    refresh: "Refresh",
    model: "Model",
    download: "Download",
    downloading: "Downloading",
    load: "Load",
    language: "Language",
    turkish: "Turkish",
    english: "English",
    auto: "Auto",
    activeModel: "Active Model",
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    loadModelFirst: "Load Model First",
    status: "Status",
    transcript: "Transcript",
    transcriptPlaceholder: "Transcript will appear here...",
    uiLanguage: "UI Language",
    transcriptionLanguage: "Transcription Language",
    modelDownloaded: "Downloaded",
    ready: "Ready",
    recording: "Recording...",
    stopped: "Stopped",
    processing: "Processing...",
    stoppingRecording: "Stopping recording and generating transcript...",
    audioDevices: "Audio Devices",
    inputDevice: "Microphone",
    outputDevice: "System Audio",
    selectDevice: "Select Device",
    defaultDevice: "Default",
    refreshDevices: "Refresh",
    version: "Version",
    checkForUpdates: "Check for Updates",
    updateAvailable: "Update Available!",
    updateRequired: "Update Required!",
    currentVersion: "Current Version",
    latestVersion: "Latest Version",
    downloadUpdate: "Download Update",
    upToDate: "Your app is up to date!",
    updateChecking: "Checking for updates...",
    updateCheckFailed: "Update check failed",
    forceUpdateMessage: "This version is no longer supported. Please update.",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    aiReport: "AI Report",
    generateReport: "Generate Report",
    generating: "Generating...",
    aiProvider: "AI Provider",
    openrouterAI: "OpenRouter AI",
    geminiAI: "Gemini AI",
    geminiApiKey: "Gemini API Key",
    enterGeminiKey: "Enter your Gemini API key",
    openrouterApiKey: "OpenRouter API Key",
    enterOpenRouterKey: "Enter your OpenRouter API key",
    selectModel: "Select Model",
    fetchingModels: "Loading models...",
    noModelsFound: "No models found",
    enterKeyFirst: "Enter API key first",
    customPrompt: "Custom Prompt",
    defaultPrompt: "Analyze this meeting transcript and summarize key points, decisions, and action items:",
    reportResult: "Report Result",
    noTranscript: "Record a meeting first to generate a report",
    reportError: "Error generating report",
    copyReport: "Copy",
    copied: "Copied!",
    history: "History",
    aiReportTab: "AI Report",
    promptTemplate: "Prompt Template",
    customPromptOption: "Custom Prompt",
    meetingNotes: "Meeting Notes",
    meetingSummary: "Meeting Summary",
    actionItems: "Action Items",
    decisionLog: "Decision Log",
    meetingNotesPrompt: "Create detailed meeting notes from this transcript. List participants, topics discussed, key points, and outcomes in bullet points. Write in English.",
    meetingSummaryPrompt: "Analyze this meeting transcript and prepare a brief executive summary. Summarize main topics, decisions made, and next steps in 2-3 paragraphs. Write in English.",
    actionItemsPrompt: "Extract all action items from this meeting transcript. For each item, specify the responsible person (if mentioned), the task, and deadline (if mentioned). List by priority. Write in English.",
    decisionLogPrompt: "Identify all decisions made in this meeting transcript. For each decision, explain the context, the decision itself, rationale, and impact. Write in English.",
    noHistory: "No recordings yet",
    deleteRecord: "Delete",
    viewRecord: "View",
    backToList: "Back to List",
    recordDate: "Date",
    recordDuration: "Duration",
    clearHistory: "Clear History",
    confirmClear: "Are you sure you want to delete all history?",
    loading: "Loading...",
    loadingModel: "Loading model...",
    modelLoading: "loading...",
    modelLoaded: "Model loaded:",
    error: "Error:",
  },
};

type Language = "tr" | "en";
type Theme = "light" | "dark" | "system";
type AIProvider = "openrouter" | "gemini";
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

function App() {
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "history" | "aireport">("main");
  const [uiLanguage, setUiLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("notlok-ui-language");
    if (saved) {
      return saved as Language;
    }

    // Detect system language
    const systemLanguage = navigator.language.toLowerCase();
    if (systemLanguage.startsWith('tr')) {
      return 'tr';
    }
    // Default to English for all other languages
    return 'en';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("notlok-theme");
    return (saved as Theme) || "system";
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // History states
  const [recordingHistory, setRecordingHistory] = useState<RecordingHistory[]>(() => {
    const saved = localStorage.getItem("notlok-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<RecordingHistory | null>(null);
  const [_recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  // App states
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("ready");
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<string>("tr");
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionStatus | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Audio devices
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>(() => {
    return localStorage.getItem("notlok-input-device") || "default";
  });
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>(() => {
    return localStorage.getItem("notlok-output-device") || "default";
  });

  // Update check
  const [appVersion, setAppVersion] = useState("2.0.0");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showUpToDateDialog, setShowUpToDateDialog] = useState(false);

  // AI Report states
  const [aiProvider, setAiProvider] = useState<AIProvider>(() => {
    const saved = localStorage.getItem("notlok-ai-provider");
    if (saved === "openrouter" || saved === "gemini") {
      return saved;
    }
    return "openrouter";
  });
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem("notlok-gemini-key") || "";
  });
  const [openrouterApiKey, setOpenrouterApiKey] = useState(() => {
    return localStorage.getItem("notlok-openrouter-key") || "";
  });
  const [openrouterModels, setOpenrouterModels] = useState<{ id: string; name: string }[]>([]);
  const [selectedOpenrouterModel, setSelectedOpenrouterModel] = useState(() => {
    return localStorage.getItem("notlok-openrouter-model") || "";
  });
  const [geminiModels, setGeminiModels] = useState<{ id: string; name: string }[]>([]);
  const [selectedGeminiModel, setSelectedGeminiModel] = useState(() => {
    return localStorage.getItem("notlok-gemini-model") || "";
  });
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(() => {
    return localStorage.getItem("notlok-custom-prompt") || "";
  });
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate>(() => {
    const saved = localStorage.getItem("notlok-prompt-template");
    return (saved as PromptTemplate) || "meetingSummary";
  });
  const [aiReport, setAiReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportError, setReportError] = useState("");
  const [copied, setCopied] = useState(false);

  const t = translations[uiLanguage];

  const getStatusText = (statusKey: string) => {
    switch (statusKey) {
      case "ready": return t.ready;
      case "recording": return t.recording;
      case "stopped": return t.stopped;
      case "processing": return t.processing;
      default: return statusKey;
    }
  };

  useEffect(() => {
    // Load models, settings, and permissions on mount
    async function initializeApp() {
      try {
        // Get app version from Tauri
        const version = await getVersion();
        setAppVersion(version);

        // Load models list (fast)
        await loadModels();

        // Load settings and permissions (fast)
        await loadSettings();
        await checkPermissions();

        // Load audio devices
        await loadAudioDevices();

        // UI is now ready, model loading happens in background
        setIsAppLoading(false);

        // Load saved model in background after UI is ready
        const savedModel = localStorage.getItem("notlok-last-model");
        if (savedModel) {
          autoLoadSavedModel(savedModel); // Runs in background
        }

        // Check for updates (silent, in background)
        setTimeout(() => {
          checkForUpdates(true);
        }, 3000);
      } catch (error) {
        console.error("App initialization error:", error);
        setIsAppLoading(false);
      }
    }

    initializeApp();

    // Listen for download progress
    const unlisten = listen<DownloadProgress>("download-progress", (event) => {
      setDownloadProgress(event.payload.progress);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  // Apply theme and save to localStorage
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }

    localStorage.setItem("notlok-theme", theme);
  }, [theme]);

  // Save UI language to localStorage
  useEffect(() => {
    localStorage.setItem("notlok-ui-language", uiLanguage);
  }, [uiLanguage]);

  // Save AI settings to localStorage
  useEffect(() => {
    localStorage.setItem("notlok-ai-provider", aiProvider);
  }, [aiProvider]);

  useEffect(() => {
    localStorage.setItem("notlok-gemini-key", geminiApiKey);
  }, [geminiApiKey]);

  useEffect(() => {
    localStorage.setItem("notlok-openrouter-key", openrouterApiKey);
  }, [openrouterApiKey]);

  useEffect(() => {
    localStorage.setItem("notlok-openrouter-model", selectedOpenrouterModel);
  }, [selectedOpenrouterModel]);

  useEffect(() => {
    localStorage.setItem("notlok-gemini-model", selectedGeminiModel);
  }, [selectedGeminiModel]);

  useEffect(() => {
    localStorage.setItem("notlok-custom-prompt", customPrompt);
  }, [customPrompt]);

  // Auto-fetch OpenRouter models when API key changes
  useEffect(() => {
    if (!openrouterApiKey.trim()) {
      setOpenrouterModels([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsFetchingModels(true);
      try {
        const res = await fetch("https://openrouter.ai/api/v1/models", {
          headers: { "Authorization": `Bearer ${openrouterApiKey.trim()}` },
        });
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          const models = data.data
            .filter((m: any) => m.id && m.name)
            .map((m: any) => ({ id: m.id, name: m.name }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
          setOpenrouterModels(models);
          if (!selectedOpenrouterModel && models.length > 0) {
            const def = models.find((m: any) => m.id.includes("gemini-2.0-flash")) || models[0];
            setSelectedOpenrouterModel(def.id);
          }
        }
      } catch {
        setOpenrouterModels([]);
      } finally {
        setIsFetchingModels(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [openrouterApiKey]);

  // Auto-fetch Gemini models when API key changes
  useEffect(() => {
    if (!geminiApiKey.trim()) {
      setGeminiModels([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsFetchingModels(true);
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey.trim()}`
        );
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          const models = data.models
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => ({
              id: m.name.replace("models/", ""),
              name: m.displayName || m.name,
            }));
          setGeminiModels(models);
          if (!selectedGeminiModel && models.length > 0) {
            const def = models.find((m: any) => m.id.includes("gemini-2.0-flash")) || models[0];
            setSelectedGeminiModel(def.id);
          }
        }
      } catch {
        setGeminiModels([]);
      } finally {
        setIsFetchingModels(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [geminiApiKey]);

  useEffect(() => {
    localStorage.setItem("notlok-prompt-template", promptTemplate);
  }, [promptTemplate]);

  function getPromptText(): string {
    switch (promptTemplate) {
      case "meetingNotes":
        return t.meetingNotesPrompt;
      case "meetingSummary":
        return t.meetingSummaryPrompt;
      case "actionItems":
        return t.actionItemsPrompt;
      case "decisionLog":
        return t.decisionLogPrompt;
      case "custom":
        return customPrompt.trim() || t.meetingSummaryPrompt;
      default:
        return t.meetingSummaryPrompt;
    }
  }

  async function generateAIReport() {
    if (!transcript.trim()) {
      setReportError(t.noTranscript);
      return;
    }

    setIsGenerating(true);
    setReportError("");
    setAiReport("");

    const promptText = getPromptText();
    const fullPrompt = `${promptText}\n\n--- TRANSCRIPT ---\n${transcript}\n--- END TRANSCRIPT ---`;

    logger.log('=== AI Report Generation ===');
    logger.log('Template:', promptTemplate);
    logger.log('Custom prompt:', customPrompt.trim() || '(empty)');
    logger.log('Selected prompt text:', promptText.substring(0, 100) + '...');
    logger.log('Transcript length:', transcript.length);
    logger.log('Full prompt length:', fullPrompt.length);
    logger.log('============================');

    try {
      if (aiProvider === "gemini") {
        // Use Gemini API
        if (!geminiApiKey.trim()) {
          setReportError(t.enterGeminiKey);
          setIsGenerating(false);
          return;
        }

        const geminiModel = selectedGeminiModel || "gemini-2.0-flash";
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
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
          // Save to most recent history item
          if (recordingHistory.length > 0) {
            updateHistoryWithReport(recordingHistory[0].id, report);
          }
        } else {
          setReportError(data.error?.message || t.reportError);
        }
      } else {
        // OpenRouter API
        if (!openrouterApiKey.trim()) {
          setReportError(t.enterOpenRouterKey);
          setIsGenerating(false);
          return;
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openrouterApiKey.trim()}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://notlok.app",
            "X-Title": "Notlok",
          },
          body: JSON.stringify({
            model: selectedOpenrouterModel || "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: fullPrompt }],
          }),
        });

        const data = await response.json();

        if (data.choices?.[0]?.message?.content) {
          const report = data.choices[0].message.content;
          setAiReport(report);
          // Save to most recent history item
          if (recordingHistory.length > 0) {
            updateHistoryWithReport(recordingHistory[0].id, report);
          }
        } else {
          setReportError(data.error?.message || t.reportError);
        }
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

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  async function loadModels() {
    try {
      const modelList = await invoke<ModelInfo[]>("list_models");
      setModels(modelList);

      // Check for saved model in localStorage
      const savedModel = localStorage.getItem("notlok-last-model");

      if (savedModel && modelList.some(m => m.id === savedModel)) {
        setSelectedModel(savedModel);
        // Don't auto-load here, it will be called from initializeApp
      } else if (modelList.length > 0 && !selectedModel) {
        setSelectedModel(modelList[0].id);
      }
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  }

  async function autoLoadSavedModel(modelId: string) {
    // Run completely in background without blocking UI
    setTimeout(async () => {
      try {
        const isDownloaded = await invoke<boolean>("is_model_downloaded", { modelId });
        if (isDownloaded) {
          // Show loading status but don't block UI
          setStatus(`${modelId} ${t.modelLoading}`);
          setIsModelLoading(true);

          // Model loading happens in background (Rust async)
          await invoke<string>("load_model", { modelId });

          setCurrentModel(modelId);
          setIsModelLoading(false);
          // Translate the status message
          const translatedStatus = `${t.modelLoaded} ${modelId}`;
          setStatus(translatedStatus);
        }
      } catch (error) {
        console.error("Failed to auto-load model:", error);
        setStatus(`${t.error} ${error}`);
        setIsModelLoading(false);
      }
    }, 500); // Small delay to ensure UI is fully rendered first
  }

  async function loadSettings() {
    try {
      const [model, lang] = await invoke<[string | null, string]>("get_current_settings");
      if (model) setCurrentModel(model);
      setTranscriptionLanguage(lang);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async function checkPermissions() {
    try {
      const status = await invoke<PermissionStatus>("check_permissions");
      setPermissions(status);
    } catch (error) {
      console.error("Failed to check permissions:", error);
    }
  }

  async function loadAudioDevices() {
    try {
      const inputs = await invoke<AudioDevice[]>("list_audio_input_devices");
      const outputs = await invoke<AudioDevice[]>("list_audio_output_devices");

      setInputDevices(inputs);
      setOutputDevices(outputs);

      // Set default devices if none selected
      if (selectedInputDevice === "default" && inputs.length > 0) {
        const defaultInput = inputs.find(d => d.is_default) || inputs[0];
        setSelectedInputDevice(defaultInput.id);
      }

      if (selectedOutputDevice === "default" && outputs.length > 0) {
        const defaultOutput = outputs.find(d => d.is_default) || outputs[0];
        setSelectedOutputDevice(defaultOutput.id);
      }
    } catch (error) {
      console.error("Failed to load audio devices:", error);
    }
  }

  async function handleInputDeviceChange(deviceId: string) {
    setSelectedInputDevice(deviceId);
    localStorage.setItem("notlok-input-device", deviceId);
    try {
      await invoke("set_input_device", { deviceId: deviceId === "default" ? null : deviceId });
    } catch (error) {
      console.error("Failed to set input device:", error);
    }
  }

  async function handleOutputDeviceChange(deviceId: string) {
    setSelectedOutputDevice(deviceId);
    localStorage.setItem("notlok-output-device", deviceId);
    // Output device setting will be handled in the audio capture
  }

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

  async function checkForUpdates(silent = false) {
    if (!silent) setIsCheckingUpdate(true);

    try {
      logger.log('Checking for updates...', { version: appVersion, silent });

      // Fetch general version info (includes changelog)
      const response = await fetch(
        `https://notlok.app/api/version`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      logger.log('Update check response:', response.status, response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.log('Update info received:', data);
      logger.log('Changelog from API:', data.changelog);

      // Compare versions properly
      const currentVersion = appVersion;
      const latestVersion = data.current_version;
      const versionComparison = compareVersions(latestVersion, currentVersion);
      const updateAvailable = versionComparison > 0; // Only true if latest > current
      const isSupported = true; // Assuming all versions are supported

      const updateInfo: UpdateInfo = {
        status: data.status,
        user_version: currentVersion,
        current_version: latestVersion,
        minimum_version: data.minimum_version,
        is_up_to_date: !updateAvailable,
        is_supported: isSupported,
        update_available: updateAvailable,
        update_required: data.force_update || false,
        force_update: data.force_update || false,
        update_message: data.update_message,
        download_url: data.download_url,
        changelog: data.changelog,
      };

      logger.log('Processed update info:', updateInfo);
      logger.log('Update available:', updateInfo.update_available);
      logger.log('Changelog length:', updateInfo.changelog?.length || 0);

      setUpdateInfo(updateInfo);

      // Show dialog if update available or required
      if (updateInfo.update_available || updateInfo.force_update) {
        logger.log('Update available, showing dialog');
        setShowUpdateDialog(true);
      } else if (!silent) {
        // Manual check - show success dialog
        logger.log('No update available, showing success dialog');
        setShowUpToDateDialog(true);
      }

      // If force update, show critical warning
      if (updateInfo.force_update) {
        setTimeout(() => {
          const message = uiLanguage === 'tr'
            ? `${t.forceUpdateMessage}\n\nMevcut Surum: v${updateInfo.user_version}\nMinimum Surum: v${updateInfo.minimum_version}`
            : `${t.forceUpdateMessage}\n\nCurrent Version: v${updateInfo.user_version}\nMinimum Version: v${updateInfo.minimum_version}`;
          alert(message);
        }, 500);
      }

    } catch (error) {
      console.error('Update check error:', error);
      if (!silent) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const message = uiLanguage === 'tr'
          ? `Guncelleme kontrolu basarisiz.\n\nHata: ${errorMessage}\n\nInternet baglantinizi kontrol edin.`
          : `Update check failed.\n\nError: ${errorMessage}\n\nPlease check your internet connection.`;
        alert(message);
      }
    } finally {
      if (!silent) setIsCheckingUpdate(false);
    }
  }

  const openDownloadUrl = () => {
    if (updateInfo?.download_url && updateInfo.download_url.trim()) {
      window.open(updateInfo.download_url, '_blank');
    } else {
      window.open('https://notlok.app', '_blank');
    }
  };

  const hasValidDownloadUrl = () => {
    return updateInfo?.download_url && updateInfo.download_url.trim() !== '';
  };

  async function requestScreenPermission() {
    try {
      await invoke("request_screen_permission");
      // Re-check after a short delay
      setTimeout(checkPermissions, 500);
    } catch (error) {
      console.error("Failed to request screen permission:", error);
    }
  }

  async function openScreenPreferences() {
    try {
      await invoke("open_system_preferences");
    } catch (error) {
      console.error("Failed to open preferences:", error);
    }
  }

  async function openMicrophonePreferences() {
    try {
      await invoke("open_microphone_preferences");
    } catch (error) {
      console.error("Failed to open preferences:", error);
    }
  }

  async function handleDownloadModel() {
    if (!selectedModel) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setStatus(`${selectedModel} ${t.downloading}`);

    try {
      const result = await invoke<string>("download_model", { modelId: selectedModel });
      setStatus(result);
      await loadModels(); // Refresh list
    } catch (error) {
      setStatus(`${t.error} ${error}`);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  }

  async function handleLoadModel() {
    if (!selectedModel) return;

    setIsModelLoading(true);
    setStatus(`${selectedModel} ${t.modelLoading}`);
    try {
      await invoke<string>("load_model", { modelId: selectedModel });
      setCurrentModel(selectedModel);
      // Translate the status message
      const translatedStatus = `${t.modelLoaded} ${selectedModel}`;
      setStatus(translatedStatus);
      // Save the loaded model to localStorage
      localStorage.setItem("notlok-last-model", selectedModel);
    } catch (error) {
      setStatus(`${t.error} ${error}`);
    } finally {
      setIsModelLoading(false);
    }
  }

  async function handleTranscriptionLanguageChange(newLang: string) {
    try {
      await invoke("set_language", { language: newLang });
      setTranscriptionLanguage(newLang);
    } catch (error) {
      console.error("Failed to set language:", error);
    }
  }

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
        } catch (error) {
          console.error("Error getting recording duration:", error);
        }
      }, 100); // Update every 100ms for smooth display

      // Store interval ID to clear on stop
      (window as any).recordingTimerInterval = timerInterval;
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error}`);
    }
  }

  async function stopRecording() {
    if (isStopping) return; // Prevent multiple clicks

    try {
      setIsStopping(true);
      setIsRecording(false);

      // Clear recording timer
      if ((window as any).recordingTimerInterval) {
        clearInterval((window as any).recordingTimerInterval);
        (window as any).recordingTimerInterval = null;
      }
      setRecordingDuration(0);

      // Stop audio recording immediately (fast)
      await invoke("stop_recording_only");

      // Release UI - transcription will run in background
      setIsStopping(false);
      setStatus("processing");

      // Start transcription in background
      setTimeout(async () => {
        try {
          const result = await invoke<string>("transcribe_audio");

          setStatus("stopped");
          setTranscript(result);

          // Save to history
          if (result && result.trim()) {
            const newRecord: RecordingHistory = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              transcript: result,
              aiReport: "",
              model: currentModel || "",
              language: transcriptionLanguage,
            };
            const updatedHistory = [newRecord, ...recordingHistory];
            setRecordingHistory(updatedHistory);
            localStorage.setItem("notlok-history", JSON.stringify(updatedHistory));
          }
        } catch (error) {
          console.error(error);
          setStatus(`${t.error} ${error}`);
        }

        setRecordingStartTime(null);
      }, 100);

    } catch (error) {
      console.error(error);
      setStatus(`${t.error} ${error}`);
      setIsStopping(false);
    }
  }

  // Update history item with AI report
  function updateHistoryWithReport(recordId: string, report: string) {
    const updatedHistory = recordingHistory.map(item =>
      item.id === recordId ? { ...item, aiReport: report } : item
    );
    setRecordingHistory(updatedHistory);
    localStorage.setItem("notlok-history", JSON.stringify(updatedHistory));
  }

  function deleteHistoryItem(id: string) {
    const updatedHistory = recordingHistory.filter(item => item.id !== id);
    setRecordingHistory(updatedHistory);
    localStorage.setItem("notlok-history", JSON.stringify(updatedHistory));
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem(null);
    }
  }

  function clearHistory() {
    if (window.confirm(t.confirmClear)) {
      setRecordingHistory([]);
      localStorage.removeItem("notlok-history");
      setSelectedHistoryItem(null);
    }
  }

  // Show loading screen only during initial app load
  if (isAppLoading) {
    return (
      <main className="loading-container">
        <div className="header-logo">
          <img src="/icon.png" alt="Notlok" className="app-logo" />
          <h1>{t.title}</h1>
        </div>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>{t.loading}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      {/* Up to Date Dialog */}
      {showUpToDateDialog && updateInfo && (
        <div className="update-overlay" onClick={() => setShowUpToDateDialog(false)}>
          <div className="update-dialog up-to-date" onClick={(e) => e.stopPropagation()}>
            <h2>{uiLanguage === 'tr' ? 'Uygulamaniz Guncel!' : 'You\'re Up to Date!'}</h2>
            <div className="update-versions">
              <div className="update-version-row">
                <span>{t.currentVersion}:</span>
                <strong className="highlight">v{updateInfo.user_version}</strong>
              </div>
            </div>
            <p className="update-message success">
              {uiLanguage === 'tr'
                ? 'En son surumu kullaniyorsunuz. Harika!'
                : 'You are using the latest version. Great!'}
            </p>
            <div className="update-actions">
              <button
                onClick={() => setShowUpToDateDialog(false)}
                className="btn start"
              >
                {uiLanguage === 'tr' ? 'Tamam' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Dialog */}
      {showUpdateDialog && updateInfo && (updateInfo.update_available || updateInfo.force_update) && (
        <div className="update-overlay">
          <div className="update-dialog">
            <h2>
              {updateInfo.force_update
                ? (uiLanguage === 'tr' ? 'Guncelleme Gerekli!' : 'Update Required!')
                : (uiLanguage === 'tr' ? 'Guncelleme Mevcut!' : 'Update Available!')
              }
            </h2>
            <div className="update-versions">
              <div className="update-version-row">
                <span>{t.currentVersion}:</span>
                <strong>v{updateInfo.user_version}</strong>
              </div>
              <div className="update-version-row">
                <span>{t.latestVersion}:</span>
                <strong className="highlight">v{updateInfo.current_version}</strong>
              </div>
            </div>

            {updateInfo.update_message && (
              <p className="update-message">{updateInfo.update_message}</p>
            )}

            {updateInfo.changelog && (
              <div className="update-changelog">
                <h4>{uiLanguage === 'tr' ? 'Degisiklikler:' : 'What\'s New:'}</h4>
                <p>{updateInfo.changelog}</p>
              </div>
            )}

            <div className="update-actions">
              {hasValidDownloadUrl() && (
                <button
                  onClick={openDownloadUrl}
                  className="btn start"
                >
                  {t.downloadUpdate}
                </button>
              )}
              {!updateInfo.force_update && (
                <button
                  onClick={() => setShowUpdateDialog(false)}
                  className="btn secondary"
                >
                  {uiLanguage === 'tr' ? 'Simdi Degil' : 'Not Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="header-logo">
        <img src="/icon.png" alt="Notlok" className="app-logo" />
        <h1>{t.title}</h1>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "main" ? "active" : ""}`}
          onClick={() => setActiveTab("main")}
        >
          {t.main}
        </button>
        <button
          className={`tab ${activeTab === "aireport" ? "active" : ""}`}
          onClick={() => setActiveTab("aireport")}
        >
          {t.aiReportTab}
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("history");
            setSelectedHistoryItem(null);
          }}
        >
          {t.history}
        </button>
        <button
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          {t.settings}
        </button>
      </div>

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
              <button
                onClick={handleDownloadModel}
                disabled={isDownloading || isRecording}
                className="btn secondary"
              >
                {isDownloading ? `${t.downloading}... ${downloadProgress?.toFixed(0)}%` : t.download}
              </button>
              <button
                onClick={handleLoadModel}
                disabled={isDownloading || isRecording}
                className="btn secondary"
              >
                {t.load}
              </button>
            </div>

            {downloadProgress !== null && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            )}

            {currentModel && !isModelLoading && (
              <div className="current-model">
                {t.activeModel}: <strong>{currentModel}</strong>
              </div>
            )}

            {isModelLoading && (
              <div className="model-loading-indicator">
                <div className="small-spinner"></div>
                <span>{t.loadingModel}</span>
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
              <button
                onClick={stopRecording}
                className="btn stop"
                disabled={isStopping}
              >
                {isStopping ? t.stoppingRecording : t.stopRecording}
              </button>
            )}

            {/* Recording Timer */}
            {isRecording && (
              <div className="recording-timer">
                <span className="timer-label">{Math.floor(recordingDuration / 60)}:{String(Math.floor(recordingDuration % 60)).padStart(2, '0')}</span>
              </div>
            )}
          </div>

          {(isStopping || status === "processing") && (
            <div className="loading-screen" style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '8px', marginTop: '1rem' }}>
              <div className="loading-spinner"></div>
              <p>{status === "processing" ? t.processing : t.stoppingRecording}</p>
              {status === "processing" && (
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>
                  {uiLanguage === 'tr'
                    ? 'Bu islem birkac dakika surebilir. Uygulama yanit veriyor.'
                    : 'This may take a few minutes. The app is still responsive.'}
                </p>
              )}
            </div>
          )}

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
                    // Scroll to AI Report tab content
                    setTimeout(() => {
                      const aiReportSection = document.querySelector('.settings-panel');
                      aiReportSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="btn secondary"
                >
                  {uiLanguage === 'tr' ? 'AI Rapor Olustur' : 'Generate AI Report'}
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={transcript}
              placeholder={t.transcriptPlaceholder}
            />
          </div>

          {/* Footer */}
          <div className="app-footer">
            <div className="footer-links">
              <a
                href="https://notlok.app"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                notlok.app
              </a>
              <span className="footer-separator">•</span>
              <span className="footer-powered">
                Powered by{' '}
                <a
                  href="https://ssilistre.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link powered"
                >
                  ssilistre.dev
                </a>
              </span>
            </div>
          </div>
        </>
      )}

      {activeTab === "aireport" && (
        <>
          <div className="settings-panel">
            <h3>{t.aiReportTab}</h3>

            <div className="setting-group">
              <label>{t.aiProvider}:</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as AIProvider)}
                disabled={isGenerating}
              >
                <option value="openrouter">{t.openrouterAI}</option>
                <option value="gemini">{t.geminiAI}</option>
              </select>
            </div>

            {aiProvider === "openrouter" && (
              <>
                <div className="setting-group">
                  <label>{t.openrouterApiKey}:</label>
                  <input
                    type="password"
                    value={openrouterApiKey}
                    onChange={(e) => setOpenrouterApiKey(e.target.value)}
                    placeholder={t.enterOpenRouterKey}
                    className="api-key-input"
                    style={{ flex: 1 }}
                    disabled={isGenerating}
                  />
                </div>
                <div className="setting-group">
                  <label>{t.selectModel}:</label>
                  {isFetchingModels ? (
                    <span style={{ opacity: 0.6, fontSize: "0.9rem" }}>{t.fetchingModels}</span>
                  ) : openrouterModels.length > 0 ? (
                    <select
                      value={selectedOpenrouterModel}
                      onChange={(e) => setSelectedOpenrouterModel(e.target.value)}
                      disabled={isGenerating}
                    >
                      {openrouterModels.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ opacity: 0.5, fontSize: "0.9rem" }}>
                      {openrouterApiKey.trim() ? t.noModelsFound : t.enterKeyFirst}
                    </span>
                  )}
                </div>
              </>
            )}

            {aiProvider === "gemini" && (
              <>
                <div className="setting-group">
                  <label>{t.geminiApiKey}:</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder={t.enterGeminiKey}
                    className="api-key-input"
                    style={{ flex: 1 }}
                    disabled={isGenerating}
                  />
                </div>
                <div className="setting-group">
                  <label>{t.selectModel}:</label>
                  {isFetchingModels ? (
                    <span style={{ opacity: 0.6, fontSize: "0.9rem" }}>{t.fetchingModels}</span>
                  ) : geminiModels.length > 0 ? (
                    <select
                      value={selectedGeminiModel}
                      onChange={(e) => setSelectedGeminiModel(e.target.value)}
                      disabled={isGenerating}
                    >
                      {geminiModels.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ opacity: 0.5, fontSize: "0.9rem" }}>
                      {geminiApiKey.trim() ? t.noModelsFound : t.enterKeyFirst}
                    </span>
                  )}
                </div>
              </>
            )}

            <div className="setting-group">
              <label>{t.promptTemplate}:</label>
              <select
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value as PromptTemplate)}
                disabled={isGenerating}
              >
                <option value="meetingSummary">{t.meetingSummary}</option>
                <option value="meetingNotes">{t.meetingNotes}</option>
                <option value="actionItems">{t.actionItems}</option>
                <option value="decisionLog">{t.decisionLog}</option>
                <option value="custom">{t.customPromptOption}</option>
              </select>
            </div>

            {promptTemplate === "custom" && (
              <div className="prompt-group">
                <label>{t.customPrompt}:</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t.defaultPrompt}
                  className="prompt-input"
                  disabled={isGenerating}
                  rows={3}
                />
              </div>
            )}
          </div>

          <div className="report-actions">
            <button
              onClick={generateAIReport}
              disabled={isGenerating || !transcript.trim()}
              className="btn start"
            >
              {isGenerating ? t.generating : t.generateReport}
            </button>
          </div>

          {reportError && (
            <div className="license-error">{reportError}</div>
          )}

          {aiReport && (
            <div className="report-result">
              <div className="report-header">
                <h3>{t.reportResult}</h3>
                <button
                  onClick={() => copyToClipboard(aiReport)}
                  className="btn small"
                >
                  {copied ? t.copied : t.copyReport}
                </button>
              </div>
              <div className="report-content">
                {aiReport}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "settings" && (
        <>
          <div className="settings-panel">
            <h3>{t.settings}</h3>

            <div className="setting-group">
              <label>{t.uiLanguage}:</label>
              <select
                value={uiLanguage}
                onChange={(e) => setUiLanguage(e.target.value as Language)}
              >
                <option value="tr">{t.turkish}</option>
                <option value="en">{t.english}</option>
              </select>
            </div>

            <div className="setting-group">
              <label>{t.theme}:</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
              >
                <option value="system">{t.system}</option>
                <option value="light">{t.light}</option>
                <option value="dark">{t.dark}</option>
              </select>
            </div>

            <div className="setting-group">
              <label>{t.transcriptionLanguage}:</label>
              <select
                value={transcriptionLanguage}
                onChange={(e) => handleTranscriptionLanguageChange(e.target.value)}
                disabled={isRecording}
              >
                <option value="tr">{t.turkish}</option>
                <option value="en">{t.english}</option>
                <option value="auto">{t.auto}</option>
              </select>
            </div>
          </div>

          <div className="settings-panel">
            <h3>{t.version}</h3>

            <div className="version-info">
              <div className="version-item">
                <span className="version-label">{t.currentVersion}:</span>
                <span className="version-value">v{appVersion}</span>
              </div>

              {updateInfo && updateInfo.update_available && (
                <div className="version-item">
                  <span className="version-label">{t.latestVersion}:</span>
                  <span className="version-value update-badge">v{updateInfo.current_version}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => checkForUpdates(false)}
              className="btn small"
              disabled={isCheckingUpdate}
            >
              {isCheckingUpdate ? t.updateChecking : t.checkForUpdates}
            </button>

            {updateInfo && updateInfo.update_available && hasValidDownloadUrl() && (
              <button
                onClick={openDownloadUrl}
                className="btn start"
                style={{ marginTop: '0.5rem' }}
              >
                {t.downloadUpdate}
              </button>
            )}

            {updateInfo && updateInfo.update_available && updateInfo.changelog && updateInfo.changelog.trim() && (
              <div className="update-changelog-preview">
                <h4>{uiLanguage === 'tr' ? 'Degisiklikler:' : 'What\'s New:'}</h4>
                <p>{updateInfo.changelog}</p>
              </div>
            )}
          </div>

          <div className="settings-panel">
            <h3>{t.audioDevices}</h3>

            <div className="setting-group">
              <label>{t.inputDevice} ({t.microphone}):</label>
              <select
                value={selectedInputDevice}
                onChange={(e) => handleInputDeviceChange(e.target.value)}
                disabled={isRecording}
              >
                <option value="default">{t.defaultDevice}</option>
                {inputDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} {device.is_default ? `(${t.defaultDevice})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-group">
              <label>{t.outputDevice} ({t.screenRecording}):</label>
              <select
                value={selectedOutputDevice}
                onChange={(e) => handleOutputDeviceChange(e.target.value)}
                disabled={isRecording}
              >
                <option value="default">{t.defaultDevice}</option>
                {outputDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} {device.is_default ? `(${t.defaultDevice})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={loadAudioDevices} className="btn small" disabled={isRecording}>
              {t.refreshDevices}
            </button>
          </div>

          {permissions && (
            <div className="settings-panel">
              <h3>{t.permissions}</h3>
              <div className="permission-item">
                <span>{t.screenRecording}: </span>
                {permissions.screen_recording ? (
                  <span className="permission-granted">{t.granted}</span>
                ) : (
                  <>
                    <span className="permission-denied">{t.denied}</span>
                    <button onClick={requestScreenPermission} className="btn small">
                      {t.requestPermission}
                    </button>
                    <button onClick={openScreenPreferences} className="btn small secondary">
                      {t.openSettings}
                    </button>
                  </>
                )}
              </div>
              <div className="permission-item">
                <span>{t.microphone}: </span>
                {permissions.microphone === "granted" ? (
                  <span className="permission-granted">{t.granted}</span>
                ) : permissions.microphone === "not_determined" ? (
                  <>
                    <span className="permission-pending">? {t.notDetermined}</span>
                    <button onClick={openMicrophonePreferences} className="btn small secondary">
                      {t.openSettings}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="permission-denied">{t.denied}</span>
                    <button onClick={openMicrophonePreferences} className="btn small secondary">
                      {t.openSettings}
                    </button>
                  </>
                )}
              </div>
              <button onClick={checkPermissions} className="btn small">
                {t.refresh}
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === "history" && (
        <>
          {selectedHistoryItem ? (
            <div className="settings-panel">
              <div className="history-detail-header">
                <button onClick={() => setSelectedHistoryItem(null)} className="btn small">
                  {t.backToList}
                </button>
                <span className="history-date">
                  {new Date(selectedHistoryItem.date).toLocaleString()}
                </span>
              </div>

              <div className="history-meta">
                <span>{t.model}: {selectedHistoryItem.model || "-"}</span>
                <span>{t.language}: {selectedHistoryItem.language}</span>
              </div>

              <div className="history-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0 }}>{t.transcript}</h4>
                  {!selectedHistoryItem.aiReport && (
                    <button
                      onClick={async () => {
                        // Set transcript and generate report
                        setTranscript(selectedHistoryItem.transcript);
                        setActiveTab('aireport');
                        // Auto-generate report
                        setTimeout(() => {
                          const generateBtn = document.querySelector('.settings-panel button[disabled="false"]') as HTMLButtonElement;
                          if (generateBtn && generateBtn.textContent?.includes('Rapor Oluştur')) {
                            generateBtn.click();
                          }
                        }, 200);
                      }}
                      className="btn small ai-report-btn-small"
                    >
                      {uiLanguage === 'tr' ? 'Rapor Olustur' : 'Generate Report'}
                    </button>
                  )}
                </div>
                <div className="history-content">
                  {selectedHistoryItem.transcript}
                </div>
              </div>

              {selectedHistoryItem.aiReport && (
                <div className="history-section">
                  <h4>{t.aiReport}</h4>
                  <div className="history-content">
                    {selectedHistoryItem.aiReport}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="settings-panel">
              <div className="history-header">
                <h3>{t.history}</h3>
                {recordingHistory.length > 0 && (
                  <button onClick={clearHistory} className="btn small secondary">
                    {t.clearHistory}
                  </button>
                )}
              </div>

              {recordingHistory.length === 0 ? (
                <p className="no-history">{t.noHistory}</p>
              ) : (
                <div className="history-list">
                  {recordingHistory.map((item) => (
                    <div key={item.id} className="history-item">
                      <div className="history-item-info">
                        <span className="history-item-date">
                          {new Date(item.date).toLocaleString()}
                        </span>
                        <span className="history-item-meta">
                          {item.model || "-"} | {item.language}
                        </span>
                        <span className="history-item-preview">
                          {item.transcript.substring(0, 100)}...
                        </span>
                        {item.aiReport && (
                          <span className="history-has-report">AI Rapor</span>
                        )}
                      </div>
                      <div className="history-item-actions">
                        <button
                          onClick={() => setSelectedHistoryItem(item)}
                          className="btn small"
                        >
                          {t.viewRecord}
                        </button>
                        {!item.aiReport && (
                          <button
                            onClick={() => {
                              // Set transcript and navigate to AI Report
                              setTranscript(item.transcript);
                              setActiveTab('aireport');
                            }}
                            className="btn small ai-report-btn-small"
                          >
                            {uiLanguage === 'tr' ? 'Rapor' : 'Report'}
                          </button>
                        )}
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="btn small secondary"
                        >
                          {t.deleteRecord}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default App;
