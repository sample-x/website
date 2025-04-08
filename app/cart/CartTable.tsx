'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import StorageSymbol from '@/app/components/StorageSymbol';
import { Sample } from '@/types/sample';

interface CartTableProps {
  items: Sample[];
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export default function CartTable({ items, onQuantityChange, onRemove }: CartTableProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-table-wrapper">
      <table className="cart-table">
        <thead>
          <tr>
            <th>Sample</th>
            <th>Type</th>
            <th>Storage</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>
                <StorageSymbol 
                  condition={item.storage_condition || ''} 
                  id={`cart-${item.id}`}
                />
              </td>
              <td>${item.price.toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max={item.quantity}
                  value={item.quantity}
                  onChange={(e) => onQuantityChange(Number(item.id), parseInt(e.target.value, 10))}
                  className="quantity-input"
                />
              </td>
              <td>${(item.price * item.quantity).toFixed(2)}</td>
              <td>
                <button 
                  onClick={() => onRemove(Number(item.id))}
                  className="text-red-500 hover:text-red-700"
                  title="Remove from Cart"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="text-right font-bold">Total:</td>
            <td colSpan={2}>${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
} 