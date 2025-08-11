module.exports = {
  apps: [
    {
      name: "vite-frontend",
      script: "npm",
      args: "run preview -- --port 5173 --host 0.0.0.0",
      interpreter: "node", // or leave it default (usually works)
      cwd: "/home/deploy/apps/outmanage-frontend",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
