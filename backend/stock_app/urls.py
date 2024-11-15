from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet,
    ProductViewSet,
    StockViewSet,
    StockMovementViewSet,
    DataUploadHistoryViewSet,
    NotificationViewSet
)

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'products', ProductViewSet)
router.register(r'stocks', StockViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'upload-history', DataUploadHistoryViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
