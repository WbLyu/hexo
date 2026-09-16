'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

hexo.extend.deployer.register('cos', async function (args) {
  const bucket = String(args.bucket || '');
  const region = String(args.region || '');

  if (!/^[a-z0-9][a-z0-9-]*-\d+$/.test(bucket)) {
    throw new Error('请在 deploy.bucket 中填写完整 COS 桶名');
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(region)) {
    throw new Error('请在 deploy.region 中填写地域，例如 ap-guangzhou');
  }

  const publicDir = path.resolve(hexo.public_dir);

  // 避免生成目录不存在或未生成首页时执行上传。
  await fs.access(path.join(publicDir, 'index.html'));

  const destination = `cos://${bucket}/`;
  const endpoint = `cos.${region}.myqcloud.com`;

  const cliArgs = [
  'sync',
  publicDir + path.sep,
  destination,
  '-r',
  '-e',
  endpoint,
  '--routines', '8',
  '--snapshot-path',
  path.join(hexo.base_dir, '.coscli-snapshots', bucket)
];

  hexo.log.info(`上传博客到 ${destination}`);

  await new Promise((resolve, reject) => {
    const child = spawn('coscli', cliArgs, {
      cwd: hexo.base_dir,
      stdio: 'inherit',
      shell: false
    });

    child.once('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error('未找到 coscli，请确认已安装并加入 PATH'));
      } else {
        reject(error);
      }
    });

    child.once('close', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(
          `COS 上传失败：${signal ? `信号 ${signal}` : `退出码 ${code}`}`
        ));
      }
    });
  });

  hexo.log.info('COS 博客部署完成');
});