# Use an official Node runtime as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files from the current directory
# to the working directory in the container
COPY package.json ./

# Install dependencies
RUN npm install

RUN npm run setup

RUN npm run seed

# Copy the rest of the application code from the current directory
# to the working directory in the container
COPY . .

# Expose the port that the app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
