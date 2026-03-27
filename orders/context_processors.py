from .models import Cart, Wishlist


def user_products_state(request):
    if not request.user.is_authenticated:
        return {}

    cart_product_ids = []
    cart_item_keys = []
    wishlist_product_ids = []
    wishlist_item_keys = []
    cart_items_count = 0
    wishlist_items_count = 0

    try:
        cart = request.user.cart
        cart_items = list(cart.items.select_related("product", "strawberry_product"))
        cart_product_ids = [item.product_id for item in cart_items if item.product_id]
        cart_item_keys = [item.item_key for item in cart_items if item.item_key]
        cart_items_count = sum(item.quantity for item in cart_items)
    except Cart.DoesNotExist:
        pass

    try:
        wishlist = request.user.wishlist
        product_ids = list(wishlist.products.values_list("id", flat=True))
        strawberry_ids = list(wishlist.strawberry_products.values_list("id", flat=True))
        wishlist_product_ids = product_ids
        wishlist_item_keys = [f"product:{product_id}" for product_id in product_ids] + [
            f"strawberry:{strawberry_id}" for strawberry_id in strawberry_ids
        ]
        wishlist_items_count = len(wishlist_item_keys)
    except Wishlist.DoesNotExist:
        pass

    return {
        "cart_product_ids": cart_product_ids,
        "cart_item_keys": cart_item_keys,
        "wishlist_product_ids": wishlist_product_ids,
        "wishlist_item_keys": wishlist_item_keys,
        "cart_items_count": cart_items_count,
        "wishlist_items_count": wishlist_items_count,
    }
