#!/bin/bash

# Stop all Docker containers
docker kill $(docker ps -q) || true

# Remove all Docker containers
docker rm $(docker ps -a -q) || true

# Remove all Docker images
docker rmi $(docker images -q) || true

# Remove postgres and redis folders
sudo rm -rf postgres redis || true

# Check which process is running on port 5432 and kill the process by PID
sudo kill -9 $(sudo lsof -i :5432 | awk 'NR==2{print $2}') || true