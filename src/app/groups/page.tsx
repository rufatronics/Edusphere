'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Plus, Lock, Globe, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function StudyGroups() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('groups')
      .select('*, group_members(count)')

    if (error) console.error(error)
    else setGroups(data || [])
    setLoading(false)
  }

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('groups')
      .insert([
        {
          name: newGroupName,
          description: newGroupDesc,
          is_public: isPublic,
          creator_id: user.id
        }
      ])
      .select()

    if (error) {
      alert(error.message)
    } else {
      // Auto join as creator
      await supabase.from('group_members').insert([
        { group_id: data[0].id, user_id: user.id }
      ])
      setShowCreateModal(false)
      fetchGroups()
    }
  }

  const joinGroup = async (groupId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: user.id }])

    if (error) alert(error.message)
    else fetchGroups()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Study Groups</h1>
            <p className="text-gray-600">Collaborate with fellow BUK students</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Create Group</span>
          </button>
        </header>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading groups...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div key={group.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 text-primary rounded-xl">
                    <Users size={24} />
                  </div>
                  {group.is_public ? (
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <Globe size={14} /> Public
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                      <Lock size={14} /> Private
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{group.name}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{group.description || 'No description provided.'}</p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Users size={14} />
                    <span>{group.group_members?.[0]?.count || 0} members</span>
                  </div>
                  <button
                    onClick={() => joinGroup(group.id)}
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Join & Chat <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Study Group</h2>
              <form onSubmit={createGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded-lg"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. CSC201 Study Group"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded-lg"
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="What is this group about?"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                    />
                    Public
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                    />
                    Private
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
