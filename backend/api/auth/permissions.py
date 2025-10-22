from rest_framework import permissions

class IsAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
      
        if request.user.role == "Admin":
            return True
        
        
        return str(obj.id) == str(request.user.id)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and 
            request.user.role == "Admin"
        )