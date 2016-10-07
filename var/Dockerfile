# a simple debian 
FROM registry.atlas.b2w:5000/atlas/debian-plataforma:jessie

# NGINX as the application server
RUN apt install -y nginx
ADD ../config/nginx.conf /etc/nginx/sites-available/default
RUN service nginx restart 

# simulador-bf install
RUN mkdir /opt/simulador-bf
ADD add ../dist/simulador-bf.tar.gz /opt
RUN cd /opt;tar -xzf /opt/simulador-bf.tar.gz

