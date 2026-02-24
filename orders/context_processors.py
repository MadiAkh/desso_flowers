from .models import Cart, Wishlist


def user_products_state(request):
    if not request.user.is_authenticated:
        return {}

    cart_ids = []
    wishlist_ids = []

    try:
        cart = request.user.cart
        cart_ids = list(
            cart.items.values_list("product_id", flat=True)
        )
    except Cart.DoesNotExist:
        pass

    try:
        wishlist = request.user.wishlist
        wishlist_ids = list(
            wishlist.products.values_list("id", flat=True)
        )
    except Wishlist.DoesNotExist:
        pass

    return {
        "cart_product_ids": cart_ids,
        "wishlist_product_ids": wishlist_ids,
    }