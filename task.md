Requirement:

Context: Implement the user wishlist and apply seller feature from backend and just check whether cart and order, seller orders pages from user and seller are paginated and filtered well also add the filter for seller orders history like how we have for the user orders and need some enchancement too.

1. Favourites page should be paginated, filters and also sort by price high to low and low to high. also make heart icon button like that fill and empty heart icon in prduct card and in details page. it should be clickable and remove from wishlist too when clicked. also should reduce the likes count and also like count should be shown in specification section in details page.

2. According to backend implement the apply seller, this page also show the status and history.

3. I think some order pages for user and seller are not paginated Ig check if not implement that. and add the filters sorts too.

Enchancement: 

1. In Product Details page it has reteun the seller deatils too like businness name and seller rating, type so showcase that in the after the specification and also the name and rating alone in top right of product details page

2. Seller rating should be calculated through his products average ratings and also can see his products Review details so make a separate Review section in sidebar This should have proper paginationa and filter and sorting. Also in Main dashboard make the top 5 products
with avg reviews too.

3. In Dashboard after that Good morning/afternoon/evening should display the name of seller

4. For create product the image URLs are accepting comma separating also in backend it has list so enchance that to images and a seller can set only 5 images there too three is madatory and remaining two is optional.

Make sure all should very good in responsive view and optimized in terms of performance and loading time and aligned with our colour palette too.. good at UI/UX too.

Validation errors display inline below each field using shadcn FormMessage component. Form never submits if validation fails — no API call made.

Error Handling: 

- API errors are caught in the mutation onError callback and shown as toast notifications using shadcn Sonner toast. Never shown as raw error objects.
- Loading states use shadcn Skeleton component — not spinners. Skeletons match the shape of the content being loaded so layout does not shift.
- Empty states are handled per page with a helpful message and a clear next action button — not just blank space.
- Network errors are caught by the axios interceptor. 401 triggers silent refresh. Other errors bubble up to the mutation error handler.
