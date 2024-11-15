FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create directory for static files
RUN mkdir -p /usr/share/nginx/html/static

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose ports
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
