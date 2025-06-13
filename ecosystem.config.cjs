module.exports = {
  apps: [
    {
      name: 'vite-frontend',
      script: 'npm',
      args: 'run dev',
      interpreter: 'node', // or leave it default (usually works)
      cwd: '/root/outmanage-frontend',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
