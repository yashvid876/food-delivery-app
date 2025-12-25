import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const OrderCard = ({ order, onUpdateStatus, showActions = false, showDeliveryActions = false }) => {
  const getStatusVariant = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'primary',
      ready: 'success',
      picked_up: 'secondary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return variants[status] || 'secondary';
  };

  const canUpdateStatus = (currentStatus) => {
    const statusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['picked_up', 'cancelled'],
      picked_up: ['delivered'],
      delivered: [],
      cancelled: []
    };
    return statusFlow[currentStatus];
  };

  const handleStatusUpdate = (orderId, action) => {
    console.log(`Updating order ${orderId} with action: ${action}`);
    onUpdateStatus(orderId, action);
  };

  return (
    <Card className="order-card mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="h6">Order #{order.order_id}</Card.Title>
          <Badge 
            bg={getStatusVariant(order.status)} 
            className="status-badge"
          >
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </Badge>
        </div>
        
        <div className="row text-sm mb-2">
          <div className="col-6">
            <small className="text-muted">Restaurant:</small>
            <div>{order.restaurant_name || 'N/A'}</div>
          </div>
          <div className="col-6">
            <small className="text-muted">Total Amount:</small>
            <div className="fw-bold">₹{order.total_amount}</div>
          </div>
        </div>
        
        <div className="row text-sm mb-3">
          <div className="col-6">
            <small className="text-muted">Order Time:</small>
            <div>{order.time}</div>
          </div>
          <div className="col-6">
            <small className="text-muted">Delivery Address:</small>
            <div className="text-truncate">{order.delivery_address}</div>
          </div>
        </div>

        {order.customer_name && (
          <div className="row text-sm mb-3">
            <div className="col-12">
              <small className="text-muted">Customer:</small>
              <div>{order.customer_name} {order.customer_phone && `(${order.customer_phone})`}</div>
            </div>
          </div>
        )}

        {showActions && canUpdateStatus(order.status).length > 0 && (
          <div className="d-flex gap-2 flex-wrap">
            {canUpdateStatus(order.status).map(status => (
              <Button
                key={status}
                variant="outline-primary"
                size="sm"
                onClick={() => handleStatusUpdate(order.order_id, status)}
              >
                Mark as {ORDER_STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        )}

        {showDeliveryActions && order.status === 'ready' && (
          <Button
            variant="success"
            size="sm"
            onClick={() => handleStatusUpdate(order.order_id, 'accept')}
          >
            <i className="fas fa-check me-1"></i>
            Accept Delivery
          </Button>
        )}

        {showDeliveryActions && order.status === 'picked_up' && (
          <Button
            variant="success"
            size="sm"
            onClick={() => handleStatusUpdate(order.order_id, 'delivered')}
          >
            <i className="fas fa-check-circle me-1"></i>
            Mark as Delivered
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default OrderCard;