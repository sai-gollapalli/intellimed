"""
IntelliMed - Inventory Service
Service for checking medicine expiry and low stock alerts.
"""

from datetime import datetime, date, timedelta
from typing import List, Dict
from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.medicine import Medicine
from backend.models.notification import Notification
from backend.models.user import User


def check_expiry_alerts(db: Session, days_threshold: int = 30) -> List[Dict]:
    """Check for medicines expiring within the threshold days."""
    threshold_date = date.today() + timedelta(days=days_threshold)
    
    expiring_items = db.query(Inventory, Medicine).join(
        Medicine, Inventory.medicine_id == Medicine.id
    ).filter(
        Inventory.expiry_date <= threshold_date,
        Inventory.quantity > 0
    ).all()
    
    alerts = []
    for inventory, medicine in expiring_items:
        days_until_expiry = (inventory.expiry_date - date.today()).days
        alerts.append({
            "inventory_id": inventory.id,
            "medicine_name": medicine.name,
            "batch_no": inventory.batch_no,
            "expiry_date": inventory.expiry_date.isoformat(),
            "days_until_expiry": days_until_expiry,
            "quantity": inventory.quantity,
            "severity": "critical" if days_until_expiry <= 7 else "warning"
        })
    
    return alerts


def check_low_stock_alerts(db: Session) -> List[Dict]:
    """Check for medicines below reorder level."""
    low_stock_items = db.query(Inventory, Medicine).join(
        Medicine, Inventory.medicine_id == Medicine.id
    ).filter(
        Inventory.quantity <= Inventory.reorder_level
    ).all()
    
    alerts = []
    for inventory, medicine in low_stock_items:
        alerts.append({
            "inventory_id": inventory.id,
            "medicine_name": medicine.name,
            "batch_no": inventory.batch_no,
            "current_quantity": inventory.quantity,
            "reorder_level": inventory.reorder_level,
            "shortage": inventory.reorder_level - inventory.quantity
        })
    
    return alerts


def create_expiry_notifications(db: Session, alerts: List[Dict]):
    """Create notifications for pharmacists about expiring medicines."""
    pharmacists = db.query(User).join(User.role).filter(
        User.role.name == "pharmacist",
        User.is_active == True
    ).all()
    
    for pharmacist in pharmacists:
        for alert in alerts:
            # Check if notification already exists for this alert
            existing = db.query(Notification).filter(
                Notification.user_id == pharmacist.id,
                Notification.notification_type == "expiry_alert",
                Notification.message.like(f"%{alert['medicine_name']}%"),
                Notification.message.like(f"%{alert['batch_no']}%")
            ).first()
            
            if not existing:
                notification = Notification(
                    user_id=pharmacist.id,
                    title=f"Medicine Expiry Alert",
                    message=f"{alert['medicine_name']} (Batch: {alert['batch_no']}) expires in {alert['days_until_expiry']} days. Quantity: {alert['quantity']}",
                    notification_type="expiry_alert",
                    is_read=False,
                    action_url="/dashboard/expiry-alerts"
                )
                db.add(notification)
    
    db.commit()


def create_low_stock_notifications(db: Session, alerts: List[Dict]):
    """Create notifications for pharmacists about low stock medicines."""
    pharmacists = db.query(User).join(User.role).filter(
        User.role.name == "pharmacist",
        User.is_active == True
    ).all()
    
    for pharmacist in pharmacists:
        for alert in alerts:
            # Check if notification already exists for this alert
            existing = db.query(Notification).filter(
                Notification.user_id == pharmacist.id,
                Notification.notification_type == "low_stock_alert",
                Notification.message.like(f"%{alert['medicine_name']}%"),
                Notification.message.like(f"%{alert['batch_no']}%")
            ).first()
            
            if not existing:
                notification = Notification(
                    user_id=pharmacist.id,
                    title=f"Low Stock Alert",
                    message=f"{alert['medicine_name']} (Batch: {alert['batch_no']}) is low. Current: {alert['current_quantity']}, Reorder level: {alert['reorder_level']}",
                    notification_type="low_stock_alert",
                    is_read=False,
                    action_url="/dashboard/inventory"
                )
                db.add(notification)
    
    db.commit()


def run_inventory_checks(db: Session):
    """Run all inventory checks and create notifications."""
    # Check expiry alerts
    expiry_alerts = check_expiry_alerts(db, days_threshold=30)
    if expiry_alerts:
        create_expiry_notifications(db, expiry_alerts)
    
    # Check low stock alerts
    low_stock_alerts = check_low_stock_alerts(db)
    if low_stock_alerts:
        create_low_stock_notifications(db, low_stock_alerts)
    
    return {
        "expiry_alerts": len(expiry_alerts),
        "low_stock_alerts": len(low_stock_alerts)
    }
