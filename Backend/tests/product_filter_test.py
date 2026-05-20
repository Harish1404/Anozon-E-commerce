import pytest
import re
from app.repo.product_helpers import build_product_query

def test_build_product_query_default():
    query = build_product_query()
    assert query["is_active"] is True
    assert query["is_deleted"] is False
    assert query["is_approved"] is True
    assert "brand" not in query
    assert "sub_category" not in query
    assert "tags" not in query
    assert "is_featured" not in query

def test_build_product_query_single_brand():
    query = build_product_query(brand="Nike")
    assert "brand" in query
    assert query["brand"] == {"$regex": "^Nike$", "$options": "i"}

def test_build_product_query_multiple_brands():
    query = build_product_query(brand="Nike, Adidas, Puma")
    assert "brand" in query
    brand_filter = query["brand"]
    assert "$in" in brand_filter
    regexes = brand_filter["$in"]
    assert len(regexes) == 3
    # Check compiled patterns
    assert regexes[0].pattern == "^Nike$"
    assert regexes[0].flags == re.IGNORECASE
    assert regexes[1].pattern == "^Adidas$"
    assert regexes[2].pattern == "^Puma$"

def test_build_product_query_single_sub_category():
    query = build_product_query(sub_category="Running")
    assert "sub_category" in query
    assert query["sub_category"] == {"$regex": "^Running$", "$options": "i"}

def test_build_product_query_multiple_sub_categories():
    query = build_product_query(sub_category="Running, Basketball")
    assert "sub_category" in query
    sub_cat_filter = query["sub_category"]
    assert "$in" in sub_cat_filter
    regexes = sub_cat_filter["$in"]
    assert len(regexes) == 2
    assert regexes[0].pattern == "^Running$"
    assert regexes[1].pattern == "^Basketball$"

def test_build_product_query_single_tag():
    query = build_product_query(tags="sale")
    assert "tags" in query
    assert query["tags"] == {"$regex": "^sale$", "$options": "i"}

def test_build_product_query_multiple_tags():
    query = build_product_query(tags="sale, discount, winter")
    assert "tags" in query
    tags_filter = query["tags"]
    assert "$in" in tags_filter
    regexes = tags_filter["$in"]
    assert len(regexes) == 3
    assert regexes[0].pattern == "^sale$"
    assert regexes[1].pattern == "^discount$"
    assert regexes[2].pattern == "^winter$"

def test_build_product_query_is_featured():
    query_true = build_product_query(is_featured=True)
    assert query_true["is_featured"] is True

    query_false = build_product_query(is_featured=False)
    assert query_false["is_featured"] is False

    query_none = build_product_query(is_featured=None)
    assert "is_featured" not in query_none

def test_build_product_query_combined():
    query = build_product_query(
        category="shoes",
        brand="Nike, Adidas",
        sub_category="Running",
        tags="sale",
        is_featured=True,
        min_price=50,
        max_price=150
    )
    assert query["category"] == {"$regex": "^shoes$", "$options": "i"}
    assert "$in" in query["brand"]
    assert query["sub_category"] == {"$regex": "^Running$", "$options": "i"}
    assert query["tags"] == {"$regex": "^sale$", "$options": "i"}
    assert query["is_featured"] is True
    assert query["price"] == {"$gte": 50, "$lte": 150}
