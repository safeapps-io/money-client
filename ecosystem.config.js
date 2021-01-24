module.exports = {
  apps: [
    {
      name: 'client',

      script: '__sapper__/build/index.js',
      exec_mode: 'cluster',
      instances: 'max',

      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
