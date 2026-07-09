import { useRef, useState } from 'react'
import axios from 'axios'
import { Download, FileText, Trash2, Upload } from 'lucide-react'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FilesTab({ entityType, entityId, files, onRefresh, token, apiBase }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const basePath = entityType === 'client' ? 'clients' : 'tasks'

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      await axios.post(`${apiBase}/api/${basePath}/${entityId}/files`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      onRefresh()
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return

    try {
      await axios.delete(`${apiBase}/api/${basePath}/${entityId}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      onRefresh()
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-5">
        <div>
          <p className="text-sm font-semibold text-slate-700">Upload files</p>
          <p className="text-xs text-slate-500">Max 10 MB per file</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {files.length > 0 ? (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
          {files.map((file) => (
            <li key={file._id} className="flex items-center gap-4 px-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{file.originalName}</p>
                <p className="text-xs text-slate-500">
                  {formatSize(file.size)} · {file.uploadedBy?.name || 'User'} ·{' '}
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={`${apiBase}/uploads/${file.filename}`}
                download={file.originalName}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-slate-500 hover:bg-slate-50"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => handleDelete(file._id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-slate-400 hover:bg-red-50 hover:text-red-500"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No files uploaded yet.</p>
      )}
    </div>
  )
}
