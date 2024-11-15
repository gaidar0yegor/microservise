from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # API URLs
    path('api/', include('stock_app.urls')),
    
    # Authentication URLs
    path('api-auth/', include('rest_framework.urls')),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Prometheus Metrics
    path('', include('django_prometheus.urls')),
]

# Customize admin site
admin.site.site_header = 'Stock Management Admin'
admin.site.site_title = 'Stock Management Admin Portal'
admin.site.index_title = 'Welcome to Stock Management Portal'
