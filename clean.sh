#!/bin/bash

# Stop all Docker containers
docker kill $(docker ps -q) || true

# Remove all Docker containers
docker rm $(docker ps -a -q) || true

# Remove all Docker images
docker rmi $(docker images -q) || true

# Remove postgres and redis folders
sudo rm -rf postgres redis