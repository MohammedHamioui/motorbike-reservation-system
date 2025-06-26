# Use an official OpenJDK runtime as a parent image
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the Maven build file and source code
COPY . /app

# Give execute permission to mvnw
RUN chmod +x mvnw

# Package the application
RUN ./mvnw clean package -DskipTests

# Run the application
CMD ["java", "-jar", "target/api-gateway-0.0.1-SNAPSHOT.jar"] 