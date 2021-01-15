FROM node:14-alpine

ENV HTMLDIR="/usr/local/www"

WORKDIR ${HTMLDIR}

COPY package.json ${BASEDIR}
COPY node-server.js ${BASEDIR}
COPY run-server.sh ${BASEDIR}

# install package.json and create new directory for html
RUN npm install && mkdir html

CMD ["/bin/sh", "/usr/local/www/run-server.sh"]