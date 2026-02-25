# Notlok Website

Modern, SEO-optimized single-page website for Notlok.

## 🌐 Features

- ✅ **SEO Optimized**: Comprehensive meta tags, Open Graph, Twitter Cards
- ✅ **Bilingual**: Turkish and English support with easy toggle
- ✅ **Responsive**: Works perfectly on all devices
- ✅ **Fast**: Single HTML file, no external dependencies
- ✅ **Accessible**: WCAG compliant, semantic HTML
- ✅ **Modern Design**: Clean, professional Apple-inspired design
- ✅ **Smooth Animations**: Scroll animations, fade-ins, smooth transitions

## 📋 Sections

1. **Hero** - Eye-catching header with CTA buttons
2. **Features** - 6 key features with icons and descriptions
3. **How It Works** - 4-step process guide
4. **Pricing** - Simple pricing card (update price as needed)
5. **FAQ** - 5 common questions in both languages
6. **Footer** - Links, contact, developer info

## 🔧 Customization

### Update Purchase Links

Replace `#` with your actual purchase links:

```html
<!-- Line ~297 (Turkish) -->
<a href="YOUR_LEMON_SQUEEZY_LINK_TR" class="btn btn-primary tr-only">Şimdi Satın Al</a>

<!-- Line ~298 (English) -->
<a href="YOUR_LEMON_SQUEEZY_LINK_EN" class="btn btn-primary en-only">Buy Now</a>

<!-- Line ~534 (Pricing Card Turkish) -->
<a href="YOUR_LEMON_SQUEEZY_LINK_TR" class="btn btn-primary tr-only">Satın Al</a>

<!-- Line ~535 (Pricing Card English) -->
<a href="YOUR_LEMON_SQUEEZY_LINK_EN" class="btn btn-primary en-only">Buy Now</a>
```

### Update Price

Replace `$XX` with actual price (Line ~485):

```html
<span>$49</span>  <!-- or whatever your price is -->
```

### Add Images

1. Create `/website/images/` folder
2. Add these images:
   - `og-image.png` (1200x630px) - For social media sharing
   - `twitter-image.png` (1200x628px) - For Twitter cards
   - `favicon.svg` - Browser icon
   - `apple-touch-icon.png` (180x180px) - iOS icon

3. Update image paths in HTML:
   ```html
   <meta property="og:image" content="https://notlok.app/images/og-image.png">
   <meta property="twitter:image" content="https://notlok.app/images/twitter-image.png">
   <link rel="icon" type="image/svg+xml" href="/images/favicon.svg">
   <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
   ```

## 🚀 Deployment

### Option 1: Vercel (Recommended)
```bash
cd website
vercel --prod
```

### Option 2: Netlify
1. Drag and drop `website` folder to Netlify
2. Done!

### Option 3: GitHub Pages
```bash
git add website/
git commit -m "Add website"
git push origin main
# Enable GitHub Pages in repo settings
```

### Option 4: Custom Server
```bash
# Upload index.html to your server
# Make sure it's served at domain root
```

## 📊 SEO Checklist

- ✅ Meta description (155 characters)
- ✅ Title tag (60 characters)
- ✅ Keywords
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Canonical URL
- ✅ Schema.org structured data
- ✅ Alt text for images (add when you include images)
- ✅ Semantic HTML (h1, h2, nav, section, etc.)
- ✅ Mobile responsive
- ✅ Fast loading
- ✅ HTTPS ready

## 🎨 Color Scheme

```css
--primary: #000000        /* Black */
--accent: #0066FF         /* Blue */
--secondary: #666666      /* Gray */
--success: #10B981        /* Green */
--bg-light: #FFFFFF       /* White */
--bg-gray: #F5F5F7        /* Light Gray */
```

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔍 Google Search Console Setup

1. Add `google-site-verification` meta tag
2. Submit sitemap.xml (create if needed)
3. Monitor indexing status

## 📈 Analytics (Optional)

Add Google Analytics or other tracking:

```html
<!-- Before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-ID');
</script>
```

## 🌍 i18n Expansion

To add more languages:

1. Add language toggle button
2. Add `.{lang}-only` classes
3. Add translations for all text
4. Update `lang` attribute toggle function

## 📝 License

Proprietary - Part of Notlok project

---

**Author**: ssilistre.dev
**Project**: Notlok - AI Destekli Sesli Not Uygulaması
**Website**: https://notlok.app

