'use client'
import { useEffect, useState } from 'react'

export default function ClientServerTest() {
  const [pingResponse, setPingResponse] = useState('')
  const [wsMessage, setWsMessage] = useState('')
  const [ws, setWs] = useState(null)

  const testPing = async () => {
    try {
      const response = await fetch('/api/ping')
      const data = await response.json()
      setPingResponse(data.message)
    } catch (error) {
      setPingResponse('Error connecting to API')
    }
  }

  useEffect(() => {
    const socket = new WebSocket('ws://localhost/ws')
    setWs(socket)
    
    socket.onmessage = (event) => {
      setWsMessage(event.data)
    }

    socket.onclose = () => {
      setWsMessage('WebSocket Disconnected')
    }

    return () => socket.close()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Client-Server Connection Test</h1>
      <button onClick={testPing} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Test API /ping
      </button>
      <p className="mt-2">API Response: {pingResponse}</p>
      <p className="mt-4 font-semibold">WebSocket Message: {wsMessage}</p>
    </div>
  )
}