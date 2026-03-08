# Ibn Batouta Web

A lightweight platform for creating professional websites. Includes a main frontend and a management admin panel.

## Local Development

You can run the application locally without Docker. The app requires Node.js installed on your machine.
There are no external dependencies or build steps.

1. Start the Website Server:
   ```bash
   node website-server.js
   ```
   *Available at http://localhost:5500*

2. Start the Admin Server:
   ```bash
   node admin-server.js
   ```
   *Available at http://localhost:5600/admin*

## Deployment (Docker & Coolify)

This project is fully containerized and ready to deploy on any VPS using Docker or platforms like Coolify.

**Requirements**:
- Docker and Docker Compose installed (or Coolify active on your server).

### Deploying Manually with Docker Compose

1. Clone the repository on your server.
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Edit the `.env` file to customize your ports if needed.
4. Start the application:
   ```bash
   docker-compose up -d --build
   ```

### Deploying with Coolify

1. Connect your Github repository to Coolify.
2. Choose **Docker Compose** as the build pack.
3. Coolify will automatically parse the `docker-compose.yml` file and set up both the website and admin containers.
4. Add the appropriate environment variables (`WEBSITE_PORT`, `ADMIN_PORT`) or just rely on default values.
5. In Coolify, bind your domains:
   - For `ibnbatouta_website`, set your main domain (e.g., `https://ibnbatouta.ma`).
   - For `ibnbatouta_admin`, set your admin domain (e.g., `https://admin.ibnbatouta.ma`).
   (*Note: Uncomment the Traefik labels in `docker-compose.yml` if your Coolify setup requires explicit Traefik definitions, otherwise Coolify handles routing automatically.*)

## Data Persistence

Configuration data, project information, and uploaded images are saved natively in the `data/` and `assets/uploads/` directories. In the Docker setup, these folders are mounted as named Docker volumes, ensuring persistent data across container restarts.
