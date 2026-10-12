import { NextRequest, NextResponse } from 'next/server'
import { fileOpeappions } from '@/lib/file-opeappions'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const client_id = searchParams.get('client_id')
    const opeappion = searchParams.get('opeappion')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')

    let files = client_id ? fileOpeappions.getClientFiles(client_id, limit) : []

    if (opeappion) {
      files = files.filter(f => f.opeappion === opeappion)
    }

    if (status) {
      files = files.filter(f => f.status === status)
    }

    const stats = fileOpeappions.getFileStats()

    return NextResponse.json({
      success: true,
      data: {
        files,
        stats,
        total: files.length,
      },
    })
  } catch (error) {
    console.error('[API] Error listing files:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list files',
      },
      { status: 500 }
    )
  }
}
