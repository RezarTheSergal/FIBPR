FROM node:20-alpine
WORKDIR /app

COPY server/package*.json ./
RUN npm install

# Copy the rest of your app
COPY server/ .

# Expose the port your app runs on
EXPOSE 3090

# Run the app
CMD ["npm", "start"]
