# Appscrip Task – Product Listing Page

A fully functional, responsive Product Listing Page (PLP) built with React.js.

## Features
- Live product data from [FakeStore API](https://fakestoreapi.com/products)
- Search, category filter, price range slider, rating filter
- Sort by: Recommended, Newest, Price ↑↓, Top Rated
- Grid / List view toggle
- Add to Cart with badge counter
- Wishlist toggle
- Toast notifications
- Pagination (8 products/page)
- Shimmer skeleton loading state
- Fully responsive (desktop → tablet → mobile)
- SEO: semantic HTML, meta tags, JSON-LD structured data, alt text

## Tech Stack
- React 18 (Create React App)
- Pure CSS (no Bootstrap / Tailwind)
- Native Fetch API (no Axios)
- Google Fonts: Cormorant Garamond + DM Sans

## Getting Started

### Install dependencies
```bash
npm install
```

### Run locally
```bash
npm start
```
Opens at [http://localhost:3000](http://localhost:3000)

### Build for production
```bash
npm run build
```

### Deploy to Netlify
Drag the `/build` folder to [app.netlify.com](https://app.netlify.com) — done!

## Project Structure
```
appscrip-task/
├── public/
│   └── index.html          # HTML shell with SEO meta tags
├── src/
│   ├── App.js              # Complete single-file PLP component
│   └── index.js            # React entry point
├── .gitignore
├── package.json
├── next.config.js          # Optional – for Next.js usage
└── README.md
```

## Using with Next.js
1. Add `"use client"` as the very first line of `src/App.js`
2. Move `src/App.js` → `src/app/page.js`
3. Run `npm run dev`

## GitHub Repository Name
`Appscrip-task-[Your-Name]`
