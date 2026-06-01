FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the port your app runs on (adjust if needed)
EXPOSE 3088

# Run the app
CMD ["npm", "start"]