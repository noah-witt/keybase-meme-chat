FROM node:14
COPY ./ /app
ENV DEBIAN_FRONTEND noninteractive
RUN groupadd -r chatter && useradd -m -r -g chatter chatter
RUN /app/dockerBuild.sh
#ENTRYPOINT [ "run_keybase", "-g", "&&", "node", "/app/build/index.js" ]
ENTRYPOINT ["/app/start.sh"]