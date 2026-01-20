import React, { useEffect, useState } from 'react'
import './index.css'

const App = () => {
  const [files, setFiles] = useState<string[]>([])
  
  useEffect(() => {
    const loadFiles = async () => {
      // 检查 electronAPI 是否存在 (在浏览器环境中可能不存在)
      if (window.electronAPI) {
        try {
          const fileList = await window.electronAPI.fs.readDir('.')
          setFiles(fileList)
        } catch (e) {
          console.error(e)
        }
      }
    }
    loadFiles()
  }, [])

  return (
    <div className="layout">
      {/* Activity Bar */}
      <div className="activity-bar">
        <div className="activity-item active" title="Explorer">📁</div>
        <div className="activity-item" title="Search">🔍</div>
        <div className="activity-item" title="Source Control">code</div>
        <div className="activity-item" title="Extensions">🧩</div>
        <div style={{ flex: 1 }}></div>
        <div className="activity-item" title="Settings">⚙️</div>
      </div>
      
      {/* Side Bar */}
      <div className="side-bar">
        <div className="side-bar-header">EXPLORER</div>
        <div className="file-list">
          {files.length === 0 && <div style={{padding: '10px', fontSize: '12px'}}>No files found or IPC not connected</div>}
          {files.map(file => (
            <div key={file} className="file-item">
              📄 {file}
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="editor-area">
        <div className="tab-bar">
          <div className="tab active">
            <span>Welcome</span>
            <span style={{marginLeft: '10px', cursor: 'pointer'}}>×</span>
          </div>
        </div>
        <div className="editor-content">
          <h1 className="text-3xl font-bold text-blue-500">Welcome to Trae Code</h1>
          <p className="text-gray-400 mt-2">Start by opening a file from the explorer.</p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <span style={{marginRight: 'auto'}}>main*</span>
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
        <span>TypeScript React</span>
        <span>🔔</span>
      </div>
    </div>
  )
}

export default App