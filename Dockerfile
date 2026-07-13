FROM nginx:1.27-alpine
COPY . /usr/share/nginx/html/
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/README.md \
  && chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
