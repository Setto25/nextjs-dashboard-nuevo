import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

// Configura la ruta al ejecutable descargado automáticamente
ffmpeg.setFfmpegPath(ffmpegPath.path);

const THUMBNAILS_DIR = path.join(process.cwd(), 'public', 'uploads', 'miniaturas');

export async function generarMiniatura(videoPath: string): Promise<string> {
  await fs.mkdir(THUMBNAILS_DIR, { recursive: true });

  const filename = path.basename(videoPath);
  const thumbnailName = `${path.parse(filename).name}-thumb.jpg`;
  const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailName);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('error', (err: Error) => reject(err))
      .on('end', async () => {
        try {
          await fs.access(thumbnailPath);
          resolve(`/uploads/miniaturas/${thumbnailName}`);
        } catch (err) {
          reject(err);
        }
      })
      .screenshots({
        count: 1,
        timemarks: ['2'],
        folder: THUMBNAILS_DIR,
        filename: thumbnailName,
        size: '320x240'
      });
  });
}