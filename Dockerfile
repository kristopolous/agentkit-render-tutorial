# Build Environment: Node + Playwright
FROM node:22
FROM mcr.microsoft.com/playwright:v1.49.1

# Env
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Copy all app files into Docker Work directory
COPY packages/indexer/package*.json /app/
COPY packages/indexer/src/ /app/src/
COPY packages/indexer/tsconfig.json /app/

RUN npm install -g pnpm

# Install Deps
RUN pnpm install

# Build TS into JS to run via Node
RUN pnpm build

# Run Node index.js file
CMD [ "pnpm", "start" ]
