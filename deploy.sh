#!/bin/bash
set -e

echo "🚀 [1/3] Menarik update dari GitHub..."
git pull origin main

echo "📦 [2/3] Sinkronisasi Backend & Database..."
cd backend
npm install --omit=dev
npx prisma generate
npx prisma db push
pm2 restart laundry-backend

echo "⚡ [3/3] Build Frontend Production..."
cd ../frontend
npm install
npm run build

echo "✅ Deploy selesai! Aplikasi Basmalah Wash siap dipakai."

