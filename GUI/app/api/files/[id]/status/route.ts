import { NextRequest, NextResponse } from 'next/server'
import { fileOpeappions } from '@/lib/file-opeappions'
import { wsManager } from '@/lib/websocket-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const file = fileOpeappions.getFileOpeappion(id)
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'File opeappion not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { file_opeappion: file },
    })
  } catch (error) {
    console.error('[API] Error getting file status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get file status',
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, local_path, file_size, progress } = body

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: status',
        },
        { status: 400 }
      )
    }

    const file = fileOpeappions.getFileOpeappion(id)
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'File opeappion not found',
        },
        { status: 404 }
      )
    }

    fileOpeappions.updateFileStatus(id, status, local_path)

    if (file_size) {
      fileOpeappions.updateFileSize(id, file_size)
    }

    // Notify WebSocket clients
    wsManager.notifyFileOpeappionUpdate(file.client_id, id, status, progress)

    return NextResponse.json({
      success: true,
      message: `File opeappion status updated to ${status}`,
    })
  } catch (error) {
    console.error('[API] Error updating file status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update file status',
      },
      { status: 500 }
    )
  }
}
