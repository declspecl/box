#!/usr/bin/env bash

echo "Bootstrapping server with Ansible..."

cd "$(dirname "$0")/../ansible"
ansible-playbook playbooks/bootstrap.yml
