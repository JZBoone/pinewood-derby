#!/bin/bash
set -e

# Create the dev database
psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE devdb;"

echo "✅ Dev database created successfully!"