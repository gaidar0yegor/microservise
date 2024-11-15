import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from django.utils import timezone
import pandas as pd
from .models import (
    Product,
    Stock,
    StockMovement,
    DataUploadHistory,
    Notification
)

logger = logging.getLogger(__name__)

@shared_task
def process_stock_file_upload(upload_history_id, file_path):
    """Process uploaded stock file (CSV/Excel)"""
    upload_history = DataUploadHistory.objects.get(id=upload_history_id)
    
    try:
        # Read file based on extension
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        with transaction.atomic():
            records_processed = 0
            records_failed = 0

            for _, row in df.iterrows():
                try:
                    product = Product.objects.get(sku=row['sku'])
                    
                    # Update or create stock record
                    stock, created = Stock.objects.update_or_create(
                        product=product,
                        defaults={
                            'quantity': row['quantity'],
                            'location': row.get('location', 'Default')
                        }
                    )

                    # Create stock movement record
                    StockMovement.objects.create(
                        product=product,
                        movement_type='ADJUST',
                        quantity=row['quantity'],
                        reference_number=f'FILE-UPLOAD-{upload_history_id}',
                        notes='Updated via file upload'
                    )

                    records_processed += 1
                except Exception as e:
                    records_failed += 1
                    logger.error(f"Error processing row: {row}, Error: {str(e)}")

            upload_history.records_processed = records_processed
            upload_history.records_failed = records_failed
            upload_history.status = 'COMPLETED'
            upload_history.save()

    except Exception as e:
        upload_history.status = 'FAILED'
        upload_history.error_message = str(e)
        upload_history.save()
        logger.error(f"File processing failed: {str(e)}")
        raise


@shared_task
def check_stock_levels():
    """Check stock levels and create notifications for low/high stock"""
    low_stock = Stock.objects.filter(quantity__lte=models.F('minimum_threshold'))
    high_stock = Stock.objects.filter(quantity__gte=models.F('maximum_threshold'))

    # Process low stock alerts
    for stock in low_stock:
        Notification.objects.create(
            type='STOCK_LOW',
            message=f'Low stock alert for {stock.product.name}. Current quantity: {stock.quantity}',
            user=stock.product.supplier.user if hasattr(stock.product.supplier, 'user') else None
        )

    # Process high stock alerts
    for stock in high_stock:
        Notification.objects.create(
            type='STOCK_HIGH',
            message=f'High stock alert for {stock.product.name}. Current quantity: {stock.quantity}',
            user=stock.product.supplier.user if hasattr(stock.product.supplier, 'user') else None
        )


@shared_task
def send_stock_report():
    """Generate and send daily stock report"""
    today = timezone.now().date()
    
    # Get today's stock movements
    movements = StockMovement.objects.filter(
        timestamp__date=today
    ).select_related('product')

    # Generate report content
    report_content = "Daily Stock Movement Report\n"
    report_content += "=" * 30 + "\n\n"

    for movement in movements:
        report_content += f"Product: {movement.product.name}\n"
        report_content += f"Movement Type: {movement.get_movement_type_display()}\n"
        report_content += f"Quantity: {movement.quantity}\n"
        report_content += f"Reference: {movement.reference_number}\n"
        report_content += "-" * 20 + "\n"

    # Send email report
    try:
        send_mail(
            subject=f'Stock Movement Report - {today}',
            message=report_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
    except Exception as e:
        logger.error(f"Failed to send stock report: {str(e)}")
        raise


@shared_task
def clean_old_notifications():
    """Clean up old notifications"""
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    Notification.objects.filter(
        created_at__lt=thirty_days_ago,
        read=True
    ).delete()


@shared_task
def process_stock_adjustment(movement_id):
    """Process stock adjustment asynchronously"""
    try:
        with transaction.atomic():
            movement = StockMovement.objects.select_related('product').get(id=movement_id)
            stock = Stock.objects.select_for_update().get(product=movement.product)

            # Update stock quantity based on movement type
            if movement.movement_type == 'IN':
                stock.quantity += movement.quantity
            elif movement.movement_type == 'OUT':
                if stock.quantity >= movement.quantity:
                    stock.quantity -= movement.quantity
                else:
                    raise ValueError("Insufficient stock quantity")
            elif movement.movement_type == 'ADJUST':
                stock.quantity = movement.quantity

            stock.save()

            # Check for threshold notifications
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

    except Exception as e:
        logger.error(f"Error processing stock adjustment: {str(e)}")
        raise
