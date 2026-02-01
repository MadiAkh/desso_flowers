"""
URL configuration for DESSO_FLOWERS_MAIN project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from main_page.views import home_page
from flowers_catalog_page.views import catalog_page
from django.conf.urls.static import static
from django.conf import settings
from personal_account import views as account_views
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_page, name="home"),
    path('catalog/', catalog_page, name="catalog_page"),
    path('profile/', account_views.profile_view, name='profile'),
    path('checkout/', account_views.checkout_view, name='checkout'),
    path(
        "personal-account/",
        include("personal_account.urls", namespace="personal_account")
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

