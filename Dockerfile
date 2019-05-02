FROM node:10-slim
RUN apt-get update && apt-get -y install git 
WORKDIR /app
COPY package.json /app
RUN yarn install
COPY . /app
CMD yarn start
EXPOSE 6661
