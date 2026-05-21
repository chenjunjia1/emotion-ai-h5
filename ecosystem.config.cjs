/** PM2 生产启动：支撑多进程并发 */
module.exports = {
  apps: [
    {
      name: "emotion-ai-h5",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
