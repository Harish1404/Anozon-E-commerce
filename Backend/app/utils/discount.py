def calculate_discount_price(price: int, discount_percent: int) -> int:
    """
    Calculate the discounted price given the original price and discount percentage.
    Returns the rounded integer value of the discount price.
    """
    if discount_percent <= 0:
        return price
    if discount_percent >= 100:
        return 0
    
    discount_amount = price * (discount_percent / 100)
    discount_price = round(price - discount_amount)
    return discount_price
