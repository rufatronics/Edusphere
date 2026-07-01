'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BUK_FACULTIES } from '@/utils/constants'
import {
  Search,
  Upload,
  FileText,
  Download,
  Eye,
  Filter,
  Bot,
  ChevronLeft,
  Grid,
  List,
  Sparkles,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

export default function ResourceHub() {
  const [resources, setResources] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchResources()
  }, [search, department])

  const fetchResources = async () => {
    setLoading(true)
    let query = supabase
      .from('resources')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,course_code.ilike.%${search}%`)
    }

    if (department) {
      query = query.eq('department', department)
    }

    const { data, error } = await query
    if (error) console.error('Error fetching resources:', error)
    else setResources(data || [])
    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const filePath = `resources/${department || 'General'}/${fileName}`

    try {
      // 1. Upload to Hugging Face directly via browser
      const hfResponse = await fetch(
        `https://huggingface.co/api/datasets/${process.env.NEXT_PUBLIC_HF_DATASET}/upload/main/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN}`,
            'Content-Type': file.type,
          },
          body: file,
        }
      )

      const hfData = await hfResponse.json()

      if (!hfResponse.ok) {
        throw new Error(hfData.message || hfData.error || 'Hugging Face upload failed')
      }

      // Verify that we got a commit/path back from HF to be absolutely certain
      if (!hfData.path && !hfData.url) {
        throw new Error('Hugging Face accepted the file but did not return a valid path.')
      }

      // 2. Generate the direct download URL (resolve URL)
      const publicUrl = `https://huggingface.co/datasets/${process.env.NEXT_PUBLIC_HF_DATASET}/resolve/main/${filePath}`

      // 3. Store metadata in Supabase
      const { error: dbError } = await supabase.from('resources').insert([
        {
          uploader_id: user.id,
          title: file.name,
          file_url: publicUrl,
          file_type: fileExt,
          department: department || 'General',
          storage_provider: 'huggingface',
          hf_path: filePath
        },
      ])

      if (dbError) {
        // Best effort: attempt to delete the orphaned file from HF if Supabase fails
        await fetch(
          `https://huggingface.co/api/datasets/${process.env.NEXT_PUBLIC_HF_DATASET}/delete/main/${filePath}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN}` }
          }
        ).catch(() => console.error('Failed to cleanup orphaned HF file'))

        throw new Error(`Database sync failed: ${dbError.message}. File was removed from storage.`)
      }

      fetchResources()
    } catch (err: any) {
      alert('Upload failed: ' + err.message)
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Area */}
      <div className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 transition-colors">
                <ChevronLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase">Resource Archive</h1>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Verified BUK Database
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  type="text"
                  placeholder="Search MTH101, CSC201..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <label className="bg-emerald-500 text-black px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 cursor-pointer whitespace-nowrap">
                <Upload size={18} />
                <span>{uploading ? 'UPLOADING...' : 'UPLOAD'}</span>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Filters */}
          <aside className="space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter size={12} /> Filter by Faculty
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setDepartment('')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${department === '' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-900'}`}
                >
                  All Departments
                </button>
                {BUK_FACULTIES.slice(0, 10).map(fac => (
                  <button
                    key={fac}
                    onClick={() => setDepartment(fac)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${department === fac ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:bg-zinc-900'}`}
                  >
                    {fac}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
              <Sparkles className="text-emerald-500 mb-4" size={24} />
              <h4 className="text-sm font-black mb-2 uppercase">Can't find a doc?</h4>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mb-4">Our AI can generate mock questions if you provide a topic name or syllabus snippet.</p>
              <Link href="/ai-tutor" className="text-[10px] font-black text-emerald-500 uppercase hover:underline flex items-center gap-1">
                ASK AI TUTOR <ArrowUpRight size={12} />
              </Link>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-black uppercase tracking-tighter">Available Files <span className="text-zinc-600 ml-2">({resources.length})</span></h2>
              <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg">
                <button className="p-1.5 text-zinc-500 hover:text-white"><Grid size={16} /></button>
                <button className="p-1.5 text-zinc-100 bg-zinc-800 rounded-md shadow-sm"><List size={16} /></button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-900 animate-pulse rounded-2xl border border-zinc-800" />)}
              </div>
            ) : resources.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={24} className="text-zinc-700" />
                </div>
                <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">No matching resources found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((res) => (
                  <div key={res.id} className="group bg-zinc-950 border border-zinc-900 p-6 rounded-2xl hover:border-emerald-500/30 transition-all hover:bg-zinc-900/50 relative overflow-hidden">
                    <div className="flex gap-5 items-start relative z-10">
                      <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-emerald-500 border border-zinc-800 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm mb-1 truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{res.title}</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">
                          {res.course_code || 'GEN101'} • {res.department}
                        </p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-600">
                             <Eye size={14} /> {res.views_count}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-600">
                             <Download size={14} /> {res.downloads_count}
                          </div>
                          <Link
                            href={`/ai-tutor?resource=${res.id}`}
                            className="text-[10px] font-black text-blue-400 uppercase flex items-center gap-1 hover:underline"
                          >
                            ASK AI <Bot size={12} />
                          </Link>
                          <a
                            href={res.file_url}
                            target="_blank"
                            className="ml-auto text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 hover:underline"
                          >
                            GET FILE <ArrowUpRight size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[8px] font-black px-2 py-1 bg-emerald-500 text-black rounded uppercase">
                          {res.file_type || 'PDF'}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
