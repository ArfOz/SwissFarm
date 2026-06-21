import { Controller, Post, HttpCode, InternalServerErrorException } from '@nestjs/common';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { AdminOnly } from '../libs/decorators/admin-only.decorator';

@Controller('backup')
export class BackupController {
  @AdminOnly()
  @Post()
  @HttpCode(200)
  createBackup(): { message: string; file: string } {
    const backupDir = path.resolve(process.cwd(), '..', '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');

    const filename = `swissfarm_${timestamp}.backup`;
    const filepath = path.join(backupDir, filename);

    // DATABASE_URL from env: postgresql://arif:swissfarm@localhost:5432/swissfarm?schema=public
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new InternalServerErrorException('DATABASE_URL not configured');
    }

    // Parse DATABASE_URL for pg_dump parameters
    const url = new URL(dbUrl);
    const user = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = url.port || '5432';
    const dbName = url.pathname.replace(/^\//, '').split('?')[0];

    try {
      execSync(
        `set PGPASSWORD=${password} && pg_dump -U ${user} -h ${host} -p ${port} -d ${dbName} -F c -f "${filepath}"`,
        { stdio: 'pipe', timeout: 120_000 },
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new InternalServerErrorException(`Backup failed: ${message}`);
    }

    return { message: 'Backup created successfully', file: filename };
  }
}