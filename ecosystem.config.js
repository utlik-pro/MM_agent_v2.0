module.exports = {
  apps: [
    {
      name: 'livekit-agent',
      script: 'agent.py',
      args: 'dev',
      interpreter: './venv/bin/python',
      cwd: '/Users/admin/MM_agent_v2.0',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONPATH: '/Users/admin/MM_agent_v2.0',
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_file: './logs/agent.log',
      out_file: './logs/agent-out.log',
      error_file: './logs/agent-error.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    }
  ]
}; 