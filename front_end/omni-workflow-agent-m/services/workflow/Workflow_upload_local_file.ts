import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

// 待处理逻辑 / 缺少完备生命周期管理 / 错误处理和边界情况考虑

// 本地文件存储服务 / 用于上传前的临时存储和管理
const UPLOAD_DIR = `${FileSystem.documentDirectory}upload_local_file/`;
// 文件索引结构 / 包含文件基本信息和上传状态 / 方便管理和展示
const INDEX_KEY = '@upload_file_index';

// 文件索引项类型定义 
interface FileIndexEntry {
  id: string;
  originalName: string;
  localPath: string;
  mimeType: string;
  size: number;
  thumbnailPath?: string;
  createdAt: number;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
}

// 本地文件存储类 / 提供文件保存、索引管理、状态更新和删除功能
export class WorkflowLocalFileStorage {
  static async init() {
    const dirInfo = await FileSystem.getInfoAsync(UPLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(UPLOAD_DIR, { intermediates: true });
    }
  }
  
  static async saveFile(uri: string, fileName: string, mimeType: string): Promise<FileIndexEntry> {
    await this.init();
    const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ext = fileName.split('.').pop() || 'bin';
    const localPath = `${UPLOAD_DIR}${id}.${ext}`;

    await FileSystem.copyAsync({ from: uri, to: localPath });
    const fileInfo = await FileSystem.getInfoAsync(localPath);

    const entry: FileIndexEntry = {
      id,
      originalName: fileName,
      localPath,
      mimeType,
      size: (fileInfo.exists && 'size' in fileInfo) ? fileInfo.size : 0,
      createdAt: Date.now(),
      uploadStatus: 'pending',
    };

    await this.addToIndex(entry);
    return entry;
  }

  static async addToIndex(entry: FileIndexEntry) {
    const index = await this.getIndex();
    index[entry.id] = entry;
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
  }

  static async getIndex(): Promise<Record<string, FileIndexEntry>> {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  static async getFile(id: string): Promise<FileIndexEntry | null> {
    const index = await this.getIndex();
    return index[id] || null;
  }

  static async updateStatus(id: string, status: FileIndexEntry['uploadStatus']) {
    const index = await this.getIndex();
    if (index[id]) {
      index[id].uploadStatus = status;
      await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
    }
  }

  static async deleteFile(id: string) {
    const entry = await this.getFile(id);
    if (!entry) return;

    await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
    if (entry.thumbnailPath) {
      await FileSystem.deleteAsync(entry.thumbnailPath, { idempotent: true });
    }

    const index = await this.getIndex();
    delete index[id];
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
  }
}
