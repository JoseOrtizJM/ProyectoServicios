#!/usr/bin/env bash
# Script de build que ejecuta Render antes de arrancar el servicio.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
