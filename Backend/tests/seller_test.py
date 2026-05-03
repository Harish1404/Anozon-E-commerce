import pytest
from datetime import datetime, timedelta
from pydantic import ValidationError

from app.models.seller_model import (
    BusinessType,
    ApplicationStatus,
    BusinessAddress,
    SellerApplicationRequest,
    SellerRejectRequest,
    SuspendRequest,
    UnsuspendRequest,
    SellerProfile,
    SellerResponse,
    SellerProfileUpdate,
    SellerMinimalResponse,
)


# -------------------------------
# BusinessType & ApplicationStatus enum tests
# -------------------------------

@pytest.mark.parametrize(
    "value,expected",
    [
        ("individual", BusinessType.individual),
        ("company", BusinessType.company),
        ("partnership", BusinessType.partnership),
    ],
    ids=[
        "happy-business-individual",
        "happy-business-company",
        "happy-business-partnership",
    ],
)
def test_business_type_enum_happy(value, expected):
    
    # Act
    result = BusinessType(value)

    
    # Assert
    assert result is expected


@pytest.mark.parametrize(
    "value",
    [
        "INDIVIDUAL",
        "corp",
        "",
        "123",
    ],
    ids=[
        "error-businesstype-upper-case",
        "error-businesstype-invalid-label",
        "error-businesstype-empty",
        "error-businesstype-numeric-string",
    ],
)
def test_business_type_enum_error(value):
    
    # Act
    with pytest.raises(ValueError):
        BusinessType(value)

    
    # Assert
    # Exception already asserted above


@pytest.mark.parametrize(
    "value,expected",
    [
        ("pending", ApplicationStatus.pending),
        ("approved", ApplicationStatus.approved),
        ("rejected", ApplicationStatus.rejected),
    ],
    ids=[
        "happy-status-pending",
        "happy-status-approved",
        "happy-status-rejected",
    ],
)
def test_application_status_enum_happy(value, expected):
    
    # Act
    result = ApplicationStatus(value)

    
    # Assert
    assert result is expected


@pytest.mark.parametrize(
    "value",
    [
        "PENDING",
        "done",
        "",
    ],
    ids=[
        "error-status-uppercase",
        "error-status-invalid-label",
        "error-status-empty",
    ],
)
def test_application_status_enum_error(value):
    
    # Act
    with pytest.raises(ValueError):
        ApplicationStatus(value)

    
    # Assert
    # Exception already asserted


# -------------------------------
# BusinessAddress tests
# -------------------------------

@pytest.mark.parametrize(
    "payload",
    [
        {
            "line1": "123 Street",
            "line2": "Apt 4",
            "city": "City",
            "state": "State",
            "pincode": "123456",
            "country": "Country",
        },
        {
            "line1": "456 Avenue",
            "city": "Town",
            "state": "Province",
            "pincode": "654321",
            "country": "Nation",
        },
    ],
    ids=[
        "happy-with-line2",
        "happy-without-line2",
    ],
)
def test_business_address_happy(payload):
    
    # Act
    addr = BusinessAddress(**payload)

    
    # Assert
    assert addr.line1 == payload["line1"]
    assert addr.city == payload["city"]
    assert addr.country == payload["country"]
    if "line2" in payload:
        assert addr.line2 == payload["line2"]
    else:
        assert addr.line2 is None


@pytest.mark.parametrize(
    "field_to_remove",
    [
        "line1",
        "city",
        "state",
        "pincode",
        "country",
    ],
    ids=[
        "error-missing-line1",
        "error-missing-city",
        "error-missing-state",
        "error-missing-pincode",
        "error-missing-country",
    ],
)
def test_business_address_required_fields(field_to_remove):
    
    # Arrange
    base = {
        "line1": "123 Street",
        "city": "City",
        "state": "State",
        "pincode": "123456",
        "country": "Country",
    }
    base.pop(field_to_remove)

    
    # Act
    with pytest.raises(ValidationError) as exc_info:
        BusinessAddress(**base)

    
    # Assert
    errors = exc_info.value.errors()
    assert any(err["loc"][-1] == field_to_remove for err in errors)


# -------------------------------
# SellerApplicationRequest tests
# -------------------------------

@pytest.mark.parametrize(
    "payload",
    [
        {
            "business_name": "My Shop",
            "business_type": "individual",
            "gstin": "GST123",
            "business_address": {
                "line1": "123 Street",
                "city": "City",
                "state": "State",
                "pincode": "123456",
                "country": "Country",
            },
        },
        {
            "business_name": "Company Ltd",
            "business_type": "company",
            "gstin": None,
            "business_address": {
                "line1": "456 Avenue",
                "line2": "Suite 1",
                "city": "Town",
                "state": "Province",
                "pincode": "654321",
                "country": "Nation",
            },
        },
    ],
    ids=[
        "happy-with-gstin",
        "happy-without-gstin",
    ],
)
def test_seller_application_request_happy(payload):
    
    # Act
    req = SellerApplicationRequest(**payload)

    
    # Assert
    assert req.business_name == payload["business_name"]
    assert req.business_type == BusinessType(payload["business_type"])
    assert req.business_address.city == payload["business_address"]["city"]
    assert req.gstin == payload["gstin"]


