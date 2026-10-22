# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

# Copy package files and install dependencies
COPY my-react-app/package*.json ./
RUN npm install

# Copy frontend source and build production bundle
COPY my-react-app/ ./
RUN npm run build

# ==========================================
# Stage 2: Build the .NET Web API
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-builder
WORKDIR /app

# Copy csproj files and restore dependencies
COPY LinkCollect/src/LinkCollect.Domain/*.csproj ./src/LinkCollect.Domain/
COPY LinkCollect/src/LinkCollect.Application/*.csproj ./src/LinkCollect.Application/
COPY LinkCollect/src/LinkCollect.Infrastructure/*.csproj ./src/LinkCollect.Infrastructure/
COPY LinkCollect/src/LinkCollect.Api/*.csproj ./src/LinkCollect.Api/
COPY LinkCollect/LinkCollect.slnx ./

RUN dotnet restore src/LinkCollect.Api/LinkCollect.Api.csproj

# Copy remaining source code and publish in Release mode
COPY LinkCollect/src/ ./src/
RUN dotnet publish src/LinkCollect.Api/LinkCollect.Api.csproj -c Release -o /app/publish

# Copy built frontend assets into wwwroot of the published backend
COPY --from=frontend-builder /app/client/dist /app/publish/wwwroot

# Copy sample-data.json for automated initial seeding
COPY my-react-app/src/sample-data.json /app/publish/sample-data.json

# ==========================================
# Stage 3: Final Production Runtime
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=backend-builder /app/publish .

# Render will supply PORT (e.g. 10000); default to 8080
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "LinkCollect.Api.dll"]
