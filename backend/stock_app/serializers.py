from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Supplier,
    Product,
    Stock,
    StockMovement,
    DataUploadHistory,
    Notification
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    current_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_current_stock(self, obj):
        stock = Stock.objects.filter(product=obj).first()
        return stock.quantity if stock else 0


class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = Stock
        fields = '__all__'


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)

    class Meta:
        model = StockMovement
        fields = '__all__'


class DataUploadHistorySerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = DataUploadHistory
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'


# Nested Serializers for detailed views
class ProductDetailSerializer(ProductSerializer):
    supplier = SupplierSerializer(read_only=True)
    stock_records = StockSerializer(many=True, read_only=True)
    movements = StockMovementSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ('stock_records', 'movements')


class SupplierDetailSerializer(SupplierSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta(SupplierSerializer.Meta):
        fields = SupplierSerializer.Meta.fields + ('products',)


# Serializers for creating/updating related objects
class StockMovementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = '__all__'

    def create(self, validated_data):
        movement = super().create(validated_data)
        
        # Update stock quantity based on movement type
        stock = Stock.objects.get(product=movement.product)
        if movement.movement_type == 'IN':
            stock.quantity += movement.quantity
        elif movement.movement_type == 'OUT':
            stock.quantity -= movement.quantity
        elif movement.movement_type == 'ADJUST':
            stock.quantity = movement.quantity
        
        stock.save()
        
        # Create notification if stock is below minimum threshold
        if stock.quantity <= stock.minimum_threshold:
            Notification.objects.create(
                type='STOCK_LOW',
                message=f'Low stock alert for {movement.product.name}. Current quantity: {stock.quantity}',
                user=movement.performed_by
            )
        elif stock.quantity >= stock.maximum_threshold:
            Notification.objects.create(
                type='STOCK_HIGH',
                message=f'High stock alert for {movement.product.name}. Current quantity: {stock.quantity}',
                user=movement.performed_by
            )
        
        return movement