@pytest.mark.parametrize(
    "missing_field",
    [
        "business_name",
        "business_type",
        "business_address",
    ],
    ids=[
        "error-missing-business_name",
        "error-missing-business_type",
        "error-missing-business_address",
    ],
)
def test_seller_application_request_missing_required(missing_field):
    
    # Arrange
    base = {
        "business_name": "My Shop",
        "business_type": "individual",
        "business_address": {
            "line1": "123 Street",
            "city": "City",
            "state": "State",
            "pincode": "123456",
            "country": "Country",
        },
    }
    base.pop(missing_field)

    
    # Act
    with pytest.raises(ValidationError) as exc_info:
        SellerApplicationRequest(**base)

    
    # Assert
    assert any(err["loc"][-1] == missing_field for err in exc_info.value.errors())


# -------------------------------
# Simple request models with min_length (SellerRejectRequest, SuspendRequest, UnsuspendRequest)
# -------------------------------

@pytest.mark.parametrize(
    "model_cls,field_name,valid_value",
    [
        (SellerRejectRequest, "rejection_reason", "Too short docs"),
        (SuspendRequest, "suspend_reason", "Violation of terms"),
        (UnsuspendRequest, "unsuspend_reason", "Issue resolved"),
    ],
    ids=[
        "happy-reject-request",
        "happy-suspend-request",
        "happy-unsuspend-request",
    ],
)
def test_reason_requests_happy(model_cls, field_name, valid_value):
    
    # Act
    obj = model_cls(**{field_name: valid_value})

    
    # Assert
    assert getattr(obj, field_name) == valid_value


@pytest.mark.parametrize(
    "model_cls,field_name,invalid_value",
    [
        (SellerRejectRequest, "rejection_reason", "1234"),
        (SuspendRequest, "suspend_reason", "abcd"),
        (UnsuspendRequest, "unsuspend_reason", ""),
    ],
    ids=[
        "error-reject-reason-too-short",
        "error-suspend-reason-too-short",
        "error-unsuspend-reason-empty",
    ],
)
def test_reason_requests_min_length_error(model_cls, field_name, invalid_value):
    
    # Act
    with pytest.raises(ValidationError) as exc_info:
        model_cls(**{field_name: invalid_value})

    
    # Assert
    errors = exc_info.value.errors()
    assert any(err["loc"][-1] == field_name for err in errors)


# -------------------------------
# SellerProfile & SellerResponse tests
# -------------------------------

@pytest.mark.parametrize(
    "payload",
    [
        {
            "_id": "507f1f77bcf86cd799439011",
            "user_id": "507f1f77bcf86cd799439012",
            "email": "seller@example.com",
            "business_name": "My Shop",
            "business_type": "individual",
            "gstin": "GST123",
            "pan_number": "PAN123",
            "business_address": {
                "line1": "123 Street",
                "city": "City",
                "state": "State",
                "pincode": "123456",
                "country": "Country",
            },
        },
        {
            "_id": None,
            "user_id": "507f1f77bcf86cd799439013",
            "email": "another@example.org",
            "business_name": "Company Ltd",
            "business_type": "company",
            "gstin": None,
            "pan_number": None,
            "business_address": {
                "line1": "456 Avenue",
                "line2": "Suite 1",
                "city": "Town",
                "state": "Province",
                "pincode": "654321",
                "country": "Nation",
            },
        },
    ],
    ids=[
        "happy-profile-with-ids-and-gstin",
        "happy-profile-minimal-ids",
    ],
)
def test_seller_profile_happy_defaults_and_alias(payload):
    
    # Act
    profile = SellerProfile(**payload)

    
    # Assert
    assert profile.user_id == payload["user_id"]
    assert profile.email == payload["email"]
    assert profile.business_name == payload["business_name"]
    assert profile.business_type == BusinessType(payload["business_type"])
    assert profile.application_status == ApplicationStatus.pending
    assert profile.total_products == 0
    assert profile.total_orders == 0
    assert profile.rating == 0.0
    assert profile.is_suspended is False
    assert profile.created_at <= profile.updated_at
    # alias "_id" should map to "id"
    assert profile.id == payload["_id"]


@pytest.mark.parametrize(
    "email,user_id",
    [
        ("invalid-email", "507f1f77bcf86cd799439011"),
        ("seller@example.com", "not-an-objectid"),
    ],
    ids=[
        "error-invalid-email",
        "error-invalid-user-id",
    ],
)
def test_seller_profile_invalid_email_or_user_id(email, user_id):
    
    # Arrange
    payload = {
        "_id": "507f1f77bcf86cd799439010",
        "user_id": user_id,
        "email": email,
        "business_name": "Test Co",
        "business_type": "individual",
        "business_address": {
            "line1": "123 Street",
            "city": "City",
            "state": "State",
            "pincode": "123456",
            "country": "Country",
        },
    }

    
    # Act
    with pytest.raises(ValidationError) as exc_info:
        SellerProfile(**payload)

    
    # Assert
    errors = exc_info.value.errors()
    assert any(err["loc"][-1] in ("email", "user_id") for err in errors)


