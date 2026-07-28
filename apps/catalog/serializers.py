from rest_framework import serializers

from apps.common.utils import valid_object_id

from .documents import Brand, Category, Product


class CategorySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def validate_name(self, value):
        value = value.strip()
        qs = Category.objects(name__iexact=value)
        if self.instance is not None:
            qs = qs.filter(id__ne=self.instance.id)
        if qs.first():
            raise serializers.ValidationError("Ya existe una categoría con este nombre.")
        return value

    def create(self, validated_data):
        return Category(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class BrandSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def validate_name(self, value):
        value = value.strip()
        qs = Brand.objects(name__iexact=value)
        if self.instance is not None:
            qs = qs.filter(id__ne=self.instance.id)
        if qs.first():
            raise serializers.ValidationError("Ya existe una marca con este nombre.")
        return value

    def create(self, validated_data):
        return Brand(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ProductSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(max_length=2000, required=False, allow_blank=True, default="")
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    stock = serializers.IntegerField(min_value=0, required=False, default=0)
    image_url = serializers.URLField(required=False, allow_blank=True, default="")

    # Entrada: solo el ID (write_only). Salida: objeto anidado {id, name}.
    category_id = serializers.CharField(write_only=True)
    brand_id = serializers.CharField(write_only=True)
    category = serializers.SerializerMethodField(read_only=True)
    brand = serializers.SerializerMethodField(read_only=True)

    is_active = serializers.BooleanField(required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_category(self, obj):
        return {"id": str(obj.category.id), "name": obj.category.name} if obj.category else None

    def get_brand(self, obj):
        return {"id": str(obj.brand.id), "name": obj.brand.name} if obj.brand else None

    def validate_category_id(self, value):
        if not valid_object_id(value):
            raise serializers.ValidationError("ID de categoría inválido.")
        category = Category.objects(id=value).first()
        if not category:
            raise serializers.ValidationError("La categoría indicada no existe.")
        return category  # queda resuelto: en validated_data ya es el objeto, no el id

    def validate_brand_id(self, value):
        if not valid_object_id(value):
            raise serializers.ValidationError("ID de marca inválido.")
        brand = Brand.objects(id=value).first()
        if not brand:
            raise serializers.ValidationError("La marca indicada no existe.")
        return brand

    def create(self, validated_data):
        validated_data.pop("is_active", None)  # los productos siempre nacen activos
        category = validated_data.pop("category_id")
        brand = validated_data.pop("brand_id")
        # URLField de MongoEngine rechaza "" como URL inválida — solo acepta
        # una URL real o None.
        validated_data["image_url"] = validated_data.get("image_url") or None
        product = Product(category=category, brand=brand, is_active=True, **validated_data)
        product.save()
        return product

    def update(self, instance, validated_data):
        category = validated_data.pop("category_id", None)
        brand = validated_data.pop("brand_id", None)
        if "image_url" in validated_data:
            validated_data["image_url"] = validated_data["image_url"] or None
        if category is not None:
            instance.category = category
        if brand is not None:
            instance.brand = brand
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
