from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import (
    Supplier,
    Product,
    Stock,
    StockMovement,
    DataUploadHistory,
    Notification
)
from .serializers import (
    SupplierSerializer,
    SupplierDetailSerializer,
    ProductSerializer,
    ProductDetailSerializer,
    StockSerializer,
    StockMovementSerializer,
    StockMovementCreateSerializer,
    DataUploadHistorySerializer,
    NotificationSerializer
)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email']
    ordering_fields = ['name', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SupplierDetailSerializer
        return SupplierSerializer

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        supplier = self.get_object()
        products = Product.objects.filter(supplier=supplier)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku']
    ordering_fields = ['name', 'created_at', 'unit_price']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer

    @action(detail=True, methods=['get'])
    def stock_history(self, request, pk=None):
        product = self.get_object()
        movements = StockMovement.objects.filter(product=product).order_by('-timestamp')
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def current_stock(self, request, pk=None):
        product = self.get_object()
        stock = Stock.objects.filter(product=product).first()
        if stock:
            serializer = StockSerializer(stock)
            return Response(serializer.data)
        return Response({'detail': 'No stock record found'}, status=status.HTTP_404_NOT_FOUND)


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'location']
    ordering_fields = ['quantity', 'last_checked']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_stock = Stock.objects.filter(quantity__lte=models.F('minimum_threshold'))
        serializer = self.get_serializer(low_stock, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def high_stock(self, request):
        high_stock = Stock.objects.filter(quantity__gte=models.F('maximum_threshold'))
        serializer = self.get_serializer(high_stock, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'reference_number']
    ordering_fields = ['timestamp']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return StockMovementCreateSerializer
        return StockMovementSerializer

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        today = timezone.now().date()
        movements = StockMovement.objects.filter(
            timestamp__date=today
        ).values('movement_type').annotate(
            total_quantity=Sum('quantity'),
            count=Count('id')
        )
        return Response(movements)

    @action(detail=False, methods=['get'])
    def weekly_summary(self, request):
        week_ago = timezone.now() - timedelta(days=7)
        movements = StockMovement.objects.filter(
            timestamp__gte=week_ago
        ).values('movement_type').annotate(
            total_quantity=Sum('quantity'),
            count=Count('id')
        )
        return Response(movements)


class DataUploadHistoryViewSet(viewsets.ModelViewSet):
    queryset = DataUploadHistory.objects.all()
    serializer_class = DataUploadHistorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['upload_type', 'file_name']
    ordering_fields = ['upload_date', 'status']

    @action(detail=False, methods=['get'])
    def failed_uploads(self, request):
        failed = self.queryset.filter(status='FAILED')
        serializer = self.get_serializer(failed, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_uploads(self, request):
        pending = self.queryset.filter(status='PENDING')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['type', 'message']
    ordering_fields = ['created_at', 'read']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().update(read=True)
        return Response({'status': 'all notifications marked as read'})

    @action(detail=False, methods=['get'])
    def unread(self, request):
        unread = self.get_queryset().filter(read=False)
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)
