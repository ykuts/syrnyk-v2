import React from 'react';
import { Table, Button, ButtonGroup } from 'react-bootstrap';
import { Trash, Plus, Minus } from 'lucide-react';

const CartTable = ({ 
  items, 
  totalPrice, 
  onAdd, 
  onRemove, 
  onRemoveAll 
}) => {
  return (
    <div className="mb-5">
      <h2 className="h4 mb-4">Ваші продукти</h2>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Продукт</th>
              <th className="text-center">Кількість</th>
              <th className="text-end">Ціна</th>
              <th className="text-end">Усього</th>
              <th className="text-center">Дія</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td className="text-center">
                  <ButtonGroup size="sm">
                    <Button 
                      variant="outline-secondary"
                      style={{ border: 'none' }}
                      onClick={() => onRemove?.(item.id)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </Button>
                    <Button variant="light" disabled>
                      {item.quantity}
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => onAdd?.(item.id)}
                    >
                      <Plus size={16} />
                    </Button>
                  </ButtonGroup>
                </td>
                <td className="text-end">{item.price.toFixed(2)} CHF</td>
                <td className="text-end">{(item.quantity * item.price).toFixed(2)} CHF</td>
                <td className="text-center">
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => onRemoveAll?.(item.id)}
                    title="Видалити продукт"
                  >
                    <Trash size={16} />
                  </Button>
                </td>
              </tr>
            ))}
            <tr className="table-active">
              <td colSpan="3" className="text-end fw-bold">Total:</td>
              <td className="text-end fw-bold fs-5">{totalPrice.toFixed(2)} CHF</td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CartTable;