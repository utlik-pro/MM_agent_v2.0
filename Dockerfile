# Multi-stage build для оптимизации размера
FROM python:3.11-slim as builder

# Устанавливаем системные зависимости для сборки
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production образ
FROM python:3.11-slim

# Копируем установленные пакеты из builder
COPY --from=builder /root/.local /root/.local

# Создаем пользователя для безопасности
RUN useradd --create-home --shell /bin/bash agent
USER agent
WORKDIR /home/agent

# Копируем исходный код
COPY --chown=agent:agent agent.py .
COPY --chown=agent:agent prompts.py .
COPY --chown=agent:agent tools.py .

# Создаем директории
RUN mkdir -p logs

# Переменные окружения
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/home/agent
ENV PYTHONUNBUFFERED=1

# Health check для Dokploy
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import sys; sys.exit(0)" || exit 1

# Команда запуска
CMD ["python", "agent.py"] 