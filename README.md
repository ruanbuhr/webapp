# ShopLeft

This is the e-commerce web application used to showcase our transformer-based recommender system.

It is built using Next.js as React.js framework, with Tailwind CSS for styling and ShadCN/UI for prebuilt UI components.

Authentication and database needs are managed by Supabase.

## Application Features

- View product catalog.
- View single product details.
- View recommended items.
- Add items to cart.
- Manage cart.
- Manage account.
- Search for specific product.
- Filter products by category.

## Running the Application

### Run Natively

Prerequisites:

- Node.js 18+
- `.env` in root of `webapp/`

To start the application ensure you are in the `webapp/` directory and run the following commands:

```
npm run build
```

This will build the application for production.

```
npm run start
```

This will create a production server on localhost:3000.

### Run Container

The repository contains a `Dockerfile`. To run the application in a containerized environment run the following commands:

```
docker build -t shopleft .
docker run -p 3000:3000 shopleft
```

This creates the container and runs a production server on localhost:3000.
