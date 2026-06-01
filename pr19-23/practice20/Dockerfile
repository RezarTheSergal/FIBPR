FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

EXPOSE 3089

# Health check - wait for server to respond
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3089/health || exit 1

# Run the app
CMD ["npm", "start"]