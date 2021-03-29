module.exports = {
  apps: [
    {
      name: 'client',

      script: 'build/index.js',
      exec_mode: 'cluster',
      instances: 'max',

      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
