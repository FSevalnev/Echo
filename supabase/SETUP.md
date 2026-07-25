# Настройка аккаунтов (Supabase)

## 1. Создать проект
1. Зайди на https://supabase.com/dashboard → **New project** (бесплатный тариф).
2. Дождись, пока проект поднимется (1-2 минуты).

## 2. Создать таблицу истории
1. В проекте открой **SQL Editor** → **New query**.
2. Скопируй туда весь файл `supabase/schema.sql` из проекта и нажми **Run**.

## 3. Включить вход через Google
1. В Google Cloud Console (https://console.cloud.google.com/apis/credentials) создай **OAuth client ID** (тип "Web application").
2. В Supabase: **Authentication → Providers → Google** → включи, вставь Client ID и Client Secret из Google.
3. Supabase покажет свой **Callback URL** (вида `https://xxxxx.supabase.co/auth/v1/callback`) — скопируй его и добавь в Google Cloud Console в **Authorized redirect URIs**.
4. В Supabase: **Authentication → URL Configuration → Redirect URLs** — добавь:
   - `http://localhost:3000/auth/callback` (для локальной разработки)
   - `https://твой-домен.vercel.app/auth/callback` (для продакшена, когда задеплоишь)

## 4. Взять ключи
В Supabase: **Project Settings → API** — там будет:
- **Project URL**
- **anon public key**

## 5. Прописать переменные окружения
Локально в `.env.local` (рядом с `GEMINI_API_KEY`) добавь:
```
NEXT_PUBLIC_SUPABASE_URL=твой project url
NEXT_PUBLIC_SUPABASE_ANON_KEY=твой anon key
```
В Vercel: **Project → Settings → Environment Variables** — добавь те же две переменные.

## 6. Установить новые зависимости
В терминале, в папке проекта:
```
npm install
```
(это подтянет `@supabase/supabase-js` и `@supabase/ssr`, которые уже добавлены в `package.json`)

## 7. Задеплоить
```
git add .
git commit -m "Add accounts, progress history, and photo/file upload"
git push
```
Vercel подхватит пуш и передеплоит сайт автоматически. Не забудь добавить те же переменные окружения в Vercel (шаг 5) до пуша, иначе там сборка либо упадёт, либо просто не даст войти.

---

Если Supabase ещё не настроен (переменные пустые), сайт продолжит работать как раньше — гостевой режим, история в localStorage, без аккаунтов. Ничего не сломается, пока не будут добавлены ключи.
