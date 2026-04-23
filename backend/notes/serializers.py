from rest_framework import serializers
from .models import Note, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class NoteSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    category_name = serializers.StringRelatedField(source='category', read_only=True)
    
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'updated_at', 
                  'is_important', 'color', 'author', 'category', 'category_name']
        read_only_fields = ['author', 'created_at', 'updated_at']