import React, { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Table, Button } from 'react-bootstrap';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { getImageUrl } from '../../../../config';

const ProductRow = ({ 
  product, 
  index, 
  moveProduct, 
  onEdit, 
  onDelete, 
  getProductImage, 
  defaultImageUrl,
  handleImageError,
  imageErrors 
}) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'PRODUCT_ROW',
    item: { index, id: product.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'PRODUCT_ROW',
    hover: (draggedItem, monitor) => {
      if (!ref.current) return;

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get middle vertical position
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half the height of the item
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveProduct(dragIndex, hoverIndex);
      
      // Mutate the item being dragged
      draggedItem.index = hoverIndex;
    },
  });

  // Combine drag and drop refs
  drag(drop(ref));


  return (
    <tr 
      ref={ref} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        transition: 'opacity 0.2s ease'
      }}
    >
      <td className="text-center">
        <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GripVertical size={16} />
          <span className="ms-2">{index + 1}</span>
        </div>
      </td>
      <td>
        {product.image && !imageErrors[product.id] ? (
          <img 
            src={getProductImage(product)}
            alt={product.name} 
            style={{ height: '40px', width: '40px', objectFit: 'cover' }} 
            onError={() => handleImageError(product.id)}
          />
        ) : (
          <img 
            src={defaultImageUrl}
            alt="Placeholder" 
            style={{ height: '40px', width: '40px', objectFit: 'cover' }}
          />
        )}
      </td>
      <td>{product.name}</td>
      <td>{product.category?.name}</td>
      <td>{product.price} CHF</td>
      <td>{product.weight}</td>
      <td>{product.stock}</td>
      <td>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => onEdit(product)}
          >
            <Edit size={16} />
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const ProductList = ({ products, onDelete, onEdit, onAddNew, onReorder }) => {
  const [imageErrors, setImageErrors] = useState({});
  const [orderedProducts, setOrderedProducts] = useState([]);

  useEffect(() => {
    if (products?.length) {
      const sortedProducts = [...products].sort((a, b) => 
        (a.displayOrder || Infinity) - (b.displayOrder || Infinity)
      );
      setOrderedProducts(sortedProducts);
    }
  }, [products]);

  const defaultImageUrl = '/placeholder.jpg';

  const handleImageError = (productId) => {
    if (!imageErrors[productId]) {
      setImageErrors(prev => ({
        ...prev,
        [productId]: true
      }));
    }
  };

  const getProductImage = (product) => {
    if (!product.image || imageErrors[product.id]) {
      return defaultImageUrl;
    }
    try {
      return getImageUrl(product.image, 'product');
    } catch (error) {
      return defaultImageUrl;
    }
  };

  const moveProduct = (fromIndex, toIndex) => {
    const updatedProducts = [...orderedProducts];
    const [movedProduct] = updatedProducts.splice(fromIndex, 1);
    updatedProducts.splice(toIndex, 0, movedProduct);

    const reorderedProducts = updatedProducts.map((product, index) => ({
      ...product,
      displayOrder: index + 1
    }));

    setOrderedProducts(reorderedProducts);

    if (onReorder) {
      onReorder(reorderedProducts);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Управління продуктами</h2>
          <Button onClick={onAddNew}>Додати продукт</Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Порядок</th>
              <th style={{ width: '80px' }}>Зображення</th>
              <th>Назва</th>
              <th>Категорія</th>
              <th>Ціна</th>
              <th>Вага</th>
              <th>Склад</th>
              <th>Дія</th>
            </tr>
          </thead>
          <tbody>
            {orderedProducts.map((product, index) => (
              <ProductRow
                key={product.id}
                product={product}
                index={index}
                moveProduct={moveProduct}
                onEdit={onEdit}
                onDelete={onDelete}
                getProductImage={getProductImage}
                defaultImageUrl={defaultImageUrl}
                handleImageError={handleImageError}
                imageErrors={imageErrors}
              />
            ))}
          </tbody>
        </Table>
      </div>
    </DndProvider>
  );
};

export default ProductList;