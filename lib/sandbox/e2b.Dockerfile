# # You can use most Debian-based base images
# FROM node:21-slim

# # Install curl
# RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# COPY compile_page.sh /compile_page.sh
# RUN chmod +x /compile_page.sh

# # Install dependencies and customize sandbox
# WORKDIR /home/user/nextjs-app

# RUN npx --yes create-next-app@15.3.3 . --yes

# RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force

# # Install tw-animate-css before adding shadcn components
# RUN npm install tw-animate-css

# RUN npx --yes shadcn@2.6.3 add --all --yes

# # Move the Nextjs app to the home directory and remove the nextjs-app directory
# RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app




# You can use most Debian-based base images
FROM node:21-slim

# =========================================================
# System Dependencies
# =========================================================
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# =========================================================
# Compile Script
# =========================================================
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# =========================================================
# App Setup
# =========================================================
WORKDIR /home/user/nextjs-app

# Create Next.js 15 app
RUN npx --yes create-next-app@15.3.3 . --yes

# Initialize shadcn/ui
RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force

# =========================================================
# REQUIRED FIX FOR cn() / lib/utils.ts / tailwind-merge
# =========================================================

# Install required utilities used by shadcn/ui
RUN npm install \
    tailwind-merge \
    clsx \
    class-variance-authority \
    tw-animate-css

# Ensure lib/utils.ts exists
RUN mkdir -p /home/user/nextjs-app/lib && \
    printf '%s\n' \
'import { type ClassValue, clsx } from "clsx"' \
'import { twMerge } from "tailwind-merge"' \
'' \
'export function cn(...inputs: ClassValue[]) {' \
'  return twMerge(clsx(inputs))' \
'}' \
> /home/user/nextjs-app/lib/utils.ts

# =========================================================
# Install ALL shadcn components
# =========================================================
RUN npx --yes shadcn@2.6.3 add --all --yes

# =========================================================
# Move App To /home/user
# =========================================================
RUN mv /home/user/nextjs-app/* /home/user/ && \
    rm -rf /home/user/nextjs-app

WORKDIR /home/user