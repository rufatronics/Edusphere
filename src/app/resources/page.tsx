'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BUK_FACULTIES } from '@/utils/constants'
import { Search, Upload, FileText, Download, Eye } from 'lucide-react'

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

    if (error) {
      console.error('Error fetching resources:', error)
    } else {
      setResources(data || [])
    }
    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error uploading file: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('resources').insert([
      {
        uploader_id: user.id,
        title: file.name,
        file_url: publicUrl,
        file_type: fileExt,
        department: department || 'General',
      },
    ])

    if (dbError) {
      alert('Error saving to database: ' + dbError.message)
    } else {
      fetchResources()
    }
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-primary">Resource Hub</h1>
          <label className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-opacity-90">
            <Upload size={20} />
            <span>{uploading ? 'Uploading...' : 'Upload Resource'}</span>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="MTH101, CSC201..."
                  className="w-full pl-10 p-2 border rounded-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Faculty/Department</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {BUK_FACULTIES.map((fac) => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Resource List */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading resources...</div>
            ) : resources.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No resources found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((res) => (
                  <div key={res.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-green-50 text-primary rounded-lg">
                        <FileText size={24} />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600 uppercase">
                        {res.file_type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{res.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{res.course_code || 'General'} • {res.department}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye size={14} /> {res.views_count}</span>
                        <span className="flex items-center gap-1"><Download size={14} /> {res.downloads_count}</span>
                      </div>
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline"
                      >
                        Download
                      </a>
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
