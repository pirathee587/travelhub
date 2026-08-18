# Stage 1: Build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source and build JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root system user and group for security
RUN addgroup -S travelhub && adduser -S travelhub -G travelhub

# Copy executable jar from build stage
COPY --from=builder /build/target/*.jar app.jar

# Set correct ownership
RUN chown -R travelhub:travelhub /app

USER travelhub:travelhub

# Default JVM memory settings (optimized for t3.medium / t2.medium or larger EC2 instances)
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
