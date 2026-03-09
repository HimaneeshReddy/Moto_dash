#!/bin/bash

echo "Starting model pull for llama3.1..."
docker exec -it dashflow-ollama ollama pull llama3.1
echo "Done!"
