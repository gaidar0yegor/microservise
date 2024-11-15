from django.contrib import admin
from .models import (
    Supplier,
    Product,
    Stock,
    StockMovement,
    DataUploadHistory,
    Notification
)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')
    search_fields = ('name', 'email')
    list_filter = ('created_at',)
    ordering = ('-created_at',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'supplier', 'unit_price', 'created_at')
    search_fields = ('name', 'sku', 'supplier__name')
    list_filter = ('supplier', 'created_at')
    ordering = ('-created_at',)


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'location', 'last_checked')
    search_fields = ('product__name', 'location')
    list_filter = ('location', 'last_checked')
    ordering = ('product__name',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product')


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('product', 'movement_type', 'quantity', 'reference_number', 'timestamp', 'performed_by')
    search_fields = ('product__name', 'reference_number')
    list_filter = ('movement_type', 'timestamp', 'performed_by')
    ordering = ('-timestamp',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'performed_by')


@admin.register(DataUploadHistory)
class DataUploadHistoryAdmin(admin.ModelAdmin):
    list_display = ('upload_type', 'file_name', 'uploaded_by', 'upload_date', 'status')
    search_fields = ('file_name', 'uploaded_by__username')
    list_filter = ('upload_type', 'status', 'upload_date')
    ordering = ('-upload_date',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('uploaded_by')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('type', 'user', 'created_at', 'read')
    search_fields = ('message', 'user__username')
    list_filter = ('type', 'read', 'created_at')
    ordering = ('-created_at',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        queryset.update(read=True)
    mark_as_read.short_description = "Mark selected notifications as read"
