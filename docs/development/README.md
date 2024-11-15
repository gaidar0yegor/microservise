# Development Guide

## Project Structure

```
.
├── backend/                 # Django backend
│   ├── stock_app/          # Main application
│   │   ├── models/         # Database models
│   │   ├── serializers/    # DRF serializers
│   │   ├── views/          # API views
│   │   └── tests/          # Unit tests
│   └── stock_management/   # Project settings
├── frontend/               # React frontend
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/         # Page components
│       ├── store/         # Redux store
│       ├── services/      # API services
│       └── types/         # TypeScript types
└── docs/                  # Documentation
```

## Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd stock-management
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

3. Start development servers:
   ```bash
   docker-compose up
   ```

## Backend Development

### Django Project Structure
- `models/`: Database models for stock, products, suppliers
- `serializers/`: API serializers for data transformation
- `views/`: API endpoints and business logic
- `tests/`: Unit and integration tests

### Adding New Features
1. Create models:
   ```python
   # stock_app/models/product.py
   from django.db import models

   class Product(models.Model):
       name = models.CharField(max_length=200)
       sku = models.CharField(max_length=50, unique=True)
       price = models.DecimalField(max_digits=10, decimal_places=2)
   ```

2. Create serializers:
   ```python
   # stock_app/serializers/product.py
   from rest_framework import serializers
   from ..models import Product

   class ProductSerializer(serializers.ModelSerializer):
       class Meta:
           model = Product
           fields = ['id', 'name', 'sku', 'price']
   ```

3. Create views:
   ```python
   # stock_app/views/product.py
   from rest_framework import viewsets
   from ..models import Product
   from ..serializers import ProductSerializer

   class ProductViewSet(viewsets.ModelViewSet):
       queryset = Product.objects.all()
       serializer_class = ProductSerializer
   ```

### Running Tests
```bash
# Run all backend tests
./run-tests.sh backend

# Run specific test file
docker-compose run --rm backend python manage.py test stock_app.tests.test_products
```

### Database Migrations
```bash
# Create migrations
docker-compose run --rm backend python manage.py makemigrations

# Apply migrations
docker-compose run --rm backend python manage.py migrate
```

## Frontend Development

### React Project Structure
- `components/`: Reusable UI components
- `pages/`: Page-level components
- `store/`: Redux state management
- `services/`: API integration
- `types/`: TypeScript type definitions

### Adding New Features
1. Create component:
   ```tsx
   // src/components/ProductCard/ProductCard.tsx
   import React from 'react';
   import { Product } from '../../types';

   interface Props {
     product: Product;
     onEdit: (id: number) => void;
   }

   export const ProductCard: React.FC<Props> = ({ product, onEdit }) => (
     <div className="product-card">
       <h3>{product.name}</h3>
       <p>SKU: {product.sku}</p>
       <button onClick={() => onEdit(product.id)}>Edit</button>
     </div>
   );
   ```

2. Create Redux slice:
   ```typescript
   // src/store/slices/productSlice.ts
   import { createSlice, PayloadAction } from '@reduxjs/toolkit';
   import { Product } from '../../types';

   interface ProductState {
     items: Product[];
     loading: boolean;
   }

   const initialState: ProductState = {
     items: [],
     loading: false,
   };

   export const productSlice = createSlice({
     name: 'products',
     initialState,
     reducers: {
       setProducts: (state, action: PayloadAction<Product[]>) => {
         state.items = action.payload;
       },
     },
   });
   ```

3. Create API service:
   ```typescript
   // src/services/api.ts
   import axios from 'axios';
   import { Product } from '../types';

   export const getProducts = async (): Promise<Product[]> => {
     const response = await axios.get('/api/products/');
     return response.data;
   };
   ```

### Running Tests
```bash
# Run all frontend tests
./run-tests.sh frontend

# Run specific test file
docker-compose run --rm frontend npm test src/components/ProductCard/ProductCard.test.tsx
```

### Code Style
- Follow ESLint and Prettier configurations
- Run linting:
  ```bash
  docker-compose run --rm frontend npm run lint
  ```

## API Integration

### Making API Calls
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling
```typescript
try {
  const response = await api.get('/products/');
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    throw new Error(error.response?.data.message || 'An error occurred');
  }
  throw error;
}
```

## State Management

### Redux Store Setup
```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Using Redux Hooks
```typescript
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setProducts } from '../store/slices/productSlice';

// In component
const products = useSelector((state: RootState) => state.products.items);
const dispatch = useDispatch<AppDispatch>();

// Dispatch action
dispatch(setProducts(data));
```

## Best Practices

1. Code Organization:
   - Keep components small and focused
   - Use TypeScript for type safety
   - Follow DRY (Don't Repeat Yourself) principle

2. Testing:
   - Write tests for new features
   - Maintain high test coverage
   - Test edge cases and error scenarios

3. Performance:
   - Use React.memo for expensive components
   - Implement proper pagination
   - Optimize API calls with caching

4. Security:
   - Validate all inputs
   - Implement proper authentication
   - Follow security best practices

## Common Tasks

1. Adding a New Feature:
   - Create feature branch
   - Implement backend (models, views, tests)
   - Implement frontend (components, state, tests)
   - Update documentation
   - Submit pull request

2. Fixing Bugs:
   - Create bug fix branch
   - Add failing test
   - Fix the bug
   - Verify all tests pass
   - Submit pull request

3. Updating Dependencies:
   - Review changelog for breaking changes
   - Update package.json/requirements.txt
   - Run tests
   - Test in development environment
