from django.db import models
from django.contrib.auth.models import User


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    sku = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"


class Stock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_records')
    quantity = models.IntegerField()
    location = models.CharField(max_length=100)
    last_checked = models.DateTimeField(auto_now=True)
    minimum_threshold = models.IntegerField(default=10)
    maximum_threshold = models.IntegerField(default=100)

    def __str__(self):
        return f"{self.product.name} - {self.quantity} units"


class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
        ('ADJUST', 'Adjustment'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=6, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    reference_number = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} ({self.quantity})"


class DataUploadHistory(models.Model):
    UPLOAD_TYPES = [
        ('FILE', 'File Upload'),
        ('API', 'API Upload'),
        ('SCRAPE', 'Web Scraping'),
        ('FTP', 'FTP/SFTP Upload'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    upload_type = models.CharField(max_length=10, choices=UPLOAD_TYPES)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    records_processed = models.IntegerField(default=0)
    records_failed = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)

    def __str__(self):
        return f"{self.get_upload_type_display()} - {self.upload_date}"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('STOCK_LOW', 'Low Stock Alert'),
        ('STOCK_HIGH', 'High Stock Alert'),
        ('UPLOAD_COMPLETE', 'Upload Complete'),
        ('UPLOAD_FAILED', 'Upload Failed'),
        ('SYSTEM', 'System Notification'),
    ]

    type = models.CharField(max_length=15, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')

    def __str__(self):
        return f"{self.get_type_display()} - {self.created_at}"
