FROM node:16

RUN apt-get update -qq && apt-get -y upgrade

RUN mkdir /api
WORKDIR /api

COPY . /api

RUN yarn install