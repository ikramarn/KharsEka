FROM node:20-alpine
WORKDIR /srv
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY src ./src
ENV NODE_ENV=production
EXPOSE 3002
CMD ["npm","start"]
