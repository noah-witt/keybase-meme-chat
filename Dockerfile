FROM node:14
COPY ./ /app
RUN /app/dockerBuild.sh
ENTRYPOINT [ "node", "/app/build/index.js" ]