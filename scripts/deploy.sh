#!/usr/bin/env bash

echo "Deploying services with Ansible..."

cd "$(dirname "$0")/../ansible"

if [ ! -f vars.yml ]; then
    echo "Error: vars.yml not found. Copy vars.example.yml to vars.yml and fill in credentials."
    exit 1
fi

ansible-playbook playbooks/deploy-services.yml
