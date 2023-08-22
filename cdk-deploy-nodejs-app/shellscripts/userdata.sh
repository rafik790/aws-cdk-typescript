#!/bin/bash
cd /home/ec2-user/

## Updating Packages
sudo su
yum update -y

yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
#restart amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

##install code deployment agent
yum install ruby -y
yum install wget -y
wget https://aws-codedeploy-us-east-1.s3.amazonaws.com/latest/install
chmod +x ./install
./install auto


## Installing Nginx
amazon-linux-extras install nginx1 -y

## Modifying Nginx Server Configuration
cat > /etc/nginx/nginx.conf <<EOL
user nginx;
worker_processes auto;
include /usr/share/nginx/modules/*.conf;
events {
    worker_connections 1024;
}
http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    error_log /dev/null;
    access_log /dev/null;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    upstream express_server {
        server 127.0.0.1:8080;
        keepalive 64;
    }
    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name _;
        location / {
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header Host \$http_host;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header X-NginX-Proxy true;
            proxy_http_version 1.1;
            proxy_pass http://localhost:3000/;
            proxy_redirect http://localhost:3000/ http://$server_name/;
            proxy_read_timeout 240s;
        }
    }
}
EOL

## Starting Nginx Services
chkconfig nginx on
systemctl start nginx.service
systemctl enable nginx.service

## Install Node.js
yum update -y
curl -sL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs git

## Installing Global PM2 package
npm install -g pm2
