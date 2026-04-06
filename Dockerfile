FROM caddy:2

COPY . /srv
COPY Caddyfile /etc/caddy/Caddyfile
