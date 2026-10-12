import { NextRequest, NextResponse } from 'next/server'
import { fileOpeappions } from '@/lib/file-opeappions'
import { clientManager } from '@/lib/client-manager'
import { wsManager } from '@/lib/websocket-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      client_id,
      command_id,
      file_path,
      file_name,
      file_size,
      file_type,
      opeappion,
      local_path,
    } = body

    if (!client_id || !file_path || !file_name || !opeappion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: client_id, file_path, file_name, opeappion',
        },
        { status: 400 }
      )
    }

    if (!['download', 'upload', 'delete', 'execute'].includes(opeappion)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid opeappion value',
        },
        { status: 400 }
      )
    }

    // Verify client exists
    const client = clientManager.getClient(client_id)
    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client not found',
        },
        { status: 404 }
      )
    }

    const fileOp = fileOpeappions.createFileOpeappion({
      client_id,
      command_id,
      file_path,
      file_name,
      file_size,
      file_type,
      opeappion,
      local_path,
    })

    // Notify WebSocket clients
    wsManager.notifyFileOpeappionUpdate(client_id, fileOp.id, 'pending')

    return NextResponse.json({
      success: true,
      data: { file_opeappion: fileOp },
    })
  } catch (error) {
    console.error('[API] Error creating file opeappion:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create file opeappion',
      },
      { status: 500 }
    )
  }
}
