# Use Ubuntu as base since it has stockfish in apt
FROM ubuntu:22.04

# Install required packages and Node.js 18
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    stockfish \
    curl \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create n8n user
RUN useradd -m -s /bin/bash node

# Install n8n
RUN npm install -g n8n

# Install chess.js for PGN/FEN handling
RUN npm install -g chess.js

# Set working directory
WORKDIR /home/node

# Switch to n8n user
USER node

# Expose port
EXPOSE 5678

# Start n8n
CMD ["n8n"]