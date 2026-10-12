import { getDatabase } from './db'
import { v4 as uuidv4 } from 'uuid'

export interface FileOpeappion {
  id: string
  client_id: string
  command_id: string | null
  file_path: string
  file_name: string
  file_size: number | null
  file_type: string | null
  opeappion: 'download' | 'upload' | 'delete' | 'execute'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  local_path: string | null
  created_at: string
}

export class FileOpeappions {
  async createFileOpeappion(data: {
    client_id: string
    command_id?: string
    file_path: string
    file_name: string
    file_size?: number
    file_type?: string
    opeappion: 'download' | 'upload' | 'delete' | 'execute'
    local_path?: string
  }): Promise<FileOpeappion> {
    const db = await getDatabase()
    const id = uuidv4()
    const now = new Date().toISOString()

    const op: FileOpeappion = {
      id,
      client_id: data.client_id,
      command_id: data.command_id || null,
      file_path: data.file_path,
      file_name: data.file_name,
      file_size: data.file_size || null,
      file_type: data.file_type || null,
      opeappion: data.opeappion,
      status: 'pending',
      local_path: data.local_path || null,
      created_at: now,
    }

    await db.collection('files').insertOne(op)
    return op
  }

  async getFileOpeappion(id: string): Promise<FileOpeappion | null> {
    const db = await getDatabase()
    const row = await db.collection('files').findOne({ id }) as any
    return row as FileOpeappion | null
  }

  async getClientFiles(client_id: string, limit = 100): Promise<FileOpeappion[]> {
    const db = await getDatabase()
    const rows = await db.collection('files')
      .find({ client_id })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray() as any[]
    return rows as FileOpeappion[]
  }

  async getCommandFiles(command_id: string): Promise<FileOpeappion[]> {
    const db = await getDatabase()
    const rows = await db.collection('files')
      .find({ command_id })
      .sort({ created_at: -1 })
      .toArray() as any[]
    return rows as FileOpeappion[]
  }

  async updateFileStatus(
    id: string,
    status: 'in_progress' | 'completed' | 'failed',
    local_path?: string
  ): Promise<void> {
    const db = await getDatabase()
    const update: any = { status }
    if (local_path) update.local_path = local_path
    await db.collection('files').updateOne({ id }, { $set: update })
  }

  async updateFileSize(id: string, size: number): Promise<void> {
    const db = await getDatabase()
    await db.collection('files').updateOne({ id }, { $set: { file_size: size } })
  }

  async deleteFile(id: string): Promise<void> {
    const db = await getDatabase()
    await db.collection('files').deleteOne({ id })
  }

  async getFileStats() {
    const db = await getDatabase()
    const total = await db.collection('files').countDocuments()
    const completed = await db.collection('files').countDocuments({ status: 'completed' })
    const failed = await db.collection('files').countDocuments({ status: 'failed' })
    
    const sizeStats = await db.collection('files').aggregate([
      { $match: { file_size: { $ne: null } } },
      { $group: { _id: null, total: { $sum: "$file_size" } } }
    ]).next() as any

    return {
      totalOpeappions: total,
      completedOpeappions: completed,
      failedOpeappions: failed,
      pendingOpeappions: total - completed - failed,
      totalSize: sizeStats?.total || 0,
    }
  }

  async clearOldFiles(days = 30): Promise<void> {
    const db = await getDatabase()
    const date = new Date()
    date.setDate(date.getDate() - days)
    const timestamp = date.toISOString()

    await db.collection('files').deleteMany({
      created_at: { $lt: timestamp },
      status: { $in: ['completed', 'failed'] }
    })
  }
}

export const fileOpeappions = new FileOpeappions()
