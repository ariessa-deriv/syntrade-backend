#!/bin/bash

# Install packages using npm
cd app && npm install && cd ..

# Build and start Docker containers in detached mode
docker-compose --env-file .env --file docker-compose.yml up -d