def test_seller_profile_time_fields_are_recent():
    
    # Arrange
    payload = {
        "user_id": "507f1f77bcf86cd799439011",
        "email": "recent@example.com",
        "business_name": "Recent Shop",
        "business_type": "individual",
        "business_address": {
            "line1": "Street",
            "city": "City",
            "state": "State",
            "pincode": "123456",
            "country": "Country",
        },
    }

    
    # Act
    profile = SellerProfile(**payload)

    
    # Assert
    now = datetime.utcnow()
    # Check that created_at and updated_at are not far from "now"
    assert now - profile.created_at < timedelta(minutes=5)
    assert now - profile.updated_at < timedelta(minutes=5)


def test_seller_response_populate_by_name():
    
    # Arrange
    payload = {
        "_id": "507f1f77bcf86cd799439011",
        "user_id": "507f1f77bcf86cd799439012",
        "email": "seller@example.com",
        "business_name": "My Shop",
        "business_type": "individual",
        "business_address": {
            "line1": "123 Street",
            "city": "City",
            "state": "State",
            "pincode": "123456",
            "country": "Country",
        },
    }

    
    # Act
    resp = SellerResponse(**payload)

    
    # Assert
    # Ensure alias "_id" mapped to "id" and can be exported by name
    assert resp.id == payload["_id"]
    model_dict = resp.model_dump(by_alias=True)
    assert model_dict["_id"] == payload["_id"]
    assert model_dict["business_name"] == payload["business_name"]


# -------------------------------
# SellerProfileUpdate tests
# -------------------------------

@pytest.mark.parametrize(
    "payload",
    [
        {"pan_number": "PAN1234"},
        {"business_name": "Updated Name"},
        {
            "business_address": {
                "line1": "New Street",
                "city": "New City",
                "state": "New State",
                "pincode": "999999",
                "country": "New Country",
            }
        },
        {
            "pan_number": "PAN5678",
            "business_name": "New Name",
            "business_address": {
                "line1": "Combo Street",
                "city": "Combo City",
                "state": "Combo State",
                "pincode": "111111",
                "country": "Combo Country",
            },
        },
    ],
    ids=[
        "happy-update-pan-only",
        "happy-update-business-name-only",
        "happy-update-address-only",
        "happy-update-all-fields",
    ],
)
def test_seller_profile_update_happy(payload):
    
    # Act
    update = SellerProfileUpdate(**payload)

    
    # Assert
    for key, value in payload.items():
        if key == "business_address":
            assert update.business_address.city == value["city"]
        else:
            assert getattr(update, key) == value


def test_seller_profile_update_all_optional_none():
    
    # Act
    update = SellerProfileUpdate()

    
    # Assert
    assert update.pan_number is None
    assert update.business_name is None
    assert update.business_address is None


@pytest.mark.parametrize(
    "invalid_address",
    [
        {
            # missing required "line1"
            "city": "City",
            "state": "State",
            "pincode": "123456",
            "country": "Country",
        },
        {
            "line1": "Street",
            # missing city
            "state": "State",
            "pincode": "123456",
            "country": "Country",
        },
    ],
    ids=[
        "error-update-address-missing-line1",
        "error-update-address-missing-city",
    ],
)
def test_seller_profile_update_invalid_address(invalid_address):
    
    # Act
    with pytest.raises(ValidationError) as exc_info:
        SellerProfileUpdate(business_address=invalid_address)

    
    # Assert
    errors = exc_info.value.errors()
    assert any(err["loc"][-1] in ("line1", "city") for err in errors)


# -------------------------------
# SellerMinimalResponse tests
# -------------------------------

@pytest.mark.parametrize(
    "payload",
    [
        {
            "business_name": "Minimal Shop",
            "business_type": "individual",
            "rating": 4.5,
        },
        {
            "business_name": "Company Mini",
            "business_type": "company",
            "rating": 0.0,
        },
    ],
    ids=[
        "happy-minimal-individual",
        "happy-minimal-company-zero-rating",
    ],
)
def test_seller_minimal_response_happy(payload):
    
    # Act
    resp = SellerMinimalResponse(**payload)

    
    # Assert
    assert resp.business_name == payload["business_name"]
    assert resp.business_type == payload["business_type"]
    assert resp.rating == payload["rating"]


@pytest.mark.parametrize(
    "payload",
    [
        {
            # missing business_name
            "business_type": "individual",
            "rating": 3.0,
        },
        {
            "business_name": "NoType",
            # missing business_type
            "rating": 3.0,
        },
        {
            "business_name": "NoRating",
            "business_type": "company",
            # missing rating
        },
    ],
    ids=[
        "error-minimal-missing-business_name",
        "error-minimal-missing-business_type",
        "error-minimal-missing-rating",
    ],
)
def test_seller_minimal_response_missing_required(payload):
    
    # Act
    with pytest.raises(ValidationError) as exc_info:
        SellerMinimalResponse(**payload)

    
    # Assert
    errors = exc_info.value.errors()
    assert len(errors) >= 1
