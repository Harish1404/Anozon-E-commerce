Anozon — Role & Seller Management Requirements

Collections
Three collections involved:

users — role field updated on promotion or demotion
seller_profiles — created when user applies, updated when admin acts
audit_logs — one insert on every role change (who, what, when)


Seller Profile Fields
Business details (user fills on application):

user_id — ref to users, unique index
email — denormalized
business_name — required
business_type — individual | company | partnership
gstin — optional, GST number
business_address — line1, line2, city, state, pincode


Status tracking:

application_status — pending | approved | rejected
rejection_reason — required when rejecting
reviewed_by — ref to users (admin who acted)
reviewed_at — timestamp of admin action

Performance (updated over time):

total_products — denormalized count
total_orders — denormalized count
rating — avg seller rating
is_suspended — admin can suspend without deleting account


Role Hierarchy & Promotion Rules
super_admin  →  can promote user to admin (direct, no application)
admin        →  can approve/reject seller applications
user         →  must apply first, then wait for admin approval

Super admin created via seed script only, never via API
Admin cannot create other admins — super admin only
Admin cannot touch super admin accounts
Seller promotion requires approved seller_profile document
Role stays user if application is rejected


Promotion & Demotion Flows
User → Seller:

User submits seller application — seller_profiles doc created with application_status: pending
Admin reviews pending list
Admin approves → user.role = seller, application_status = approved, reviewed_by, reviewed_at set
Admin rejects → role stays user, application_status = rejected, rejection_reason required
Audit log entry written on every action

User → Admin:

Super admin picks any verified user
Direct role update — no application flow
Audit log entry written

Demotion (any role → user):

Super admin only
Direct role update
If demoting a seller — seller_profile.is_suspended set to true
Audit log entry written


Endpoints Needed
Seller application (user role):

POST /seller/apply — submit business details, creates seller_profile doc

Admin endpoints:

GET /admin/sellers/pending — list all pending applications
POST /admin/sellers/{user_id}/approve — approve seller application
POST /admin/sellers/{user_id}/reject — reject with reason (body: rejection_reason)
POST /admin/sellers/{user_id}/suspend — suspend active seller
POST /admin/sellers/{user_id}/unsuspend — reverse suspension
GET /admin/users — list all users with filters (role, is_verified, date)
POST /admin/users/{user_id}/ban — ban a user

Super admin endpoints:

POST /super-admin/promote-admin/{user_id} — promote user to admin
POST /super-admin/demote/{user_id} — demote anyone to user
GET /super-admin/audit-logs — view all role change history


Permissions Map
Permission string Who has it What it guardsadmin:createsuper_adminpromote user → admin endpointadmin:demotesuper_admindemote any role → user endpointseller:applyusersubmit seller applicationseller:approveadmin, super_adminapprove seller applicationseller:rejectadmin, super_adminreject with reasonseller:suspendadmin, super_adminsuspend active selleruser:banadmin, super_adminban a user accountuser:viewadmin, super_adminview full user listproduct:anyadmin, super_adminread/write/delete any productproduct:own:writesellercreate and edit own products onlyproduct:own:deletesellerdelete own products onlyproduct:own:togglesellerhide/show own productsproduct:readuserbrowse approved active productsorder:anyadmin, super_adminview and update all ordersorder:own:createuserplace an orderorder:own:viewuser, selleruser sees own orders, seller sees orders with their productsorder:own:cancelusercancel own order in pending status onlyorder:own:status:updatesellerconfirmed → shipped → deliveredreview:own:writeuserwrite review on verified purchases onlyprofile:own:writeuserupdate own profile and addressesseller_profile:own:writesellerupdate own business details and bank infoaudit:viewsuper_adminview audit log historysystem:settingssuper_adminplatform-level config

Ownership Scope Rule
For any permission with :own — role check alone is not enough. Service layer must also verify:

Seller editing a product → product.seller_id == current_user._id
User cancelling an order → order.user_id == current_user._id
User writing a review → order exists with this product for this user
Seller updating order status → order contains at least one product owned by this seller

Admin and super_admin skip ownership checks — they hold :any permissions, not :own.

Audit Log Entry Shape
Every role change writes one document:
action        — "promoted_to_admin" | "promoted_to_seller" | "demoted" | 
                "seller_approved" | "seller_rejected" | "seller_suspended" |
                "user_banned"
target_user_id — who was affected
performed_by   — who did it
from_role      — previous role
to_role        — new role (null if suspension or ban)
reason         — optional, required for reject
timestamp      — datetime

Validation Rules

Seller application requires business_name, business_type, business_address,  — all mandatory before submission

rejection_reason is mandatory on reject endpoint — empty string not accepted
User must be is_verified: true before applying as seller
User must be is_verified: true before being promoted to admin
Cannot promote a suspended or banned user

1. Super Admin Actions
Only super_admin can:

Promote a regular user to admin
Demote any user to regular user (including admins or sellers)
Promote a user to seller directly (no application required)

2. Admin Actions
Only admin can:

Approve seller applications
Reject seller applications
Suspend active sellers
Unsuspend sellers
Ban users (demote → user + set is_suspended: true)

3. User Actions
Regular users can:

Apply for seller status (creates pending seller_profile)

Cannot promote, demote, or act as admin

4. Ownership Rules (Revisited)
Admin/super_admin bypass ownership checks via :any permission.
For :own permissions:

Seller editing product → product.seller_id must match user.
Seller editing order status → order must contain at least one product from this seller.
User cancelling order → order.user_id must match user.
User writing review → order must exist with this product for this user.


