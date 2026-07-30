import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomBytes, randomUUID } from 'crypto';
import { getObjectUrlForKey, uploadFileToS3 } from './aws-s3.service';

export interface HlsVideoInfo {
  url: string;
  duration?: number;
  masterPlaylistUrl: string;
}

const TEMP_DIR = process.env.NODE_ENV === 'production' ? '/tmp/videos' : 'temp_videos';

async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

function generateEncryptionKey(): Buffer {
  return randomBytes(16);
}

function runProcess(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      reject(error);
    });

    child.on('close', code => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

async function getVideoDuration(inputPath: string): Promise<number | undefined> {
  try {
    const output = await runProcess('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      inputPath,
    ]);

    return parseFloat(output.trim());
  } catch {
    return undefined;
  }
}

function updatePlaylistReferences(
  playlistContent: string,
  folderName: string,
): string {
  const keyPattern = /(URI=")([^"]+)(")/g;
  const segmentPattern = /^(?!#)(.+)$/gm;

  const withKeyUrl = playlistContent.replace(keyPattern, (_, prefix, uri, suffix) => {
    const absoluteUrl = getObjectUrlForKey(`${folderName}/${uri}`);
    return `${prefix}${absoluteUrl}${suffix}`;
  });

  return withKeyUrl.replace(segmentPattern, line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return line;
    }

    return getObjectUrlForKey(`${folderName}/${trimmedLine}`);
  });
}

export async function processVideoToHls(
  file: Express.Multer.File,
  folderName: string,
): Promise<HlsVideoInfo> {
  await ensureTempDir();

  const sessionId = randomUUID();
  const tempDir = join(TEMP_DIR, sessionId);

  try {
    await fs.mkdir(tempDir, { recursive: true });

    const inputFileName = `input${getExtension(file.originalname)}`;
    const inputPath = join(tempDir, inputFileName);
    const outputDir = join(tempDir, 'hls');
    const keyFileName = 'enc.key';
    const keyInfoFileName = 'enc.keyinfo';
    const masterPlaylistFileName = 'master.m3u8';
    const keyPath = join(tempDir, keyFileName);
    const keyInfoPath = join(tempDir, keyInfoFileName);
    const masterPlaylistPath = join(outputDir, masterPlaylistFileName);

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(inputPath, file.buffer);

    const duration = await getVideoDuration(inputPath);
    const encryptionKey = generateEncryptionKey();

    await fs.writeFile(keyPath, encryptionKey);
    await fs.writeFile(keyInfoPath, `${keyFileName}\n${keyPath}\n`);

    await runProcess('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      '-b:v',
      '2M',
      '-b:a',
      '128k',
      '-hls_time',
      '10',
      '-hls_list_size',
      '0',
      '-hls_playlist_type',
      'vod',
      '-hls_flags',
      'independent_segments',
      '-hls_segment_filename',
      join(outputDir, 'segment%03d.ts'),
      '-hls_key_info_file',
      keyInfoPath,
      '-f',
      'hls',
      masterPlaylistPath,
    ]);

    const files = await fs.readdir(outputDir);
    const hlsFiles = files.filter(fileName =>
      fileName.endsWith('.m3u8') || fileName.endsWith('.ts'),
    );
    const s3Folder = `${folderName}/${sessionId}`;

    await uploadFileToS3(
      encryptionKey,
      keyFileName,
      'application/octet-stream',
      s3Folder,
      { preserveFileName: true },
    );

    for (const hlsFile of hlsFiles.filter(fileName => fileName.endsWith('.ts'))) {
      const fileContent = await fs.readFile(join(outputDir, hlsFile));
      await uploadFileToS3(fileContent, hlsFile, 'video/mp2t', s3Folder, {
        preserveFileName: true,
      });
    }

    const playlistContent = await fs.readFile(masterPlaylistPath, 'utf-8');
    const updatedPlaylist = updatePlaylistReferences(playlistContent, s3Folder);

    await uploadFileToS3(
      Buffer.from(updatedPlaylist),
      masterPlaylistFileName,
      'application/vnd.apple.mpegurl',
      s3Folder,
      { preserveFileName: true },
    );

    const masterPlaylistUrl = getObjectUrlForKey(`${s3Folder}/${masterPlaylistFileName}`);

    return {
      url: masterPlaylistUrl,
      duration,
      masterPlaylistUrl,
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function getExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? `.${ext}` : '.mp4';
}

export async function getVideoInfo(file: Express.Multer.File): Promise<number | undefined> {
  await ensureTempDir();
  const tempFile = join(TEMP_DIR, `temp_${Date.now()}${getExtension(file.originalname)}`);
  await fs.writeFile(tempFile, file.buffer);
  const duration = await getVideoDuration(tempFile);
  await fs.unlink(tempFile);
  return duration;
}
