from rest_framework import serializers

from .documents import Review


class ReviewSerializer(serializers.Serializer):
    """Lectura de una reseña, y edición del propio rating/comentario."""

    id = serializers.CharField(read_only=True)
    product = serializers.SerializerMethodField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(max_length=1000, required=False, allow_blank=True, default="")
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_product(self, obj):
        return {"id": str(obj.product.id), "name": obj.product.name} if obj.product else None

    def get_user(self, obj):
        if not obj.user:
            return None
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return {"id": str(obj.user.id), "name": full_name or obj.user.email}

    def update(self, instance, validated_data):
        instance.rating = validated_data.get("rating", instance.rating)
        instance.comment = validated_data.get("comment", instance.comment)
        instance.save()
        return instance


class ReviewCreateSerializer(serializers.Serializer):
    """Requiere context={'request': request, 'product': product}."""

    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(max_length=1000, required=False, allow_blank=True, default="")

    def validate(self, attrs):
        product = self.context["product"]
        user = self.context["request"].user
        if Review.objects(product=product, user=user).first():
            raise serializers.ValidationError("Ya escribiste una reseña para este producto.")
        return attrs

    def create(self, validated_data):
        review = Review(
            product=self.context["product"],
            user=self.context["request"].user,
            **validated_data,
        )
        review.save()
        return review
