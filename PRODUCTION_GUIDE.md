# 🚀 EduSphere BUK Production Readiness Guide

To make **EduSphere BUK** fully functional and ready for deployment, follow these steps to set up your environment variables and database.

---

## 1. 🔑 Environment Variables
You must replace the placeholder values in your `.env.local` (or your hosting provider's dashboard like Vercel) with real API keys.

### **Supabase Setup**
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings > API**.
3. Copy **Project URL** → Put in `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy **anon (public) key** → Put in `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### **AI Provider Setup**
1. **Groq (Llama 3.3):**
   - Get an API key from [console.groq.com](https://console.groq.com).
   - Put it in `GROQ_API_KEY`.
2. **Gemini (Fallback):**
   - Get an API key from [aistudio.google.com](https://aistudio.google.com).
   - Put it in `GEMINI_API_KEY`.

### **Hugging Face Storage Setup**
1. **Create Dataset:** Create a public dataset at [huggingface.co/new-dataset](https://huggingface.co/new-dataset).
2. **Access Token:** Get a **Write** token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
3. **Environment:**
   - `NEXT_PUBLIC_HF_TOKEN`: Your write token.
   - `NEXT_PUBLIC_HF_DATASET`: Your dataset path (e.g., `username/dataset-name`).

---

## 2. 🗄️ Database Setup (SQL Editor)
Go to your Supabase Dashboard, open the **SQL Editor**, and run the scripts found in `supabase/migrations/`:

1. **Run `20240626000000_initial_schema.sql`**: This creates your `profiles`, `resources`, `messages`, and `groups` tables.
2. **Run `20240626000001_auto_delete.sql`**: This sets up the logic for ephemeral messaging.

---

## 3. 📂 Storage Setup
1. Go to **Storage** in Supabase.
2. Create a new **Public Bucket** named `resources`.
3. Ensure the RLS (Row Level Security) policies allow authenticated users to upload and anyone to read.

---

## 4. 🗑️ Message Auto-Delete Scheduling
The auto-delete logic is in the database, but it needs a "heartbeat" to run.

**Option A: Supabase Cron (Recommended)**
If you have the `pg_cron` extension enabled in Supabase (Settings > Extensions):
```sql
SELECT cron.schedule('cleanup-messages', '0 * * * *', 'SELECT cleanup_expired_messages();');
```
*This runs the cleanup every hour.*

**Option B: Edge Function**
You can create a Supabase Edge Function that calls `cleanup_expired_messages()` and trigger it via a GitHub Action or a cron service (like Upstash or EasyCron).

---

## 5. 🌐 Deployment
The easiest way to deploy is using **Vercel**:
1. Connect your GitHub repository to Vercel.
2. Add all the environment variables mentioned in Step 1.
3. Deploy! The PWA features and Turbopack optimizations are already configured.

---

## 🛠️ Maintenance & Troubleshooting

### **Fixing "Email Rate Limit Exceeded"**
If students see a rate limit error during signup, you must adjust Supabase's default security settings:
1. **Authentication > Settings > Email Auth**: Toggle **OFF** "Confirm email" (Recommended for faster onboarding).
2. **Authentication > Settings > Rate Limits**: Increase the **Max 1 hour** signup limit from `3` to `50+`.

---

## 🚀 Final Launch Checklist
- **RLS Policies:** Always double-check your Supabase RLS policies in production to ensure students can only delete their own resources.
- **AI Limits:** Monitor your Groq usage. If you hit rate limits, the app will automatically switch to Gemini.

**Ready to launch?** 🚀
If you have any questions during setup, refer to the `AGENTS.md` for architectural details.
