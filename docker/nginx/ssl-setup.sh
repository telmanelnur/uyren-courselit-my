#!/bin/sh

# SSL Setup Script for Let's Encrypt
# This script handles SSL certificate generation and renewal

DOMAIN=${DOMAIN:-"your-domain.com"}
EMAIL=${EMAIL:-"admin@your-domain.com"}

echo "Setting up SSL for domain: $DOMAIN"

# Check if certificates already exist
if [ -f "/etc/nginx/ssl/cert.pem" ] && [ -f "/etc/nginx/ssl/key.pem" ]; then
    echo "SSL certificates already exist"
    exit 0
fi

# Generate self-signed certificates for initial setup
if [ ! -f "/etc/nginx/ssl/cert.pem" ] || [ ! -f "/etc/nginx/ssl/key.pem" ]; then
    echo "Generating self-signed certificates for initial setup..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
    echo "Self-signed certificates generated"
fi

# Function to obtain Let's Encrypt certificates
obtain_letsencrypt_cert() {
    echo "Attempting to obtain Let's Encrypt certificates..."
    
    # Stop nginx temporarily
    nginx -s stop
    
    # Obtain certificates using certbot
    certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --domains "$DOMAIN" \
        --domains "www.$DOMAIN"
    
    # Copy certificates to nginx SSL directory
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" /etc/nginx/ssl/cert.pem
        cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" /etc/nginx/ssl/key.pem
        echo "Let's Encrypt certificates installed successfully"
    else
        echo "Failed to obtain Let's Encrypt certificates, using self-signed"
    fi
    
    # Start nginx
    nginx -g "daemon off;" &
}

# Function to renew certificates
renew_certificates() {
    echo "Renewing SSL certificates..."
    certbot renew --quiet
    
    # Copy renewed certificates
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" /etc/nginx/ssl/cert.pem
        cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" /etc/nginx/ssl/key.pem
        
        # Reload nginx configuration
        nginx -s reload
        echo "Certificates renewed and nginx reloaded"
    fi
}

# Main execution
case "$1" in
    "obtain")
        obtain_letsencrypt_cert
        ;;
    "renew")
        renew_certificates
        ;;
    *)
        echo "Usage: $0 {obtain|renew}"
        echo "  obtain - Obtain Let's Encrypt certificates"
        echo "  renew  - Renew existing certificates"
        exit 1
        ;;
esac
