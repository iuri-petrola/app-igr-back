FROM ubuntu:24.04

RUN apt update && apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs=18.20.8-1nodesource1

WORKDIR /app
COPY . .
RUN npm install

ENTRYPOINT npm run prd
