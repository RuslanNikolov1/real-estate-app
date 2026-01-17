# Professional Real Estate Website

A modern, professional real estate website built with Next.js 16, TypeScript, and Supabase.

## 🚀 Features

- **Property Search**: Advanced search with filters for location type, property type, price range, area, rooms, and bathrooms
- **Property Listings**: Browse properties for sale and rent
- **Featured Properties**: Showcase the most viewed properties
- **Client Reviews**: Display customer testimonials
- **Partner Services**: Showcase partner companies
- **Certificates & Memberships**: Display professional certifications
- **Contact Broker**: Online inquiry form
- **Multi-language Support**: Bulgarian (default), English, Russian, German
- **Responsive Design**: Mobile-first, accessible design
- **SEO Optimized**: Dynamic meta tags, JSON-LD schema, sitemap

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: SASS Modules
- **Database**: Supabase
- **File Storage**: Cloudinary
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Rich Text Editor**: Plate
- **Animations**: Framer Motion
- **Icons**: Phosphore Icons
- **Maps**: Mapbox
- **i18n**: react-i18next

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd real-estate-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
/src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── features/              # Feature-based components
│   └── home/             # Homepage feature
├── components/            # Shared components
│   ├── ui/               # UI components (Button, Input, etc.)
│   └── layout/           # Layout components (Header, Footer)
├── lib/                  # Core utilities
│   ├── supabase.ts       # Supabase client
│   ├── cloudinary.ts     # Cloudinary helpers
│   ├── fonts.ts          # Font configuration
│   └── i18n.ts           # i18n configuration
├── hooks/                # Custom React hooks
├── styles/               # Global styles
│   ├── _variables.scss   # SCSS variables
│   └── globals.scss      # Global styles
├── types/                # TypeScript types
└── locales/              # Translation files
    ├── bg/               # Bulgarian
    ├── en/               # English
    ├── ru/               # Russian
    └── de/               # German
```

## 🎨 Design System

### Colors
- **Black**: `#000`
- **White**: `#fff`
- **Light Gray**: `#f4f4f4`
- **Dark Gray**: `#222`
- **Red**: `#e10600`
- **Dark Red**: `#8b0000`

### Fonts
- **Headlines**: Montserrat
- **Body**: Roboto

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📝 TODO

- [ ] Implement property listing pages
- [ ] Create admin panels for properties, reviews, and certificates
- [ ] Add property detail pages
- [ ] Implement favorites/saved properties
- [ ] Add authentication and user dashboard
- [ ] Implement property valuation page
- [ ] Add neighborhood descriptions page
- [ ] Set up Supabase database schema
- [ ] Implement Cloudinary upload functionality
- [ ] Add Mapbox integration for property maps
- [ ] Implement saved searches with notifications
- [ ] Add SEO metadata for all pages
- [ ] Generate sitemap.xml and robots.txt

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
